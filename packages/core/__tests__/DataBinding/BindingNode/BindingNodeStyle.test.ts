import { describe, it, expect } from "vitest";
import { createBindingNodeStyle } from "../../../src/DataBinding/BindingNode/BindingNodeStyle";
import { createBindingStub, createEngineStub, createRendererStub } from "../helpers/bindingNodeHarness";

describe("BindingNodeStyle", () => {
  it("style.color を反映（nullは空文字）", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeStyle("style.color", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(null);
    node.applyChange(createRendererStub());
    expect(div.style.color).toBe("");

    binding.bindingState.getFilteredValue.mockReturnValue("red");
    node.applyChange(createRendererStub());
    expect(div.style.color).toBe("red");
  });

  it("undefined は空文字に変換される", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeStyle("style.fontSize", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(undefined);
    node.applyChange(createRendererStub());
    expect(div.style.fontSize).toBe("");
  });

  it("NaN は空文字に変換される", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeStyle("style.width", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(NaN);
    node.applyChange(createRendererStub());
    expect(div.style.width).toBe("");
  });

  it("数値（NaNでない）は文字列に変換される", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const node = createBindingNodeStyle("style.opacity", [], [])(binding, div, engine.inputFilters);

    binding.bindingState.getFilteredValue.mockReturnValue(0.5);
    node.applyChange(createRendererStub());
    expect(div.style.opacity).toBe("0.5");
  });
});
