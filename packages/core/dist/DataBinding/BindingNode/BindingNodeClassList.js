import { createFilters } from "../../BindingBuilder/createFilters.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeClassList クラスは、class 属性（classList）のバインディングを担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、classList 固有の処理を実装
 * - 配列値を空白区切りで結合して className プロパティに反映
 * - 単方向バインディング（状態 → DOM のみ）
 *
 * 主な役割:
 * 1. 配列形式のクラス名リストを受け取り、空白区切りの文字列に変換
 * 2. 変換した文字列を element.className に設定
 * 3. 配列以外の値が渡された場合はエラーを発生
 *
 * 使用例:
 * - <div data-bind="class: buttonClasses"> (buttonClasses=['btn', 'btn-primary']) → class="btn btn-primary"
 * - <div data-bind="class: activeClasses"> (activeClasses=['active', 'highlight']) → class="active highlight"
 * - <div data-bind="class: emptyClasses"> (emptyClasses=[]) → class=""
 *
 * 設計ポイント:
 * - assignValue で配列検証と文字列変換を実行
 * - join(" ") で配列を空白区切りの文字列に変換
 * - 配列以外の値（文字列、数値、オブジェクト等）はエラー
 * - 双方向バインディングは未対応（DOM → 状態への更新なし）
 *
 * ---
 *
 * BindingNodeClassList class implements binding for class attribute (classList).
 *
 * Architecture:
 * - Inherits BindingNode, implements classList-specific processing
 * - Converts array value to space-separated string and reflects to className property
 * - One-way binding (state → DOM only)
 *
 * Main responsibilities:
 * 1. Receive array of class names and convert to space-separated string
 * 2. Set converted string to element.className
 * 3. Raise error if non-array value is passed
 *
 * Usage examples:
 * - <div data-bind="class: buttonClasses"> (buttonClasses=['btn', 'btn-primary']) → class="btn btn-primary"
 * - <div data-bind="class: activeClasses"> (activeClasses=['active', 'highlight']) → class="active highlight"
 * - <div data-bind="class: emptyClasses"> (emptyClasses=[]) → class=""
 *
 * Design points:
 * - assignValue performs array validation and string conversion
 * - join(" ") converts array to space-separated string
 * - Non-array values (string, number, object, etc.) cause error
 * - Bidirectional binding not supported (no DOM → state update)
 *
 * @throws BIND-201 Value is not array: 配列以外が渡された場合 / When non-array value is passed
 */
class BindingNodeClassList extends BindingNode {
    /**
     * 配列値を空白区切りの文字列に変換し、className に設定するメソッド。
     *
     * 処理フロー:
     * 1. 値が配列であることを確認（配列でない場合はエラー）
     * 2. ノードを Element にキャスト
     * 3. 配列を空白区切りで結合（join(" ")）
     * 4. 結合した文字列を element.className に設定
     *
     * 変換例:
     * - ['btn', 'btn-primary'] → "btn btn-primary"
     * - ['active', 'highlight', 'selected'] → "active highlight selected"
     * - [] → "" (空文字列)
     * - ['single'] → "single"
     *
     * エラー条件:
     * - value が配列でない場合（文字列、数値、オブジェクト、null、undefined 等）
     *
     * 注意点:
     * - 配列要素は toString() で文字列化されるため、数値やオブジェクトも含められる
     * - undefined や null が配列に含まれる場合、"undefined" "null" という文字列になる
     * - 重複するクラス名もそのまま出力される（DOM が自動で重複除去）
     *
     * Method to convert array value to space-separated string and set to className.
     *
     * Processing flow:
     * 1. Verify value is array (error if not array)
     * 2. Cast node to Element
     * 3. Join array with spaces (join(" "))
     * 4. Set joined string to element.className
     *
     * Conversion examples:
     * - ['btn', 'btn-primary'] → "btn btn-primary"
     * - ['active', 'highlight', 'selected'] → "active highlight selected"
     * - [] → "" (empty string)
     * - ['single'] → "single"
     *
     * Error conditions:
     * - When value is not array (string, number, object, null, undefined, etc.)
     *
     * Notes:
     * - Array elements are stringified with toString(), so numbers and objects can be included
     * - If undefined or null in array, becomes "undefined" "null" string
     * - Duplicate class names are output as-is (DOM auto-deduplicates)
     *
     * @param value - 配列値（クラス名のリスト） / Array value (list of class names)
     */
    assignValue(value) {
        // ステップ1: 配列であることを確認
        // Step 1: Verify it's an array
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-4: 配列を空白区切りで結合し、className に設定
        // Step 2-4: Join array with spaces, set to className
        const element = this.node;
        element.className = value.join(" ");
    }
}
/**
 * classList 用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "class")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(classList では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeClassList を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeClassList インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate classList binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "class")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for classList)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeClassList
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeClassList instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeClassList = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeClassList(binding, node, name, filterFns, decorates);
};
