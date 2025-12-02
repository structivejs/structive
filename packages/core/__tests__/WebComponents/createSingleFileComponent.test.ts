/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSingleFileComponent } from "../../src/WebComponents/createSingleFileComponent";
import { config } from "../../src/WebComponents/getGlobalConfig";

describe("WebComponents/createSingleFileComponent", () => {
  const originalDebug = config.debug;

  beforeEach(() => {
    config.debug = false;
  });

  afterEach(() => {
    config.debug = originalDebug;
    vi.restoreAllMocks();
  });

  it("<template> の HTML を抽出し、{{ }} を保持する（script/style なし）", async () => {
    const sfc = `
      <template>
        <div class="x">Hello {{name}}</div>
      </template>
    `;
    const res = await createSingleFileComponent("test.html", sfc);
    expect(res.html.trim()).toBe('<div class="x">Hello {{name}}</div>');
    expect(res.css).toBe("");
    expect(typeof res.stateClass).toBe("function");
  });

  it("<style> を抽出し、CSS テキストを返す", async () => {
    const sfc = `
      <template>
        <p>text</p>
      </template>
      <style>
        .x{color:red}
      </style>
    `;
    const res = await createSingleFileComponent("test.html", sfc);
    expect(res.html.trim()).toBe('<p>text</p>');
    expect(res.css.replace(/\s+/g, "")).toBe('.x{color:red}');
  });

  it("<script type=module> の default export を stateClass として返す", async () => {
    const sfc = `
      <template>
        <section>ok</section>
      </template>
      <script type="module">
        export default class MyState { static $config = { enabled: true } }
      </script>
    `;
    const res = await createSingleFileComponent("test.html", sfc);
    expect(res.html.trim()).toBe('<section>ok</section>');
    expect(typeof res.stateClass).toBe("function");
    // static プロパティが参照できること
    expect((res.stateClass as any).$config).toEqual({ enabled: true });
  });

  it("<template> が存在しない場合は空 HTML を返す", async () => {
    const sfc = `
      <style>.no-template{display:none}</style>
      <script type="module">export const value = 1;</script>
    `;
    const res = await createSingleFileComponent("test.html", sfc);
    expect(res.html).toBe("");
    expect(res.css.replace(/\s+/g, "")).toBe('.no-template{display:none}');
    // default export が無い場合は空クラスが返る
    expect(Object.getPrototypeOf(res.stateClass)).toBe(Function.prototype);
  });

  it("URL.createObjectURL が存在する場合は Blob URL 経由でスクリプトをインポートする", async () => {
    // このテストでは URL.createObjectURL のコードパス（48-51行）を通過させる
    // ただし実際のBlob URLからのimportはテスト環境では動作しないため、
    // URL.createObjectURL/revokeObjectURLの呼び出しが正しく行われることを確認する
    
    const mockBlobURL = "blob:test-url";
    let capturedBlob: Blob | null = null;
    const mockCreateObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return mockBlobURL;
    });
    const mockRevokeObjectURL = vi.fn();
    
    // URL APIをモック
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = mockCreateObjectURL as any;
    URL.revokeObjectURL = mockRevokeObjectURL;

    const sfc = `
      <template>
        <div>blob test</div>
      </template>
      <script type="module">
        export default class BlobTestState { static $type = "blob" }
      </script>
    `;

    try {
      // このテストは import(url) でエラーになるが、
      // それまでの処理（createObjectURL呼び出し）が正しく行われることを確認
      await createSingleFileComponent("blob-test.html", sfc).catch(() => {
        // importエラーは予想される
      });

      // createObjectURL が Blob で呼ばれたことを確認
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(capturedBlob).toBeInstanceOf(Blob);
      // @ts-expect-error - Blobの型チェック回避
      expect(capturedBlob?.type).toBe("application/javascript");
      
      // revokeObjectURL は import でエラーになるため呼ばれない可能性がある
      // （エラーハンドリングで呼ばれないケース）
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("config.debug=true のとき、missing <template> を警告する", async () => {
    config.debug = true;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const sfc = `
      <style>.only-style{}</style>
      <script type="module">export default class {}</script>
    `;
    await createSingleFileComponent("warn-template.sfc", sfc);
    expect(warnSpy).toHaveBeenCalledWith(
      "[Structive][SFC] Missing <template> section in warn-template.sfc"
    );
  });

  it("config.debug=true のとき、type=module なしの <script> 欠如を警告する", async () => {
    config.debug = true;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const sfc = `
      <template><div>no script</div></template>
      <style>.no-script{}</style>
    `;
    await createSingleFileComponent("warn-script.sfc", sfc);
    expect(warnSpy).toHaveBeenCalledWith(
      "[Structive][SFC] Missing <script> section in warn-script.sfc (expects <script type=\"module\">)"
    );
  });

  it("config.debug=true のとき、missing <style> を警告する", async () => {
    config.debug = true;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const sfc = `
      <template><p>no style</p></template>
      <script type="module">export default class {}</script>
    `;
    await createSingleFileComponent("warn-style.sfc", sfc);
    expect(warnSpy).toHaveBeenCalledWith(
      "[Structive][SFC] Missing <style> section in warn-style.sfc"
    );
  });
});
