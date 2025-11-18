import { createFilters } from "../../BindingBuilder/createFilters.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
/**
 * BindingNodeIf クラスは、if バインディング(条件付き描画)を担当するノード実装です。
 *
 * アーキテクチャ:
 * - BindingNodeBlock を継承し、条件分岐による描画制御を実装
 * - boolean 値に応じて BindContent(描画内容)の mount/unmount を制御
 * - コメントノード(@@|<id> if)をマーカーとして使用し、その直後に内容を挿入
 * - 内部でテンプレート ID を使用して BindContent を生成
 *
 * 主な役割:
 * 1. boolean 値が true の場合、テンプレート内容を DOM に挿入(mount)
 * 2. boolean 値が false の場合、挿入した内容を DOM から削除(unmount)
 * 3. 現在表示中の BindContent 集合を bindContents で参照可能
 * 4. activate/inactivate でライフサイクルを管理
 * 5. applyChange で状態変更時の再描画を制御
 *
 * 使用例:
 * - {{ if:isVisible }}<div></div>{{ endif: }} → isVisible が true の時のみ表示
 * - {{ if:hasData }}<section></section>{{ endif: }} → hasData が true の時のみ表示
 * - {{ if:showMessage }}<p></p>{{ endif: }} → showMessage が true の時のみ表示
 *
 * 設計ポイント:
 * - #bindContent: コメントノード配下のテンプレート内容を管理
 * - #trueBindContents: true 時に表示する BindContent の配列([#bindContent])
 * - #falseBindContents: false 時に表示する BindContent の配列(空配列[])
 * - #bindContents: 現在表示中の BindContent を指すポインタ(true/false で切り替え)
 * - assignValue は未実装(applyChange で直接 mount/unmount を制御)
 * - applyChange で boolean 値を評価し、mount/unmount を実行
 * - inactivate で unmount して非表示状態にリセット
 *
 * ---
 *
 * BindingNodeIf class implements if binding (conditional rendering).
 *
 * Architecture:
 * - Inherits BindingNodeBlock, implements rendering control by conditional branching
 * - Controls BindContent (rendering content) mount/unmount according to boolean value
 * - Uses comment node (@@|<id> if) as marker, inserts content immediately after
 * - Generates BindContent using template ID internally
 *
 * Main responsibilities:
 * 1. If boolean value is true, insert template content into DOM (mount)
 * 2. If boolean value is false, remove inserted content from DOM (unmount)
 * 3. Currently displayed BindContent set accessible via bindContents
 * 4. Manage lifecycle with activate/inactivate
 * 5. Control re-rendering on state change with applyChange
 *
 * Usage examples:
 * - {{ if:isVisible }}<div></div>{{ endif: }} → Display only when isVisible is true
 * - {{ if:hasData }}<section></section>{{ endif: }} → Display only when hasData is true
 * - {{ if:showMessage }}<p></p>{{ endif: }} → Display only when showMessage is true
 *
 * Design points:
 * - #bindContent: Manages template content under comment node
 * - #trueBindContents: BindContent array to display when true ([#bindContent])
 * - #falseBindContents: BindContent array to display when false (empty array [])
 * - #bindContents: Pointer to currently displayed BindContent (switches between true/false)
 * - assignValue not implemented (directly control mount/unmount in applyChange)
 * - applyChange evaluates boolean value and executes mount/unmount
 * - inactivate unmounts and resets to hidden state
 *
 * @throws BIND-201 Not implemented: assignValue は未実装 / assignValue not implemented
 * @throws BIND-201 Value is not boolean: applyChange で値が boolean ではない / Value is not boolean in applyChange
 * @throws BIND-201 ParentNode is null: マウント先の親ノードが存在しない / Parent node for mounting doesn't exist
 * @throws TMP-001 Template not found: 内部で参照するテンプレート未登録 / Template referenced internally not registered
 */
