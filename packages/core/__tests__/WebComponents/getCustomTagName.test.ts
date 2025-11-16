/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { getCustomTagName } from "../../src/WebComponents/getCustomTagName";

describe("WebComponents/getCustomTagName", () => {
  describe("カスタム要素（autonomous custom elements）", () => {
    it("tagName に - を含む場合、小文字化したタグ名を返す", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "X-CUSTOM", writable: false });
      
      expect(getCustomTagName(component)).toBe("x-custom");
    });

    it("大文字のタグ名も小文字に変換される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "MY-COMPONENT", writable: false });
      
      expect(getCustomTagName(component)).toBe("my-component");
    });

    it("複数のハイフンを含むタグ名も正しく処理される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "MY-SUPER-COMPONENT", writable: false });
      
      expect(getCustomTagName(component)).toBe("my-super-component");
    });

    it("小文字のカスタムタグ名はそのまま返される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "my-component", writable: false });
      
      expect(getCustomTagName(component)).toBe("my-component");
    });
  });

  describe("カスタマイズドビルトイン要素（customized built-in elements）", () => {
    it("tagName に - がなく is 属性に - を含む場合、is 属性の小文字化を返す", () => {
      const component = document.createElement("button");
      Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
      component.setAttribute("is", "x-custom-button");
      
      expect(getCustomTagName(component)).toBe("x-custom-button");
    });

    it("is 属性が大文字の場合も小文字に変換される", () => {
      const component = document.createElement("button");
      Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
      component.setAttribute("is", "MY-CUSTOM-BUTTON");
      
      expect(getCustomTagName(component)).toBe("my-custom-button");
    });

    it("様々な標準要素で is 属性が正しく処理される", () => {
      const testCases = [
        { tag: "DIV", is: "x-custom-div" },
        { tag: "INPUT", is: "x-custom-input" },
        { tag: "A", is: "x-custom-link" },
        { tag: "P", is: "x-custom-paragraph" }
      ];

      testCases.forEach(({ tag, is }) => {
        const component = document.createElement("div");
        Object.defineProperty(component, "tagName", { value: tag, writable: false });
        component.setAttribute("is", is);
        
        expect(getCustomTagName(component)).toBe(is);
      });
    });

    it("is 属性がnullまたは空文字の場合、エラーを投げる", () => {
      const component = document.createElement("button");
      Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
      component.setAttribute("is", "");
      
      expect(() => getCustomTagName(component)).toThrow();
    });
  });

  describe("エラーケース", () => {
    it("カスタムタグ名が見つからない場合エラーを投げる", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "DIV", writable: false });
      
      expect(() => getCustomTagName(component)).toThrow();
    });

    it("標準的なHTML要素でis属性がない場合エラーを投げる", () => {
      const standardTags = ["DIV", "SPAN", "P", "A", "BUTTON", "INPUT"];
      
      standardTags.forEach(tag => {
        const component = document.createElement("div");
        Object.defineProperty(component, "tagName", { value: tag, writable: false });
        
        expect(() => getCustomTagName(component)).toThrow();
      });
    });

    it("エラーメッセージに適切な情報が含まれる", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "DIV", writable: false });
      
      expect(() => getCustomTagName(component)).toThrow(/Custom tag name not found/);
    });

    it("is属性にハイフンが含まれない場合エラーを投げる", () => {
      const component = document.createElement("button");
      Object.defineProperty(component, "tagName", { value: "BUTTON", writable: false });
      component.setAttribute("is", "custombutton");
      
      expect(() => getCustomTagName(component)).toThrow();
    });
  });

  describe("エッジケース", () => {
    it("tagNameの先頭にハイフンがある場合も正しく処理される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "-CUSTOM-ELEMENT", writable: false });
      
      expect(getCustomTagName(component)).toBe("-custom-element");
    });

    it("tagNameの末尾にハイフンがある場合も正しく処理される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "CUSTOM-ELEMENT-", writable: false });
      
      expect(getCustomTagName(component)).toBe("custom-element-");
    });

    it("is属性とtagNameの両方にハイフンがある場合、tagNameが優先される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "CUSTOM-ELEMENT", writable: false });
      component.setAttribute("is", "other-custom");
      
      expect(getCustomTagName(component)).toBe("custom-element");
    });

    it("数字を含むカスタムタグ名も正しく処理される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { value: "MY-COMPONENT-V2", writable: false });
      
      expect(getCustomTagName(component)).toBe("my-component-v2");
    });

    it("長いカスタムタグ名も正しく処理される", () => {
      const component = document.createElement("div");
      Object.defineProperty(component, "tagName", { 
        value: "MY-VERY-LONG-CUSTOM-COMPONENT-NAME-WITH-MANY-WORDS", 
        writable: false 
      });
      
      expect(getCustomTagName(component)).toBe("my-very-long-custom-component-name-with-many-words");
    });
  });
});
