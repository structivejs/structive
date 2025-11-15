/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { connectedCallback } from "../../../src/StateClass/apis/connectedCallback";
import { CONNECTED_CALLBACK_FUNC_NAME } from "../../../src/constants";

describe("connectedCallback", () => {
  it("target に $connectedCallback があれば呼ぶ（同期）", () => {
    const receiver = {} as any;
    const called = vi.fn();
    const target = { [CONNECTED_CALLBACK_FUNC_NAME]: called } as any;
    const result = connectedCallback(target, CONNECTED_CALLBACK_FUNC_NAME, receiver, {} as any);
    expect(called).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("target に $connectedCallback があれば呼ぶ（非同期）", async () => {
    const receiver = {} as any;
    const called = vi.fn().mockResolvedValue(undefined);
    const target = { [CONNECTED_CALLBACK_FUNC_NAME]: called } as any;
    const result = connectedCallback(target, CONNECTED_CALLBACK_FUNC_NAME, receiver, {} as any);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(called).toHaveBeenCalled();
  });
});
