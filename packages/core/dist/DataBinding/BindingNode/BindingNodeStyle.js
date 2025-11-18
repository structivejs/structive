import { createFilters } from "../../BindingBuilder/createFilters.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeStyle クラスは、style 属性(インラインスタイル)のバインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、スタイル固有の処理を実装
 * - name から CSS プロパティ名(subName)を抽出し、style.setProperty で値を設定
 * - 単方向バインディング(状態 → DOM のみ)
 * - null/undefined/NaN は空文字列に変換
 *
 * 主な役割:
 * 1. name から CSS プロパティ名を抽出(例: "style.color" → "color")
 * 2. バインディング値を指定の CSS プロパティ(subName)として HTMLElement にセット
 * 3. null/undefined/NaN の場合は空文字列に変換してセット
 * 4. 値を文字列化して style.setProperty で反映
 *
 * 使用例:
 * - <div data-bind="style.color: textColor"> → textColor を div の color スタイルにバインド
 * - <div data-bind="style.backgroundColor: bgColor"> → bgColor を div の backgroundColor スタイルにバインド
 * - <div data-bind="style.fontSize: fontSize"> → fontSize を div の fontSize スタイルにバインド
 * - <div data-bind="style.display: isVisible"> → isVisible を div の display スタイルにバインド
 *
 * 設計ポイント:
 * - constructor で name を分割して CSS プロパティ名(subName)を抽出
 * - assignValue で null/undefined/NaN を空文字列に変換し、toString() で文字列化
 * - style.setProperty を使用することで、あらゆる CSS プロパティに対応
 * - 単方向バインディングのみ(DOM → 状態への更新はなし)
 * - CSS プロパティ名は kebab-case(例: "background-color")と camelCase(例: "backgroundColor")の両方に対応
 *
 * ---
 *
 * BindingNodeStyle class implements binding processing for style attribute (inline style).
 *
 * Architecture:
 * - Inherits BindingNode, implements style-specific processing
 * - Extracts CSS property name (subName) from name and sets value with style.setProperty
 * - One-way binding (state → DOM only)
 * - Converts null/undefined/NaN to empty string
 *
 * Main responsibilities:
 * 1. Extract CSS property name from name (e.g., "style.color" → "color")
 * 2. Set binding value as specified CSS property (subName) to HTMLElement
 * 3. Convert to empty string if null/undefined/NaN
 * 4. Stringify value and reflect with style.setProperty
 *
 * Usage examples:
 * - <div data-bind="style.color: textColor"> → Bind textColor to div's color style
 * - <div data-bind="style.backgroundColor: bgColor"> → Bind bgColor to div's backgroundColor style
 * - <div data-bind="style.fontSize: fontSize"> → Bind fontSize to div's fontSize style
 * - <div data-bind="style.display: isVisible"> → Bind isVisible to div's display style
 *
 * Design points:
 * - Split name in constructor to extract CSS property name (subName)
 * - Convert null/undefined/NaN to empty string in assignValue, stringify with toString()
 * - Using style.setProperty supports any CSS property
 * - One-way binding only (no DOM → state update)
 * - CSS property names support both kebab-case (e.g., "background-color") and camelCase (e.g., "backgroundColor")
 */
