function escapeEmbed(html) {
    return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
        return `<!--{{${expr}}}-->`;
    });
}
function unescapeEmbed(html) {
    return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
        return `{{${expr}}}`;
    });
}
let id = 0;
export async function createSingleFileComponent(path, text) {
    const template = document.createElement("template");
    template.innerHTML = escapeEmbed(text);
    const html = template.content.querySelector("template");
    html?.remove();
    const script = template.content.querySelector("script[type=module]");
    let scriptModule = {};
    if (script) {
        const uniq_comment = `\n// uniq id: ${id++}\n//# sourceURL=${path}\n`;
        // blob URLを使用（ブラウザ環境）
        // テスト環境（jsdom）ではURL.createObjectURLが存在しないためフォールバック
        if (typeof URL.createObjectURL === 'function') {
            const blob = new Blob([script.text + uniq_comment], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            scriptModule = await import(url);
            URL.revokeObjectURL(url);
        }
        else {
            // フォールバック: Base64エンコード方式（テスト環境用）
            const b64 = btoa(String.fromCodePoint(...new TextEncoder().encode(script.text + uniq_comment)));
            scriptModule = await import("data:application/javascript;base64," + b64);
        }
    }
    script?.remove();
    const style = template.content.querySelector("style");
    style?.remove();
    const stateClass = (scriptModule.default ?? class {
    });
    return {
        text,
        html: unescapeEmbed(html?.innerHTML ?? "").trim(),
        css: style?.textContent ?? "",
        stateClass,
    };
}
