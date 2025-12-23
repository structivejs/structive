/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRenderMain } from "../../src/Updater/RenderMain.js";

const renderMock = vi.fn();
vi.mock("../../src/Updater/Renderer.js", () => ({
  render: (...args: any[]) => renderMock(...args),
}));

describe("RenderMain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRenderMain", () => {
    it("should create a RenderMain instance", () => {
      const engine = {} as any;
      const updater = { retrieveAndClearQueue: vi.fn().mockReturnValue([]) } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      expect(renderMain).toBeDefined();
      expect(renderMain.wakeup).toBeDefined();
      expect(renderMain.terminate).toBeDefined();
    });
  });

  describe("wakeup", () => {
    it("should resolve the wait resolver and create a new one", async () => {
      const engine = {} as any;
      const updater = { retrieveAndClearQueue: vi.fn().mockReturnValue([]) } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Call wakeup - should resolve the internal promise
      renderMain.wakeup();
      
      // Wait for microtask to process
      await Promise.resolve();
      
      // Terminate to clean up
      renderMain.terminate();
      await completedResolvers.promise;
    });
  });

  describe("terminate", () => {
    it("should resolve with completedResolvers and exit the main loop", async () => {
      const engine = {} as any;
      const updater = { retrieveAndClearQueue: vi.fn().mockReturnValue([]) } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for microtask
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      // Wait for completion
      const result = await completedResolvers.promise;
      expect(result).toBe(true);
    });
  });

  describe("_main loop", () => {
    it("should process queue items when wakeup is called", async () => {
      const engine = {} as any;
      const queue = [{ ref: "ref1" }];
      const updater = {
        retrieveAndClearQueue: vi.fn()
          .mockReturnValueOnce(queue)
          .mockReturnValue([])
      } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      renderMock.mockImplementation((_queue, _engine, _updater, resolver) => {
        resolver.resolve();
      });
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for initial microtask
      await Promise.resolve();
      
      // Wakeup to process queue
      renderMain.wakeup();
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      const result = await completedResolvers.promise;
      expect(result).toBe(true);
      expect(renderMock).toHaveBeenCalledWith(queue, engine, updater, expect.any(Object));
    });

    it("should skip processing when queue is empty", async () => {
      const engine = {} as any;
      const updater = { retrieveAndClearQueue: vi.fn().mockReturnValue([]) } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for initial microtask
      await Promise.resolve();
      
      // Wakeup with empty queue
      renderMain.wakeup();
      await Promise.resolve();
      
      // Wakeup again
      renderMain.wakeup();
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      const result = await completedResolvers.promise;
      expect(result).toBe(true);
      expect(renderMock).not.toHaveBeenCalled();
    });

    it("should handle render errors gracefully", async () => {
      const engine = {} as any;
      const queue = [{ ref: "ref1" }];
      const updater = {
        retrieveAndClearQueue: vi.fn()
          .mockReturnValueOnce(queue)
          .mockReturnValue([])
      } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderMock.mockImplementation(() => {
        throw new Error("Render error");
      });
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for initial microtask
      await Promise.resolve();
      
      // Wakeup to process queue (will throw)
      renderMain.wakeup();
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      const result = await completedResolvers.promise;
      // Result is false because of rejected promise
      expect(result).toBe(false);
      expect(consoleError).toHaveBeenCalledWith("Rendering error:", expect.any(Error));
      
      consoleError.mockRestore();
    });

    it("should return false when render promise rejects", async () => {
      const engine = {} as any;
      const queue = [{ ref: "ref1" }];
      const updater = {
        retrieveAndClearQueue: vi.fn()
          .mockReturnValueOnce(queue)
          .mockReturnValue([])
      } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      renderMock.mockImplementation((_queue, _engine, _updater, resolver) => {
        resolver.reject(new Error("Async render error"));
      });
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for initial microtask
      await Promise.resolve();
      
      // Wakeup to process queue
      renderMain.wakeup();
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      const result = await completedResolvers.promise;
      expect(result).toBe(false);
    });

    it("should process multiple batches of queue items", async () => {
      const engine = {} as any;
      const queue1 = [{ ref: "ref1" }];
      const queue2 = [{ ref: "ref2" }];
      const updater = {
        retrieveAndClearQueue: vi.fn()
          .mockReturnValueOnce(queue1)
          .mockReturnValueOnce(queue2)
          .mockReturnValue([])
      } as any;
      const completedResolvers = Promise.withResolvers<boolean>();
      
      renderMock.mockImplementation((_queue, _engine, _updater, resolver) => {
        resolver.resolve();
      });
      
      const renderMain = createRenderMain(engine, updater, completedResolvers);
      
      // Wait for initial microtask
      await Promise.resolve();
      
      // Wakeup for first batch
      renderMain.wakeup();
      await Promise.resolve();
      
      // Wakeup for second batch
      renderMain.wakeup();
      await Promise.resolve();
      
      // Terminate
      renderMain.terminate();
      
      const result = await completedResolvers.promise;
      expect(result).toBe(true);
      expect(renderMock).toHaveBeenCalledTimes(2);
      expect(renderMock).toHaveBeenNthCalledWith(1, queue1, engine, updater, expect.any(Object));
      expect(renderMock).toHaveBeenNthCalledWith(2, queue2, engine, updater, expect.any(Object));
    });
  });
});
