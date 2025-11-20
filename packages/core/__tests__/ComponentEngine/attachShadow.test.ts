import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { attachShadow } from "../../src/ComponentEngine/attachShadow";
import * as canHaveShadowRootModule from "../../src/ComponentEngine/canHaveShadowRoot";

function makeConfig(over?: Partial<any>) {
  return {
    shadowDomMode: "auto",
    extends: null,
    ...over,
  } as any;
}

describe("attachShadow", () => {
  let el: HTMLElement;
  let originalDocSheets: any;

  beforeEach(() => {
    el = document.createElement("div");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalDocSheets !== undefined) {
      // restore document.adoptedStyleSheets
      Object.defineProperty(document, "adoptedStyleSheets", {
        configurable: true,
        writable: true,
        value: originalDocSheets,
      });
      originalDocSheets = undefined;
    }
  });

  it("shadowDomMode=auto: attachShadow を呼び、ShadowRoot に style を適用", () => {
    const fakeRoot = { adoptedStyleSheets: [] as any[] } as any;
    // attachShadow をスパイ/スタブ
    const hasAttach = typeof (el as any).attachShadow === "function";
    const attachSpy = hasAttach
      ? vi.spyOn(el as any, "attachShadow").mockImplementation(() => fakeRoot)
      : ((el as any).attachShadow = vi.fn(() => fakeRoot));
    const sheet = {} as any;

    attachShadow(el, makeConfig({ shadowDomMode: "auto", extends: null }), sheet);
    expect((fakeRoot as any).adoptedStyleSheets).toEqual([sheet]);
    expect((el as any).attachShadow).toHaveBeenCalledTimes(1);
  });

  it("shadowDomMode=force: 判定なしで強制的に ShadowRoot を作成", () => {
    const fakeRoot = { adoptedStyleSheets: [] as any[] } as any;
    const hasAttach = typeof (el as any).attachShadow === "function";
    const attachSpy = hasAttach
      ? vi.spyOn(el as any, "attachShadow").mockImplementation(() => fakeRoot)
      : ((el as any).attachShadow = vi.fn(() => fakeRoot));
    const sheet = {} as any;

    attachShadow(el, makeConfig({ shadowDomMode: "force", extends: "invalid!" }), sheet);
    expect((fakeRoot as any).adoptedStyleSheets).toEqual([sheet]);
    expect((el as any).attachShadow).toHaveBeenCalledTimes(1);
  });

  it("extends 指定がある場合でも canHaveShadowRoot を確認して ShadowRoot を張る", () => {
    const fakeRoot = { adoptedStyleSheets: [] as any[] } as any;
    const hasAttach = typeof (el as any).attachShadow === "function";
    const attachSpy = hasAttach
      ? vi.spyOn(el as any, "attachShadow").mockImplementation(() => fakeRoot)
      : ((el as any).attachShadow = vi.fn(() => fakeRoot));
    const canHaveSpy = vi.spyOn(canHaveShadowRootModule, "canHaveShadowRoot").mockReturnValue(true);
    const sheet = {} as any;

    attachShadow(el, makeConfig({ shadowDomMode: "auto", extends: "article" }), sheet);

    expect(canHaveSpy).toHaveBeenCalledWith("article");
    expect((fakeRoot as any).adoptedStyleSheets).toEqual([sheet]);
    expect((el as any).attachShadow).toHaveBeenCalledTimes(1);
  });

  it("shadowDomMode=auto かつ extends が Shadow 不可なタグの場合は Light DOM にフォールバック", () => {
    // document.adoptedStyleSheets を用意
    originalDocSheets = (document as any).adoptedStyleSheets;
    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      writable: true,
      value: [] as any[],
    });
    const wrapper = document.createElement("section");
    wrapper.appendChild(el);
    const sheet = {} as any;

    // canHaveShadowRoot は実装依存なので、明確に false になるよう invalid なタグ名を渡す
    attachShadow(el, makeConfig({ shadowDomMode: "auto", extends: "invalid!" }), sheet);
    
    // Light DOM にスタイルが追加される
    expect((document as any).adoptedStyleSheets).toEqual([sheet]);
  });

  it("shadowDomMode=none: document.adoptedStyleSheets に追加し、重複は避ける", () => {
    // document.adoptedStyleSheets を用意
    originalDocSheets = (document as any).adoptedStyleSheets;
    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      writable: true,
      value: [] as any[],
    });
    const wrapper = document.createElement("section");
    wrapper.appendChild(el);
    const sheet = {} as any;

    attachShadow(el, makeConfig({ shadowDomMode: "none" }), sheet);
    expect((document as any).adoptedStyleSheets).toEqual([sheet]);

    // もう一度呼んでも重複しない
    attachShadow(el, makeConfig({ shadowDomMode: "none" }), sheet);
    expect((document as any).adoptedStyleSheets).toEqual([sheet]);
  });

  it("shadowDomMode=none でも親 ShadowRoot にスタイルを適用", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });
    Object.defineProperty(shadowRoot, "adoptedStyleSheets", {
      configurable: true,
      writable: true,
      value: [] as CSSStyleSheet[],
    });
    const child = document.createElement("span");
    shadowRoot.appendChild(child);
    const sheet = {} as any;

    attachShadow(child, makeConfig({ shadowDomMode: "none" }), sheet);
    expect(shadowRoot.adoptedStyleSheets).toEqual([sheet]);
  });

  it("既に shadowRoot がある場合は attachShadow を呼ばない", () => {
    // shadowRoot が存在する状態を作る
    Object.defineProperty(el, "shadowRoot", {
      configurable: true,
      value: {} as any,
    });
    const hasAttach = typeof (el as any).attachShadow === "function";
    const attachSpy = hasAttach
      ? vi.spyOn(el as any, "attachShadow")
      : ((el as any).attachShadow = vi.fn());

    const sheet = {} as any;
    attachShadow(el, makeConfig({ shadowDomMode: "auto" }), sheet);
    expect((el as any).attachShadow).not.toHaveBeenCalled();
  });
});
