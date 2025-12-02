import { describe, it, expect } from "vitest";
import { createBindingNodeClassList } from "../../../src/DataBinding/BindingNode/BindingNodeClassList";
import { createBindingStub, createEngineStub, createRendererStub } from "../helpers/bindingNodeHarness";

type StructiveError = Error & { code?: string; context?: Record<string, unknown> };

function captureError(fn: () => unknown): StructiveError {
  try {
    fn();
  } catch (err) {
    return err as StructiveError;
  }
  throw new Error("Expected error to be thrown");
}

describe("BindingNodeClassList", () => {
  it("配列から className 生成", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeClassList("classList", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(["a", "b", "c"]);
    node.applyChange(createRendererStub());
    expect(div.className).toBe("a b c");
  });

  it("assignValue: 非配列でエラー", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeClassList("classList", [], [])(binding, div, engine.inputFilters);
    const err = captureError(() => node.assignValue("abc" as any));
    expect(err.code).toBe("BIND-201");
    expect(err.message).toMatch(/ClassList value is not array/);
    expect(err.context).toEqual(
      expect.objectContaining({ where: "BindingNodeClassList.update", receivedType: "string" })
    );
  });
});
