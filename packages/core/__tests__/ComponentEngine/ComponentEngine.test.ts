import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStructuredPathInfo } from "../../src/StateProperty/getStructuredPathInfo";
import { getStatePropertyRef } from "../../src/StatePropertyRef/StatepropertyRef";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol } from "../../src/StateClass/symbols";
import { AssignStateSymbol } from "../../src/ComponentStateInput/symbols";
import { createRootNode } from "../../src/PathTree/PathNode";
import { applyComponentEngineListStorePatch } from "../helpers/componentEngineListStorePatch";

// シンプルなベースとなるカスタムエレメントとコンポーネントクラスを偽装
class DummyState {
  foo = 1;
  bar = 2;
  async [ConnectedCallbackSymbol]() {}
  async [DisconnectedCallbackSymbol]() {}
}

function makeTestPathManager() {
  return {
    alls: new Set<string>(),
    funcs: new Set<string>(),
    rootNode: createRootNode(),
    dynamicDependencies: new Map<string, Set<string>>(),
    staticDependencies: new Map<string, Set<string>>(),
    lists: new Set<string>(),
    elements: new Set<string>(),
  } as any;
}

class DummyComponent extends HTMLElement {
  static template = document.createElement("template");
  // CSSStyleSheet が無い環境でも動くよう、ダミーオブジェクト
  static styleSheet = {} as any;
  static stateClass = DummyState as any;
  static inputFilters = {} as any;
  static outputFilters = {} as any;
  static id = 1 as any;
  static pathManager = makeTestPathManager();

  parentStructiveComponent: any = null;
  engine!: any;
  constructor() {
    super();
  }
}
customElements.define("x-dummy-engine", DummyComponent);

function makeConfig(over?: Partial<any>) {
  return {
    enableWebComponents: true,
    enableShadowDom: true,
    extends: null,
    ...over,
  } as any;
}
// ------- Mocks & dynamic import helpers -------
let currentBindContent: any;
let lastCreateBindArgs: any[] = [];
let lastUpdater: any = null;
let updateCallCount = 0;
let lastStateProxy: any = null;
// update の待機制御用（disconnectedCallback の完了待ちをテストするため）
let blockNextUpdate = false;
let resolveUpdateBlocker: (() => void) | null = null;
let updateBlockerPromise: Promise<void> | null = null;

vi.mock("../../src/DataBinding/BindContent", () => {
  return {
    createBindContent: vi.fn((parentBinding: any, id: number, engine: any, loopRef: any) => {
      lastCreateBindArgs = [parentBinding, id, engine, loopRef];
      return currentBindContent;
    })
  };
});

vi.mock("../../src/Updater/Updater", () => {
  return {
    createUpdater: vi.fn(async (_engine: any, cb: any) => {
      const enqueueRef = vi.fn();
      const updater = {
        enqueueRef,
        initialRender: vi.fn((renderFn: any) => {
          // initialRenderのモック実装
          const renderer = {
            createReadonlyState: vi.fn((fn: any) => {
              const readonlyProxy = {
                [GetByRefSymbol]: vi.fn(() => 123),
                [GetListIndexesByRefSymbol]: vi.fn(() => null),
              };
              const handler = {} as any;
              return fn(readonlyProxy, handler);
            }),
          };
          renderFn(renderer);
        }),
        update: vi.fn(async (_loop: any, fn: any) => {
          updateCallCount++;
          lastUpdater = updater;
          lastStateProxy = {
            [ConnectedCallbackSymbol]: vi.fn(async () => {}),
            [DisconnectedCallbackSymbol]: vi.fn(async () => {}),
            [SetByRefSymbol]: vi.fn(),
            [GetByRefSymbol]: vi.fn(),
          };
          const handler = {} as any;
          await fn(lastStateProxy, handler);
          if (blockNextUpdate) {
            blockNextUpdate = false;
            // 次の update 呼び出しのみをブロックし、外部から解除できるようにする
            updateBlockerPromise = new Promise<void>((resolve) => {
              resolveUpdateBlocker = resolve;
            });
            await updateBlockerPromise;
          }
        }),
        createReadonlyState: vi.fn((fn: any) => {
          const readonlyProxy = {
            [GetByRefSymbol]: vi.fn(() => 123),
            [GetListIndexesByRefSymbol]: vi.fn(() => null),
          };
          const handler = {} as any;
          return fn(readonlyProxy, handler);
        }),
      };
      return cb(updater);
    }),
  };
});

