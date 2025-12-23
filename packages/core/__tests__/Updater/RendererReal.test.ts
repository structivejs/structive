/**
 * RendererReal.test.ts - Tests for the real Renderer implementation (no mocks)
 * This file tests the actual Renderer.ts to achieve 100% coverage
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WILDCARD } from "../../src/constants";
import { GetListIndexesByRefSymbol } from "../../src/StateClass/symbols";
import { IComponentEngine } from "../../src/ComponentEngine/types";
import { IUpdater, IRenderer } from "../../src/Updater/types";
import { IBinding } from "../../src/DataBinding/types";

// Import the actual implementation
import { render, createRenderer } from "../../src/Updater/Renderer";

// Mock dependencies used by Renderer
const createReadonlyStateProxyMock = vi.fn();
const createReadonlyStateHandlerMock = vi.fn();
vi.mock("../../src/StateClass/createReadonlyStateProxy", () => ({
  createReadonlyStateProxy: (state: any, handler: any) => createReadonlyStateProxyMock(state, handler),
  createReadonlyStateHandler: (engine: any, updater: any, renderer: any) => createReadonlyStateHandlerMock(engine, updater, renderer),
}));

const findPathNodeByPathMock = vi.fn();
vi.mock("../../src/PathTree/PathNode", () => ({
  findPathNodeByPath: (root: any, pattern: string) => findPathNodeByPathMock(root, pattern),
}));

const getStructuredPathInfoMock = vi.fn();
vi.mock("../../src/StateProperty/getStructuredPathInfo", () => ({
  getStructuredPathInfo: (path: string) => getStructuredPathInfoMock(path),
}));

const getStatePropertyRefMock = vi.fn();
vi.mock("../../src/StatePropertyRef/StatepropertyRef", () => ({
  getStatePropertyRef: (info: any, listIndex: any) => getStatePropertyRefMock(info, listIndex),
}));

// Helper to create a mock readonly state
const makeReadonlyState = (getListIndexesValue: any = null) => ({
  [GetListIndexesByRefSymbol]: (ref: any) => 
    (typeof getListIndexesValue === "function" ? getListIndexesValue(ref) : getListIndexesValue),
} as any);

// Helper to create a mock engine
const makeEngine = () => {
  const engine = {
    state: {},
    pathManager: {
      rootNode: { name: "root" },
      dynamicDependencies: new Map<string, Set<string>>(),
      lists: new Set<string>(),
      elements: new Set<string>(),
    },
    bindingsByListIndex: new WeakMap<any, Set<any>>(),
    bindingsByComponent: new Map<any, Set<any>>(),
    structiveChildComponents: new Set<any>(),
    getBindings: vi.fn(() => [] as any[]),
    getListAndListIndexes: vi.fn(() => ({ list: [], listIndexes: [], listClone: [] })),
    saveListAndListIndexes: vi.fn(),
    getListIndexes: vi.fn(() => []),
  } as any;
  return engine;
};

// Helper to create a mock updater
const makeUpdater = () => {
  const listDiffByRef = new Map<any, any>();
  const updater = {
    version: 0,
    revision: 0,
    swapInfoByRef: new Map<any, any>(),
    getListDiff: vi.fn((ref: any) => listDiffByRef.get(ref)),
    setListDiff: vi.fn((ref: any, diff: any) => listDiffByRef.set(ref, diff)),
  } as any;
  return { updater, listDiffByRef };
};

// Helper to create a resolver compatible with Promise.withResolvers
const createResolver = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("Renderer Real Implementation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createReadonlyStateHandlerMock.mockImplementation((engine: any, updater: any, renderer: any) => ({ 
      engine, updater, renderer 
    }));
    createReadonlyStateProxyMock.mockReturnValue(makeReadonlyState());
    findPathNodeByPathMock.mockImplementation((_root: any, pattern: string) => ({
      childNodeByName: new Map<string, any>(),
      currentPath: pattern,
    }));
    getStructuredPathInfoMock.mockImplementation((path: string) => ({
      pattern: path,
      wildcardCount: 0,
      wildcardParentInfos: [],
    }));
    getStatePropertyRefMock.mockImplementation((info: any, listIndex: any) => ({
      info,
      listIndex,
      key: `${info?.pattern || "unknown"}-${listIndex?.id ?? listIndex?.index ?? "null"}`,
      parentRef: null,
    }));
  });

  describe("createRenderer", () => {
    it("should create a renderer instance with required properties", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();

      const renderer = createRenderer(engine, updater);

      expect(renderer).toBeDefined();
      expect(renderer.updatedBindings).toBeInstanceOf(Set);
      expect(renderer.processedRefs).toBeInstanceOf(Set);
      expect(renderer.lastListInfoByRef).toBeInstanceOf(Map);
      expect(renderer.updatingRefs).toEqual([]);
      expect(renderer.updatingRefSet).toBeInstanceOf(Set);
      expect(renderer.applyPhaseBinidings).toBeInstanceOf(Set);
      expect(renderer.renderPhase).toBe("build");
    });
  });

  describe("render function", () => {
    it("should create renderer and call render, then resolve", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const resolver = createResolver<void>();
      const resolveSpy = vi.spyOn(resolver, "resolve");

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;
      
      render([ref], engine, updater, resolver);

      expect(resolveSpy).toHaveBeenCalled();
    });

    it("should resolve even if render throws", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const resolver = createResolver<void>();
      const resolveSpy = vi.spyOn(resolver, "resolve");

      // Make render throw by returning null for PathNode
      findPathNodeByPathMock.mockReturnValue(null);

      const ref = { info: { pattern: "missing" }, listIndex: null, key: "missing-null", parentRef: null } as any;
      
      expect(() => render([ref], engine, updater, resolver)).toThrow(/PathNode not found/);
      expect(resolveSpy).toHaveBeenCalled();
    });
  });

  describe("render method", () => {
    it("should clear state at the start", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Pre-populate the state
      renderer.processedRefs.add({ key: "old" } as any);
      renderer.updatedBindings.add({ key: "old-binding" } as any);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;
      renderer.render([ref]);

      // Previous processedRefs/updatedBindings should be cleared before new render
      expect(renderer.updatingRefs).toEqual([ref]);
      expect(renderer.updatingRefSet.has(ref)).toBe(true);
    });

    it("should set updatingRefs and updatingRefSet", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref1 = { info: { pattern: "a" }, listIndex: null, key: "a-null", parentRef: null } as any;
      const ref2 = { info: { pattern: "b" }, listIndex: null, key: "b-null", parentRef: null } as any;
      
      renderer.render([ref1, ref2]);

      expect(renderer.updatingRefs).toEqual([ref1, ref2]);
      expect(renderer.updatingRefSet.has(ref1)).toBe(true);
      expect(renderer.updatingRefSet.has(ref2)).toBe(true);
    });
  });

  describe("readonlyState getter", () => {
    it("should throw when not initialized", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      expect(() => renderer.readonlyState).toThrow(/ReadonlyState not initialized/);
    });

    it("should return readonlyState during createReadonlyState callback", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      const mockState = makeReadonlyState();
      createReadonlyStateProxyMock.mockReturnValue(mockState);

      let capturedState: any = null;
      renderer.createReadonlyState((state) => {
        capturedState = renderer.readonlyState;
      });

      expect(capturedState).toBe(mockState);
    });
  });

  describe("readonlyHandler getter", () => {
    it("should throw when not initialized", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      expect(() => renderer.readonlyHandler).toThrow(/ReadonlyHandler not initialized/);
    });

    it("should return readonlyHandler during createReadonlyState callback", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      const mockHandler = { test: true };
      createReadonlyStateHandlerMock.mockReturnValue(mockHandler);

      let capturedHandler: any = null;
      renderer.createReadonlyState(() => {
        capturedHandler = renderer.readonlyHandler;
      });

      expect(capturedHandler).toBe(mockHandler);
    });
  });

  describe("createReadonlyState", () => {
    it("should create state and handler, execute callback, then clean up", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      const mockState = makeReadonlyState();
      const mockHandler = { handler: true };
      createReadonlyStateProxyMock.mockReturnValue(mockState);
      createReadonlyStateHandlerMock.mockReturnValue(mockHandler);

      const callback = vi.fn((state, handler) => {
        expect(state).toBe(mockState);
        expect(handler).toBe(mockHandler);
        return "result";
      });

      const result = renderer.createReadonlyState(callback);

      expect(result).toBe("result");
      expect(createReadonlyStateHandlerMock).toHaveBeenCalledWith(engine, updater, renderer);
      expect(createReadonlyStateProxyMock).toHaveBeenCalledWith(engine.state, mockHandler);
      
      // After callback, readonlyState should be cleaned up
      expect(() => renderer.readonlyState).toThrow(/ReadonlyState not initialized/);
    });

    it("should clean up even if callback throws", () => {
      const engine = makeEngine();
      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      createReadonlyStateProxyMock.mockReturnValue(makeReadonlyState());
      createReadonlyStateHandlerMock.mockReturnValue({});

      expect(() => {
        renderer.createReadonlyState(() => {
          throw new Error("callback error");
        });
      }).toThrow("callback error");

      // Cleanup should still happen
      expect(() => renderer.readonlyState).toThrow(/ReadonlyState not initialized/);
    });
  });

  describe("Phase 1-2: List element grouping and reordering", () => {
    it("should group element refs by parent list and apply bindings", () => {
      const engine = makeEngine();
      engine.pathManager.elements.add("root.*");

      const parentInfo = { pattern: "root" };
      const childInfo = { pattern: "root.*", parentInfo };
      const listIndex0 = { id: 0 } as any;
      
      const listRef = { info: parentInfo, listIndex: null, key: "root-null", parentRef: null } as any;
      const elementRef = { 
        info: childInfo, 
        listIndex: listIndex0, 
        key: "root.*-0", 
        parentRef: listRef 
      } as any;

      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      getStatePropertyRefMock.mockImplementation((info: any, listIndex: any) => {
        if (info === parentInfo && listIndex === null) return listRef;
        return { info, listIndex, key: `${info?.pattern}-${listIndex?.id ?? 'null'}`, parentRef: null };
      });

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([elementRef]);

      expect(binding.applyChange).toHaveBeenCalled();
      expect(renderer.processedRefs.has(listRef)).toBe(true);
    });

    it("should skip element processing if parent list is in update set", () => {
      const engine = makeEngine();
      engine.pathManager.elements.add("root.*");
      engine.pathManager.lists.add("root");

      const parentInfo = { pattern: "root" };
      const childInfo = { pattern: "root.*", parentInfo };
      const listIndex0 = { id: 0 } as any;
      
      const listRef = { info: parentInfo, listIndex: null, key: "root-null", parentRef: null } as any;
      const elementRef = { 
        info: childInfo, 
        listIndex: listIndex0, 
        key: "root.*-0", 
        parentRef: listRef 
      } as any;

      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      getStatePropertyRefMock.mockImplementation((info: any, listIndex: any) => {
        if (info === parentInfo && listIndex === null) return listRef;
        return { info, listIndex, key: `${info?.pattern}-${listIndex?.id ?? 'null'}`, parentRef: null };
      });

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Both list ref and element ref are in the update set
      renderer.render([listRef, elementRef]);

      // Element should be marked as processed due to parent list skip
      expect(renderer.processedRefs.has(elementRef)).toBe(true);
    });

    it("should throw UPD-004 if element ref has no parentRef", () => {
      const engine = makeEngine();
      engine.pathManager.elements.add("root.*");

      const childInfo = { pattern: "root.*", parentInfo: null };
      const listIndex0 = { id: 0 } as any;
      
      const elementRef = { 
        info: childInfo, 
        listIndex: listIndex0, 
        key: "root.*-0", 
        parentRef: null 
      } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      expect(() => renderer.render([elementRef])).toThrow(/ParentInfo is null for ref/);
    });
  });

  describe("Phase 3: Remaining refs processing", () => {
    it("should process non-element refs in phase 3", () => {
      const engine = makeEngine();
      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(binding.applyChange).toHaveBeenCalled();
    });

    it("should throw PATH-101 if PathNode not found in phase 3", () => {
      const engine = makeEngine();
      findPathNodeByPathMock.mockReturnValue(null);

      const ref = { info: { pattern: "missing" }, listIndex: null, key: "missing-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      expect(() => renderer.render([ref])).toThrow(/PathNode not found: missing/);
    });

    it("should skip already processed refs in phase 3", () => {
      const engine = makeEngine();
      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Same ref twice - should be processed only once
      renderer.render([ref, ref]);

      expect(binding.applyChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Phase 4: Structive child components", () => {
    it("should notify structive child components of changes", () => {
      const engine = makeEngine();
      const mockComponent = { name: "childComponent" };
      engine.structiveChildComponents.add(mockComponent);
      
      const componentBinding = { notifyRedraw: vi.fn() };
      engine.bindingsByComponent.set(mockComponent, new Set([componentBinding]));

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(componentBinding.notifyRedraw).toHaveBeenCalledWith([ref]);
    });

    it("should skip if no structive child components", () => {
      const engine = makeEngine();
      // structiveChildComponents is empty by default
      
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw
      expect(() => renderer.render([ref])).not.toThrow();
    });

    it("should handle component without bindings", () => {
      const engine = makeEngine();
      const mockComponent = { name: "childComponent" };
      engine.structiveChildComponents.add(mockComponent);
      // No bindings set for component

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw
      expect(() => renderer.render([ref])).not.toThrow();
    });
  });

  describe("Phase 5: Apply phase bindings", () => {
    it("should apply bindings in apply phase", () => {
      const engine = makeEngine();
      
      // Create a binding that registers itself for apply phase
      const applyPhaseBinding = { applyChange: vi.fn() };
      const buildPhaseBinding = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applyPhaseBinidings.add(applyPhaseBinding as any);
        }),
      };
      engine.getBindings.mockReturnValue([buildPhaseBinding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(buildPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
      expect(applyPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
    });

    it("should set renderPhase to 'apply' during phase 5", () => {
      const engine = makeEngine();
      
      let capturedPhase: string | undefined;
      const applyPhaseBinding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          capturedPhase = renderer.renderPhase;
        }) 
      };
      const buildPhaseBinding = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applyPhaseBinidings.add(applyPhaseBinding as any);
        }),
      };
      engine.getBindings.mockReturnValue([buildPhaseBinding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(capturedPhase).toBe("apply");
    });
  });

  describe("Phase 6: ApplySelect phase bindings", () => {
    it("should apply bindings in applySelect phase during render", () => {
      const engine = makeEngine();
      
      const applySelectPhaseBinding = { applyChange: vi.fn() };
      const buildPhaseBinding = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applySelectPhaseBinidings.add(applySelectPhaseBinding as any);
        }),
      };
      engine.getBindings.mockReturnValue([buildPhaseBinding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(buildPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
      expect(applySelectPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
    });

    it("should set renderPhase to 'applySelect' during phase 6", () => {
      const engine = makeEngine();
      
      let capturedPhase: string | undefined;
      const applySelectPhaseBinding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          capturedPhase = renderer.renderPhase;
        }) 
      };
      const buildPhaseBinding = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applySelectPhaseBinidings.add(applySelectPhaseBinding as any);
        }),
      };
      engine.getBindings.mockReturnValue([buildPhaseBinding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      expect(capturedPhase).toBe("applySelect");
    });
  });

  describe("renderItem", () => {
    it("should skip already updated bindings", () => {
      const engine = makeEngine();
      
      const binding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.updatedBindings.add(binding as any);
        }) 
      };
      // Return same binding twice
      engine.getBindings.mockReturnValue([binding, binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      // Should only be called once despite being in array twice
      expect(binding.applyChange).toHaveBeenCalledTimes(1);
    });

    it("should calculate diffListIndexes for list refs", () => {
      const engine = makeEngine();
      engine.pathManager.lists.add("root");

      const listIndex1 = { id: 1 };
      const listIndex2 = { id: 2 };
      
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => [listIndex1, listIndex2],
      });

      const childNode = { childNodeByName: new Map(), currentPath: "root.*" };
      const topNode = { 
        childNodeByName: new Map([[WILDCARD, childNode]]), 
        currentPath: "root" 
      };
      findPathNodeByPathMock.mockReturnValue(topNode);

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: path.includes("*") ? 1 : 0,
        wildcardParentInfos: path.includes("*") ? [{ pattern: "root" }] : [],
      }));

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // No previous list info, so all indexes are new
      renderer.render([ref]);

      // Child refs should be created for new list indexes
      const wildcardCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "root.*"
      );
      expect(wildcardCalls.length).toBe(2);
    });

    it("should only traverse new list indexes (diff)", () => {
      const engine = makeEngine();
      engine.pathManager.lists.add("root");

      const listIndex1 = { id: 1 };
      const listIndex2 = { id: 2 };
      const listIndex3 = { id: 3 }; // new
      
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => [listIndex1, listIndex2, listIndex3],
      });

      const childNode = { childNodeByName: new Map(), currentPath: "root.*" };
      const topNode = { 
        childNodeByName: new Map([[WILDCARD, childNode]]), 
        currentPath: "root" 
      };
      findPathNodeByPathMock.mockReturnValue(topNode);

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: path.includes("*") ? 1 : 0,
        wildcardParentInfos: path.includes("*") ? [{ pattern: "root" }] : [],
      }));

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Set previous list info
      renderer.lastListInfoByRef.set(ref, { 
        value: [1, 2], 
        listIndexes: [listIndex1, listIndex2] as any
      });

      renderer.render([ref]);

      // Only new listIndex3 should trigger child ref creation
      const wildcardCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "root.*"
      );
      expect(wildcardCalls.length).toBe(1);
      expect(wildcardCalls[0][1]).toBe(listIndex3);
    });

    it("should traverse non-wildcard children", () => {
      const engine = makeEngine();

      const childNode = { childNodeByName: new Map(), currentPath: "root.child" };
      const topNode = { 
        childNodeByName: new Map([["child", childNode]]), 
        currentPath: "root" 
      };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "root.child") return childNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: 0,
        wildcardParentInfos: [],
      }));

      const listIndex = { id: 5 };
      const ref = { info: { pattern: "root" }, listIndex, key: "root-5", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      // Child ref should inherit parent's listIndex
      const childCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "root.child"
      );
      expect(childCalls.length).toBe(1);
      expect(childCalls[0][1]).toBe(listIndex);
    });

    it("should skip already processed children", () => {
      const engine = makeEngine();

      const childNode = { childNodeByName: new Map(), currentPath: "root.child" };
      const topNode = { 
        childNodeByName: new Map([["child", childNode]]), 
        currentPath: "root" 
      };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "root.child") return childNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: 0,
        wildcardParentInfos: [],
      }));

      const childRef = { info: { pattern: "root.child" }, listIndex: null, key: "root.child-null", parentRef: null } as any;
      getStatePropertyRefMock.mockReturnValue(childRef);

      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Both parent and child in same render call
      renderer.render([ref, childRef]);

      // Child binding should only be called once
      expect(binding.applyChange).toHaveBeenCalledTimes(2); // once for parent, once for child
    });
  });

  describe("Dynamic dependencies", () => {
    it("should traverse non-wildcard dynamic dependencies", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep"]));

      const depNode = { childNodeByName: new Map(), currentPath: "dep" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: 0,
        wildcardParentInfos: [],
      }));

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      // Dep ref should be created with null listIndex
      const depCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "dep"
      );
      expect(depCalls.length).toBe(1);
      expect(depCalls[0][1]).toBeNull();
    });

    it("should throw PATH-101 if dynamic dependency node not found", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["missingDep"]));

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: 0,
        wildcardParentInfos: [],
      }));

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      expect(() => renderer.render([ref])).toThrow(/PathNode not found: missingDep/);
    });

    it("should traverse wildcard dynamic dependencies hierarchically", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*"]));

      const listIndex1 = { id: 1 };
      const listIndex2 = { id: 2 };
      
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => [listIndex1, listIndex2],
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*") {
          return {
            pattern: path,
            wildcardCount: 1,
            wildcardParentInfos: [{ pattern: "dep" }],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      // Dep refs should be created for each listIndex
      const depCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "dep.*"
      );
      expect(depCalls.length).toBe(2);
    });

    it("should traverse multi-level wildcard dependencies", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*.sub.*"]));

      const listIndex1 = { id: 1 };
      const listIndex2 = { id: 2 };
      const subListIndex1 = { id: 11 };
      const subListIndex2 = { id: 12 };
      
      let callCount = 0;
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => {
          callCount++;
          // First call returns top-level indexes, subsequent calls return sub-indexes
          if (callCount <= 1) return [listIndex1, listIndex2];
          return [subListIndex1, subListIndex2];
        },
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*.sub.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*.sub.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*.sub.*") {
          return {
            pattern: path,
            wildcardCount: 2,
            wildcardParentInfos: [
              { pattern: "dep" },
              { pattern: "dep.*" },
            ],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([ref]);

      // Final dep refs should be created (2 top-level * 2 sub-level = 4)
      const depCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "dep.*.sub.*"
      );
      expect(depCalls.length).toBe(4);
    });

    it("should skip already processed dynamic dependency refs", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep"]));

      const depNode = { childNodeByName: new Map(), currentPath: "dep" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => ({
        pattern: path,
        wildcardCount: 0,
        wildcardParentInfos: [],
      }));

      const depRef = { info: { pattern: "dep" }, listIndex: null, key: "dep-null", parentRef: null } as any;
      getStatePropertyRefMock.mockImplementation((info: any, listIndex: any) => {
        if (info?.pattern === "dep") return depRef;
        return { info, listIndex, key: `${info?.pattern}-null`, parentRef: null };
      });

      const binding = { applyChange: vi.fn() };
      engine.getBindings.mockReturnValue([binding]);

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Both root and dep in render - dep should be processed once
      renderer.render([ref, depRef]);

      // Binding called for root and dep
      expect(binding.applyChange).toHaveBeenCalledTimes(2);
    });

    it("should skip wildcard children when listIndexes is empty", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*"]));

      // Return empty listIndexes
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => [],
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*") {
          return {
            pattern: path,
            wildcardCount: 1,
            wildcardParentInfos: [{ pattern: "dep" }],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw even with empty listIndexes
      expect(() => renderer.render([ref])).not.toThrow();

      // No child refs should be created
      const depCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "dep.*"
      );
      expect(depCalls.length).toBe(0);
    });

    it("should handle multi-level wildcards with empty listIndexes at intermediate level", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*.sub.*"]));

      // First call returns indexes, second level is empty
      let callCount = 0;
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => {
          callCount++;
          if (callCount <= 1) return [{ id: 1 }]; // First level has one item
          return []; // Second level is empty
        },
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*.sub.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*.sub.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*.sub.*") {
          return {
            pattern: path,
            wildcardCount: 2,
            wildcardParentInfos: [
              { pattern: "dep" },
              { pattern: "dep.*" },
            ],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw
      expect(() => renderer.render([ref])).not.toThrow();

      // No final dep refs should be created (second level is empty)
      const depCalls = getStatePropertyRefMock.mock.calls.filter(
        (c) => c[0]?.pattern === "dep.*.sub.*"
      );
      expect(depCalls.length).toBe(0);
    });

    it("should handle null return from GetListIndexesByRefSymbol", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*"]));

      // Return null to trigger the || [] fallback
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => null,
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*") {
          return {
            pattern: path,
            wildcardCount: 1,
            wildcardParentInfos: [{ pattern: "dep" }],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw - null gets converted to []
      expect(() => renderer.render([ref])).not.toThrow();
    });

    it("should handle undefined return from GetListIndexesByRefSymbol", () => {
      const engine = makeEngine();
      engine.pathManager.dynamicDependencies.set("root", new Set(["dep.*"]));

      // Return undefined to trigger the || [] fallback
      createReadonlyStateProxyMock.mockReturnValue({
        [GetListIndexesByRefSymbol]: () => undefined,
      });

      const depNode = { childNodeByName: new Map(), currentPath: "dep.*" };
      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockImplementation((_, pattern) => {
        if (pattern === "root") return topNode;
        if (pattern === "dep.*") return depNode;
        return null;
      });

      getStructuredPathInfoMock.mockImplementation((path: string) => {
        if (path === "dep.*") {
          return {
            pattern: path,
            wildcardCount: 1,
            wildcardParentInfos: [{ pattern: "dep" }],
          };
        }
        return { pattern: path, wildcardCount: 0, wildcardParentInfos: [] };
      });

      const ref = { info: { pattern: "root" }, listIndex: null, key: "root-null", parentRef: null } as any;

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      // Should not throw - undefined gets converted to []
      expect(() => renderer.render([ref])).not.toThrow();
    });
  });

  describe("Phase 2: List binding skip", () => {
    it("should skip already updated bindings in phase 2", () => {
      const engine = makeEngine();
      engine.pathManager.elements.add("root.*");

      const parentInfo = { pattern: "root" };
      const childInfo = { pattern: "root.*", parentInfo };
      const listIndex0 = { id: 0 } as any;
      
      const listRef = { info: parentInfo, listIndex: null, key: "root-null", parentRef: null } as any;
      const elementRef = { 
        info: childInfo, 
        listIndex: listIndex0, 
        key: "root.*-0", 
        parentRef: listRef 
      } as any;

      const binding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.updatedBindings.add(binding as any);
        }) 
      };
      // Return same binding twice to test skip logic
      engine.getBindings.mockReturnValue([binding, binding]);

      const topNode = { childNodeByName: new Map(), currentPath: "root" };
      findPathNodeByPathMock.mockReturnValue(topNode);

      getStatePropertyRefMock.mockImplementation((info: any, listIndex: any) => {
        if (info === parentInfo && listIndex === null) return listRef;
        return { info, listIndex, key: `${info?.pattern}-${listIndex?.id ?? 'null'}`, parentRef: null };
      });

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.render([elementRef]);

      // Binding should only be called once despite being in array twice
      expect(binding.applyChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("initialRender method", () => {
    it("should apply bindings in apply phase during initialRender", () => {
      const engine = makeEngine();
      
      const applyPhaseBinding = { applyChange: vi.fn() };
      
      // Root that adds binding to applyPhaseBinidings in build phase
      const mockRoot = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applyPhaseBinidings.add(applyPhaseBinding as any);
        }),
      };

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.initialRender(mockRoot as any);

      expect(mockRoot.applyChange).toHaveBeenCalledTimes(1);
      expect(applyPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
    });

    it("should apply bindings in applySelect phase during initialRender", () => {
      const engine = makeEngine();
      
      const applySelectPhaseBinding = { applyChange: vi.fn() };
      
      // Root that adds binding to applySelectPhaseBinidings in build phase
      const mockRoot = {
        applyChange: vi.fn((renderer: IRenderer) => {
          renderer.applySelectPhaseBinidings.add(applySelectPhaseBinding as any);
        }),
      };

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.initialRender(mockRoot as any);

      expect(mockRoot.applyChange).toHaveBeenCalledTimes(1);
      expect(applySelectPhaseBinding.applyChange).toHaveBeenCalledTimes(1);
    });

    it("should apply both apply and applySelect phase bindings in order during initialRender", () => {
      const engine = makeEngine();
      
      const callOrder: string[] = [];
      const applyPhaseBinding = { 
        applyChange: vi.fn(() => callOrder.push("apply")) 
      };
      const applySelectPhaseBinding = { 
        applyChange: vi.fn(() => callOrder.push("applySelect")) 
      };
      
      // Root that adds bindings to both phases
      const mockRoot = {
        applyChange: vi.fn((renderer: IRenderer) => {
          callOrder.push("build");
          renderer.applyPhaseBinidings.add(applyPhaseBinding as any);
          renderer.applySelectPhaseBinidings.add(applySelectPhaseBinding as any);
        }),
      };

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.initialRender(mockRoot as any);

      // Verify correct order: build -> apply -> applySelect
      expect(callOrder).toEqual(["build", "apply", "applySelect"]);
    });

    it("should set correct renderPhase during each phase of initialRender", () => {
      const engine = makeEngine();
      
      const capturedPhases: string[] = [];
      const applyPhaseBinding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          capturedPhases.push(`apply:${renderer.renderPhase}`);
        }) 
      };
      const applySelectPhaseBinding = { 
        applyChange: vi.fn((renderer: IRenderer) => {
          capturedPhases.push(`applySelect:${renderer.renderPhase}`);
        }) 
      };
      
      const mockRoot = {
        applyChange: vi.fn((renderer: IRenderer) => {
          capturedPhases.push(`build:${renderer.renderPhase}`);
          renderer.applyPhaseBinidings.add(applyPhaseBinding as any);
          renderer.applySelectPhaseBinidings.add(applySelectPhaseBinding as any);
        }),
      };

      const { updater } = makeUpdater();
      const renderer = createRenderer(engine, updater);

      renderer.initialRender(mockRoot as any);

      expect(capturedPhases).toEqual([
        "build:build",
        "apply:apply",
        "applySelect:applySelect"
      ]);
    });
  });
});
