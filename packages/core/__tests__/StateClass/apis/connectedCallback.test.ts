/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { connectedCallback } from "../../../src/StateClass/apis/connectedCallback";
import { CONNECTED_CALLBACK_FUNC_NAME } from "../../../src/constants";

describe("connectedCallback", () => {
  it("target に $connectedCallback があれば呼ぶ", async () => {
    const receiver = {} as any;
    const called = vi.fn();
    const target = { [CONNECTED_CALLBACK_FUNC_NAME]: called } as any;
    await connectedCallback(target, CONNECTED_CALLBACK_FUNC_NAME, receiver, {} as any);
    expect(called).toHaveBeenCalled();
  });
});
