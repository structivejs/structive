import { describe, it, expect } from "vitest";
import { createBindingNodeClassName } from "../../../src/DataBinding/BindingNode/BindingNodeClassName";
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

describe("BindingNodeClassName", () => {
  it("booleanで add/remove", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeClassName("class.active", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(true);
    node.applyChange(createRendererStub());
    expect(div.classList.contains("active")).toBe(true);

    binding.bindingState.getFilteredValue.mockReturnValue(false);
    node.applyChange(createRendererStub());
    expect(div.classList.contains("active")).toBe(false);
  });

  it("assignValue: boolean 以外でエラー", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeClassName("class.active", [], [])(binding, div, engine.inputFilters);
    const err = captureError(() => node.assignValue("true" as any));
    expect(err.code).toBe("BIND-201");
    expect(err.message).toMatch(/ClassName value is not boolean/);
    expect(err.context).toEqual(
      expect.objectContaining({ where: "BindingNodeClassName.update", receivedType: "string" })
    );
  });
});
