import { createFilters } from "../../BindingBuilder/createFilters.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeClassName クラスは、個別クラス名のトグル制御を担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、特定のクラス名の追加/削除を実装
 * - name から subName（実際のクラス名）を抽出
 * - boolean 値に基づいて classList.toggle で制御
 *
 * 主な役割:
 * 1. name から「class.」以降のクラス名を抽出（例: "class.active" → "active"）
 * 2. boolean 値が true のときクラスを追加、false のとき削除
 * 3. classList.toggle API を使用した効率的な制御
 * 4. boolean 以外の値が渡された場合はエラーを発生
 *
 * 使用例:
 * - <div data-bind="class.active: isActive"> (isActive=true) → class="active" を追加
 * - <div data-bind="class.highlight: isHighlighted"> (isHighlighted=false) → class="highlight" を削除
 * - <div data-bind="class.btn-primary: isPrimary"> (isPrimary=true) → class="btn-primary" を追加
 *
 * 設計ポイント:
 * - subName はコンストラクタで一度だけ抽出し、プライベートフィールドに保存
 * - assignValue で boolean 検証と classList.toggle を実行
 * - classList.toggle(className, force) の第2引数で明示的に追加/削除を制御
 * - 単一のクラス名のみを制御（複数クラスの場合は BindingNodeClassList を使用）
 *
 * ---
 *
 * BindingNodeClassName class implements toggle control for individual class names.
 *
 * Architecture:
 * - Inherits BindingNode, implements add/remove of specific class name
 * - Extracts subName (actual class name) from name
 * - Controls with classList.toggle based on boolean value
 *
 * Main responsibilities:
 * 1. Extract class name after "class." from name (e.g., "class.active" → "active")
 * 2. Add class when boolean value is true, remove when false
 * 3. Efficient control using classList.toggle API
 * 4. Raise error if non-boolean value is passed
 *
 * Usage examples:
 * - <div data-bind="class.active: isActive"> (isActive=true) → Adds class="active"
 * - <div data-bind="class.highlight: isHighlighted"> (isHighlighted=false) → Removes class="highlight"
 * - <div data-bind="class.btn-primary: isPrimary"> (isPrimary=true) → Adds class="btn-primary"
 *
 * Design points:
 * - subName is extracted once in constructor and stored in private field
 * - assignValue performs boolean validation and classList.toggle
 * - Second argument of classList.toggle(className, force) explicitly controls add/remove
 * - Controls only single class name (use BindingNodeClassList for multiple classes)
 *
 * @throws BIND-201 Value is not boolean: boolean 以外が渡された場合 / When non-boolean value is passed
 */
class BindingNodeClassName extends BindingNode {
    #subName;
    /**
     * 制御対象のクラス名を返す getter。
     * name から抽出されたクラス名（"class.active" の "active" 部分）。
     *
     * Getter to return target class name.
     * Class name extracted from name ("active" part of "class.active").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - name からクラス名（subName）を抽出
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割（例: "class.active" → ["class", "active"]）
     * 3. 分割結果の2番目の要素（インデックス1）を subName として保存
     *
     * 抽出例:
     * - "class.active" → subName = "active"
     * - "class.btn-primary" → subName = "btn-primary"
     * - "class.is-visible" → subName = "is-visible"
     *
     * 注意点:
     * - name は必ず "class.<className>" の形式を想定
     * - "." が含まれない場合、subName は undefined になる可能性がある
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts class name (subName) from name
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by "." (e.g., "class.active" → ["class", "active"])
     * 3. Save second element (index 1) of split result as subName
     *
     * Extraction examples:
     * - "class.active" → subName = "active"
     * - "class.btn-primary" → subName = "btn-primary"
     * - "class.is-visible" → subName = "is-visible"
     *
     * Notes:
     * - name is expected to be in "class.<className>" format
     * - If "." is not included, subName may be undefined
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // name を分割してクラス名を抽出（"class.active" → "active"）
        // Split name to extract class name ("class.active" → "active")
        const [, subName] = this.name.split(".");
        this.#subName = subName;
    }
    /**
     * boolean 値に基づいてクラス名を追加/削除するメソッド。
     *
     * 処理フロー:
     * 1. 値が boolean 型であることを確認（boolean でない場合はエラー）
     * 2. ノードを Element にキャスト
     * 3. classList.toggle(subName, value) でクラスを追加/削除
     *
     * classList.toggle の動作:
     * - toggle(className, true) → クラスを追加（既に存在する場合は何もしない）
     * - toggle(className, false) → クラスを削除（存在しない場合は何もしない）
     *
     * 実行例:
     * - value=true, subName="active" → element.classList に "active" を追加
     * - value=false, subName="active" → element.classList から "active" を削除
     * - value=true, subName="btn-primary" → element.classList に "btn-primary" を追加
     *
     * エラー条件:
     * - value が boolean 以外の型（string, number, object, null, undefined 等）
     *
     * 利点:
     * - classList.toggle の第2引数（force）を使用することで、条件分岐なしで制御可能
     * - ブラウザネイティブ API のため、パフォーマンスが高い
     * - 冪等性が保証される（同じ操作を複数回実行しても安全）
     *
     * Method to add/remove class name based on boolean value.
     *
     * Processing flow:
     * 1. Verify value is boolean type (error if not boolean)
     * 2. Cast node to Element
     * 3. Add/remove class with classList.toggle(subName, value)
     *
     * classList.toggle behavior:
     * - toggle(className, true) → Adds class (no action if already exists)
     * - toggle(className, false) → Removes class (no action if doesn't exist)
     *
     * Execution examples:
     * - value=true, subName="active" → Adds "active" to element.classList
     * - value=false, subName="active" → Removes "active" from element.classList
     * - value=true, subName="btn-primary" → Adds "btn-primary" to element.classList
     *
     * Error conditions:
     * - When value is non-boolean type (string, number, object, null, undefined, etc.)
     *
     * Advantages:
     * - Using second argument (force) of classList.toggle enables control without conditional branching
     * - High performance as browser native API
     * - Idempotency guaranteed (safe to execute same operation multiple times)
     *
     * @param value - boolean 値（true でクラス追加、false でクラス削除）/ Boolean value (add class on true, remove on false)
     */
    assignValue(value) {
        // ステップ1: boolean 型であることを確認
        // Step 1: Verify it's boolean type
        if (typeof value !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeClassName.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-3: classList.toggle でクラスを追加/削除
        // Step 2-3: Add/remove class with classList.toggle
        const element = this.node;
        element.classList.toggle(this.subName, value);
    }
}
/**
 * class 名バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "class.active"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（className では通常未使用）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeClassName を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeClassName インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate class name binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "class.active")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for className)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeClassName
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeClassName instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeClassName = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeClassName(binding, node, name, filterFns, decorates);
};
