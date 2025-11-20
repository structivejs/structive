import { canHaveShadowRoot } from "./canHaveShadowRoot.js";
function getParentShadowRoot(parentNode) {
    let node = parentNode;
    while (node) {
        if (node instanceof ShadowRoot) {
            return node;
        }
        node = node.parentNode;
    }
}
/**
 * Light DOMモード: Shadow DOMを使用せず、スタイルを親のShadowRootまたはdocumentに追加する。
 * スタイルシートの重複追加を防止する。
 *
 * @param element    対象のHTMLElement
 * @param styleSheet 適用するCSSStyleSheet
 */
function attachStyleInLightMode(element, styleSheet) {
    const shadowRootOrDocument = getParentShadowRoot(element.parentNode) || document;
    const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
    if (!styleSheets.includes(styleSheet)) {
        shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, styleSheet];
    }
}
/**
 * ShadowRootを作成し、スタイルシートを適用する。
 * 既にShadowRootが存在する場合は作成をスキップする。
 *
 * @param element    対象のHTMLElement
 * @param styleSheet 適用するCSSStyleSheet
 */
function createShadowRootWithStyle(element, styleSheet) {
    if (!element.shadowRoot) {
        const shadowRoot = element.attachShadow({ mode: 'open' });
        shadowRoot.adoptedStyleSheets = [styleSheet];
    }
}
/**
 * 指定したHTMLElementにShadow DOMをアタッチし、スタイルシートを適用するユーティリティ関数。
 *
 * - config.shadowDomMode="auto": Shadow DOMをサポートする要素のみShadowRootを生成、非対応はLight DOMにフォールバック
 *   - 自律型カスタム要素: 常にShadowRoot作成
 *   - 組み込み要素拡張: canHaveShadowRootで判定、対応ならShadowRoot作成、非対応ならLight DOM
 * - config.shadowDomMode="force": 判定なしで強制的にShadowRootを生成（非対応の場合は例外）
 * - config.shadowDomMode="none": Shadow DOMを使用せず、親のShadowRootまたはdocumentにスタイルを追加
 * - すでに同じスタイルシートが含まれていれば重複追加しない
 *
 * @param element    対象のHTMLElement
 * @param config     コンポーネント設定
 * @param styleSheet 適用するCSSStyleSheet
 */
export function attachShadow(element, config, styleSheet) {
    if (config.shadowDomMode === "none") {
        attachStyleInLightMode(element, styleSheet);
    }
    else if (config.shadowDomMode === "force") {
        createShadowRootWithStyle(element, styleSheet);
    }
    else {
        // Auto mode: Shadow DOMをサポートする要素のみShadowRoot作成、非対応はLight DOMにフォールバック
        if (config.extends === null || canHaveShadowRoot(config.extends)) {
            // 自律型カスタム要素 or Shadow DOM対応の組み込み要素拡張
            createShadowRootWithStyle(element, styleSheet);
        }
        else {
            // Shadow DOM非対応の組み込み要素拡張 → Light DOMにフォールバック
            attachStyleInLightMode(element, styleSheet);
        }
    }
}
