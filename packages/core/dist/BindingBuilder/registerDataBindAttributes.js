import { createDataBindAttributes } from "./createDataBindAttributes.js";
import { getNodesHavingDataBind } from "./getNodesHavingDataBind.js";
/**
 * テンプレート ID ごとのバインディング属性リストのキャッシュ。
 * テンプレートが登録されると、そのテンプレート内の全バインディング情報を格納。
 *
 * Cache of binding attribute lists per template ID.
 * When a template is registered, stores all binding information within that template.
 */
const listDataBindAttributesById = {};
/**
 * テンプレート ID ごとの "for" バインディングの stateProperty 集合のキャッシュ。
 * ループ（リスト）に関連する状態パスを特定するために使用。
 *
 * 例: "for:items" → listPathsSetById[id] に "items" が追加される
 *
 * Cache of "for" binding stateProperty sets per template ID.
 * Used to identify state paths related to loops (lists).
 *
 * Example: "for:items" → "items" is added to listPathsSetById[id]
 */
const listPathsSetById = {};
/**
 * テンプレート ID ごとの全バインディングの stateProperty 集合のキャッシュ。
 * テンプレート内で参照される全ての状態パスを追跡。
 *
 * 例: "textContent:user.name", "value:email" → pathsSetById[id] に "user.name", "email" が追加
 *
 * Cache of all binding stateProperty sets per template ID.
 * Tracks all state paths referenced within the template.
 *
 * Example: "textContent:user.name", "value:email" → "user.name", "email" are added to pathsSetById[id]
 */
const pathsSetById = {};
/**
 * テンプレートの DocumentFragment から data-bind 対象ノードを抽出し、
 * IDataBindAttributes の配列へ変換する内部ユーティリティ関数。
 *
 * 処理フロー:
 * 1. getNodesHavingDataBind でバインディングを持つノードを抽出
 * 2. 各ノードを createDataBindAttributes で属性情報に変換
 * 3. IDataBindAttributes 配列として返す
 *
 * Internal utility function that extracts data-bind target nodes from template's DocumentFragment
 * and converts them to IDataBindAttributes array.
 *
 * Processing flow:
 * 1. Extract nodes with bindings using getNodesHavingDataBind
 * 2. Convert each node to attribute information using createDataBindAttributes
 * 3. Return as IDataBindAttributes array
 *
 * @param content - テンプレートの DocumentFragment / Template's DocumentFragment
 * @returns バインディング属性情報の配列 / Array of binding attribute information
 */
