import { raiseError } from "../../utils.js";
/**
 * BindingNode クラスは、1つのバインディング対象ノード（ElementやTextなど）に対する
 * バインディング処理の基底クラスです。
 *
 * アーキテクチャ:
 * - #binding: 親バインディング（IBinding）への参照
 * - #node: バインディング対象のDOMノード
 * - #name: バインディングのプロパティ名（例: "textContent", "value"）
 * - #filters: 値取得時に適用するフィルタ関数群
 * - #decorates: デコレータ文字列配列（例: ["prevent", "stop"]）
 * - #bindContents: 子BindContent配列（構造制御バインディング用）
 *
 * 主な役割:
 * 1. ノード・プロパティ名・フィルタ・デコレータ・バインディング情報の保持
 * 2. バインディング値の更新（applyChange → assignValue）のインターフェース提供
 * 3. 複数バインド内容（bindContents）の管理（構造制御バインディング用）
 * 4. サブクラスでassignValue, updateElementsを実装し、各種ノード・プロパティごとのバインディング処理を拡張
 *
 * 設計パターン:
 * - Template Method: applyChange が共通フロー、assignValue をサブクラスで実装
 * - Strategy: フィルタ・デコレータで振る舞いをカスタマイズ
 *
 * サブクラス:
 * - BindingNodeAttribute: 属性バインディング
 * - BindingNodeProperty*: プロパティバインディング（value, checked, etc.）
 * - BindingNodeEvent*: イベントバインディング
 * - BindingNodeFor, BindingNodeIf: 構造制御バインディング
 *
 * 設計ポイント:
 * - assignValue, updateElementsは未実装（サブクラスでオーバーライド必須）
 * - isSelectElement, value, filteredValueなどはサブクラスで用途に応じて拡張
 * - フィルタやデコレータ、バインド内容の管理も柔軟に対応
 *
 * ---
 *
 * BindingNode class is the base class for binding processing on a single target node (Element, Text, etc.).
 *
 * Architecture:
 * - #binding: Reference to parent binding (IBinding)
 * - #node: Target DOM node for binding
 * - #name: Property name of binding (e.g., "textContent", "value")
 * - #filters: Array of filter functions applied when retrieving value
 * - #decorates: Array of decorator strings (e.g., ["prevent", "stop"])
 * - #bindContents: Array of child BindContent (for structural control bindings)
 *
 * Main responsibilities:
 * 1. Hold node, property name, filters, decorators, and binding info
 * 2. Provide interface for binding value update (applyChange → assignValue)
 * 3. Manage multiple bind contents (bindContents) for structural control bindings
 * 4. Extend binding processing per node/property type by implementing assignValue, updateElements in subclasses
 *
 * Design patterns:
 * - Template Method: applyChange provides common flow, assignValue implemented in subclasses
 * - Strategy: Customize behavior with filters and decorators
 *
 * Subclasses:
 * - BindingNodeAttribute: Attribute binding
 * - BindingNodeProperty*: Property binding (value, checked, etc.)
 * - BindingNodeEvent*: Event binding
 * - BindingNodeFor, BindingNodeIf: Structural control binding
 *
 * Design points:
 * - assignValue, updateElements are unimplemented (must override in subclasses)
 * - isSelectElement, value, filteredValue etc. extended in subclasses as needed
 * - Flexible handling of filters, decorators, and bind contents
 */
