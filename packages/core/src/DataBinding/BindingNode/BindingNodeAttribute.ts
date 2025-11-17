import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeAttribute クラスは、属性バインディング（例: attr.src, attr.alt など）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、属性バインディング固有の処理を実装
 * - #subName: name から抽出した属性名（例: "attr.src" → "src"）
 *
 * 主な役割:
 * 1. ノード属性名（subName）を抽出し、値を属性としてElementにセット
 * 2. null/undefined/NaN の場合は空文字列に変換してセット
 * 3. フィルタやデコレータにも対応
 * 4. 値を常に文字列に変換して setAttribute で設定
 *
 * 使用例:
 * - <img :attr.src="imageUrl"> → <img src="https://example.com/image.png">
 * - <a :attr.href="linkUrl"> → <a href="/about">
 * - <div :attr.data-id="itemId"> → <div data-id="123">
 *
 * 設計ポイント:
 * - name から属性名（subName）を抽出（例: "attr.src" → "src"）
 * - assignValue で属性値を常に文字列として設定
 * - null/undefined/NaN は空文字列に変換（HTML仕様に準拠）
 * - createBindingNodeAttribute ファクトリでフィルタ適用済みインスタンスを生成
 *
 * ---
 *
 * BindingNodeAttribute class implements binding node for attribute bindings (e.g., attr.src, attr.alt).
 *
 * Architecture:
 * - Inherits BindingNode, implements attribute binding-specific processing
 * - #subName: Attribute name extracted from name (e.g., "attr.src" → "src")
 *
 * Main responsibilities:
 * 1. Extract node attribute name (subName), set value as element attribute
 * 2. Convert null/undefined/NaN to empty string
 * 3. Support filters and decorators
 * 4. Always convert value to string and set with setAttribute
 *
 * Usage examples:
 * - <img :attr.src="imageUrl"> → <img src="https://example.com/image.png">
 * - <a :attr.href="linkUrl"> → <a href="/about">
 * - <div :attr.data-id="itemId"> → <div data-id="123">
 *
 * Design points:
 * - Extract attribute name (subName) from name (e.g., "attr.src" → "src")
 * - Always set attribute value as string in assignValue
 * - Convert null/undefined/NaN to empty string (conforms to HTML spec)
 * - createBindingNodeAttribute factory generates filter-applied instance
 */
class BindingNodeAttribute extends BindingNode {
  #subName: string;
  
  /**
   * 属性名を返す getter。
   * 例: "attr.src" から "src" を返す。
   *
   * Getter to return attribute name.
   * Example: Returns "src" from "attr.src".
   */
  get subName():string {
    return this.#subName;
  }
  
  /**
   * コンストラクタ。
   * - name から属性名（subName）を抽出（"attr." の後の部分）
   * - 親クラス（BindingNode）を初期化
   *
   * 処理フロー:
   * 1. super() で親クラスを初期化
   * 2. name を "." で分割し、2番目の要素を subName として保存
   *    例: "attr.src" → ["attr", "src"] → subName = "src"
   *
   * Constructor.
   * - Extracts attribute name (subName) from name (part after "attr.")
   * - Initializes parent class (BindingNode)
   *
   * Processing flow:
   * 1. Initialize parent class with super()
   * 2. Split name by ".", save second element as subName
   *    Example: "attr.src" → ["attr", "src"] → subName = "src"
   */
  constructor(
    binding   : IBinding, 
    node      : Node, 
    name      : string,
    filters   : Filters,
    decorates : string[]
  ) {
    super(binding, node, name, filters, decorates);
    const [, subName] = this.name.split(".");
    this.#subName = subName;
  }
  
  /**
   * 属性値を DOM に割り当てるメソッド。
   *
   * 処理フロー:
   * 1. null/undefined/NaN の場合は空文字列に変換
   *    - HTML仕様に準拠（属性値は常に文字列）
   *    - これにより、属性が完全に削除されず、空文字列として保持される
   * 2. ノードを Element としてキャスト
   * 3. setAttribute で subName に値を文字列として設定
   *    - value.toString() で明示的に文字列変換
   *
   * 設計意図:
   * - HTML属性は常に文字列として扱われる
   * - null等の特殊値を空文字列に統一することで、一貫性を保つ
   * - setAttribute を使用することで、標準DOM APIに準拠
   *
   * Method to assign attribute value to DOM.
   *
   * Processing flow:
   * 1. Convert null/undefined/NaN to empty string
   *    - Conforms to HTML spec (attribute values are always strings)
   *    - This keeps attribute instead of removing it completely
   * 2. Cast node as Element
   * 3. Set value as string to subName with setAttribute
   *    - Explicitly convert to string with value.toString()
   *
   * Design intent:
   * - HTML attributes are always treated as strings
   * - Unify special values like null to empty string for consistency
   * - Conform to standard DOM API by using setAttribute
   *
   * @param value - 属性に割り当てる値 / Value to assign to attribute
   */
  assignValue(value:any) {
    // ステップ1: null/undefined/NaN を空文字列に変換
    // Step 1: Convert null/undefined/NaN to empty string
    if (value === null || value === undefined || Number.isNaN(value)) {
      value = "";
    }
    // ステップ2-3: 属性値を文字列として設定
    // Step 2-3: Set attribute value as string
    const element = this.node as Element;
    element.setAttribute(this.subName, value.toString());
  }
}

/**
 * 属性バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "attr.src"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeAttribute を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeAttribute インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate attribute binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "attr.src")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeAttribute
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeAttribute instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeAttribute: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      // フィルタ関数群を生成
      // Generate filter functions
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeAttribute(binding, node, name, filterFns, decorates);
    }