vi.mock("../../src/ComponentEngine/attachShadow.js", () => ({ attachShadow: () => {} }));
vi.mock("../../src/ComponentEngine/attachShadow", () => ({ attachShadow: () => {} }));

// stateInput/stateOutput/stateBinding をモック
let assignCalls = 0;
let lastAssignPayload: any = null;
const fakeStateInput: any = {
  [AssignStateSymbol]: (payload: any) => {
    assignCalls++;
    lastAssignPayload = payload;
  }
};
let stateBindingBindSpy = vi.fn();
const fakeStateBinding: any = { bind: (..._args:any[]) => stateBindingBindSpy(..._args) };
const fakeStateOutput: any = { startsWith: () => false, getListIndexes: () => null };

vi.mock("../../src/ComponentStateInput/createComponentStateInput.js", () => ({
  createComponentStateInput: () => fakeStateInput
}));
vi.mock("../../src/ComponentStateInput/createComponentStateInput", () => ({
  createComponentStateInput: () => fakeStateInput
}));
vi.mock("../../src/ComponentStateBinding/createComponentStateBinding.js", () => ({
  createComponentStateBinding: () => fakeStateBinding
}));
vi.mock("../../src/ComponentStateBinding/createComponentStateBinding", () => ({
  createComponentStateBinding: () => fakeStateBinding
}));
vi.mock("../../src/ComponentStateOutput/createComponentStateOutput.js", () => ({
  createComponentStateOutput: () => fakeStateOutput
}));
vi.mock("../../src/ComponentStateOutput/createComponentStateOutput", () => ({
  createComponentStateOutput: () => fakeStateOutput
}));

async function importEngineModule() {
  return import("../../src/ComponentEngine/ComponentEngine");
}

