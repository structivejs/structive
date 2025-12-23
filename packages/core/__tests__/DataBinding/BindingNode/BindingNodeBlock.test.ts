import { describe, it, expect } from "vitest";
import { BindingNodeBlock } from "../../../src/DataBinding/BindingNode/BindingNodeBlock";
import { createBindingStub, createEngineStub } from "../helpers/bindingNodeHarness";

describe("BindingNodeBlock", () => {
  describe("正常系: 0以上の整数", () => {
    it("id が 0 の場合", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|0");
      const binding = createBindingStub(engine, comment);
      const node = new BindingNodeBlock(binding, comment, "block", "block", [], []);
      expect(node.id).toBe(0);
    });

    it("正の整数 id を取得できる", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|42");
      const binding = createBindingStub(engine, comment);
      const node = new BindingNodeBlock(binding, comment, "block", "block", [], []);
      expect(node.id).toBe(42);
    });

    it("大きな正の整数も取得できる", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|999999");
      const binding = createBindingStub(engine, comment);
      const node = new BindingNodeBlock(binding, comment, "block", "block", [], []);
      expect(node.id).toBe(999999);
    });

    it("id の後にスペース区切りで追加情報がある場合も正しく id を取得", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|123 extra info");
      const binding = createBindingStub(engine, comment);
      const node = new BindingNodeBlock(binding, comment, "block", "block", [], []);
      expect(node.id).toBe(123);
    });

    it("filters と decorates を正しく渡せる", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|99");
      const binding = createBindingStub(engine, comment);
      const filters = [{ name: "testFilter", args: [] }];
      const decorates = ["decorate1"];
      const node = new BindingNodeBlock(binding, comment, "block", "block", filters, decorates);
      expect(node.id).toBe(99);
      expect(node.filters).toEqual(filters);
      expect(node.decorates).toEqual(decorates);
    });

    it("buildable getter は true を返す", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|0");
      const binding = createBindingStub(engine, comment);
      const node = new BindingNodeBlock(binding, comment, "block", "block", [], []);
      expect(node.buildable).toBe(true);
    });
  });

  describe("異常系: textContent が null または不正", () => {
    it("textContent が null の場合にエラー", () => {
      const engine = createEngineStub();
      const fakeNode = {
        textContent: null
      } as unknown as Node;
      const binding = createBindingStub(engine, fakeNode);
      expect(() => new BindingNodeBlock(binding, fakeNode, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("textContent が空文字列の場合はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("textContent が COMMENT_TEMPLATE_MARK より短い場合はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });
  });

  describe("異常系: 負の数", () => {
    it("負の整数はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|-5");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("-1 はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|-1");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });
  });

  describe("異常系: 小数", () => {
    it("小数点を含む id はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|42.5");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("0.5 はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|0.5");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });
  });

  describe("異常系: 無限大", () => {
    it("Infinity はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|Infinity");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("-Infinity はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|-Infinity");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });
  });

  describe("異常系: 無効な文字列", () => {
    it("数値でない文字列はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|abc");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("先頭にスペースがある数値はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@| 42");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("指数表記（文字列表現が異なる）はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|1e2");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("16進数表記はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|0x10");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("先頭にゼロがある数値（文字列表現が異なる）はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|007");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });

    it("プラス記号付きの数値はエラー", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|+42");
      const binding = createBindingStub(engine, comment);
      expect(() => new BindingNodeBlock(binding, comment, "block", "block", [], [])).toThrow("Invalid node");
    });
  });

  describe("エラーコンテキストの検証", () => {
    it("バリデーションエラー時のエラーコードとコンテキスト", () => {
      const engine = createEngineStub();
      const comment = document.createComment("@@|abc");
      const binding = createBindingStub(engine, comment);
      try {
        new BindingNodeBlock(binding, comment, "block", "block", [], []);
        expect.fail("エラーが投げられるべき");
      } catch (err: any) {
        expect(err.message).toBe("Invalid node");
        expect(err.code).toBe("BIND-201");
        expect(err.context).toBeDefined();
        expect(err.context.where).toBe("BindingNodeBlock.id");
      }
    });
  });
});