class BindingNodeStyle extends BindingNode {
    #subName;
    /**
     * CSS プロパティ名を返す getter。
     * name から抽出した CSS プロパティ名("style.color" の "color" 部分)。
     *
     * Getter to return CSS property name.
     * CSS property name extracted from name ("color" part of "style.color").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNode)を初期化
     * - name から CSS プロパティ名(subName)を抽出
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割(例: "style.color" → ["style", "color"])
     * 3. 分割結果の2番目の要素(インデックス1)を subName として保存
     *
     * 抽出例:
     * - "style.color" → subName = "color"
     * - "style.backgroundColor" → subName = "backgroundColor"
     * - "style.font-size" → subName = "font-size"
     *
     * 注意点:
     * - name は必ず "style.<propertyName>" の形式を想定
     * - "." が含まれない場合、subName は undefined になる可能性がある
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts CSS property name (subName) from name
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by "." (e.g., "style.color" → ["style", "color"])
     * 3. Save second element (index 1) of split result as subName
     *
     * Extraction examples:
     * - "style.color" → subName = "color"
     * - "style.backgroundColor" → subName = "backgroundColor"
     * - "style.font-size" → subName = "font-size"
     *
     * Notes:
     * - name is expected to be in "style.<propertyName>" format
     * - If "." is not included, subName may be undefined
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // name を分割して CSS プロパティ名を抽出("style.color" → "color")
        // Split name to extract CSS property name ("style.color" → "color")
        const [, subName] = this.name.split(".");
        this.#subName = subName;
    }
    /**
     * CSS プロパティに値を設定するメソッド。
     * null/undefined/NaN は空文字列に変換してから設定する。
     *
     * 処理フロー:
     * 1. 値が null, undefined, NaN のいずれかの場合、空文字列 "" に変換
     * 2. ノードを HTMLElement にキャスト
     * 3. 値を文字列化(toString())
     * 4. element.style.setProperty(subName, 文字列化した値)で CSS プロパティを設定
     *
     * 設定例:
     * - subName="color", value="red" → style.setProperty("color", "red") → style="color: red;"
     * - subName="backgroundColor", value="#fff" → style.setProperty("backgroundColor", "#fff") → style="background-color: #fff;"
     * - subName="font-size", value="16px" → style.setProperty("font-size", "16px") → style="font-size: 16px;"
     * - subName="display", value=null → style.setProperty("display", "") → style="display: ;"
     *
     * null/undefined/NaN の変換:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → "0" (変換なし)
     * - false → "false" (変換なし)
     *
     * 設計意図:
     * - null/undefined/NaN を空文字列に変換することで、スタイルをリセット
     * - toString() で値を文字列化し、あらゆる型の値に対応
     * - style.setProperty を使用することで、CSS プロパティ名の形式(kebab-case/camelCase)を問わず設定可能
     * - 空文字列を設定すると、該当の CSS プロパティが実質的に削除される(継承値やデフォルト値に戻る)
     *
     * Method to set value to CSS property.
     * Converts null/undefined/NaN to empty string before setting.
     *
     * Processing flow:
     * 1. Convert value to empty string "" if null, undefined, or NaN
     * 2. Cast node to HTMLElement
     * 3. Stringify value (toString())
     * 4. Set CSS property with element.style.setProperty(subName, stringified value)
     *
     * Setting examples:
     * - subName="color", value="red" → style.setProperty("color", "red") → style="color: red;"
     * - subName="backgroundColor", value="#fff" → style.setProperty("backgroundColor", "#fff") → style="background-color: #fff;"
     * - subName="font-size", value="16px" → style.setProperty("font-size", "16px") → style="font-size: 16px;"
     * - subName="display", value=null → style.setProperty("display", "") → style="display: ;"
     *
     * Converting null/undefined/NaN:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → "0" (no conversion)
     * - false → "false" (no conversion)
     *
     * Design intent:
     * - Convert null/undefined/NaN to empty string to reset style
     * - Stringify value with toString() to support any type of value
     * - Using style.setProperty enables setting regardless of CSS property name format (kebab-case/camelCase)
     * - Setting empty string effectively removes the CSS property (returns to inherited or default value)
     *
     * @param value - 設定する値 / Value to set
     */
    assignValue(value) {
        // ステップ1: null/undefined/NaN を空文字列に変換
        // Step 1: Convert null/undefined/NaN to empty string
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        // ステップ2-4: 値を文字列化して CSS プロパティに設定
        // Step 2-4: Stringify value and set to CSS property
        const element = this.node;
        element.style.setProperty(this.subName, value.toString());
    }
}
/**
 * style 属性バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "style.color")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(style では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeStyle を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeStyle インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate style attribute binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "style.color")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for style)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeStyle
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeStyle instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeStyle = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeStyle(binding, node, name, filterFns, decorates);
};
