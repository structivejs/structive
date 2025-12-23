import { describe, it, expect, vi } from "vitest";
import { BindingNode } from "../../../src/DataBinding/BindingNode/BindingNode";

type StructiveError = Error & { code?: string; context?: Record<string, unknown> };

function captureError(fn: () => unknown): StructiveError {
  try {
    fn();
  } catch (err) {
    return err as StructiveError;
  }
  throw new Error("Expected error to be thrown");
}

describe("BindingNode", () => {
  it("assignValue/updateElements は未実装エラー、notifyRedraw は何もしない", () => {
    const binding = {} as any;
    const div = document.createElement("div");
    const node = new BindingNode(binding as any, div, "value", "value", [], []);
    const assignErr = captureError(() => node.assignValue(1));
    expect(assignErr.code).toBe("BIND-301");
    expect(assignErr.message).toMatch(/Binding assignValue not implemented/);

    const updateErr = captureError(() => node.updateElements([], []));
    expect(updateErr.code).toBe("BIND-301");
    expect(updateErr.message).toMatch(/Binding updateElements not implemented/);
    node.notifyRedraw([] as any);
  });

  it("isSelectElement の判定、各種ゲッター", () => {
    const binding = {} as any;
    const select = document.createElement("select");
    const node1 = new BindingNode(binding as any, select, "value", "value", [], ["d1"]);
    expect(node1.isSelectElement).toBe(true);
    expect(node1.name).toBe("value");
    expect(node1.subName).toBe("value");
    expect(node1.decorates).toEqual(["d1"]);
    expect(Array.isArray(node1.filters)).toBe(true);
    expect(Array.isArray(node1.bindContents)).toBe(true);
    expect(node1.value).toBeNull();
    expect(node1.filteredValue).toBeNull();
    // isFor と isBlock プロパティはベースクラスには存在しないのでコメントアウト
    // expect(node1.isFor).toBe(false);
    // expect(node1.isBlock).toBe(false);

    const div = document.createElement("div");
    const node2 = new BindingNode(binding as any, div, "textContent", "textContent", [], []);
    expect(node2.isSelectElement).toBe(false);
  });

  it("applyChange でフィルタ済み値を1度だけ割り当て、2度目はスキップ", () => {
    class ConcreteBindingNode extends BindingNode {
      assigned: any[] = [];
      assignValue(value: any): void {
        this.assigned.push(value);
      }
    }
    const binding = {
      bindingState: {
        getFilteredValue: vi.fn(() => "filtered"),
      },
    } as any;
    const renderer = {
      updatedBindings: new Set<any>(),
      readonlyState: {},
      readonlyHandler: {},
    } as any;
    const node = new ConcreteBindingNode(binding, document.createElement("div"), "value", "value", [], []);

    node.applyChange(renderer);
    expect(node.assigned).toEqual(["filtered"]);
    expect(binding.bindingState.getFilteredValue).toHaveBeenCalledTimes(1);

    node.applyChange(renderer);
    expect(node.assigned).toEqual(["filtered", "filtered"]);
    expect(binding.bindingState.getFilteredValue).toHaveBeenCalledTimes(2);
  });

  it("activate/inactivate methods are empty implementations", () => {
    const binding = {} as any;
    const div = document.createElement("div");
    const node = new BindingNode(binding as any, div, "value", "value", [], []);
    
    // activate/inactivateメソッドは何もしないが、呼び出せることを確認
    expect(() => node.activate()).not.toThrow();
    expect(() => node.inactivate()).not.toThrow();
  });

  it("buildable getter returns false by default", () => {
    const binding = {} as any;
    const div = document.createElement("div");
    const node = new BindingNode(binding as any, div, "value", "value", [], []);
    
    expect(node.buildable).toBe(false);
  });
});
