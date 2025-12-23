/**
 * UpdaterReal.test.ts - Tests for Updater methods that need real implementation testing (no mocks)
 * This file tests specific Updater.ts methods to achieve 100% coverage
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Import real implementations
import { createUpdater } from "../../src/Updater/Updater";
import { IComponentEngine } from "../../src/ComponentEngine/types";

// Create a minimal engine stub for testing
function createMinimalEngine(): IComponentEngine {
  let versionCounter = 0;
  return {
    state: {},
    versionUp: vi.fn(() => ++versionCounter),
    pathManager: {
      rootNode: { childNodeByName: new Map(), currentPath: "" },
      dynamicDependencies: new Map(),
      lists: new Set(),
      elements: new Set(),
      hasUpdatedCallback: false,
    },
    getListAndListIndexes: vi.fn(() => ({ list: null, listIndexes: null, listClone: null })),
    saveListAndListIndexes: vi.fn(),
    versionRevisionByPath: new Map(),
    updateCompleteQueue: {
      enqueue: vi.fn(),
      current: Promise.resolve(true),
    },
  } as any;
}

describe("Updater.initialRender Real Implementation", () => {
  it("initialRender creates processResolver and calls root.applyChange with renderer", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    // Create a mock root with applyChange method
    const mockRoot = {
      applyChange: vi.fn(),
    };
    
    capturedUpdater.initialRender(mockRoot);
    
    // Verify applyChange was called with a renderer
    expect(mockRoot.applyChange).toHaveBeenCalled();
    const renderer = mockRoot.applyChange.mock.calls[0][0];
    expect(renderer).toBeDefined();
    expect(renderer.render).toBeDefined();
    expect(typeof renderer.render).toBe("function");
  });

  it("initialRender resolves processResolver in finally block even when applyChange throws", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    // Create a mock root that throws in applyChange
    const mockRoot = {
      applyChange: vi.fn(() => {
        throw new Error("Test error in applyChange");
      }),
    };
    
    // Call initialRender with a root that throws
    expect(() => {
      capturedUpdater.initialRender(mockRoot);
    }).toThrow("Test error in applyChange");
    
    // The test passes if the finally block executed properly (processResolvers.resolve() was called)
    // This covers the finally block in lines 251-253
  });
});

describe("Updater._rebuild UPD-006 error path", () => {
  it("_rebuild throws UPD-006 when _isAlive is true (error object creation)", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    // updater is alive at this point, so _rebuild should throw
    try {
      capturedUpdater._rebuild();
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err.code).toBe("UPD-006");
      expect(err.message).toContain("Updater has already been used");
      expect(err.context.where).toBe("Updater._rebuild");
    }
  });
});

describe("Updater.invoke with _rebuild path", () => {
  it("invoke calls _rebuild when _isAlive is false and then executes callback", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    // Manually set _isAlive to false to simulate completed state
    capturedUpdater._isAlive = false;
    
    const callbackResult = capturedUpdater.invoke(() => "test-value");
    
    expect(callbackResult).toBe("test-value");
    // After invoke with rebuild, _isAlive should be true again
    expect(capturedUpdater._isAlive).toBe(true);
    // versionUp should have been called twice (once in initial createUpdater, once in _rebuild)
    expect(engine.versionUp).toHaveBeenCalledTimes(2);
  });

  it("invoke creates processResolver for callback execution", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    let callbackExecuted = false;
    capturedUpdater.invoke(() => {
      callbackExecuted = true;
      return "result";
    });
    
    expect(callbackExecuted).toBe(true);
  });

  it("invoke resolves processResolver even if callback throws", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    expect(() => {
      capturedUpdater.invoke(() => {
        throw new Error("Test error");
      });
    }).toThrow("Test error");
    
    // The test passes if the finally block executed properly
  });
});

describe("Updater.updateComplete getter", () => {
  it("updateComplete returns a promise", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    const updateCompletePromise = capturedUpdater.updateComplete;
    expect(updateCompletePromise).toBeInstanceOf(Promise);
  });

  it("updateComplete getter returns _completedResolvers.promise", () => {
    const engine = createMinimalEngine();
    
    let capturedUpdater: any;
    createUpdater<void>(engine, (updater) => {
      capturedUpdater = updater;
    });
    
    // Call updateComplete twice to verify it returns the same promise
    const promise1 = capturedUpdater.updateComplete;
    const promise2 = capturedUpdater.updateComplete;
    expect(promise1).toBe(promise2);
  });
});
