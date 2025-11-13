/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { findStructiveParent, registerStructiveComponent, removeStructiveComponent } from "../../src/WebComponents/findStructiveParent";

describe("WebComponents/findStructiveParent", () => {
  it("登録前は null を返す", () => {
    const child = {} as any;
    expect(findStructiveParent(child)).toBeNull();
  });

  it("registerStructiveComponent 後に親が取得できる", () => {
    const parent = { name: "parent" } as any;
    const child = { name: "child" } as any;
    registerStructiveComponent(parent, child);
    expect(findStructiveParent(child)).toBe(parent);
  });

  it("removeStructiveComponent 後は null を返す", () => {
    const parent = { name: "parent" } as any;
    const child = { name: "child" } as any;
    
    // 登録して確認
    registerStructiveComponent(parent, child);
    expect(findStructiveParent(child)).toBe(parent);
    
    // 削除して確認
    removeStructiveComponent(child);
    expect(findStructiveParent(child)).toBeNull();
  });
});