function getDataBindAttributesFromTemplate(content) {
    // ステップ1: バインディングを持つ全ノードを取得
    // Step 1: Get all nodes with bindings
    const nodes = getNodesHavingDataBind(content);
    // ステップ2: 各ノードを属性情報に変換
    // Step 2: Convert each node to attribute information
    return nodes.map(node => createDataBindAttributes(node));
}
/**
 * テンプレート内のバインディング情報（data-bind 属性やコメント）を解析・登録し、
 * テンプレート ID ごとに属性リストと状態パス集合を構築してキャッシュする。
 *
 * 主な機能:
 * 1. テンプレート内の全バインディングノードを検出・変換
 * 2. 全バインディングの stateProperty を pathsSetById に登録
 * 3. "for" バインディングの stateProperty を listPathsSetById にも登録
 * 4. 解析結果を listDataBindAttributesById にキャッシュ
 *
 * rootId パラメータ:
 * - テンプレートが入れ子の場合、ルートテンプレートの ID を指定
 * - 状態パス集合はルート ID でまとめて管理される
 * - 省略時は id が rootId として使用される
 *
 * 処理フロー:
 * 1. getDataBindAttributesFromTemplate でバインディング情報を抽出
 * 2. rootId に対応する paths と listPaths の Set を取得（初回は新規作成）
 * 3. 各バインディング属性を走査:
 *    a. 各 bindText の stateProperty を paths に追加
 *    b. nodeProperty が "for" の場合、listPaths にも追加
 * 4. 解析結果を listDataBindAttributesById[id] に保存して返す
 *
 * 使用例:
 * ```typescript
 * // テンプレート HTML:
 * // <div data-bind="textContent:user.name"></div>
 * // <ul>
 * //   <!-- @@:for:items -->
 * //   <li data-bind="textContent:name"></li>
 * //   <!-- @@:end -->
 * // </ul>
 *
 * const template = document.getElementById('myTemplate');
 * const attributes = registerDataBindAttributes(1, template.content);
 *
 * // 結果:
 * // listDataBindAttributesById[1] = [
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "user.name", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "for", stateProperty: "items", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "name", ... }], ... }
 * // ]
 * // pathsSetById[1] = Set { "user.name", "items", "name" }
 * // listPathsSetById[1] = Set { "items" }
 * ```
 *
 * Parses and registers binding information (data-bind attributes and comments) within a template,
 * building and caching attribute lists and state path sets per template ID.
 *
 * Main features:
 * 1. Detects and converts all binding nodes within the template
 * 2. Registers all binding stateProperty values to pathsSetById
 * 3. Also registers "for" binding stateProperty values to listPathsSetById
 * 4. Caches parse results in listDataBindAttributesById
 *
 * rootId parameter:
 * - When templates are nested, specify the root template's ID
 * - State path sets are managed collectively by root ID
 * - If omitted, id is used as rootId
 *
 * Processing flow:
 * 1. Extract binding information using getDataBindAttributesFromTemplate
 * 2. Get paths and listPaths Sets corresponding to rootId (create new if first time)
 * 3. Traverse each binding attribute:
 *    a. Add each bindText's stateProperty to paths
 *    b. If nodeProperty is "for", also add to listPaths
 * 4. Save parse result to listDataBindAttributesById[id] and return
 *
 * Usage example:
 * ```typescript
 * // Template HTML:
 * // <div data-bind="textContent:user.name"></div>
 * // <ul>
 * //   <!-- @@:for:items -->
 * //   <li data-bind="textContent:name"></li>
 * //   <!-- @@:end -->
 * // </ul>
 *
 * const template = document.getElementById('myTemplate');
 * const attributes = registerDataBindAttributes(1, template.content);
 *
 * // Result:
 * // listDataBindAttributesById[1] = [
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "user.name", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "for", stateProperty: "items", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "name", ... }], ... }
 * // ]
 * // pathsSetById[1] = Set { "user.name", "items", "name" }
 * // listPathsSetById[1] = Set { "items" }
 * ```
 *
 * @param id - テンプレート ID / Template ID
 * @param content - テンプレートの DocumentFragment / Template's DocumentFragment
 * @param rootId - ルートテンプレート ID（省略時は id と同じ） / Root template ID (defaults to id if omitted)
 * @returns 解析済みバインディング属性リスト / Parsed binding attribute list
 */
export function registerDataBindAttributes(id, content, rootId = id) {
    // ステップ1: テンプレートから全バインディング情報を抽出
    // Step 1: Extract all binding information from template
    const dataBindAttributes = getDataBindAttributesFromTemplate(content);
    // ステップ2: rootId に対応する状態パス集合を取得（初回は新規作成）
    // Step 2: Get state path sets corresponding to rootId (create new if first time)
    const paths = pathsSetById[rootId] ?? (pathsSetById[rootId] = new Set());
    const listPaths = listPathsSetById[rootId] ?? (listPathsSetById[rootId] = new Set());
    // ステップ3: 各バインディング属性を走査し、状態パスを登録
    // Step 3: Traverse each binding attribute and register state paths
    for (let i = 0; i < dataBindAttributes.length; i++) {
        const attribute = dataBindAttributes[i];
        // 各バインディングテキストの stateProperty を処理
        // Process stateProperty of each binding text
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            // 全バインディングの stateProperty を paths に追加
            // Add stateProperty of all bindings to paths
            paths.add(bindText.stateProperty);
            // "for" バインディング（ループ）の場合は listPaths にも追加
            // If "for" binding (loop), also add to listPaths
            if (bindText.nodeProperty === "for") {
                listPaths.add(bindText.stateProperty);
            }
        }
    }
    // ステップ4: 解析結果をキャッシュに保存して返す
    // Step 4: Save parse result to cache and return
    return listDataBindAttributesById[id] = dataBindAttributes;
}
/**
 * テンプレート ID から登録済みバインディング属性リストを取得する。
 *
 * registerDataBindAttributes で登録されたテンプレートの
 * バインディング情報を取得する際に使用。
 *
 * 使用例:
 * ```typescript
 * registerDataBindAttributes(1, template.content);
 * const attributes = getDataBindAttributesById(1);
 * // → [{ bindTexts: [...], nodeType: "Element", nodePath: [...], ... }]
 * ```
 *
 * Gets registered binding attribute list from template ID.
 *
 * Used to retrieve binding information of templates
 * registered with registerDataBindAttributes.
 *
 * Usage example:
 * ```typescript
 * registerDataBindAttributes(1, template.content);
 * const attributes = getDataBindAttributesById(1);
 * // → [{ bindTexts: [...], nodeType: "Element", nodePath: [...], ... }]
 * ```
 *
 * @param id - テンプレート ID / Template ID
 * @returns バインディング属性リスト / Binding attribute list
 */
