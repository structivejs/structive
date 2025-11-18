import { createFilters } from "../../BindingBuilder/createFilters.js";
import { raiseError } from "../../utils.js";
/**
 * BindingStateIndex クラスは、forバインディング等のループ内で利用される
 * インデックス値（$1, $2, ...）のバインディング状態を管理する実装です。
 *
 * アーキテクチャ:
 * - indexNumber: パターン（例: "$1"）から抽出したインデックス番号（1始まり）
 * - #loopContext: 対応するループコンテキスト（activate時に解決）
 * - filters: 値取得時に適用するフィルタ関数群
 *
 * 主な役割:
 * 1. ループコンテキストからインデックス値を取得し、getValue/getFilteredValueで参照可能にする
 * 2. activate時にbindingsByListIndexへ自身を登録し、依存解決や再描画を効率化
 * 3. フィルタ適用にも対応
 *
 * 設計ポイント:
 * - pattern（例: "$1"）からインデックス番号を抽出し、ループコンテキストから該当インデックスを取得
 * - activateでループコンテキストやlistIndexRefを初期化し、バインディング情報をエンジンに登録
 * - assignValueは未実装（インデックスは書き換え不可のため）
 * - createBindingStateIndexファクトリでフィルタ適用済みインスタンスを生成
 *
 * BindingStateIndex class manages binding state for index values ($1, $2, ...) used in loops (e.g., for bindings).
 *
 * Architecture:
 * - indexNumber: Index number (1-based) extracted from pattern (e.g., "$1")
 * - #loopContext: Corresponding loop context (resolved in activate)
 * - filters: Array of filter functions applied when retrieving value
 *
 * Main responsibilities:
 * 1. Retrieve index value from loop context, make accessible via getValue/getFilteredValue
 * 2. Register self to bindingsByListIndex in activate, optimize dependency resolution/redraw
 * 3. Support filter application
 *
 * Design points:
 * - Extract index number from pattern (e.g., "$1"), retrieve corresponding index from loop context
 * - Initialize loop context and listIndexRef in activate, register binding info to engine
 * - assignValue is unimplemented (index is read-only)
 * - createBindingStateIndex factory generates filter-applied instance
 */
class BindingStateIndex {
    binding;
    indexNumber;
    filters;
    #loopContext = null;
    /**
     * pattern, info: インデックスバインディングでは未実装（参照不可）
     * pattern, info: Not implemented for index binding (not accessible)
     */
    get pattern() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.pattern' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    get info() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.info' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * 現在のリストインデックス（ループコンテキストから取得）
     * Getter for current list index (retrieved from loop context)
     */
    get listIndex() {
        return this.#loopContext?.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.listIndex' },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * 現在のリストインデックスのref（ループコンテキストから取得）
     * Getter for ref of current list index (retrieved from loop context)
     */
    get ref() {
        return this.#loopContext?.ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'BindingStateIndex.ref' },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    /**
     * インデックスバインディングであることを示すフラグ
     * Flag indicating this is an index binding
     */
    get isLoopIndex() {
        return true;
    }
    /**
     * コンストラクタ。
     * - pattern（例: "$1"）からインデックス番号を抽出（1始まり）
     * - フィルタ配列を保存
     * - patternが不正な場合はエラー
     *
     * Constructor.
     * - Extracts index number (1-based) from pattern (e.g., "$1")
     * - Saves filter array
     * - Throws error if pattern is invalid
     */
    constructor(binding, pattern, filters) {
        this.binding = binding;
        const indexNumber = Number(pattern.slice(1));
        if (isNaN(indexNumber)) {
            raiseError({
                code: 'BIND-202',
                message: 'Pattern is not a number',
                context: { where: 'BindingStateIndex.constructor', pattern },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        this.indexNumber = indexNumber;
        this.filters = filters;
    }
    /**
     * 現在のインデックス値を取得するメソッド。
     * - ループコンテキストからlistIndex.indexを取得
     * - 未初期化時はエラー
     *
     * Method to get current index value.
     * - Retrieves listIndex.index from loop context
     * - Throws error if uninitialized
     */
    getValue(state, handler) {
        return this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.getValue' },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * フィルタ適用後のインデックス値を取得するメソッド。
     * - getValueで取得した値にfilters配列を順次適用
     *
     * Method to get index value after filter application.
     * - Sequentially applies filters array to value obtained by getValue
     */
    getFilteredValue(state, handler) {
        let value = this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.getFilteredValue' },
            docsUrl: '/docs/error-codes.md#list',
        });
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * assignValueは未実装（インデックスは書き換え不可のため）。
     * assignValue is not implemented (index is read-only).
     */
    assignValue(writeState, handler, value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.assignValue' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * バインディングを有効化するメソッド。
     * - ループコンテキストを解決し、indexNumberに対応するものを取得
     * - bindingsByListIndexに自身を登録（依存解決・再描画最適化）
     *
     * Method to activate binding.
     * - Resolves loop context, retrieves one corresponding to indexNumber
     * - Registers self to bindingsByListIndex (optimizes dependency resolution/redraw)
     */
    activate() {
        const loopContext = this.binding.parentBindContent.currentLoopContext ??
            raiseError({
                code: 'BIND-201',
                message: 'LoopContext is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const loopContexts = loopContext.serialize();
        this.#loopContext = loopContexts[this.indexNumber - 1] ??
            raiseError({
                code: 'BIND-201',
                message: 'Current loopContext is null',
                context: { where: 'BindingStateIndex.init', indexNumber: this.indexNumber },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const bindingForList = this.#loopContext.bindContent.parentBinding;
        if (bindingForList == null) {
            raiseError({
                code: 'BIND-201',
                message: 'Binding for list is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        // bindingsByListIndexに自身を登録
        // Register self to bindingsByListIndex
        const bindings = bindingForList.bindingsByListIndex.get(this.listIndex);
        if (typeof bindings === "undefined") {
            bindingForList.bindingsByListIndex.set(this.listIndex, new Set([this.binding]));
        }
        else {
            bindings.add(this.binding);
        }
    }
    /**
     * バインディングを無効化するメソッド。
     * - #loopContextをクリア
     *
     * Method to inactivate binding.
     * - Clears #loopContext
     */
    inactivate() {
        this.#loopContext = null;
    }
}
/**
 * BindingStateIndexインスタンスを生成するファクトリ関数。
 * - name: インデックスバインディングのパターン（例: "$1"）
 * - filterTexts: フィルタテキスト配列
 * - filters: フィルタ関数群（FilterWithOptions）
 *
 * Factory function to generate BindingStateIndex instance.
 * - name: Pattern for index binding (e.g., "$1")
 * - filterTexts: Array of filter texts
 * - filters: Array of filter functions (FilterWithOptions)
 *
 * @returns 生成されたBindingStateIndexインスタンス / Generated BindingStateIndex instance
 */
export const createBindingStateIndex = (name, filterTexts) => (binding, filters) => {
    // フィルタ関数群を生成（必要ならメモ化可能）
    // Generates filter functions (can be memoized if needed)
    const filterFns = createFilters(filters, filterTexts); // ToDo:ここは、メモ化できる
    return new BindingStateIndex(binding, name, filterFns);
};
