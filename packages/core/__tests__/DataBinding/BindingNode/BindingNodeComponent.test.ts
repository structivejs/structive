import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { createBinding } from "../../../src/DataBinding/Binding";
import { createBindingNodeComponent } from "../../../src/DataBinding/BindingNode/BindingNodeComponent";
import { NotifyRedrawSymbol } from "../../../src/ComponentStateInput/symbols";
import { getStatePropertyRef } from "../../../src/StatePropertyRef/StatepropertyRef";

// モック設定
vi.mock("../../../src/WebComponents/findStructiveParent", () => ({
  registerStructiveComponent: vi.fn(),
  removeStructiveComponent: vi.fn()
}));

// getCustomTagNameのモック
const getCustomTagNameMock = vi.fn((component: HTMLElement) => {
  // デフォルトの動作: tagNameに'-'が含まれていれば小文字化
  if (component.tagName.includes('-')) {
    return component.tagName.toLowerCase();
  }
  // is属性をチェック
  const isAttr = component.getAttribute('is');
  if (isAttr?.includes('-')) {
    return isAttr.toLowerCase();
  }
  throw new Error('Custom tag name not found');
});
vi.mock("../../../src/WebComponents/getCustomTagName", () => ({
  getCustomTagName: (component: HTMLElement) => getCustomTagNameMock(component)
}));

import { registerStructiveComponent, removeStructiveComponent } from "../../../src/WebComponents/findStructiveParent";

// ヘルパー: 簡易な info/listIndex を生成
function makeInfo(pattern: string, pathSegments: string[], wildcardCount: number, cumulative: string[]): any {
  return {
    pattern,
    pathSegments,
    wildcardCount,
    cumulativePathSet: new Set(cumulative),
    sid: `${pattern}|${wildcardCount}`,
  };
}