export const getDataBindAttributesById = (id) => {
    return listDataBindAttributesById[id];
};
/**
 * テンプレート ID から "for" バインディング（ループ）の stateProperty 集合を取得する。
 *
 * ループに関連する状態パスを特定するために使用。
 * 登録されていない場合は空配列を返す。
 *
 * 使用例:
 * ```typescript
 * // テンプレート内に <!-- @@:for:items --> があるとする
 * registerDataBindAttributes(1, template.content);
 * const listPaths = getListPathsSetById(1);
 * // → Set { "items" }
 *
 * // ループ状態の変更を監視
 * if (listPaths.has("items")) {
 *   // items が配列であることを前提とした処理
 * }
 * ```
 *
 * Gets "for" binding (loop) stateProperty set from template ID.
 *
 * Used to identify state paths related to loops.
 * Returns empty array if not registered.
 *
 * Usage example:
 * ```typescript
 * // Assuming template contains <!-- @@:for:items -->
 * registerDataBindAttributes(1, template.content);
 * const listPaths = getListPathsSetById(1);
 * // → Set { "items" }
 *
 * // Monitor loop state changes
 * if (listPaths.has("items")) {
 *   // Process assuming items is an array
 * }
 * ```
 *
 * @param id - テンプレート ID / Template ID
 * @returns "for" バインディングの状態パス集合（未登録時は空配列） / State path set of "for" bindings (empty array if not registered)
 */
export const getListPathsSetById = (id) => {
    return listPathsSetById[id] ?? [];
};
/**
 * テンプレート ID から全バインディングの stateProperty 集合を取得する。
 *
 * テンプレート内で参照される全ての状態パスを追跡するために使用。
 * 登録されていない場合は空配列を返す。
 *
 * 使用例:
 * ```typescript
 * // テンプレート内に以下のバインディングがあるとする:
 * // - textContent:user.name
 * // - value:email
 * // - for:items
 * registerDataBindAttributes(1, template.content);
 * const allPaths = getPathsSetById(1);
 * // → Set { "user.name", "email", "items" }
 *
 * // 状態の変更監視
 * if (allPaths.has("user.name")) {
 *   // user.name の変更を処理
 * }
 * ```
 *
 * Gets all binding stateProperty set from template ID.
 *
 * Used to track all state paths referenced within the template.
 * Returns empty array if not registered.
 *
 * Usage example:
 * ```typescript
 * // Assuming template has following bindings:
 * // - textContent:user.name
 * // - value:email
 * // - for:items
 * registerDataBindAttributes(1, template.content);
 * const allPaths = getPathsSetById(1);
 * // → Set { "user.name", "email", "items" }
 *
 * // Monitor state changes
 * if (allPaths.has("user.name")) {
 *   // Process user.name change
 * }
 * ```
 *
 * @param id - テンプレート ID / Template ID
 * @returns 全バインディングの状態パス集合（未登録時は空配列） / State path set of all bindings (empty array if not registered)
 */
export const getPathsSetById = (id) => {
    return pathsSetById[id] ?? [];
};