class BindingNodeIf extends BindingNodeBlock {
    /**
     * コメントノード配下のテンプレート内容を管理する BindContent。
     * BindContent that manages template content under comment node.
     */
    #bindContent;
    /**
     * true 時に表示する BindContent の配列。
     * 常に [#bindContent] を指す。
     * BindContent array to display when true.
     * Always points to [#bindContent].
     */
    #trueBindContents;
    /**
     * false 時に表示する BindContent の配列。
     * 常に空配列 [] を指す。
     * BindContent array to display when false.
     * Always points to empty array [].
     */
    #falseBindContents = [];
    /**
     * 現在表示中の BindContent を指すポインタ。
     * true 時は #trueBindContents、false 時は #falseBindContents を指す。
     * Pointer to currently displayed BindContent.
     * Points to #trueBindContents when true, #falseBindContents when false.
     */
    #bindContents;
    /**
     * 現在表示中の BindContent の配列を返す getter。
     * true 時は [#bindContent]、false 時は [] を返す。
     *
     * Getter to return currently displayed BindContent array.
     * Returns [#bindContent] when true, [] when false.
     */
    get bindContents() {
        return this.#bindContents;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNodeBlock)を初期化
     * - テンプレート ID に対応する BindContent を生成
     * - true/false 時の BindContent 配列を初期化
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化(id を抽出)
     * 2. 空のパス情報と状態参照を生成(blankInfo, blankRef)
     * 3. createBindContent でテンプレート ID に対応する BindContent を生成
     * 4. #trueBindContents を [#bindContent] に設定
     * 5. #bindContents を #falseBindContents に設定(初期状態は false として扱う)
     *
     * 初期化される情報:
     * - #bindContent: テンプレート ID に対応する BindContent
     * - #trueBindContents: [#bindContent] (true 時に表示)
     * - #falseBindContents: [] (false 時は空)
     * - #bindContents: #falseBindContents (初期状態)
     *
     * 設計意図:
     * - コンストラクタでは BindContent の構造のみを準備し、実際の mount/unmount は applyChange で制御
     * - blankRef を使用することで、BindContent 自体は状態に依存しない形で初期化
     * - 初期状態を false として扱うことで、最初の applyChange で適切に mount/unmount される
     *
     * Constructor.
     * - Initializes parent class (BindingNodeBlock)
     * - Generates BindContent corresponding to template ID
     * - Initializes BindContent arrays for true/false
     *
     * Processing flow:
     * 1. Initialize parent class with super() (extract id)
     * 2. Generate empty path info and state reference (blankInfo, blankRef)
     * 3. Generate BindContent corresponding to template ID with createBindContent
     * 4. Set #trueBindContents to [#bindContent]
     * 5. Set #bindContents to #falseBindContents (initial state treated as false)
     *
     * Initialized information:
     * - #bindContent: BindContent corresponding to template ID
     * - #trueBindContents: [#bindContent] (display when true)
     * - #falseBindContents: [] (empty when false)
     * - #bindContents: #falseBindContents (initial state)
     *
     * Design intent:
     * - Constructor only prepares BindContent structure, actual mount/unmount controlled in applyChange
     * - Using blankRef initializes BindContent in form independent of state
     * - Treating initial state as false ensures proper mount/unmount on first applyChange
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // 空のパス情報と状態参照を生成
        // Generate empty path info and state reference
        const blankInfo = getStructuredPathInfo("");
        const blankRef = getStatePropertyRef(blankInfo, null);
        // テンプレート ID に対応する BindContent を生成
        // Generate BindContent corresponding to template ID
        this.#bindContent = createBindContent(this.binding, this.id, this.binding.engine, blankRef);
        // true 時の BindContent を設定
        // Set BindContent for true
        this.#trueBindContents = [this.#bindContent];
        // 初期状態は false として扱う
        // Treat initial state as false
        this.#bindContents = this.#falseBindContents;
    }
    /**
     * 値の直接代入は未実装。
     * if バインディングでは applyChange で直接 mount/unmount を制御するため、assignValue は使用しない。
     *
     * 設計意図:
     * - if バインディングは boolean 値の評価と mount/unmount がセットで必要
     * - assignValue では mount/unmount の制御ができないため、未実装としている
     * - applyChange で一括して処理することで、整合性を保つ
     *
     * Direct value assignment not implemented.
     * If binding doesn't use assignValue as applyChange directly controls mount/unmount.
     *
     * Design intent:
     * - If binding requires boolean value evaluation and mount/unmount as a set
     * - assignValue cannot control mount/unmount, so left unimplemented
     * - Processing together in applyChange maintains consistency
     *
     * @throws BIND-201 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-201',
            message: 'Not implemented',
            context: { where: 'BindingNodeIf.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
    }
    /**
     * 値を評価して true なら mount+applyChange、false なら unmount。
     * 状態変更時の条件付き描画を制御するメソッド。
     *
     * 処理フロー:
     * 1. bindingState.getFilteredValue でフィルタ適用後の値を取得
     * 2. 値が boolean でない場合はエラー(BIND-201)
     * 3. parentNode(マウント先)が null の場合はエラー(BIND-201)
     * 4. 値が true の場合:
     *    a. #bindContent.activate() でバインディングをアクティブ化
     *    b. #bindContent.mountAfter() でコメントノード直後に内容を挿入
     *    c. #bindContent.applyChange() で内部のバインディングを更新
     *    d. #bindContents を #trueBindContents に切り替え
     * 5. 値が false の場合:
     *    a. #bindContent.unmount() で DOM から内容を削除
     *    b. #bindContent.inactivate() でバインディングを非アクティブ化
     *    c. #bindContents を #falseBindContents に切り替え
     *
     * 動作例:
     * - isVisible: false → true: unmount 状態から mount して表示
     * - isVisible: true → false: mount 状態から unmount して非表示
     * - isVisible: true → true: 既に mount 済みなので applyChange のみ実行
     *
     * エラー条件:
     * - 値が boolean 以外の型(string, number, object, null, undefined 等)
     * - parentNode が null(コメントノードが DOM から削除された等)
     *
     * 設計意図:
     * - true/false の切り替えごとに activate/inactivate でライフサイクルを管理
     * - mount/unmount で DOM への挿入/削除を制御し、パフォーマンスを最適化
     * - applyChange を再帰的に呼び出し、内部のバインディングも更新
     * - #bindContents を切り替えることで、外部から現在の状態を参照可能
     *
     * Evaluates value and mount+applyChange if true, unmount if false.
     * Method to control conditional rendering on state change.
     *
     * Processing flow:
     * 1. Get filtered value with bindingState.getFilteredValue
     * 2. Error (BIND-201) if value is not boolean
     * 3. Error (BIND-201) if parentNode (mount target) is null
     * 4. If value is true:
     *    a. Activate binding with #bindContent.activate()
     *    b. Insert content immediately after comment node with #bindContent.mountAfter()
     *    c. Update internal bindings with #bindContent.applyChange()
     *    d. Switch #bindContents to #trueBindContents
     * 5. If value is false:
     *    a. Remove content from DOM with #bindContent.unmount()
     *    b. Deactivate binding with #bindContent.inactivate()
     *    c. Switch #bindContents to #falseBindContents
     *
     * Behavior examples:
     * - isVisible: false → true: Mount and display from unmount state
     * - isVisible: true → false: Unmount and hide from mount state
     * - isVisible: true → true: Already mounted, only execute applyChange
     *
     * Error conditions:
     * - Value is non-boolean type (string, number, object, null, undefined, etc.)
     * - parentNode is null (comment node removed from DOM, etc.)
     *
     * Design intent:
     * - Manage lifecycle with activate/inactivate on every true/false switch
     * - Control DOM insertion/removal with mount/unmount to optimize performance
     * - Recursively call applyChange to update internal bindings
     * - Switching #bindContents makes current state accessible from outside
     *
     * @param renderer - レンダラー(状態とハンドラを含む) / Renderer (contains state and handler)
     * @throws BIND-201 Value is not boolean
     * @throws BIND-201 ParentNode is null
     */
    applyChange(renderer) {
        // フィルタ適用後の値を取得
        // Get filtered value
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        // boolean 型チェック
        // Boolean type check
        if (typeof filteredValue !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeIf.applyChange', valueType: typeof filteredValue },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // 親ノード存在チェック
        // Parent node existence check
        const parentNode = this.node.parentNode;
        if (parentNode == null) {
            raiseError({
                code: 'BIND-201',
                message: 'ParentNode is null',
                context: { where: 'BindingNodeIf.applyChange', nodeType: this.node.nodeType },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // true の場合: activate + mount + applyChange
        // If true: activate + mount + applyChange
        if (filteredValue) {
            this.#bindContent.activate();
            this.#bindContent.mountAfter(parentNode, this.node);
            this.#bindContent.applyChange(renderer);
            this.#bindContents = this.#trueBindContents;
        }
        // false の場合: unmount + inactivate
        // If false: unmount + inactivate
        else {
            this.#bindContent.unmount();
            this.#bindContent.inactivate();
            this.#bindContents = this.#falseBindContents;
        }
    }
    /**
     * バインディングを非アクティブ化し、内容を非表示状態にリセット。
     * コンポーネントが DOM から削除される際などに呼び出される。
     *
     * 処理:
     * 1. #bindContent.unmount() で DOM から内容を削除
     * 2. #bindContent.inactivate() でバインディングを非アクティブ化
     * 3. #bindContents を #falseBindContents に切り替え(非表示状態)
     *
     * 設計意図:
     * - DOM から削除される際のクリーンアップ処理
     * - メモリリークを防ぐため、バインディングを適切に解放
     * - 非表示状態にリセットすることで、次回の activate 時に正しく動作
     *
     * Deactivates binding and resets content to hidden state.
     * Called when component is removed from DOM, etc.
     *
     * Processing:
     * 1. Remove content from DOM with #bindContent.unmount()
     * 2. Deactivate binding with #bindContent.inactivate()
     * 3. Switch #bindContents to #falseBindContents (hidden state)
     *
     * Design intent:
     * - Cleanup processing when removed from DOM
     * - Properly release binding to prevent memory leaks
     * - Resetting to hidden state ensures correct operation on next activate
     */
    inactivate() {
        this.#bindContent.unmount();
        this.#bindContent.inactivate();
        this.#bindContents = this.#falseBindContents;
    }
}
/**
 * if バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "if")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(if では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeIf を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeIf インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate if binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "if")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for if)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeIf
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeIf instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeIf = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeIf(binding, node, name, filterFns, decorates);
};
