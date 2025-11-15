/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { getCustomTagName } from "../../src/WebComponents/getCustomTagName";

describe("WebComponents/getCustomTagName", () => {
  it("tagName に - を含む場合、小文字化したタグ名を返す", () => {
    const component = document.createElement("div");
    Object.defineProperty(component, "tagName", { value: "X-CUSTOM", writable: false });
    
    expect(getCustomTagName(component)).toBe("x-custom");
  });

  it("tagName に - がなく is 属性に - を含む場合、is 属性の小文字化を返す", () => {
    const component = document.createElement("button");
    Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
    component.setAttribute("is", "x-custom-button");
    
    expect(getCustomTagName(component)).toBe("x-custom-button");
  });

  it("カスタムタグ名が見つからない場合エラーを投げる", () => {
    const component = document.createElement("div");
    Object.defineProperty(component, "tagName", { value: "DIV", writable: false });
    
    expect(() => getCustomTagName(component)).toThrow();
  });

  it("大文字のタグ名も小文字に変換される", () => {
    const component = document.createElement("div");
    Object.defineProperty(component, "tagName", { value: "MY-COMPONENT", writable: false });
    
    expect(getCustomTagName(component)).toBe("my-component");
  });

  it("is 属性が大文字の場合も小文字に変換される", () => {
    const component = document.createElement("button");
    Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
    component.setAttribute("is", "MY-CUSTOM-BUTTON");
    
    expect(getCustomTagName(component)).toBe("my-custom-button");
  });
});