function makeListIndex(sid: string, selfAt0 = false): any {
  const li: any = {
    parentListIndex: null,
    id: 1,
    sid,
    position: 0,
    length: 1,
    index: 0,
    version: 1,
    dirty: false,
    indexes: [],
    listIndexes: [],
    varName: "i",
    at: (pos: number) => {
      if (!selfAt0) return null;
      if (pos === 0 || pos === -1) return li;
      return null;
    },
  };
  return li;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("BindingNodeComponent", () => {
  let engine: any;
  let component: any;
  let parentComponent: any;
  let node: HTMLElement;
  let binding: any;
  let parentBindContent: any;
  let createBindingState: any;

  beforeAll(() => {
    if (!customElements.get("mock-component")) {
      customElements.define("mock-component", class extends HTMLElement {});
    }
  });

  beforeEach(() => {
    // モックをクリア
    vi.clearAllMocks();
    
    parentComponent = document.createElement("div") as any;
    parentComponent.isStructive = true;
    parentComponent.state = { [NotifyRedrawSymbol]: vi.fn() } as any;
    parentComponent.registerChildComponent = vi.fn(); // registerChildComponent を追加
    engine = {
      owner: parentComponent,
      bindingsByComponent: new WeakMap<any, Set<any>>()
    };
    node = document.createElement("mock-component");
    component = node as any;
    component.isStructive = true;
    component.state = { [NotifyRedrawSymbol]: vi.fn() } as any;
    component.readyResolvers = { promise: Promise.resolve() };
    component.stateBinding = { addBinding: vi.fn() }; // stateBinding を追加

    parentBindContent = {} as any;
    const info = makeInfo("values.*.foo", ["values","*","foo"], 1, ["values","values.*","values.*.foo"]);
    let currentListIndex: any = makeListIndex("LI#A", true);
    createBindingState = vi.fn(() => {
      let currentRef = getStatePropertyRef(info, currentListIndex);
      return {
        info,
        get listIndex() {
          return currentListIndex;
        },
        set listIndex(value: any) {
          currentListIndex = value ?? null;
          currentRef = getStatePropertyRef(info, currentListIndex);
        },
        get ref() {
          return currentRef;
        },
        getFilteredValue: () => 0,
        assignValue: vi.fn(),
        activate: vi.fn(), // activate メソッドを追加
        inactivate: vi.fn(), // inactivate メソッドも追加
        init: vi.fn(),
        isLoopIndex: false,
      };
    });
    const createNode = createBindingNodeComponent("state.foo", [], []);
    binding = createBinding(parentBindContent, node, engine, createNode as any, createBindingState as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("subName ゲッターが正しく動作する", () => {
    const componentNode = binding.bindingNode as any;
    expect(componentNode.subName).toBe("foo");
  });

  it("component の listIndex が null でも親パス更新を通知する", async () => {
    binding.activate();
    binding.bindingState.listIndex = null;
    const parentInfo = makeInfo("values", ["values"], 0, ["values", "values.*", "values.*.foo"]);
    const parentListIndex = makeListIndex("LI#parent", true);
    const parentRef = getStatePropertyRef(parentInfo, parentListIndex);
    binding.notifyRedraw([parentRef]);
    await flushPromises();
    const calls = (component.state[NotifyRedrawSymbol] as any).mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0][0]).toBe(parentRef);
  });

  it("notifyRedraw: whenDefined 解決後に通知する", async () => {
    binding.activate();
    const refs = [binding.bindingState.ref];
    let resolveWhenDefined!: (value: any) => void;
    const whenDefinedPromise = new Promise<any>((resolve) => {
      resolveWhenDefined = resolve;
    });
    const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockReturnValue(whenDefinedPromise);

    (binding.bindingNode as any)._notifyRedraw(refs);
    await Promise.resolve();
    expect(whenDefinedSpy).toHaveBeenCalledWith("mock-component");
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);

    resolveWhenDefined(customElements.get("mock-component")!);
    await Promise.resolve();
    await Promise.resolve();

    const calls = (component.state[NotifyRedrawSymbol] as any).mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(refs);
  });

  it("applyChange: バインディングの ref を通知する", () => {
    binding.activate();
    const node = binding.bindingNode as any;
    const notifySpy = vi.spyOn(node, "_notifyRedraw");
    const renderer = {} as any;

    node.applyChange(renderer);

    expect(notifySpy).toHaveBeenCalledTimes(1);
    expect(notifySpy.mock.calls[0][0]).toEqual([binding.bindingState.ref]);
  });

  it("activate: bindingsByComponent に登録され、親 StructiveComponent が紐づく", () => {
    binding.activate();
    const set = engine.bindingsByComponent.get(component)!;
    expect(set).toBeTruthy();
    expect(set.has(binding)).toBe(true);
    
    // registerStructiveComponent が呼び出されることを確認
    expect(registerStructiveComponent).toHaveBeenCalledWith(engine.owner, component);
  });

  it("activate: カスタム要素定義後に registerChildComponent と stateBinding.addBinding が呼ばれる", async () => {
    // stateBinding.addBinding のモックを追加
    component.stateBinding = {
      addBinding: vi.fn()
    };
    
    // parentComponent の registerChildComponent をスパイ
    const registerChildSpy = vi.fn();
    engine.owner.registerChildComponent = registerChildSpy;
    
    // カスタム要素の定義を待機するPromiseをモック
    let resolveWhenDefined!: (value: any) => void;
    const whenDefinedPromise = new Promise<any>((resolve) => {
      resolveWhenDefined = resolve;
    });
    const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockReturnValue(whenDefinedPromise);

    binding.activate();
    
    // whenDefined が呼ばれることを確認
    expect(whenDefinedSpy).toHaveBeenCalledWith("mock-component");
    
    // まだ呼ばれていないことを確認
    await Promise.resolve();
    expect(registerChildSpy).not.toHaveBeenCalled();
    expect(component.stateBinding.addBinding).not.toHaveBeenCalled();
    
    // カスタム要素が定義された後の処理
    resolveWhenDefined(customElements.get("mock-component")!);
    await flushPromises();
    
    // registerChildComponent と stateBinding.addBinding が呼ばれたことを確認
    expect(registerChildSpy).toHaveBeenCalledWith(component);
    expect(component.stateBinding.addBinding).toHaveBeenCalledWith(binding);
  });

  it("notifyRedraw: 親パス更新（component パターンを含む）をそのまま通知", async () => {
    binding.activate();
  const info = binding.bindingState.info;
  const listIndex = binding.bindingState.listIndex;
    // 親パス values の更新を模す（短いパス）
  const parentInfo = makeInfo("values", ["values"], 0, ["values", "values.*", "values.*.foo"]);
    const parentRef = getStatePropertyRef(parentInfo, listIndex);
    binding.notifyRedraw([parentRef]);
    await flushPromises();
    const notifyCalls = (component.state[NotifyRedrawSymbol] as any).mock.calls;
    expect(notifyCalls.length).toBe(1);
    const forwarded = notifyCalls[0][0][0];
    expect(forwarded).toBe(parentRef);
  });

  it("notifyRedraw: 子パスで component パターンを含まない場合は通知しない", async () => {
    binding.activate();
    // 自分の pattern は values.*.foo。含まれない別ツリー（values.*.bar）
  const childInfo = makeInfo("values.*.bar", ["values","*","bar"], 1, ["values","values.*","values.*.bar"]);
  const childRef = getStatePropertyRef(childInfo as any, binding.bindingState.listIndex);
    binding.notifyRedraw([childRef]);
    await flushPromises();
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);
  });

  it("notifyRedraw: listIndex 不一致はスキップ（子パス側）", async () => {
    binding.activate();
    // listIndex が異なる子パス → 通知しない
    const otherListIndex = makeListIndex("LI#B", true);
    const childInfo = makeInfo("values.*.bar", ["values","*","bar"], 1, ["values","values.*","values.*.bar"]);
    const childRef = getStatePropertyRef(childInfo as any, otherListIndex);
    binding.notifyRedraw([childRef]);
    await flushPromises();
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);
  });

  it("notifyRedraw: cumulativePathSet に含まれない親パターンはスキップ", async () => {
    binding.activate();
    const unrelatedInfo = makeInfo("others", ["others"], 0, ["others"]);
    const unrelatedRef = getStatePropertyRef(unrelatedInfo as any, null);
    binding.notifyRedraw([unrelatedRef]);
    await flushPromises();
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);
  });

  it("notifyRedraw: 親パスで listIndex が一致する場合は親 Ref を通知", async () => {
    binding.activate();
    const listIndex = binding.bindingState.listIndex;
    const parentInfo = makeInfo("values.*", ["values","*"], 1, ["values","values.*","values.*.foo"]);
    const parentRef = getStatePropertyRef(parentInfo as any, listIndex);
    binding.notifyRedraw([parentRef]);
    await flushPromises();
    const notifyCalls = (component.state[NotifyRedrawSymbol] as any).mock.calls;
    expect(notifyCalls.length).toBe(1);
    const forwarded = notifyCalls[0][0][0];
    expect(forwarded).toBe(parentRef);
  });

  it("notifyRedraw: 親パスで listIndex が異なる場合は通知しない", async () => {
    binding.activate();
    const mismatchListIndex = makeListIndex("LI#Mismatch", true);
    const parentInfo = makeInfo("values.*", ["values","*"], 1, ["values","values.*","values.*.foo"]);
    const parentRef = getStatePropertyRef(parentInfo as any, mismatchListIndex);
    binding.notifyRedraw([parentRef]);
    await flushPromises();
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);
  });

  it("notifyRedraw: 自身のパターン更新は通知しない", async () => {
    binding.activate();
    const info = binding.bindingState.info;
  const listIndex = binding.bindingState.listIndex;
    const sameRef = getStatePropertyRef(info as any, listIndex);
    binding.notifyRedraw([sameRef]);
    await flushPromises();
    expect((component.state[NotifyRedrawSymbol] as any).mock.calls.length).toBe(0);
  });

  it("inactivate: bindingsByComponent からバインディングを削除する", () => {
    // 最初に activate してバインディングを登録
    binding.activate();
    const bindingsSet = engine.bindingsByComponent.get(component)!;
    expect(bindingsSet.has(binding)).toBe(true);
    
    // inactivate を呼び出してバインディングを削除
    binding.inactivate();
    expect(bindingsSet.has(binding)).toBe(false);
    
    // removeStructiveComponent が呼び出されることを確認
    expect(removeStructiveComponent).toHaveBeenCalledWith(component);
  });

  it("inactivate: bindingsByComponent に存在しない場合でもエラーにならない", () => {
    // activate せずに直接 inactivate を呼び出す（isActive が false の場合）
    expect(() => binding.inactivate()).not.toThrow();
    
    // isActive が false の場合は bindingNode.inactivate が呼ばれないため、
    // removeStructiveComponent も呼び出されない
    expect(removeStructiveComponent).not.toHaveBeenCalled();
  });

  it("inactivate: bindingsが存在しない状態でactivateしたバインディングをinactivateしてもエラーにならない", () => {
    // engineのbindingsByComponentをクリアして存在しない状態にする
    engine.bindingsByComponent = new WeakMap();
    
    // activate してから inactivate を呼び出す
    binding.activate(); 
    expect(() => binding.inactivate()).not.toThrow();
    
    // removeStructiveComponent は呼び出される
    expect(removeStructiveComponent).toHaveBeenCalledWith(component);
  });

  describe("getCustomTagName統合テスト", () => {
    it("_notifyRedraw: getCustomTagNameが正しく呼び出される", async () => {
      vi.clearAllMocks();
      getCustomTagNameMock.mockClear();
      
      binding.activate(); // activate 内で getCustomTagName が1回呼ばれる
      const refs = [binding.bindingState.ref];
      
      let resolveWhenDefined!: (value: any) => void;
      const whenDefinedPromise = new Promise<any>((resolve) => {
        resolveWhenDefined = resolve;
      });
      vi.spyOn(customElements, "whenDefined").mockReturnValue(whenDefinedPromise);

      (binding.bindingNode as any)._notifyRedraw(refs); // _notifyRedraw 内で getCustomTagName が1回呼ばれる
      
      // getCustomTagNameが呼び出されたことを確認（activate と _notifyRedraw で計2回）
      expect(getCustomTagNameMock).toHaveBeenCalledWith(component);
      expect(getCustomTagNameMock).toHaveBeenCalledTimes(2);
      
      await Promise.resolve();
      resolveWhenDefined(customElements.get("mock-component")!);
      await flushPromises();
      
      const calls = (component.state[NotifyRedrawSymbol] as any).mock.calls;
      expect(calls.length).toBe(1);
    });

    it("_notifyRedraw: カスタマイズドビルトイン要素（is属性）も正しく処理される", async () => {
      vi.clearAllMocks();
      getCustomTagNameMock.mockClear();
      
      // is属性を持つカスタマイズドビルトイン要素を作成
      const customButton = document.createElement("button");
      Object.defineProperty(customButton, "tagName", { value: "BUTTON", writable: false });
      customButton.setAttribute("is", "x-custom-button");
      (customButton as any).isStructive = true;
      (customButton as any).state = { [NotifyRedrawSymbol]: vi.fn() };
      
      // 新しいバインディングを作成
      const customButtonBinding = createBinding(
        parentBindContent,
        customButton,
        engine,
        createBindingNodeComponent("state.foo", [], []) as any,
        createBindingState as any
      );
      customButtonBinding.activate();
      
      const refs = [customButtonBinding.bindingState.ref];
      
      let resolveWhenDefined!: (value: any) => void;
      const whenDefinedPromise = new Promise<any>((resolve) => {
        resolveWhenDefined = resolve;
      });
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockReturnValue(whenDefinedPromise);

      (customButtonBinding.bindingNode as any)._notifyRedraw(refs);
      
      // getCustomTagNameが呼び出され、is属性の値が返されることを確認
      expect(getCustomTagNameMock).toHaveBeenCalledWith(customButton);
      expect(whenDefinedSpy).toHaveBeenCalledWith("x-custom-button");
      
      await Promise.resolve();
      resolveWhenDefined(class extends HTMLButtonElement {});
      await flushPromises();
      
      const calls = ((customButton as any).state[NotifyRedrawSymbol] as any).mock.calls;
      expect(calls.length).toBe(1);
    });

    it("_notifyRedraw: getCustomTagNameがエラーを投げた場合、適切に伝播される", () => {
      vi.clearAllMocks();
      getCustomTagNameMock.mockClear();
      
      // is属性を持つカスタマイズドビルトイン要素を作成
      const customButton = document.createElement("button");
      customButton.setAttribute("is", "x-error-button");
      Object.defineProperty(customButton, "tagName", { value: "BUTTON", writable: false });
      (customButton as any).isStructive = true;
      (customButton as any).state = { [NotifyRedrawSymbol]: vi.fn() };
      
      // getCustomTagNameが正常に動作するようにモック
      getCustomTagNameMock.mockReturnValue("x-error-button");
      
      // 新しいバインディングを作成
      const errorBinding = createBinding(
        parentBindContent,
        customButton,
        engine,
        createBindingNodeComponent("state.foo", [], []) as any,
        createBindingState as any
      );
      errorBinding.activate();
      
      const refs = [errorBinding.bindingState.ref];
      
      // バインディング作成後、getCustomTagNameがエラーを投げるように変更
      getCustomTagNameMock.mockImplementation(() => {
        throw new Error('Custom tag name not found');
      });
      
      // _notifyRedrawがエラーを投げることを確認
      expect(() => {
        (errorBinding.bindingNode as any)._notifyRedraw(refs);
      }).toThrow('Custom tag name not found');
    });

    it("_notifyRedraw: 大文字のカスタムタグ名が小文字に変換されてwhenDefinedに渡される", async () => {
      vi.clearAllMocks();
      getCustomTagNameMock.mockClear();
      
      // 大文字のカスタムタグを持つコンポーネント
      const upperCaseComponent = document.createElement("div");
      Object.defineProperty(upperCaseComponent, "tagName", { value: "MY-CUSTOM-COMPONENT", writable: false });
      (upperCaseComponent as any).isStructive = true;
      (upperCaseComponent as any).state = { [NotifyRedrawSymbol]: vi.fn() };
      
      // 新しいバインディングを作成
      const upperCaseBinding = createBinding(
        parentBindContent,
        upperCaseComponent,
        engine,
        createBindingNodeComponent("state.foo", [], []) as any,
        createBindingState as any
      );
      upperCaseBinding.activate();
      
      const refs = [upperCaseBinding.bindingState.ref];
      
      let resolveWhenDefined!: (value: any) => void;
      const whenDefinedPromise = new Promise<any>((resolve) => {
        resolveWhenDefined = resolve;
      });
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockReturnValue(whenDefinedPromise);

      (upperCaseBinding.bindingNode as any)._notifyRedraw(refs);
      
      // getCustomTagNameが呼び出され、小文字化された値がwhenDefinedに渡される
      expect(getCustomTagNameMock).toHaveBeenCalledWith(upperCaseComponent);
      expect(whenDefinedSpy).toHaveBeenCalledWith("my-custom-component");
      
      await Promise.resolve();
      resolveWhenDefined(class extends HTMLElement {});
      await flushPromises();
      
      const calls = ((upperCaseComponent as any).state[NotifyRedrawSymbol] as any).mock.calls;
      expect(calls.length).toBe(1);
    });

    it("constructor: カスタム要素のタグ名が見つからない場合、エラーを投げる", () => {
      vi.clearAllMocks();
      
      // 標準要素（ハイフンなし、is属性なし）
      const standardDiv = document.createElement("div");
      Object.defineProperty(standardDiv, "tagName", { value: "DIV", writable: false });
      (standardDiv as any).isStructive = true;
      (standardDiv as any).state = { [NotifyRedrawSymbol]: vi.fn() };
      
      // コンストラクタでエラーが投げられることを確認
      expect(() => {
        createBinding(
          parentBindContent,
          standardDiv,
          engine,
          createBindingNodeComponent("state.foo", [], []) as any,
          createBindingState as any
        );
      }).toThrow('Custom element tag name not found');
    });

    it("_notifyRedraw: whenDefined が reject した場合、COMP-402 エラーを投げる", async () => {
      vi.clearAllMocks();
      
      const refs = [binding.bindingState.ref];
      const testError = new Error("Custom element definition failed");
      
      // Suppress unhandled rejection in this test
      const unhandledRejectionHandler = vi.fn();
      process.on('unhandledRejection', unhandledRejectionHandler);
      
      // whenDefined が reject するPromiseを返すようにモック
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockRejectedValue(testError);
      
      // raiseError をモックしてエラーを投げる
      const raiseErrorModule = await import("../../../src/utils");
      const raiseErrorSpy = vi.spyOn(raiseErrorModule, "raiseError").mockImplementation((detail: any) => {
        const message = typeof detail === "string" ? detail : detail?.message ?? "error";
        const err = new Error(message);
        (err as any).code = detail.code;
        throw err;
      });
      
      // _notifyRedraw を呼び出す
      (binding.bindingNode as any)._notifyRedraw(refs);
      
      // Promise が reject されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // raiseError が COMP-402 で呼ばれ、元のエラーが cause として渡されたことを確認
      expect(raiseErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMP-402',
          message: 'Custom element definition failed: mock-component',
          docsUrl: './docs/error-codes.md#comp',
          context: expect.objectContaining({
            where: 'BindingNodeComponent._notifyRedraw',
            tagName: 'mock-component'
          }),
          cause: testError,
        })
      );
      
      // Clean up
      process.off('unhandledRejection', unhandledRejectionHandler);
    });

    it("_notifyRedraw: whenDefined が非Errorオブジェクトで reject した場合も処理する", async () => {
      vi.clearAllMocks();
      
      const refs = [binding.bindingState.ref];
      const testError = "String error message";
      
      // Suppress unhandled rejection in this test
      const unhandledRejectionHandler = vi.fn();
      process.on('unhandledRejection', unhandledRejectionHandler);
      
      // whenDefined が非Errorで reject するPromiseを返すようにモック
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockRejectedValue(testError);
      
      // raiseError をモックしてエラーを投げる
      const raiseErrorModule = await import("../../../src/utils");
      const raiseErrorSpy = vi.spyOn(raiseErrorModule, "raiseError").mockImplementation((detail: any) => {
        const message = typeof detail === "string" ? detail : detail?.message ?? "error";
        const err = new Error(message);
        (err as any).code = detail.code;
        throw err;
      });
      
      // _notifyRedraw を呼び出す
      (binding.bindingNode as any)._notifyRedraw(refs);
      
      // Promise が reject されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // raiseError が COMP-402 で呼ばれ、String(e) が cause.message に反映されたことを確認
      expect(raiseErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMP-402',
          message: 'Custom element definition failed: mock-component',
          docsUrl: './docs/error-codes.md#comp',
          context: expect.objectContaining({
            where: 'BindingNodeComponent._notifyRedraw',
            tagName: 'mock-component'
          }),
          cause: expect.objectContaining({ message: 'String error message' }),
        })
      );
      
      // Clean up
      process.off('unhandledRejection', unhandledRejectionHandler);
    });

    it("activate: whenDefined が reject した場合、COMP-402 エラーを投げる", async () => {
      vi.clearAllMocks();
      
      const testError = new Error("Failed to register component");
      
      // Suppress unhandled rejection in this test
      const unhandledRejectionHandler = vi.fn();
      process.on('unhandledRejection', unhandledRejectionHandler);
      
      // whenDefined が reject するPromiseを返すようにモック
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockRejectedValue(testError);
      
      // raiseError をモックしてエラーを投げる
      const raiseErrorModule = await import("../../../src/utils");
      const raiseErrorSpy = vi.spyOn(raiseErrorModule, "raiseError").mockImplementation((detail: any) => {
        const message = typeof detail === "string" ? detail : detail?.message ?? "error";
        const err = new Error(message);
        (err as any).code = detail.code;
        throw err;
      });
      
      // activate を呼び出す
      binding.activate();
      
      // Promise が reject されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // raiseError が COMP-402 で呼ばれ、元のエラーが cause として渡されたことを確認
      expect(raiseErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMP-402',
          message: 'Custom element definition failed: mock-component',
          docsUrl: './docs/error-codes.md#comp',
          context: expect.objectContaining({
            where: 'BindingNodeComponent.activate',
            tagName: 'mock-component'
          }),
          cause: testError,
        })
      );
      
      // Clean up
      process.off('unhandledRejection', unhandledRejectionHandler);
    });

    it("activate: whenDefined が非Errorオブジェクトで reject した場合も処理する", async () => {
      vi.clearAllMocks();
      
      const testError = { someField: "not an error object" };
      
      // Suppress unhandled rejection in this test
      const unhandledRejectionHandler = vi.fn();
      process.on('unhandledRejection', unhandledRejectionHandler);
      
      // whenDefined が非Errorで reject するPromiseを返すようにモック
      const whenDefinedSpy = vi.spyOn(customElements, "whenDefined").mockRejectedValue(testError);
      
      // raiseError をモックしてエラーを投げる
      const raiseErrorModule = await import("../../../src/utils");
      const raiseErrorSpy = vi.spyOn(raiseErrorModule, "raiseError").mockImplementation((detail: any) => {
        const message = typeof detail === "string" ? detail : detail?.message ?? "error";
        const err = new Error(message);
        (err as any).code = detail.code;
        throw err;
      });
      
      // activate を呼び出す
      binding.activate();
      
      // Promise が reject されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // raiseError が COMP-402 で呼ばれ、String(e) が cause.message に反映されたことを確認
      expect(raiseErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMP-402',
          message: 'Custom element definition failed: mock-component',
          docsUrl: './docs/error-codes.md#comp',
          context: expect.objectContaining({
            where: 'BindingNodeComponent.activate',
            tagName: 'mock-component'
          }),
          cause: expect.objectContaining({ message: '[object Object]' }),
        })
      );
      
      // Clean up
      process.off('unhandledRejection', unhandledRejectionHandler);
    });
  });
});