export class BindingNode {
    #binding;
    #node;
    #name;
    #filters;
    #decorates;
    #bindContents = [];
    /**
     * バインディング対象のDOMノードを返すgetter。
     * Getter to return target DOM node for binding.
     */
    get node() {
        return this.#node;
    }
    /**
     * バインディングのプロパティ名を返すgetter（例: "textContent", "value"）。
     * Getter to return property name of binding (e.g., "textContent", "value").
     */
    get name() {
        return this.#name;
    }
    /**
     * サブプロパティ名を返すgetter（基底クラスでは name と同じ、サブクラスでオーバーライド可能）。
     * Getter to return sub-property name (same as name in base class, can be overridden in subclasses).
     */
    get subName() {
        return this.#name;
    }
    /**
     * 親バインディング（IBinding）を返すgetter。
     * Getter to return parent binding (IBinding).
     */
    get binding() {
        return this.#binding;
    }
    /**
     * デコレータ文字列配列を返すgetter（例: ["prevent", "stop"]）。
     * Getter to return array of decorator strings (e.g., ["prevent", "stop"]).
     */
    get decorates() {
        return this.#decorates;
    }
    /**
     * フィルタ関数群を返すgetter。
     * Getter to return array of filter functions.
     */
    get filters() {
        return this.#filters;
    }
    /**
     * 子BindContent配列を返すgetter（構造制御バインディング用）。
     * Getter to return array of child BindContent (for structural control bindings).
     */
    get bindContents() {
        return this.#bindContents;
    }
    /**
     * コンストラクタ。
     * - binding: 親バインディング
     * - node: バインディング対象のDOMノード
     * - name: バインディングのプロパティ名
     * - filters: フィルタ関数群
     * - decorates: デコレータ文字列配列
     *
     * 初期化処理:
     * 1. 全パラメータをプライベートフィールドに保存
     * 2. bindContents は空配列で初期化
     * 3. サブクラスで activate() 時に追加の初期化処理を実装可能
     *
     * Constructor.
     * - binding: Parent binding
     * - node: Target DOM node for binding
     * - name: Property name of binding
     * - filters: Array of filter functions
     * - decorates: Array of decorator strings
     *
     * Initialization process:
     * 1. Save all parameters to private fields
     * 2. bindContents initialized as empty array
     * 3. Subclasses can implement additional initialization in activate()
     */
    constructor(binding, node, name, filters, decorates) {
        this.#binding = binding;
        this.#node = node;
        this.#name = name;
        this.#filters = filters;
        this.#decorates = decorates;
    }
    /**
     * 初期化メソッド（基底クラスでは空実装）。
     * サブクラスで初期化処理を実装可能。
     * 注意: 現在は activate() が推奨されており、このメソッドは非推奨。
     *
     * Initialization method (empty implementation in base class).
     * Subclasses can implement initialization processing.
     * Note: activate() is now recommended, this method is deprecated.
     */
    init() {
        // サブクラスで初期化処理を実装可能 / Subclasses can implement initialization
    }
    /**
     * 値をDOMに割り当てるメソッド（基底クラスでは未実装、サブクラスで必須オーバーライド）。
     * - 属性バインディング: 属性値を設定
     * - プロパティバインディング: プロパティ値を設定
     * - イベントバインディング: イベントリスナーを登録
     * - 構造制御バインディング: DOM構造を変更
     *
     * Method to assign value to DOM (unimplemented in base class, must override in subclasses).
     * - Attribute binding: Set attribute value
     * - Property binding: Set property value
     * - Event binding: Register event listener
     * - Structural control binding: Modify DOM structure
     *
     * @param value - DOMに割り当てる値 / Value to assign to DOM
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * 複数要素を一括更新するメソッド（基底クラスでは未実装、構造制御バインディングでオーバーライド）。
     * - BindingNodeFor: ループアイテムの一括更新
     * - その他のバインディング: 通常は使用しない
     *
     * Method to batch update multiple elements (unimplemented in base class, override in structural control bindings).
     * - BindingNodeFor: Batch update of loop items
     * - Other bindings: Normally not used
     *
     * @param listIndexes - リストインデックス配列 / Array of list indices
     * @param values - 値配列 / Array of values
     */
    updateElements(listIndexes, values) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.updateElements', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * 再描画通知メソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - 動的依存関係解決後に関連バインディングを更新する際に使用
     * - 構造制御バインディングで子BindContentへの通知に使用
     *
     * Redraw notification method (empty implementation in base class, can override in subclasses).
     * - Used to update related bindings after dynamic dependency resolution
     * - Used in structural control bindings to notify child BindContent
     *
     * @param refs - 再描画対象の状態参照配列 / Array of state references for redraw
     */
    notifyRedraw(refs) {
        // サブクラスで親子関係を考慮してバインディングの更新を通知する実装が可能
        // Subclasses can implement notification considering parent-child relationships
    }
    /**
     * 変更適用メソッド（Template Methodパターン）。
     * - BindingStateからフィルタ適用後の値を取得
     * - assignValue を呼び出してDOMに反映
     * - サブクラスは assignValue をオーバーライドして具体的な処理を実装
     *
     * Change application method (Template Method pattern).
     * - Retrieves filtered value from BindingState
     * - Calls assignValue to reflect to DOM
     * - Subclasses override assignValue to implement specific processing
     *
     * @param renderer - レンダラーインスタンス / Renderer instance
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        this.assignValue(filteredValue);
    }
    /**
     * バインディングノードを有効化するメソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - 初期レンダリング実行
     * - イベントリスナー登録（イベントバインディング）
     * - 子BindContentの初期化（構造制御バインディング）
     *
     * Method to activate binding node (empty implementation in base class, can override in subclasses).
     * - Execute initial rendering
     * - Register event listeners (event binding)
     * - Initialize child BindContent (structural control binding)
     */
    activate() {
        // サブクラスでバインディングノードの有効化処理を実装可能
        // Subclasses can implement activation processing
    }
    /**
     * バインディングノードを無効化するメソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - イベントリスナー解除（イベントバインディング）
     * - 子BindContentのクリーンアップ（構造制御バインディング）
     *
     * Method to inactivate binding node (empty implementation in base class, can override in subclasses).
     * - Unregister event listeners (event binding)
     * - Cleanup child BindContent (structural control binding)
     */
    inactivate() {
        // サブクラスでバインディングノードの無効化処理を実装可能
        // Subclasses can implement inactivation processing
    }
    /**
     * ノードがHTMLSelectElementかどうかを判定するgetter。
     * プロパティバインディングで select 要素の特殊処理に使用。
     *
     * Getter to determine if node is HTMLSelectElement.
     * Used for special handling of select elements in property binding.
     */
    get isSelectElement() {
        return this.node instanceof HTMLSelectElement;
    }
    /**
     * 現在の値を返すgetter（基底クラスでは null、サブクラスでオーバーライド）。
     * 双方向バインディングで現在のDOM値を取得する際に使用。
     *
     * Getter to return current value (null in base class, override in subclasses).
     * Used to get current DOM value in bidirectional binding.
     */
    get value() {
        return null;
    }
    /**
     * フィルタ適用後の値を返すgetter（基底クラスでは null、サブクラスでオーバーライド）。
     * 双方向バインディングでフィルタ適用後のDOM値を取得する際に使用。
     *
     * Getter to return filtered value (null in base class, override in subclasses).
     * Used to get filtered DOM value in bidirectional binding.
     */
    get filteredValue() {
        return null;
    }
}
