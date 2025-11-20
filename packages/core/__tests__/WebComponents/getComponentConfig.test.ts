/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { getComponentConfig } from "../../src/WebComponents/getComponentConfig";

vi.mock("../../src/WebComponents/getGlobalConfig.js", () => ({
  getGlobalConfig: () => ({ shadowDomMode: "auto" }),
}));

describe("WebComponents/getComponentConfig", () => {
  it("ユーザ未指定はグローバル設定を採用し、enableWebComponents は true", () => {
    const conf = getComponentConfig({} as any);
    expect(conf.enableWebComponents).toBe(true);
    expect(conf.shadowDomMode).toBe("auto");
    expect(conf.extends).toBeNull();
  });

  it("ユーザー設定が優先される", () => {
    const conf = getComponentConfig({ enableWebComponents: false, shadowDomMode: "none", extends: "button" } as any);
    expect(conf.enableWebComponents).toBe(false);
    expect(conf.shadowDomMode).toBe("none");
    expect(conf.extends).toBe("button");
  });
});
