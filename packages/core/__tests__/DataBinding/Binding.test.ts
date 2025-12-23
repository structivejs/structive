import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBinding } from "../../src/DataBinding/Binding";

describe("Binding", () => {
  let engine: any;

  const node = document.createElement("div");

  const mockBindingNode = {
    bindContents: [],
    activate: vi.fn(),
    inactivate: vi.fn(),
    notifyRedraw: vi.fn(),
    applyChange: vi.fn(),
    isBlock: false,
  };

  const mockBindingState = {
    activate: vi.fn(),
    assignValue: vi.fn(),
    getFilteredValue: vi.fn(),
    inactivate: vi.fn(),
    isLoopIndex: false,
    ref: { info: { pattern: "state.path" } } as any,
  };

  const createBindingNode = vi.fn(() => mockBindingNode as any);
  const createBindingState = vi.fn(() => mockBindingState as any);

  const parentBindContent = {} as any;

  beforeEach(() => {
    engine = {
      inputFilters: {},
      outputFilters: {},
      pathManager: {
        dynamicDependencies: new Map<string, Set<string>>(),
      },
      getBindings: vi.fn(() => []),
    };
    mockBindingNode.bindContents = [];
    mockBindingNode.activate.mockClear();
    mockBindingNode.inactivate.mockClear();
    mockBindingNode.notifyRedraw.mockClear();
    mockBindingNode.applyChange.mockClear();
    mockBindingState.activate.mockClear();
    mockBindingState.assignValue.mockClear();
    mockBindingState.inactivate.mockClear();
  mockBindingState.ref = { info: { pattern: "state.path" } } as any;
  mockBindingState.isLoopIndex = false;
  mockBindingState.getFilteredValue.mockClear();
    createBindingNode.mockClear();
    createBindingState.mockClear();
  });

  it("bindContents getter は bindingNode の bindContents を返す", () => {
    const childBindContents = [{ id: 1 }];
    mockBindingNode.bindContents = childBindContents as any;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    expect(binding.bindContents).toBe(childBindContents);
  });

  it("activate は bindingNode と bindingState の activate を呼び、isActive を true にする", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    expect((binding as any).isActive).toBe(false); // 初期状態は false
    
    binding.activate();
    expect((binding as any).isActive).toBe(true); // activate 後は true
    expect(mockBindingNode.activate).toHaveBeenCalledTimes(1);
    expect(mockBindingState.activate).toHaveBeenCalledTimes(1);
  });

  it("updateStateValue は bindingState.assignValue を呼ぶ", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    const writeState: any = {};
    const handler: any = {};
    binding.updateStateValue(writeState, handler, 123);
    expect(mockBindingState.assignValue).toHaveBeenCalledWith(writeState, handler, 123);
  });

  it("notifyRedraw は bindingNode.notifyRedraw を委譲", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    const refs: any[] = [];
    binding.notifyRedraw(refs as any);
    expect(mockBindingNode.notifyRedraw).toHaveBeenCalledWith(refs);
  });

  it("applyChange は renderer.updatedBindings に含まれていない場合のみ bindingNode.applyChange を呼び、条件に応じて processedRefs に追加", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    engine.getBindings.mockReturnValue([binding]);
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      readonlyState: {},
      readonlyHandler: {},
    };
    
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).toHaveBeenCalledWith(renderer);
    expect(renderer.updatedBindings.has(binding)).toBe(true);
    
    // isLoopIndex が false で、動的依存がなく、bindingsが1つの場合はprocessedRefsに追加される
    expect(renderer.processedRefs.has(mockBindingState.ref)).toBe(true);

    // 2回目は updatedBindings に含まれているのでスキップされること
    mockBindingNode.applyChange.mockClear();
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
  });

  it("inactivate は isActive が true の場合のみ bindingNode と bindingState の inactivate を呼び、isActive を false にする", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    // 最初に activate していない状態で inactivate を呼ぶ
    binding.inactivate();
    expect(mockBindingNode.inactivate).not.toHaveBeenCalled();
    expect(mockBindingState.inactivate).not.toHaveBeenCalled();
    expect((binding as any).isActive).toBe(false);
    
    // activate してから inactivate を呼ぶ
    binding.activate();
    expect((binding as any).isActive).toBe(true);
    
    binding.inactivate();
    expect((binding as any).isActive).toBe(false);
    expect(mockBindingNode.inactivate).toHaveBeenCalledTimes(1);
    expect(mockBindingState.inactivate).toHaveBeenCalledTimes(1);
  });

  it("applyChange: isLoopIndex が true の場合は processedRefs に追加されない", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    mockBindingState.isLoopIndex = true;
    engine.getBindings.mockReturnValue([binding]);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
    };
    
    binding.applyChange(renderer);
    expect(renderer.processedRefs.has(mockBindingState.ref)).toBe(false);
  });

  it("applyChange: 動的依存がある場合は processedRefs に追加されない", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    engine.pathManager.dynamicDependencies.set("state.path", new Set(["dependency"]));
    engine.getBindings.mockReturnValue([binding]);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
    };
    
    binding.applyChange(renderer);
    expect(renderer.processedRefs.has(mockBindingState.ref)).toBe(false);
  });

  it("applyChange: bindingsが複数ある場合は processedRefs に追加されない", () => {
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    const otherBinding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    engine.getBindings.mockReturnValue([binding, otherBinding]);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
    };
    
    binding.applyChange(renderer);
    expect(renderer.processedRefs.has(mockBindingState.ref)).toBe(false);
  });

  it("applyChange: buildフェーズで buildable=false の場合は applyPhaseBinidings に追加してスキップ", () => {
    (mockBindingNode as any).buildable = false;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      applyPhaseBinidings: [] as any[],
      renderPhase: 'build',
    };
    
    binding.applyChange(renderer);
    expect(renderer.applyPhaseBinidings.includes(binding)).toBe(true);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
  });

  it("applyChange: applyフェーズで buildable=true の場合はスキップ", () => {
    (mockBindingNode as any).buildable = true;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      applyPhaseBinidings: [] as any[],
      renderPhase: 'apply',
    };
    
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
    expect(renderer.updatedBindings.has(binding)).toBe(false);
  });

  it("applyChange: buildフェーズで isSelectElement=true の場合は applySelectPhaseBinidings に追加してスキップ", () => {
    (mockBindingNode as any).buildable = false;
    (mockBindingNode as any).isSelectElement = true;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      applyPhaseBinidings: [] as any[],
      applySelectPhaseBinidings: [] as any[],
      renderPhase: 'build',
    };
    
    binding.applyChange(renderer);
    expect(renderer.applySelectPhaseBinidings.includes(binding)).toBe(true);
    expect(renderer.applyPhaseBinidings.includes(binding)).toBe(false);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
    
    // cleanup
    (mockBindingNode as any).isSelectElement = false;
  });

  it("applyChange: applySelectフェーズで buildable=true の場合はスキップ", () => {
    (mockBindingNode as any).buildable = true;
    (mockBindingNode as any).isSelectElement = false;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      renderPhase: 'applySelect',
    };
    
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
    expect(renderer.updatedBindings.has(binding)).toBe(false);
  });

  it("applyChange: applySelectフェーズで isSelectElement=false の場合はスキップ", () => {
    (mockBindingNode as any).buildable = false;
    (mockBindingNode as any).isSelectElement = false;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      renderPhase: 'applySelect',
    };
    
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
    expect(renderer.updatedBindings.has(binding)).toBe(false);
  });

  it("applyChange: applyフェーズで isSelectElement=true の場合はスキップ", () => {
    (mockBindingNode as any).buildable = false;
    (mockBindingNode as any).isSelectElement = true;
    const binding = createBinding(parentBindContent, node, engine, createBindingNode as any, createBindingState as any);
    
    const renderer: any = {
      updatedBindings: new Set(),
      processedRefs: new Set(),
      renderPhase: 'apply',
    };
    
    binding.applyChange(renderer);
    expect(mockBindingNode.applyChange).not.toHaveBeenCalled();
    expect(renderer.updatedBindings.has(binding)).toBe(false);
    
    // cleanup
    (mockBindingNode as any).isSelectElement = false;
  });
});