describe("ComponentEngine", () => {
  let el: DummyComponent;
  let createComponentEngineFn: (config: any, owner: any) => any;
  let engine: any;

  beforeEach(async () => {
    // reset mocks state
    currentBindContent = { 
      mount: vi.fn(), 
      mountAfter: vi.fn(),
      activate: vi.fn(),
      applyChange: vi.fn()
    };
    lastCreateBindArgs = [];
    lastUpdater = null;
    lastStateProxy = null;
    updateCallCount = 0;
    blockNextUpdate = false;
    resolveUpdateBlocker = null;
    updateBlockerPromise = null;

    // fresh element & engine
    el = document.createElement("x-dummy-engine") as DummyComponent;
    // create fresh PathManager for each test to avoid cross-test pollution
    (DummyComponent as any).pathManager = makeTestPathManager();
    const engineModule = await importEngineModule();
    createComponentEngineFn = engineModule.createComponentEngine as any;
    engine = createComponentEngineFn(makeConfig(), el as any);
    applyComponentEngineListStorePatch(engine);
    // reset counters for state input/binding
    assignCalls = 0;
    lastAssignPayload = null;
    stateBindingBindSpy = vi.fn();
  });

  it("setup: pathManager.alls に state 直下のキーを登録し、bindContent を初期化する", () => {
    engine.setup();
    expect((engine.pathManager as any).alls.has("foo")).toBe(true);
    expect((engine.pathManager as any).alls.has("bar")).toBe(true);
  // createBindContent が呼ばれ、ルート参照が渡されている
    expect(lastCreateBindArgs.length).toBe(4);
    const loopRef = lastCreateBindArgs[3];
  expect(loopRef.info.pattern).toBe("");
  });

  it("setup: RESERVED_WORD_SET や既存エントリは登録をスキップする", () => {
    (engine.pathManager as any).alls.add("foo");
    (engine.state as any).let = 3;
    engine.setup();
    expect((engine.pathManager as any).alls.has("let")).toBe(false);
    expect(Array.from((engine.pathManager as any).alls)).toContain("bar");
  });

  it("versionUp: currentVersion をインクリメントして返す", () => {
    expect(engine.currentVersion).toBe(0);
    expect(engine.versionUp()).toBe(1);
    expect(engine.currentVersion).toBe(1);
  });

  it("connectedCallback: data-state を AssignState し、mount と初期 enqueue を行う", async () => {
    // data-state をセット
    el.dataset.state = JSON.stringify({ foo: 10 });
    engine.setup();
    (engine.pathManager as any).alls.add("nested.value");
    (engine.pathManager as any).alls.add("functionProp");
    (engine.pathManager as any).funcs.add("functionProp");
    await engine.connectedCallback();
    // mount が呼ばれる
    expect(currentBindContent.mount).toHaveBeenCalled();
    // initialRender と activate が呼ばれる
    expect(currentBindContent.activate).toHaveBeenCalled();
    expect(currentBindContent.applyChange).toHaveBeenCalled();
    // AssignStateSymbol が呼ばれている
    expect(assignCalls).toBe(1);
    expect(lastAssignPayload).toEqual({ foo: 10 });
  });

  it("bindContent getter: setup 前はエラーを投げる", () => {
    expect(() => {
      // アクセス時に raiseError が投げられる
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      engine.bindContent;
  }).toThrowError(/bindContent not initialized yet/);
  });

  it("connectedCallback: data-state が不正 JSON の場合はエラー", async () => {
    el.dataset.state = "{foo:}"; // 不正な JSON
    engine.setup();
    await expect(() => engine.connectedCallback()).rejects.toThrow(/Failed to parse state from dataset/);
  });

  it("connectedCallback: enableWebComponents=false では placeholder 経由で mountAfter", async () => {
    engine = createComponentEngineFn(makeConfig({ enableWebComponents: false }), el as any);
    applyComponentEngineListStorePatch(engine);
    // 挿入先が必要（parentNode を持たせる）
    document.body.appendChild(el);
    const originalParent = el.parentNode;
    // replaceWith をスタブして placeholder(Comment) を捕捉
    let capturedPlaceholder: Comment | null = null;
    const origReplaceWith = (el as any).replaceWith?.bind(el);
    (el as any).replaceWith = (node: Node) => {
      if (node instanceof Comment) {
        capturedPlaceholder = node;
      }
      // JSDOM の replaceWith 互換: 親の同じ位置に node を挿入し、元 el を除去
      if (el.parentNode) {
        el.parentNode.insertBefore(node, el);
        el.remove();
      } else if (origReplaceWith) {
        origReplaceWith(node);
      }
    };
    engine.setup();
    await engine.connectedCallback();
    expect(currentBindContent.mountAfter).toHaveBeenCalledTimes(1);
    const [passedParent, passedPlaceholder] = currentBindContent.mountAfter.mock.calls[0];
    expect(passedParent).toBe(originalParent);
    expect(passedPlaceholder).toBeInstanceOf(Comment);
    expect(capturedPlaceholder).toBeInstanceOf(Comment);
  });

  it("connectedCallback: block モードで親が無い場合はエラーを投げる", async () => {
    engine = createComponentEngineFn(makeConfig({ enableWebComponents: false }), el as any);
    applyComponentEngineListStorePatch(engine);
    let ignorePromise: Promise<void> | null = null;
    (el as any).replaceWith = vi.fn(() => {
      ignorePromise = engine.disconnectedCallback();
    });
    engine.setup();
    await expect(engine.connectedCallback()).rejects.toThrowError(/Block parent node is not set/);
    await (ignorePromise ?? Promise.resolve());
  });

  it("getPropertyValue/setPropertyValue: ref 経由の取得/設定を行う", async () => {
    const info = getStructuredPathInfo("foo");
    const ref = getStatePropertyRef(info, null);

    // get は ReadonlyProxy 経由
    const v = engine.getPropertyValue(ref);
    expect(v).toBe(123);

    // set は update 経由で SetByRefSymbol を叩く
    engine.setPropertyValue(ref, 999);
    expect(lastStateProxy?.[SetByRefSymbol]).toHaveBeenCalledTimes(1);
  });

  it("getCacheEntry/setCacheEntry: キャッシュエントリを保存・更新できる", () => {
    const info = getStructuredPathInfo("foo");
    const ref = getStatePropertyRef(info, null);

    expect(engine.getCacheEntry(ref)).toBeNull();

    const firstEntry = { value: "first" } as any;
    engine.setCacheEntry(ref, firstEntry);
    expect(engine.getCacheEntry(ref)).toBe(firstEntry);
    expect(engine.getBindings(ref)).toEqual([]);

    const secondEntry = { value: "second" } as any;
    engine.setCacheEntry(ref, secondEntry);
    expect(engine.getCacheEntry(ref)).toBe(secondEntry);
    expect(engine.getBindings(ref)).toEqual([]);

    const binding = { id: "binding" } as any;
    engine.saveBinding(ref, binding);
    expect(engine.getBindings(ref)).toEqual([binding]);

    const thirdEntry = { value: "third" } as any;
    engine.setCacheEntry(ref, thirdEntry);
    expect(engine.getCacheEntry(ref)).toBe(thirdEntry);
    expect(engine.getBindings(ref)).toEqual([binding]);
  });

  it("save/getBindings, saveListAndListIndexes, getListIndexes/Lists", () => {
    const info = getStructuredPathInfo("foo");
    const ref = getStatePropertyRef(info, null);

    expect(engine.getBindings(ref)).toEqual([]);
    const fakeBinding = { id: "B" } as any;
    const anotherBinding = { id: "C" } as any;
    engine.saveBinding(ref, fakeBinding);
    engine.saveBinding(ref, anotherBinding);
    expect(engine.getBindings(ref)).toEqual([fakeBinding, anotherBinding]);

    // save/get list & listIndexes
    engine.pathManager.lists.add(ref.info.pattern);
    engine.saveListAndListIndexes(ref, [1, 2], [{ sid: "LI", at: () => null } as any]);
    const saveInfo = engine.getListAndListIndexes(ref);
    expect(saveInfo.list?.length).toBe(2);
    expect(saveInfo.listIndexes?.length).toBe(1);
    expect(engine.getListIndexes(ref)?.[0]?.sid).toBe("LI");
    engine.saveListAndListIndexes(ref, null, null);
    const clearedInfo = engine.getListAndListIndexes(ref);
    expect(clearedInfo).toEqual({ list: null, listIndexes: null, listClone: null });
    expect(engine.getListIndexes(ref)).toBeNull();

    const otherInfo = getStructuredPathInfo("baz");
    const otherRef = getStatePropertyRef(otherInfo, null);
    const initialSaveInfo = engine.getListAndListIndexes(otherRef);
    expect(initialSaveInfo).toEqual({ list: null, listIndexes: null, listClone: null });
    engine.saveListAndListIndexes(otherRef, [7], null);
    expect(engine.getListAndListIndexes(otherRef)).toEqual({ list: null, listIndexes: null, listClone: null });
    expect(engine.getListIndexes(otherRef)).toBeNull();
  });

  it("getListIndexes: stateOutput.startsWith が true のときは stateOutput.getListIndexes を使う", () => {
    const info = getStructuredPathInfo("child.values.*.foo");
    const ref = getStatePropertyRef(info, null);

    // stateOutput を偽装
    const getListIndexes = vi.fn(() => [{ sid: "X" }]);
    const startsWith = vi.fn(() => true);
    engine.stateOutput = { getListIndexes, startsWith } as any;

    const ret = engine.getListIndexes(ref);
    expect(ret?.[0]?.sid).toBe("X");
    expect(startsWith).toHaveBeenCalled();
  });

  it("disconnectedCallback: Disconnected を呼び出し、非 WebComponents は placeholder を掃除", async () => {
    engine = createComponentEngineFn(makeConfig({ enableWebComponents: false }), el as any);
    applyComponentEngineListStorePatch(engine);
    // pathManager.hasDisconnectedCallback を true に設定
    (engine as any).pathManager.hasDisconnectedCallback = true;
    document.body.appendChild(el);
    const parent = {
      registerChildComponent: vi.fn(),
      unregisterChildComponent: vi.fn(),
      readyResolvers: { promise: Promise.resolve() },
    } as any;
    el.parentStructiveComponent = parent;
    // replaceWith をスタブして placeholder を捕捉し、remove をスパイ
    let capturedPlaceholder: Comment | null = null;
    const origReplaceWith = (el as any).replaceWith?.bind(el);
    (el as any).replaceWith = (node: Node) => {
      if (node instanceof Comment) {
        capturedPlaceholder = node;
      }
      if (el.parentNode) {
        el.parentNode.insertBefore(node, el);
        el.remove();
      } else if (origReplaceWith) {
        origReplaceWith(node);
      }
    };
    engine.setup();
    await engine.connectedCallback();
    // remove をスパイ（捕捉済みの placeholder に差し替え）
  expect(capturedPlaceholder).toBeInstanceOf(Comment);
  // TS に non-null を納得させるため runtime check 後に unknown 経由でキャスト
  const placeholder = (capturedPlaceholder as unknown) as Comment;
  const removeSpy = vi.spyOn(placeholder, "remove");
    const before = updateCallCount;
    await engine.disconnectedCallback();
    // update が呼ばれている（DisconnectedCallbackSymbol 実行）
    expect(updateCallCount).toBeGreaterThan(before);
    // placeholder の remove が呼ばれている
    expect(removeSpy).toHaveBeenCalled();
    expect(parent.unregisterChildComponent).toHaveBeenCalledWith(el);
  });

  it("createComponentEngine: ファクトリ関数でインスタンス生成できる", async () => {
    const { createComponentEngine } = await import("../../src/ComponentEngine/ComponentEngine");
    const inst = createComponentEngine(makeConfig(), el as any);
    expect(inst).toBeTruthy();
    // 型までは厳密に見ないが、メソッドが存在することを確認
    expect(typeof (inst as any).setup).toBe("function");
  });

  it("connectedCallback: 親コンポーネントがいても connectedCallback では何もしない（BindingNodeComponent.activate で処理される）", async () => {
    engine.setup();
    const parent = {
      registerChildComponent: vi.fn(),
      readyResolvers: { promise: Promise.resolve() },
    } as any;
    el.parentStructiveComponent = parent as any;
    await engine.connectedCallback();
    // connectedCallback では親子バインド登録は行わない（BindingNodeComponent.activate に移譲）
    expect(parent.registerChildComponent).not.toHaveBeenCalled();
    expect(stateBindingBindSpy).not.toHaveBeenCalled();
  });

  it("readyResolvers: connectedCallback 完了後に解決される", async () => {
    engine.setup();
    await engine.connectedCallback();
    await engine.readyResolvers.promise; // 例外なく await できればOK
    expect(true).toBe(true);
  });

  it("connectedCallback: hasConnectedCallback が true のとき ConnectedCallbackSymbol を呼び出す", async () => {
    (engine.pathManager as any).hasConnectedCallback = true;
    const initialUpdateCallCount = updateCallCount;
    engine.setup();
    await engine.connectedCallback();
    // hasConnectedCallback=true のため update が追加で呼ばれる
    // (setup 時の initialRender で1回 + connectedCallback 内のマウント処理で1回 + hasConnectedCallback による呼び出しで1回)
    expect(updateCallCount).toBeGreaterThan(initialUpdateCallCount);
    // lastStateProxy の ConnectedCallbackSymbol が呼ばれていることを確認
    expect(lastStateProxy[ConnectedCallbackSymbol]).toHaveBeenCalled();
  });

  it("config.extends が指定されていると type が builtin になる", async () => {
    const engine2 = createComponentEngineFn(makeConfig({ extends: "div" }), el as any);
    expect(engine2.type).toBe("builtin");
  });

  it("registerChildComponent/unregisterChildComponent: セットに追加・削除される", () => {
    const child = document.createElement("div") as any;
    engine.registerChildComponent(child);
    expect(engine.structiveChildComponents.has(child)).toBe(true);
    engine.unregisterChildComponent(child);
    expect(engine.structiveChildComponents.has(child)).toBe(false);
  });

  it("listIndex スコープごとに保存領域が分かれる", () => {
    const info = getStructuredPathInfo("items.*");
    // listIndex なし
    const refNoIdx = getStatePropertyRef(info, null);
    engine.pathManager.lists.add(refNoIdx.info.pattern);
    engine.saveListAndListIndexes(refNoIdx, [1, 2, 3], [{ sid: "A" } as any]);

    // listIndex あり（別保存）
    const listIndex = { sid: "IDX", at: () => null } as any;
    const refWithIdx = getStatePropertyRef(info, listIndex);
    engine.pathManager.lists.add(refWithIdx.info.pattern);
    engine.saveListAndListIndexes(refWithIdx, [9, 9], [{ sid: "B" } as any]);

    const info0 = engine.getListAndListIndexes(refNoIdx);
    const info1 = engine.getListAndListIndexes(refWithIdx);
    expect(info0.list).toEqual([1, 2, 3]);
    expect(info0.listIndexes?.[0]?.sid).toBe("A");
    expect(info1.list).toEqual([9, 9]);
    expect(info1.listIndexes?.[0]?.sid).toBe("B");
  });

  it("removeBinding: バインディングを削除する", () => {
    const info = getStructuredPathInfo("foo");
    const ref = getStatePropertyRef(info, null);

    // バインディングを追加
    const binding1 = { id: "binding1" } as any;
    const binding2 = { id: "binding2" } as any;
    const binding3 = { id: "binding3" } as any;
    
    engine.saveBinding(ref, binding1);
    engine.saveBinding(ref, binding2);
    engine.saveBinding(ref, binding3);
    
    expect(engine.getBindings(ref)).toEqual([binding1, binding2, binding3]);

    // 中央のバインディングを削除
    engine.removeBinding(ref, binding2);
    expect(engine.getBindings(ref)).toEqual([binding1, binding3]);

    // 最初のバインディングを削除
    engine.removeBinding(ref, binding1);
    expect(engine.getBindings(ref)).toEqual([binding3]);

    // 最後のバインディングを削除
    engine.removeBinding(ref, binding3);
    expect(engine.getBindings(ref)).toEqual([]);
  });

  it("removeBinding: 存在しない ref の場合は何もしない", () => {
    const info = getStructuredPathInfo("nonexistent");
    const ref = getStatePropertyRef(info, null);
    const binding = { id: "binding" } as any;

    // 存在しない ref からバインディングを削除しようとしても例外は発生しない
    expect(() => {
      engine.removeBinding(ref, binding);
    }).not.toThrow();
  });

  it("removeBinding: 存在しないバインディングを削除しようとしても何もしない", () => {
    const info = getStructuredPathInfo("foo");
    const ref = getStatePropertyRef(info, null);

    const binding1 = { id: "binding1" } as any;
    const binding2 = { id: "binding2" } as any;
    const nonExistentBinding = { id: "nonexistent" } as any;
    
    engine.saveBinding(ref, binding1);
    engine.saveBinding(ref, binding2);
    
    expect(engine.getBindings(ref)).toEqual([binding1, binding2]);

    // 存在しないバインディングを削除しようとしても配列は変わらない
    engine.removeBinding(ref, nonExistentBinding);
    expect(engine.getBindings(ref)).toEqual([binding1, binding2]);
  });

  it("disconnectedCallback: hasDisconnectedCallback が true の場合に bindContent.inactivate が呼ばれる", async () => {
    // hasDisconnectedCallback を true に設定
    engine.pathManager.hasDisconnectedCallback = true;
    engine.setup();
    
    // inactivate のスパイを設定
    const inactivateSpy = vi.fn();
    currentBindContent.inactivate = inactivateSpy;
    
    await engine.connectedCallback();
    await engine.disconnectedCallback();
    
    // inactivate が呼ばれたことを確認
    expect(inactivateSpy).toHaveBeenCalled();
  });
});
