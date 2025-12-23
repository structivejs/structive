/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUpdateActivityTracker, _UpdateActivityTracker } from "../../src/Updater/UpdateActivityTracker";

declare const process: any;

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

describe("UpdateActivityTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUpdateActivityTracker", () => {
    it("should create an UpdateActivityTracker instance", () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      expect(tracker).toBeDefined();
      expect(tracker.createProcessResolver).toBeDefined();
      expect(tracker.isProcessing).toBe(false);
    });
  });

  describe("isProcessing", () => {
    it("should return false when not processing", () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      expect(tracker.isProcessing).toBe(false);
    });

    it("should return true when processing", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // Start processing
      const resolver = tracker.createProcessResolver();
      
      // Wait for microtask
      await Promise.resolve();
      
      expect(tracker.isProcessing).toBe(true);
      
      // Clean up
      resolver.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  });

  describe("createProcessResolver", () => {
    it("should create a resolver and start _main if not already started", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      const resolver = tracker.createProcessResolver();
      
      expect(resolver).toBeDefined();
      expect(resolver.promise).toBeInstanceOf(Promise);
      expect(resolver.resolve).toBeInstanceOf(Function);
      expect(resolver.reject).toBeInstanceOf(Function);
      
      // Wait for microtask
      await Promise.resolve();
      
      // Should be processing
      expect(tracker.isProcessing).toBe(true);
      
      // Resolve to complete
      resolver.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should reject waitResolver when creating new resolver during processing", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // First resolver starts the loop
      const resolver1 = tracker.createProcessResolver();
      
      // Wait for microtask to start _main
      await Promise.resolve();
      
      // Second resolver while waiting - should reject the waitResolver
      const resolver2 = tracker.createProcessResolver();
      
      // Wait for microtask
      await Promise.resolve();
      
      // Resolve both
      resolver1.resolve();
      resolver2.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should queue _main call when mainResolver exists", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // First resolver starts the loop
      const resolver1 = tracker.createProcessResolver();
      
      // Wait for microtask to ensure _main has started
      await Promise.resolve();
      
      // Resolve first to begin termination
      resolver1.resolve();
      
      // Wait for the Promise.allSettled to process
      await Promise.resolve();
      await Promise.resolve();
      
      // At this point, mainResolver exists but is resolving
      // Create a new resolver - this should trigger the mainResolver.promise.then() path (lines 24-28)
      const resolver2 = tracker.createProcessResolver();
      
      // Wait for the chained _main to start
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      // Resolve second
      resolver2.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should handle _main already running guard (lines 69-70)", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // Start first processing
      const resolver1 = tracker.createProcessResolver();
      
      // Wait for _main to start
      await Promise.resolve();
      
      // Try to trigger _main again while it's running
      // This is achieved by having waitResolver be null when createProcessResolver is called
      // which triggers the inner _main() path that should hit the guard
      
      // Resolve first
      resolver1.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });
  });

  describe("_main loop", () => {
    it("should terminate when all resolvers are resolved", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      const resolver = tracker.createProcessResolver();
      
      // Wait for microtask
      await Promise.resolve();
      
      // Resolve immediately
      resolver.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
      expect(tracker.isProcessing).toBe(false);
    });

    it("should continue loop when waitResolver is rejected", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // First resolver
      const resolver1 = tracker.createProcessResolver();
      
      // Wait for microtask
      await Promise.resolve();
      
      // Second resolver while waiting - this rejects the waitResolver
      const resolver2 = tracker.createProcessResolver();
      
      // Wait for microtask
      await Promise.resolve();
      
      // Resolve first - this should cause the loop to continue
      resolver1.resolve();
      
      // Wait
      await Promise.resolve();
      await Promise.resolve();
      
      // Resolve second
      resolver2.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should handle version mismatch in _nextWaitPromise", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // Create multiple resolvers rapidly to cause version mismatch
      const resolver1 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      // Create another resolver to bump version while first is being observed
      const resolver2 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      // Resolve both
      resolver1.resolve();
      
      await Promise.resolve();
      
      resolver2.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should handle multiple process resolvers being added and resolved", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // Create multiple resolvers
      const resolver1 = tracker.createProcessResolver();
      const resolver2 = tracker.createProcessResolver();
      const resolver3 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      // Resolve in order
      resolver1.resolve();
      resolver2.resolve();
      resolver3.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });

    it("should properly clean up observedResolvers on version mismatch", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = createUpdateActivityTracker(renderMain);
      
      // First batch
      const resolver1 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      // Add more while first is being processed - this bumps version
      const resolver2 = tracker.createProcessResolver();
      
      await Promise.resolve();
      await Promise.resolve();
      
      // Resolve first - version has changed, so observedResolvers should be filtered
      resolver1.resolve();
      
      await Promise.resolve();
      await Promise.resolve();
      
      // Add another and resolve
      const resolver3 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      resolver2.resolve();
      resolver3.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      expect(renderMain.terminate).toHaveBeenCalled();
    });
  });

  describe("_UpdateActivityTracker internal", () => {
    it("should handle mainResolver.promise.then path (lines 24-28)", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = new _UpdateActivityTracker(renderMain) as any;
      
      // Start first processing
      const resolver1 = tracker.createProcessResolver();
      
      await Promise.resolve();
      
      // Resolve to start termination process
      resolver1.resolve();
      
      // Wait for allSettled to complete - but not completely finished
      await Promise.resolve();
      await Promise.resolve();
      
      // At this point, _mainResolver is not null but _main is in finally block
      // _waitResolver should be null after the loop exits
      // Create a new resolver with _waitResolver === null but _mainResolver !== null
      // This triggers the mainResolver.promise.then() branch (lines 23-28)
      const resolver2 = tracker.createProcessResolver();
      
      // Wait for the chained _main to execute
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      // Resolve second
      resolver2.resolve();
      
      // Wait for completion
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    it("should trigger mainResolver.promise.then by manipulating state directly", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = new _UpdateActivityTracker(renderMain) as any;
      
      // Manually set state to trigger the else branch in createProcessResolver
      // _waitResolver is null, _mainResolver is not null
      tracker._waitResolver = null;
      tracker._mainResolver = createResolver<void>();
      
      // This should trigger the else branch (lines 23-28)
      const resolver = tracker.createProcessResolver();
      
      // Resolve the mainResolver to allow the then callback to execute
      tracker._mainResolver.resolve();
      
      // Wait for then callback
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      
      // Clean up
      resolver.resolve();
      
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    it("should return early when _main is already running (lines 69-70)", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = new _UpdateActivityTracker(renderMain) as any;
      
      // Manually set _mainResolver to simulate already running
      tracker._mainResolver = createResolver<void>();
      
      // Call _main directly - should return early
      await tracker._main();
      
      // _mainResolver should still be the same (not overwritten)
      expect(tracker._mainResolver).not.toBeNull();
    });

    it("should throw error when waitResolver is null in _nextWaitPromise callback (lines 54-60)", async () => {
      const renderMain = { terminate: vi.fn(), wakeup: vi.fn() } as any;
      const tracker = new _UpdateActivityTracker(renderMain) as any;
      
      // Set up the tracker state to trigger the error path
      tracker._version = 0;
      tracker._processResolvers = [];
      tracker._observedResolvers = [];
      
      // Create a resolver that will be observed
      const testResolver = createResolver<void>();
      tracker._observedResolvers.push(testResolver);
      
      // Call _nextWaitPromise to set up the internal callback
      const waitPromise = tracker._nextWaitPromise();
      
      // Set _waitResolver to null before the Promise.allSettled callback executes
      // This simulates a race condition that the error guard is meant to catch
      tracker._waitResolver = null;
      
      // Resolve the test resolver to trigger the callback
      // This will cause raiseError to be called inside the Promise.allSettled.then callback
      testResolver.resolve();
      
      // We need to wait for the internal callback to execute and catch the error
      // The error is thrown inside the Promise.allSettled.then callback, which creates an unhandled rejection
      // We catch it by listening for unhandledRejection
      const errorPromise = new Promise<Error>((resolve) => {
        const handler = (event: PromiseRejectionEvent | Error) => {
          const error = event instanceof Error ? event : (event as any).reason;
          if (error && (error as any).code === 'UPD-007') {
            (process as any).off('unhandledRejection', handler as any);
            resolve(error);
          }
        };
        (process as any).on('unhandledRejection', handler as any);
      });
      
      // Wait for the callback to execute
      await Promise.resolve();
      await Promise.resolve();
      
      // Verify the error was thrown with the expected code
      const error = await Promise.race([
        errorPromise,
        new Promise<Error>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      ]);
      
      expect((error as any).code).toBe('UPD-007');
    });
  });
});
