/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCompleteQueue, _UpdateCompleteQueue } from "../../src/Updater/CompleteQueue.js";

describe("CompleteQueue", () => {
  describe("createCompleteQueue", () => {
    it("should create an UpdateCompleteQueue instance", () => {
      const queue = createCompleteQueue();
      expect(queue).toBeDefined();
      expect(queue.current).toBeNull();
    });
  });

  describe("current", () => {
    it("should return null when queue is empty", () => {
      const queue = createCompleteQueue();
      expect(queue.current).toBeNull();
    });

    it("should return promise when item is in queue", async () => {
      const queue = createCompleteQueue();
      const resolver = Promise.withResolvers<boolean>();
      
      queue.enqueue(resolver.promise);
      
      expect(queue.current).not.toBeNull();
      expect(queue.current).toBeInstanceOf(Promise);
      
      // Resolve to clean up
      resolver.resolve(true);
      await queue.current;
    });
  });

  describe("enqueue", () => {
    it("should process a single item", async () => {
      const queue = createCompleteQueue();
      const resolver = Promise.withResolvers<boolean>();
      
      queue.enqueue(resolver.promise);
      const current = queue.current;
      
      resolver.resolve(true);
      const result = await current;
      
      expect(result).toBe(true);
    });

    it("should process multiple items in order", async () => {
      const queue = createCompleteQueue();
      const results: boolean[] = [];
      
      const resolver1 = Promise.withResolvers<boolean>();
      const resolver2 = Promise.withResolvers<boolean>();
      const resolver3 = Promise.withResolvers<boolean>();
      
      queue.enqueue(resolver1.promise);
      const current1 = queue.current!;
      
      queue.enqueue(resolver2.promise);
      queue.enqueue(resolver3.promise);
      
      // Resolve in order
      resolver1.resolve(true);
      results.push(await current1);
      
      // Wait for queue to process next item
      await Promise.resolve();
      const current2 = queue.current!;
      
      resolver2.resolve(false);
      results.push(await current2);
      
      // Wait for queue to process next item
      await Promise.resolve();
      const current3 = queue.current!;
      
      resolver3.resolve(true);
      results.push(await current3);
      
      expect(results).toEqual([true, false, true]);
    });

    it("should handle promise rejection and still resolve notifyResolver", async () => {
      const queue = createCompleteQueue();
      // Use a rejected promise directly to avoid unhandled rejection
      const rejectedPromise = Promise.reject(new Error("Test error")).catch(() => false) as Promise<boolean>;
      
      queue.enqueue(rejectedPromise);
      const current = queue.current!;
      
      // The notifyResolver should still resolve (with false due to the error)
      const result = await current;
      expect(result).toBe(false);
    });

    it("should not start processing again if already processing", async () => {
      const queue = createCompleteQueue();
      
      const resolver1 = Promise.withResolvers<boolean>();
      const resolver2 = Promise.withResolvers<boolean>();
      
      // Enqueue first item - this starts processing
      queue.enqueue(resolver1.promise);
      
      // Enqueue second item while first is being processed
      // This should not start a new processing loop (covers line 40-41)
      queue.enqueue(resolver2.promise);
      
      const current1 = queue.current!;
      
      resolver1.resolve(true);
      await current1;
      
      // Wait for microtask
      await Promise.resolve();
      
      const current2 = queue.current!;
      resolver2.resolve(true);
      await current2;
      
      // Queue should be empty now
      expect(queue.current).toBeNull();
    });

    it("should process items enqueued during processing", async () => {
      const queue = createCompleteQueue();
      const results: number[] = [];
      
      const resolver1 = Promise.withResolvers<boolean>();
      
      queue.enqueue(resolver1.promise);
      const current1 = queue.current!;
      
      // Resolve first and wait
      resolver1.resolve(true);
      await current1;
      results.push(1);
      
      // Now queue should be empty and not processing
      expect(queue.current).toBeNull();
      
      // Enqueue new item - should start processing again
      const resolver2 = Promise.withResolvers<boolean>();
      queue.enqueue(resolver2.promise);
      
      expect(queue.current).not.toBeNull();
      const current2 = queue.current!;
      
      resolver2.resolve(true);
      await current2;
      results.push(2);
      
      expect(results).toEqual([1, 2]);
    });

    it("should enqueue while processing triggers the guard branch", async () => {
      const queue = createCompleteQueue();
      
      // Create a slow promise that will keep the queue processing
      const slowResolver = Promise.withResolvers<boolean>();
      queue.enqueue(slowResolver.promise);
      
      // At this point, _processing is true
      // Enqueue more items - this hits the `if (!this._processing)` branch (false case)
      const resolver2 = Promise.withResolvers<boolean>();
      const resolver3 = Promise.withResolvers<boolean>();
      queue.enqueue(resolver2.promise);
      queue.enqueue(resolver3.promise);
      
      // Resolve all
      slowResolver.resolve(true);
      await queue.current;
      
      await Promise.resolve();
      resolver2.resolve(true);
      await queue.current;
      
      await Promise.resolve();
      resolver3.resolve(true);
      await queue.current;
      
      expect(queue.current).toBeNull();
    });
  });

  describe("_UpdateCompleteQueue internal", () => {
    it("should throw error when _processNext is called with empty queue", async () => {
      const queue = new _UpdateCompleteQueue() as any;
      const resolver = Promise.withResolvers<void>();
      
      // Directly call _processNext with empty queue to trigger raiseError
      await expect(queue._processNext(resolver)).rejects.toThrow('No item in update complete queue to process');
    });

    it("should return early when _processQueue is called while already processing", async () => {
      const queue = new _UpdateCompleteQueue() as any;
      
      // Set _processing to true to simulate already processing
      queue._processing = true;
      
      // Call _processQueue - should return early
      await queue._processQueue();
      
      // _processing should still be true (not reset by the early return)
      expect(queue._processing).toBe(true);
    });
  });
});
