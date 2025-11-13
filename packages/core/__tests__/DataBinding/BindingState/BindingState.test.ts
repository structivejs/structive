import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createBindingState } from "../../../src/DataBinding/BindingState/BindingState";
import * as getByRefMod from "../../../src/StateClass/methods/getByRef";
import * as setByRefMod from "../../../src/StateClass/methods/setByRef";
import * as getStructuredPathInfoMod from "../../../src/StateProperty/getStructuredPathInfo";
import * as getStatePropertyRefMod from "../../../src/StatePropertyRef/StatepropertyRef";

describe("BindingState", () => {
  let engine: any;
  let getByRefSpy: ReturnType<typeof vi.spyOn>;
  let setByRefSpy: ReturnType<typeof vi.spyOn>;
  let valueByRef: Map<any, any>;

  beforeEach(() => {
    valueByRef = new Map();
    engine = {
      inputFilters: {},
      outputFilters: {
        upper: () => (v: any) => String(v).toUpperCase(),
        add: (opts: string[]) => (v: any) => Number(v) + Number(opts[0] ?? 0),
      },
      saveBinding: vi.fn(),
      removeBinding: vi.fn(),
      state: {},
    };
    getByRefSpy = vi.spyOn(getByRefMod, "getByRef").mockImplementation((_state: any, ref: any) => valueByRef.get(ref));
    setByRefSpy = vi.spyOn(setByRefMod, "setByRef").mockImplementation((_state: any, ref: any, value: any) => {
      valueByRef.set(ref, value);
    });
  });

  afterEach(() => {
    getByRefSpy.mockRestore();
    setByRefSpy.mockRestore();
  });

  it("非ワイルドカード: activate/saveBinding/get/assignValue", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    // フィルタなし
    const factory = createBindingState("user.name", []);
    const bindingState = factory(binding, engine.outputFilters);

    // 初期化で saveBinding が呼ばれる（非ワイルドカードはループ不要）
    bindingState.activate();
    expect(engine.saveBinding).toHaveBeenCalledTimes(1);
    const savedRef = engine.saveBinding.mock.calls[0][0];

    // 値の get / set を確認
    const stateProxy = {} as any;
    const handler = {} as any;
    valueByRef.set(savedRef, "alice");
    expect(bindingState.getValue(stateProxy, handler)).toBe("alice");

    bindingState.assignValue(stateProxy as any, handler, "bob");
    expect(valueByRef.get(savedRef)).toBe("bob");
  });

  it("フィルタ適用: upper と add", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    const factory = createBindingState("user.score", [
      { name: "add", options: ["10"] },
    ]);
    const bindingState = factory(binding, engine.outputFilters);
    bindingState.activate();

    const savedRef = engine.saveBinding.mock.calls.at(-1)[0];
    const stateProxy = {} as any;
    const handler = {} as any;
    valueByRef.set(savedRef, 5);

    expect(bindingState.getValue(stateProxy, handler)).toBe(5);
    expect(bindingState.getFilteredValue(stateProxy, handler)).toBe(15);
  });

  it("ワイルドカード: currentLoopContext から listIndex を取得して参照を解決", () => {
    const listIndex = { sid: "LI#1" } as any; // 最低限でOK（key組み立てに利用）
    const loopContext = {
      path: "items.*",
      listIndex,
      find: (name: string) => (name === "items.*" ? loopContext : null),
    } as any;

    const mockBindContent = { currentLoopContext: loopContext } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    const factory = createBindingState("items.*.name", []);
    const bindingState = factory(binding, engine.outputFilters);

    bindingState.activate();
    // saveBinding に渡された ref は listIndex 付きのもの
    expect(engine.saveBinding).toHaveBeenCalled();
    const ref = engine.saveBinding.mock.calls.at(-1)[0];

    const stateProxy = {} as any;
    const handler = {} as any;
    valueByRef.set(ref, "carol");
    expect(bindingState.getValue(stateProxy, handler)).toBe("carol");
  });

  it("フィルタチェーン: upper -> add", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    const factory = createBindingState("user.label", [
      { name: "upper", options: [] },
    ]);
    const bindingState = factory(binding, engine.outputFilters);
    bindingState.activate();

    const ref = engine.saveBinding.mock.calls.at(-1)[0];
    const stateProxy = {} as any;
    const handler = {} as any;
    valueByRef.set(ref, "dev");
    expect(bindingState.getFilteredValue(stateProxy, handler)).toBe("DEV");
  });

  it("ゲッター: pattern/info/listIndex/filters/binding", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    const factory = createBindingState("user.name", []);
    const bindingState = factory(binding, engine.outputFilters);
    bindingState.activate();

    expect(bindingState.pattern).toBe("user.name");
    expect(bindingState.info.pattern).toBe("user.name");
    expect(bindingState.filters.length).toBe(0);
  expect((bindingState as any).binding).toBe(binding);
    expect(bindingState.listIndex).toBeNull();
    expect(bindingState.isLoopIndex).toBe(false);
  });

  it("エラー: ワイルドカードで lastWildcardPath が null", () => {
    const binding = { parentBindContent: { currentLoopContext: { find: vi.fn() } }, engine } as any;
    const factory = createBindingState("items.*.name", []);
    const bindingState = factory(binding, engine.outputFilters);
    // info.lastWildcardPath を null にするため、currentLoopContext.find が null を返すケースを利用
    (binding.parentBindContent.currentLoopContext.find as any).mockReturnValue(null);
    expect(() => bindingState.activate()).toThrow(/LoopContext is null/i);
  });

  it("エラー: ワイルドカード・未activate で ref が null", () => {
    // ワイルドカードの場合、コンストラクタで #nullRef は null になる
    // activate() を呼ばずに getValue すると、loopContext === null かつ nullRef === null で 'LoopContext is null'
    const binding = { parentBindContent: { currentLoopContext: null }, engine } as any;
    const factory = createBindingState("items.*.name", []);
    const bindingState = factory(binding, engine.outputFilters);
    expect(() => bindingState.getValue({} as any, {} as any)).toThrow(/LoopContext is null/i);
  });

  it("エラー: lastWildcardPath が null の場合", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;
    const infoStub = {
      pattern: "items.*.name",
      wildcardCount: 1,
      lastWildcardPath: null,
    } as any;
    const spy = vi.spyOn(getStructuredPathInfoMod, "getStructuredPathInfo").mockReturnValue(infoStub);

    const factory = createBindingState("items.*.name", []);
    const bindingState = factory(binding, engine.outputFilters);

    expect(() => bindingState.activate()).toThrow(/Wildcard last parentPath is null/);

    spy.mockRestore();
  });

  it("inactivate()メソッド: ワイルドカードの場合のrefがnullでない時のremoveBinding呼び出し", () => {
    const listIndex = { sid: "LI#1" } as any;
    const loopContext = {
      path: "items.*",
      listIndex,
      find: (name: string) => (name === "items.*" ? loopContext : null),
    } as any;

    const mockBindContent = { currentLoopContext: loopContext } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    const factory = createBindingState("items.*.name", []);
    const bindingState = factory(binding, engine.outputFilters);
    
    // activate() を呼んでrefを設定（ワイルドカードの場合はrefが作成される）
    bindingState.activate();
    expect(engine.saveBinding).toHaveBeenCalledTimes(1);
    const savedRef = engine.saveBinding.mock.calls[0][0];
    
    // inactivate() を呼ぶと removeBinding が呼ばれる
    bindingState.inactivate();
    expect(engine.removeBinding).toHaveBeenCalledWith(savedRef, binding);
  });

  it("ref getter: nullRefがnullでない場合にnullRefがundefinedの時のエラー処理", () => {
    const mockBindContent = { currentLoopContext: null } as any;
    const binding = { parentBindContent: mockBindContent, engine } as any;

    // getStatePropertyRefがundefinedを返すようにモック
    const getStatePropertyRefSpy = vi.spyOn(getStatePropertyRefMod, "getStatePropertyRef")
      .mockReturnValue(undefined as any);

    const factory = createBindingState("user.name", []);
    const bindingState = factory(binding, engine.outputFilters);
    
    // この状態でrefにアクセスすると、"ref is null"エラーが発生する
    expect(() => bindingState.ref).toThrow(/ref is null/i);
    
    getStatePropertyRefSpy.mockRestore();
  });
});
