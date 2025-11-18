import { createBindingState } from "../DataBinding/BindingState/BindingState.js";
import { createBindingStateIndex } from "../DataBinding/BindingState/BindingStateIndex.js";
/**
 * ループコンテキスト内のインデックス参照を判定するための正規表現
 * パターン: "$" + 数字（例: "$1", "$2", "$3"）
 *
 * 階層構造（1始まり、外側から内側へ）:
 * - "$1": 最も外側のループのインデックス
 * - "$2": 1つ内側のループのインデックス
 * - "$3": さらに内側のループのインデックス
 *
 * 使用例（ネストしたループ）:
 * ```
 * <ul data-bind="for:categories">              ← $1
 *   <li>
 *     <ul data-bind="for:categories.*.items">  ← $2 (親リストの要素が子リストを持つ)
 *       <li data-bind="text:$1">...            ← categoriesのインデックス
 *       <li data-bind="text:$2">...            ← itemsのインデックス
 *     </ul>
 *   </li>
 * </ul>
 * ```
 *
 * 注: ネストしたループでは、子リストは必ず親リストの要素のプロパティとして定義される
 * （例: categories.*.items は categories[i].items を意味する）
 *
 * Regular expression to identify index references within loop context
 * Pattern: "$" + digit (e.g., "$1", "$2", "$3")
 *
 * Hierarchy structure (1-based, from outer to inner):
 * - "$1": Index of outermost loop
 * - "$2": Index of one level inner loop
 * - "$3": Index of further inner loop
 *
 * Usage example (nested loops):
 * ```
 * <ul data-bind="for:categories">              ← $1
 *   <li>
 *     <ul data-bind="for:categories.*.items">  ← $2 (child list is property of parent list element)
 *       <li data-bind="text:$1">...            ← categories index
 *       <li data-bind="text:$2">...            ← items index
 *     </ul>
 *   </li>
 * </ul>
 * ```
 *
 * Note: In nested loops, child list must be defined as property of parent list element
 * (e.g., categories.*.items means categories[i].items)
 */
const ereg = new RegExp(/^\$\d+$/);
/**
 * バインディング対象の状態プロパティ名とフィルタ情報から、
 * 適切なバインディング状態生成関数（CreateBindingStateByStateFn）を返すファクトリ関数。
 *
 * 判定ロジック:
 * 1. プロパティ名が "$数字" 形式か正規表現でチェック
 *    - マッチした場合: createBindingStateIndex を使用
 *      ループインデックスバインディング（例: for文内の $1, $2）
 *    - マッチしない場合: createBindingState を使用
 *      通常の状態プロパティバインディング（例: user.name）
 *
 * 2. フィルタ情報を渡して生成関数を実行
 *
 * 3. 実際のバインディング状態インスタンスを生成する関数を返す
 *
 * 使用例:
 * ```typescript
 * // 通常のプロパティバインディング
 * const creator1 = getBindingStateCreator('user.name', []);
 * // creator1は通常のBindingStateを生成
 *
 * // 最も外側のループインデックスバインディング
 * const creator2 = getBindingStateCreator('$1', []);
 * // creator2はBindingStateIndexを生成（最も外側のループのインデックス値にアクセス）
 *
 * // ネストしたループの内側のインデックス
 * const creator3 = getBindingStateCreator('$2', []);
 * // creator3は1つ内側のループのインデックスにアクセス
 * ```
 *
 * Factory function that returns the appropriate binding state creator function
 * (CreateBindingStateByStateFn) from target state property name and filter information.
 *
 * Decision logic:
 * 1. Check if property name matches "$digit" pattern with regex
 *    - If matches: Use createBindingStateIndex
 *      Loop index binding (e.g., $1, $2 inside for statement)
 *    - If not matches: Use createBindingState
 *      Normal state property binding (e.g., user.name)
 *
 * 2. Execute creator function with filter information
 *
 * 3. Return function that creates actual binding state instance
 *
 * Usage examples:
 * ```typescript
 * // Normal property binding
 * const creator1 = getBindingStateCreator('user.name', []);
 * // creator1 generates normal BindingState
 *
 * // Outermost loop index binding
 * const creator2 = getBindingStateCreator('$1', []);
 * // creator2 generates BindingStateIndex (accesses outermost loop index value)
 *
 * // Inner loop index in nested loops
 * const creator3 = getBindingStateCreator('$2', []);
 * // creator3 accesses index of one level inner loop
 * ```
 *
 * @param name - バインディング対象の状態プロパティ名（例: "user.name", "$1", "$2"） / Target state property name (e.g., "user.name", "$1", "$2")
 * @param filterTexts - 出力フィルタのメタデータ配列（ノード→状態方向） / Array of output filter metadata (node→state direction)
 * @returns 実際のバインディング状態インスタンスを生成する関数 / Function that creates actual binding state instance
 */
export function getBindingStateCreator(name, filterTexts) {
    // プロパティ名が "$数字" 形式かチェック
    // Check if property name matches "$digit" pattern
    if (ereg.test(name)) {
        // ループインデックスバインディング用の生成関数を返す
        // "$1" → 最も外側のループインデックス（1始まり）
        // "$2" → 1つ内側のループインデックス
        // "$3" → さらに内側のループインデックス
        // ...以降も同様に内側へ進む
        // Return creator function for loop index binding
        // "$1" → Outermost loop index (1-based)
        // "$2" → One level inner loop index
        // "$3" → Further inner loop index
        // ...and so on, proceeding inward
        return createBindingStateIndex(name, filterTexts);
    }
    else {
        // 通常のプロパティ名の場合は標準のバインディング状態生成関数を返す
        // 例: "user.name", "items", "isVisible"
        // Return standard binding state creator function for normal property names
        // Examples: "user.name", "items", "isVisible"
        return createBindingState(name, filterTexts);
    }
}
