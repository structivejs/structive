import { describe, it, expect, vi } from "vitest";
import { createBindingNodeAttribute } from "../../../src/DataBinding/BindingNode/BindingNodeAttribute";
import * as createFiltersMod from "../../../src/BindingBuilder/createFilters";
import { createBindingStub, createEngineStub, createRendererStub } from "../helpers/bindingNodeHarness";

describe("BindingNodeAttribute", () => {
  it("attr.src を反映（NaN/undefined/nullは空文字）", () => {
    const engine = createEngineStub();
    const img = document.createElement("img");
    const binding = createBindingStub(engine, img);

    binding.bindingState.getFilteredValue.mockReturnValueOnce(undefined);
    const node = createBindingNodeAttribute("attr.src", [], [])(binding, img, engine.inputFilters);
    node.applyChange(createRendererStub());
    expect(img.getAttribute("src")).toBe("");

    binding.bindingState.getFilteredValue.mockReturnValueOnce(null);
    node.applyChange(createRendererStub());
    expect(img.getAttribute("src")).toBe("");

    binding.bindingState.getFilteredValue.mockReturnValueOnce(Number.NaN);
    node.applyChange(createRendererStub());
    expect(img.getAttribute("src")).toBe("");

    binding.bindingState.getFilteredValue.mockReturnValue("/path.png");
    node.applyChange(createRendererStub());
    expect(img.getAttribute("src")).toBe("/path.png");
  });

  it("createBindingNodeAttribute は createFilters を通じて subName を設定", () => {
    const engine = createEngineStub();
    const div = document.createElement("div");
    const binding = createBindingStub(engine, div);
    const filterTexts: any = [{ filter: "upper" }];
    const filterFns = [vi.fn()];
    const spy = vi.spyOn(createFiltersMod, "createFilters").mockReturnValue(filterFns as any);

    const node = createBindingNodeAttribute("attr.data-label", filterTexts, ["dec"])(binding, div, engine.inputFilters);

    expect(spy).toHaveBeenCalledWith(engine.inputFilters, filterTexts);
    expect(node.subName).toBe("data-label");
    node.assignValue("Hello");
    expect(div.getAttribute("data-label")).toBe("Hello");
    expect(node.filters).toBe(filterFns as any);

    spy.mockRestore();
  });
});
