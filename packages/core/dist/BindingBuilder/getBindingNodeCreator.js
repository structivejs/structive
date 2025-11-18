import { createBindingNodeAttribute } from "../DataBinding/BindingNode/BindingNodeAttribute.js";
import { createBindingNodeCheckbox } from "../DataBinding/BindingNode/BindingNodeCheckbox.js";
import { createBindingNodeClassList } from "../DataBinding/BindingNode/BindingNodeClassList.js";
import { createBindingNodeClassName } from "../DataBinding/BindingNode/BindingNodeClassName.js";
import { createBindingNodeEvent } from "../DataBinding/BindingNode/BindingNodeEvent.js";
import { createBindingNodeIf } from "../DataBinding/BindingNode/BindingNodeIf.js";
import { createBindingNodeFor } from "../DataBinding/BindingNode/BindingNodeFor.js";
import { createBindingNodeProperty } from "../DataBinding/BindingNode/BindingNodeProperty.js";
import { createBindingNodeRadio } from "../DataBinding/BindingNode/BindingNodeRadio.js";
import { createBindingNodeStyle } from "../DataBinding/BindingNode/BindingNodeStyle.js";
import { raiseError } from "../utils.js";
import { createBindingNodeComponent } from "../DataBinding/BindingNode/BindingNodeComponent.js";
/**
 * ノード種別（Element/Comment）とプロパティ名の組み合わせで
 * 特定のバインディングノード生成関数を定義するマップ
 *
 * インデックス 0 (Element): 要素ノード専用のバインディング
 *   - "class": classList操作（class属性のトークンリスト操作）
 *   - "checkbox": チェックボックスのchecked状態バインディング
 *   - "radio": ラジオボタンのchecked状態バインディング
 *
 * インデックス 1 (Comment): コメントノード専用のバインディング
 *   - "if": 条件分岐バインディング（要素の表示/非表示）
 *
 * Map defining specific binding node creator functions by combination of
 * node type (Element/Comment) and property name
 *
 * Index 0 (Element): Element-specific bindings
 *   - "class": classList manipulation (class attribute token list operations)
 *   - "checkbox": Checkbox checked state binding
 *   - "radio": Radio button checked state binding
 *
 * Index 1 (Comment): Comment node-specific bindings
 *   - "if": Conditional binding (element show/hide)
 */
const nodePropertyConstructorByNameByIsComment = {
    0: {
        "class": createBindingNodeClassList,
        "checkbox": createBindingNodeCheckbox,
        "radio": createBindingNodeRadio,
    },
    1: {
        "if": createBindingNodeIf,
    },
};
/**
 * プロパティ名の先頭部分（ドット区切りの最初の要素）で判定する
 * バインディングノード生成関数のマップ
 *
 * 対応パターン:
 *   - "class.xxx": className バインディング（class属性全体の設定）
 *   - "attr.xxx": attribute バインディング（任意の属性の設定）
 *   - "style.xxx": style バインディング（インラインスタイルの設定）
 *   - "state.xxx": component state バインディング（コンポーネント状態の受け渡し）
 *
 * 例:
 *   - "class.active" → BindingNodeClassName (class属性を"active"に設定)
 *   - "attr.src" → BindingNodeAttribute (src属性を設定)
 *   - "style.color" → BindingNodeStyle (colorスタイルを設定)
 *   - "state.user" → BindingNodeComponent (子コンポーネントのuserステートに値を渡す)
 *
 * Map of binding node creator functions determined by property name prefix
 * (first element before dot separator)
 *
 * Supported patterns:
 *   - "class.xxx": className binding (set entire class attribute)
 *   - "attr.xxx": attribute binding (set arbitrary attribute)
 *   - "style.xxx": style binding (set inline style)
 *   - "state.xxx": component state binding (pass state to child component)
 *
 * Examples:
 *   - "class.active" → BindingNodeClassName (set class attribute to "active")
 *   - "attr.src" → BindingNodeAttribute (set src attribute)
 *   - "style.color" → BindingNodeStyle (set color style)
 *   - "state.user" → BindingNodeComponent (pass value to child component's user state)
 */
