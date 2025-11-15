/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { disconnectedCallback } from "../../../src/StateClass/apis/disconnectedCallback";
import { DISCONNECTED_CALLBACK_FUNC_NAME } from "../../../src/constants";

describe("disconnectedCallback", () => {
  it("target に $disconnectedCallback があれば呼ぶ", () => {
    const receiver = {} as any;
    const called = vi.fn();
    const target = { [DISCONNECTED_CALLBACK_FUNC_NAME]: called } as any;
    const result = disconnectedCallback(target, DISCONNECTED_CALLBACK_FUNC_NAME, receiver, {} as any);
    expect(called).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
