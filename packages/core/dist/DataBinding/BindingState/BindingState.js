import { createFilters } from "../../BindingBuilder/createFilters.js";
import { getByRef } from "../../StateClass/methods/getByRef.js";
import { setByRef } from "../../StateClass/methods/setByRef.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { raiseError } from "../../utils.js";
/**
 * BindingState クラスは、バインディング対象の状態（State）プロパティへのアクセス・更新・フィルタ適用を担当する実装です。
 *
 * アーキテクチャ:
 * - pattern, info: バインディング対象の状態プロパティパスとその構造情報
 * - filters: 値取得時に適用するフィルタ関数群
 * - ref: 状態プロパティ参照（ループやワイルドカードに応じて動的に解決）
 * - listIndex: ループバインディング時のインデックス情報
 *
 * 主な役割:
 * 1. バインディング対象の状態プロパティ（pattern, info）やリストインデックス（listIndex）を管理
 * 2. getValue で現在の値を取得、getFilteredValue でフィルタ適用後の値を取得
 * 3. assignValue で状態プロキシに値を書き込む（双方向バインディング対応）
 * 4. activate/inactivate でバインディング情報の登録・解除（依存解決や再描画の最適化）
 *
 * 設計ポイント:
 * - ワイルドカードパス（配列バインディング等）にも対応し、ループごとのインデックス管理が可能
 * - フィルタ適用は配列で柔軟に対応
 * - createBindingState ファクトリでフィルタ適用済みインスタンスを生成
 *
 * BindingState class is responsible for accessing, updating, and applying filters to the state (State) property targeted by the binding.
 *
 * Architecture:
 * - pattern, info: State property path targeted by binding and its structural info
 * - filters: Array of filter functions applied when retrieving value
 * - ref: State property reference (dynamically resolved for loops/wildcards)
 * - listIndex: Index info for loop bindings
 *
 * Main responsibilities:
 * 1. Manage state property targeted by binding (pattern, info) and list index (listIndex)
 * 2. getValue retrieves current value, getFilteredValue retrieves value after filter application
 * 3. assignValue writes value to state proxy (supports bidirectional binding)
 * 4. activate/inactivate registers/unregisters binding info (optimizes dependency resolution and redraw)
 *
 * Design points:
 * - Supports wildcard paths (array bindings), enables per-loop index management
 * - Flexible filter application via array
 * - createBindingState factory generates filter-applied instances
 */
class BindingState {
    binding;
    pattern;
    info;
    filters;
    isLoopIndex = false;
    #nullRef = null;
    #ref = null;
    #loopContext = null;
    /**
     * 現在のリストインデックス（ループバインディング時のみ有効）を返すgetter。
     * Getter to return current list index (valid only for loop bindings).
     */
    get listIndex() {
        return this.ref.listIndex;
    }
    /**
     * 状態プロパティ参照（IStatePropertyRef）を返すgetter。
     * - 通常: #nullRef（ワイルドカードなし）を返す
     * - ワイルドカードあり: #loopContext からインデックスを取得し、#refを動的に生成
     * - ループコンテキスト未初期化時はエラー
     *
     * Getter to return state property reference (IStatePropertyRef).
     * - Normal: returns #nullRef (no wildcard)
     * - With wildcard: gets index from #loopContext, dynamically generates #ref
     * - Throws error if loop context is uninitialized
     */
    get ref() {
        if (this.#nullRef === null) {
            // ワイルドカードバインディング時: ループコンテキストが必要
            if (this.#loopContext === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            }
            // #refが未生成なら生成
            if (this.#ref === null) {
                this.#ref = getStatePropertyRef(this.info, this.#loopContext.listIndex);
            }
            return this.#ref;
        }
        else {
            // 通常バインディング: #nullRefを返す
            return this.#nullRef ?? raiseError({
                code: 'BIND-201',
                message: 'ref is null',
                context: { pattern: this.pattern },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
    }
    /**
     * コンストラクタ。
     * - バインディング、パスパターン、フィルタ配列を受け取り初期化
     * - パターンから構造情報（info）を生成
     * - ワイルドカードなしの場合は #nullRef を即時生成
     *
     * Constructor.
     * - Initializes with binding, path pattern, and filter array
     * - Generates structural info (info) from pattern
     * - If no wildcard, immediately generates #nullRef
     */
    constructor(binding, pattern, filters) {
        this.binding = binding;
        this.pattern = pattern;
        this.info = getStructuredPathInfo(pattern);
        this.filters = filters;
        this.#nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
    }
    /**
     * 現在の値を取得するメソッド。
     * - engine.state, ref, state, handlerを使って値を取得
     *
     * Method to get current value.
     * - Uses engine.state, ref, state, handler to retrieve value
     */
    getValue(state, handler) {
        return getByRef(this.binding.engine.state, this.ref, state, handler);
    }
    /**
     * フィルタ適用後の値を取得するメソッド。
     * - getValueで取得した値にfilters配列を順次適用
     *
     * Method to get value after filter application.
     * - Sequentially applies filters array to value obtained by getValue
     */
    getFilteredValue(state, handler) {
        let value = getByRef(this.binding.engine.state, this.ref, state, handler);
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * 状態プロキシに値を書き込むメソッド（双方向バインディング用）。
     * - setByRefでengine.state, ref, value, writeState, handlerを使って書き込み
     *
     * Method to write value to state proxy (for bidirectional binding).
     * - Uses setByRef with engine.state, ref, value, writeState, handler
     */
    assignValue(writeState, handler, value) {
        setByRef(this.binding.engine.state, this.ref, value, writeState, handler);
    }
    /**
     * バインディングを有効化するメソッド。
     * - ワイルドカードバインディング時はループコンテキストを解決
     * - バインディング情報をエンジンに登録（依存解決・再描画最適化）
     *
     * Method to activate binding.
     * - Resolves loop context for wildcard bindings
     * - Registers binding info to engine (optimizes dependency resolution/redraw)
     */
    activate() {
        if (this.info.wildcardCount > 0) {
            // ワイルドカードバインディング: ループコンテキストを解決
            const lastWildcardPath = this.info.lastWildcardPath ??
                raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard last parentPath is null',
                    context: { where: 'BindingState.init', pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#loopContext = this.binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ??
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { where: 'BindingState.init', lastWildcardPath },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#ref = null; // ループインデックスが変わる可能性があるため毎回再解決
        }
        // バインディング情報をエンジンに登録
        this.binding.engine.saveBinding(this.ref, this.binding);
    }
    /**
     * バインディングを無効化するメソッド。
     * - バインディング情報をエンジンから解除
     * - #ref, #loopContextをクリア
     *
     * Method to inactivate binding.
     * - Unregisters binding info from engine
     * - Clears #ref and #loopContext
     */
    inactivate() {
        this.binding.engine.removeBinding(this.ref, this.binding);
        this.#ref = null;
        this.#loopContext = null;
    }
}
/**
 * BindingStateインスタンスを生成するファクトリ関数。
 * - name: バインディング対象の状態プロパティパス
 * - filterTexts: フィルタテキスト配列
 * - filters: フィルタ関数群（FilterWithOptions）
 *
 * Factory function to generate BindingState instance.
 * - name: State property path targeted by binding
 * - filterTexts: Array of filter texts
 * - filters: Array of filter functions (FilterWithOptions)
 */
export const createBindingState = (name, filterTexts) => (binding, filters) => {
    // フィルタ関数群を生成（必要ならメモ化可能）
    // Generates filter functions (can be memoized if needed)
    const filterFns = createFilters(filters, filterTexts); // ToDo:ここは、メモ化できる
    return new BindingState(binding, name, filterFns);
};