const nodePropertyConstructorByFirstName = {
    "class": createBindingNodeClassName,
    "attr": createBindingNodeAttribute,
    "style": createBindingNodeStyle,
    "state": createBindingNodeComponent,
    //  "popover": PopoverTarget,      // 将来の拡張用 / For future extension
    //  "commandfor": CommandForTarget, // 将来の拡張用 / For future extension
};
/**
 * バインディング対象ノードの種別（Element/Comment）とプロパティ名に応じて、
 * 適切なバインディングノード生成関数（CreateBindingNodeFn）を返す内部関数。
 *
 * 判定ロジック（優先順位順）:
 * 1. ノード種別とプロパティ名の完全一致で判定（nodePropertyConstructorByNameByIsComment）
 *    - Element: "class", "checkbox", "radio"
 *    - Comment: "if"
 *
 * 2. コメントノードで"for"の場合 → createBindingNodeFor
 *
 * 3. コメントノードで未知のプロパティ → エラー
 *
 * 4. プロパティ名の先頭部分で判定（nodePropertyConstructorByFirstName）
 *    - "class.xxx", "attr.xxx", "style.xxx", "state.xxx"
 *
 * 5. 要素ノードで"on"から始まる場合 → createBindingNodeEvent
 *    - 例: "onclick", "onchange", "onkeydown"
 *
 * 6. その他 → createBindingNodeProperty（汎用プロパティバインディング）
 *    - 例: "value", "textContent", "disabled", "innerHTML"
 *
 * Internal function that returns the appropriate binding node creator function
 * (CreateBindingNodeFn) based on target node type (Element/Comment) and property name.
 *
 * Decision logic (in priority order):
 * 1. Exact match by node type and property name (nodePropertyConstructorByNameByIsComment)
 *    - Element: "class", "checkbox", "radio"
 *    - Comment: "if"
 *
 * 2. Comment node with "for" → createBindingNodeFor
 *
 * 3. Comment node with unknown property → Error
 *
 * 4. Match by property name prefix (nodePropertyConstructorByFirstName)
 *    - "class.xxx", "attr.xxx", "style.xxx", "state.xxx"
 *
 * 5. Element node starting with "on" → createBindingNodeEvent
 *    - Examples: "onclick", "onchange", "onkeydown"
 *
 * 6. Others → createBindingNodeProperty (generic property binding)
 *    - Examples: "value", "textContent", "disabled", "innerHTML"
 *
 * @param isComment - コメントノードかどうか / Whether it's a comment node
 * @param isElement - 要素ノードかどうか / Whether it's an element node
 * @param propertyName - バインディングプロパティ名 / Binding property name
 * @returns バインディングノード生成関数 / Binding node creator function
 * @throws プロパティ名が不正な場合 / When property name is invalid
 */
function _getBindingNodeCreator(isComment, isElement, propertyName) {
    // ステップ1: ノード種別とプロパティ名の完全一致で専用生成関数を取得
    // Step 1: Get dedicated creator function by exact match of node type and property name
    const bindingNodeCreatorByName = nodePropertyConstructorByNameByIsComment[isComment ? 1 : 0][propertyName];
    if (typeof bindingNodeCreatorByName !== "undefined") {
        return bindingNodeCreatorByName;
    }
    // ステップ2: コメントノードで"for"の場合は専用の繰り返しバインディング
    // Step 2: For comment node with "for", use dedicated loop binding
    if (isComment && propertyName === "for") {
        return createBindingNodeFor;
    }
    // ステップ3: コメントノードで未対応のプロパティはエラー
    // （コメントノードで使えるのは "if" と "for" のみ）
    // Step 3: Error for unsupported properties on comment node
    // (Only "if" and "for" are allowed on comment nodes)
    if (isComment) {
        raiseError(`getBindingNodeCreator: unknown node property ${propertyName}`);
    }
    // ステップ4: プロパティ名の先頭部分（ドット区切りの最初）で判定
    // 例: "attr.src" → nameElements[0] = "attr"
    // Step 4: Determine by property name prefix (first part before dot)
    // Example: "attr.src" → nameElements[0] = "attr"
    const nameElements = propertyName.split(".");
    const bindingNodeCreatorByFirstName = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof bindingNodeCreatorByFirstName !== "undefined") {
        return bindingNodeCreatorByFirstName;
    }
    // ステップ5: 要素ノードで"on"から始まる場合はイベントバインディング
    // 例: "onclick", "onchange", "onsubmit"
    // Step 5: For element node starting with "on", use event binding
    // Examples: "onclick", "onchange", "onsubmit"
    if (isElement) {
        if (propertyName.startsWith("on")) {
            return createBindingNodeEvent;
        }
        else {
            // ステップ6a: その他の要素プロパティは汎用プロパティバインディング
            // 例: "value", "textContent", "disabled"
            // Step 6a: Other element properties use generic property binding
            // Examples: "value", "textContent", "disabled"
            return createBindingNodeProperty;
        }
    }
    else {
        // ステップ6b: 要素でもコメントでもない場合（Textノード等）も汎用バインディング
        // Step 6b: For nodes that are neither element nor comment (Text nodes, etc.), use generic binding
        return createBindingNodeProperty;
    }
}
/**
 * バインディングノード生成関数のキャッシュ
 * キー形式: "{isComment}\t{isElement}\t{propertyName}"
 *
 * 同じノード種別とプロパティ名の組み合わせが複数回使われる場合、
 * 判定ロジックを再実行せずキャッシュから取得してパフォーマンスを向上
 *
 * Cache for binding node creator functions
 * Key format: "{isComment}\t{isElement}\t{propertyName}"
 *
 * When the same combination of node type and property name is used multiple times,
 * retrieve from cache instead of re-executing decision logic to improve performance
 */
