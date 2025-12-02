/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const createSingleFileComponentMock = vi.fn(async (path: string, text: string) => ({ html: "<p>", css: "", stateClass: class {} }));
vi.mock("../../src/WebComponents/createSingleFileComponent", () => ({ createSingleFileComponent: (p: string, t: string) => createSingleFileComponentMock(p, t) }));

// fetch をモック
const fetchMock = vi.fn(async (url:string) => ({
  ok: true,
  status: 200,
  statusText: "OK",
  url,
  text: async () => `// sfc from ${url}`
}));
globalThis.fetch = fetchMock as any;

let loadSingleFileComponent: typeof import("../../src/WebComponents/loadSingleFileComponent")['loadSingleFileComponent'];
let nativeResolve: ((path: string) => string) | undefined;

describe("WebComponents/loadSingleFileComponent", () => {
  beforeEach(async () => {
    vi.resetModules();
    fetchMock.mockClear();
    fetchMock.mockImplementation(async (url:string) => ({
      ok: true,
      status: 200,
      statusText: "OK",
      url,
      text: async () => `// sfc from ${url}`
    }));
    createSingleFileComponentMock.mockClear();
    nativeResolve = (import.meta as any).resolve?.bind(import.meta);
    (globalThis as any).__vite_ssr_import_meta__ = nativeResolve ? { resolve: nativeResolve } : {};
    ({ loadSingleFileComponent } = await import("../../src/WebComponents/loadSingleFileComponent"));
  });

  it("fetch -> text -> createSingleFileComponent の順で処理する", async () => {
    const path = "/path/to/component.sfc";
    const expectedResolved = nativeResolve ? nativeResolve(path) : path;
    const data = await loadSingleFileComponent(path);
    expect(fetch).toHaveBeenCalledWith(expectedResolved);
    expect(createSingleFileComponentMock).toHaveBeenCalledWith(path, expect.stringContaining(`// sfc from ${expectedResolved}`));
    expect(data.html).toBe("<p>");
  });

  it("fetch が非 2xx を返したら IMP-202 を投げる", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      url: "https://example.test/missing.sfc",
      text: async () => ""
    });

    const path = "@components/missing";
    await expect(loadSingleFileComponent(path)).rejects.toMatchObject({
      message: `Failed to load component from ${path}`,
      code: "IMP-202",
      docsUrl: "./docs/error-codes.md#imp-202-component-load-failed",
      context: expect.objectContaining({ path })
    });
  });

  it("fetch が reject したら原因をラップして投げる", async () => {
    const failure = new Error("network down");
    fetchMock.mockRejectedValueOnce(failure);
    const path = "./broken.sfc";

    await expect(loadSingleFileComponent(path)).rejects.toMatchObject({
      message: `Failed to load component from ${path}`,
      cause: failure,
      code: "IMP-202"
    });
  });
});
