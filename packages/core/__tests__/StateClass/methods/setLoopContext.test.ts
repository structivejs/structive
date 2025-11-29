/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setLoopContext } from "../../../src/StateClass/methods/setLoopContext";

const raiseErrorMock = vi.fn((detail: any) => {
  const message = typeof detail === "string" ? detail : detail?.message ?? "error";
  throw new Error(message);
});
vi.mock("../../../src/utils", () => ({
  raiseError: (detail: any) => raiseErrorMock(detail),
}));

function makeHandler() {
  return {
    loopContext: undefined,
    refStack: [null],
    refIndex: -1,
    lastRefStack: null,
  } as any;
}

beforeEach(() => {
  raiseErrorMock.mockReset();
});

describe("StateClass/methods setLoopContext", () => {
  it("loopContext が null の場合は callback を直接実行（非同期）", async () => {
    const handler = makeHandler();
    const callback = vi.fn(async () => {});

    const result = setLoopContext(handler, null, callback);
    expect(result).toBeInstanceOf(Promise);
    await result;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(handler.loopContext).toBeNull();
    expect(handler.refIndex).toBe(-1);
  });

  it("loopContext が null の場合は callback を直接実行（同期）", () => {
    const handler = makeHandler();
    const callback = vi.fn();

    const result = setLoopContext(handler, null, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(handler.loopContext).toBeNull();
    expect(handler.refIndex).toBe(-1);
    expect(result).toBeUndefined();
  });

  it("loopContext が指定された場合はスタックを構築して実行（非同期）", async () => {
    const handler = makeHandler();
    const ref = { info: { pattern: "items.*" } };
    const loopContext = { ref } as any;
    const callback = vi.fn(async () => {
      expect(handler.loopContext).toBe(loopContext);
      expect(handler.refStack[handler.refIndex]).toBe(ref);
    });

    const result = setLoopContext(handler, loopContext, callback);
    expect(result).toBeInstanceOf(Promise);
    await result;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(handler.loopContext).toBeNull();
    expect(handler.refIndex).toBe(-1);
    expect(handler.refStack[0]).toBeNull();
    expect(handler.lastRefStack).toBeNull();
  });

  it("loopContext が指定された場合はスタックを構築して実行（同期）", () => {
    const handler = makeHandler();
    const ref = { info: { pattern: "items.*" } };
    const loopContext = { ref } as any;
    const callback = vi.fn(() => {
      expect(handler.loopContext).toBe(loopContext);
      expect(handler.refStack[handler.refIndex]).toBe(ref);
    });

    const result = setLoopContext(handler, loopContext, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(handler.loopContext).toBeNull();
    expect(handler.refIndex).toBe(-1);
    expect(handler.refStack[0]).toBeNull();
    expect(handler.lastRefStack).toBeNull();
    expect(result).toBeUndefined();
  });

  it("既に loopContext が設定されている場合はエラー", () => {
    const handler = makeHandler();
    handler.loopContext = { ref: {} };

    expect(() => setLoopContext(handler, null, () => {})).toThrow(/already in loop context/);
    expect(raiseErrorMock).toHaveBeenCalled();
  });

  it("callback が例外を投げても最後に loopContext をリセット（非同期）", async () => {
    const handler = makeHandler();
    const loopContext = { ref: { info: { pattern: "loop" } } } as any;
    const error = new Error("boom");
    const callback = vi.fn(async () => {
      expect(handler.loopContext).toBe(loopContext);
      throw error;
    });

    const resultPromise = setLoopContext(handler, loopContext, callback);
    // エラーを明示的に捕捉してUnhandled Rejectionを防ぐ
    resultPromise.catch(() => {});
    await expect(resultPromise).rejects.toThrow(error);
    // Promiseのfinallyが実行されるまで待つ
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(handler.loopContext).toBeNull();
    expect(handler.lastRefStack).toBeNull();
    expect(handler.refIndex).toBe(-1);
  });

  it("callback が例外を投げても最後に loopContext をリセット（同期）", () => {
    const handler = makeHandler();
    const loopContext = { ref: { info: { pattern: "loop" } } } as any;
    const error = new Error("boom");
    const callback = vi.fn(() => {
      expect(handler.loopContext).toBe(loopContext);
      throw error;
    });

    expect(() => setLoopContext(handler, loopContext, callback)).toThrow(error);
    expect(handler.loopContext).toBeNull();
    expect(handler.lastRefStack).toBeNull();
    expect(handler.refIndex).toBe(-1);
  });

  it("loopContext が指定され refIndex が末尾の場合は push して実行（非同期）", async () => {
    const handler = makeHandler();
    handler.refIndex = handler.refStack.length - 1;
    const ref = { info: { pattern: "items" } };
    const loopContext = { ref } as any;

    const result = setLoopContext(handler, loopContext, async () => {
      expect(handler.refStack[handler.refIndex]).toBe(ref);
    });
    expect(result).toBeInstanceOf(Promise);
    await result;

    expect(handler.refStack.length).toBe(2);
    expect(handler.refStack[1]).toBeNull();
    expect(handler.refIndex).toBe(0);
    expect(handler.lastRefStack).toBeNull();
  });

  it("loopContext が指定され refIndex が末尾の場合は push して実行（同期）", () => {
    const handler = makeHandler();
    handler.refIndex = handler.refStack.length - 1;
    const ref = { info: { pattern: "items" } };
    const loopContext = { ref } as any;

    const result = setLoopContext(handler, loopContext, () => {
      expect(handler.refStack[handler.refIndex]).toBe(ref);
    });

    expect(handler.refStack.length).toBe(2);
    expect(handler.refStack[1]).toBeNull();
    expect(handler.refIndex).toBe(0);
    expect(handler.lastRefStack).toBeNull();
    expect(result).toBeUndefined();
  });

  it("loopContext が null で callback が同期エラーを投げた場合も loopContext をリセット", () => {
    const handler = makeHandler();
    const error = new Error("sync error");
    const callback = vi.fn(() => {
      throw error;
    });

    expect(() => setLoopContext(handler, null, callback)).toThrow(error);
    expect(handler.loopContext).toBeNull();
  });

  it("ネストされたループコンテキストでエラーが発生した場合のクリーンアップ", () => {
    const handler = makeHandler();
    handler.refStack = [{ info: { pattern: "outer" } }, null];
    handler.refIndex = 0;
    const loopContext = { ref: { info: { pattern: "inner" } } } as any;
    const error = new Error("nested error");
    const callback = vi.fn(() => {
      throw error;
    });

    expect(() => setLoopContext(handler, loopContext, callback)).toThrow(error);
    expect(handler.loopContext).toBeNull();
    expect(handler.refIndex).toBe(0);
    expect(handler.lastRefStack).toBe(handler.refStack[0]);
  });
});