const _cache = {};
/**
 * ノード、プロパティ名、フィルタ、デコレータ情報から
 * 適切なバインディングノード生成関数を取得するファクトリ関数。
 *
 * 処理フロー:
 * 1. ノード種別を判定（Comment/Element）
 * 2. キャッシュキーを生成（"{isComment}\t{isElement}\t{propertyName}"）
 * 3. キャッシュを確認、存在しない場合は_getBindingNodeCreatorで取得してキャッシュ
 * 4. 取得した生成関数にプロパティ名、フィルタ、デコレータを渡して実行
 * 5. 実際のバインディングノード生成関数（CreateBindingNodeByNodeFn）を返す
 *
 * 使用例:
 * ```typescript
 * const node = document.querySelector('input');
 * const creator = getBindingNodeCreator(
 *   node,
 *   'value',
 *   [{ name: 'trim', options: [] }],
 *   ['required']
 * );
 * // creatorは (binding, node, filters) => BindingNodeProperty のような関数
 * ```
 *
 * Factory function that retrieves the appropriate binding node creator function
 * from node, property name, filter, and decorator information.
 *
 * Processing flow:
 * 1. Determine node type (Comment/Element)
 * 2. Generate cache key ("{isComment}\t{isElement}\t{propertyName}")
 * 3. Check cache, if not exists, get via _getBindingNodeCreator and cache it
 * 4. Execute obtained creator function with property name, filters, and decorates
 * 5. Return actual binding node creator function (CreateBindingNodeByNodeFn)
 *
 * Usage example:
 * ```typescript
 * const node = document.querySelector('input');
 * const creator = getBindingNodeCreator(
 *   node,
 *   'value',
 *   [{ name: 'trim', options: [] }],
 *   ['required']
 * );
 * // creator is a function like (binding, node, filters) => BindingNodeProperty
 * ```
 *
 * @param node - バインディング対象のDOMノード / Target DOM node for binding
 * @param propertyName - バインディングプロパティ名（例: "value", "onclick", "attr.src"） / Binding property name (e.g., "value", "onclick", "attr.src")
 * @param filterTexts - 入力フィルタのメタデータ配列 / Array of input filter metadata
 * @param decorates - デコレータ配列（例: ["required", "trim"]） / Array of decorators (e.g., ["required", "trim"])
 * @returns 実際のバインディングノードインスタンスを生成する関数 / Function that creates actual binding node instance
 */
export function getBindingNodeCreator(node, propertyName, filterTexts, decorates) {
    // ノード種別を判定
    // Determine node type
    const isComment = node instanceof Comment;
    const isElement = node instanceof Element;
    // キャッシュキーを生成（タブ区切りで連結）
    // Generate cache key (concatenate with tab separator)
    const key = isComment + "\t" + isElement + "\t" + propertyName;
    // キャッシュから取得、なければ新規に判定してキャッシュに保存
    // Get from cache, if not exists, determine and save to cache
    const fn = _cache[key] ?? (_cache[key] = _getBindingNodeCreator(isComment, isElement, propertyName));
    // 取得した生成関数にプロパティ名、フィルタ、デコレータを渡して実行
    // Execute obtained creator function with property name, filters, and decorates
    return fn(propertyName, filterTexts, decorates);
}
