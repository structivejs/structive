import { getAbsoluteNodePath } from "./getAbsoluteNodePath.js";
import { getBindingNodeCreator } from "./getBindingNodeCreator.js";
import { getBindingStateCreator } from "./getBindingStateCreator.js";
import { getDataBindText } from "./getDataBindText.js";
import { getNodeType } from "./getNodeType.js";
import { parseBindText } from "./parseBindText.js";
import { removeDataBindAttribute } from "./removeDataBindAttribute.js";
import { replaceTextNodeFromComment } from "./replaceTextNodeFromComment.js";
import { IBindingCreator, IBindText, IDataBindAttributes, NodePath, NodeType } from "./types";

/**
 * DataBindAttributesクラスは、DOMノードからバインディング情報を抽出・解析し、
 * バインディング生成に必要な情報（ノード種別・パス・バインドテキスト・クリエイター）を管理します。
 *
 * 主な処理フロー:
 * 1. ノード種別の判定（HTMLElement/SVGElement/Text/Template）
 * 2. data-bind属性またはコメントからバインディング式を抽出
 * 3. コメントノードの場合、Textノードに置換（テンプレート前処理の復元）
 * 4. 処理済みdata-bind属性を削除（重複処理防止）
 * 5. ノードの絶対パスを計算（親からのインデックス配列）
 * 6. バインディング式をパースし構造化（プロパティ、フィルタ、デコレータ）
 * 7. 各バインドテキストに対応するファクトリ関数ペアを生成
 *    - createBindingNode: ランタイムBindingNodeインスタンス生成用
 *    - createBindingState: ランタイムBindingStateインスタンス生成用
 *
 * これにより、テンプレート内のバインディング定義を一元的に管理し、
 * 後続のバインディング構築処理を効率化します。
 *
 * DataBindAttributes class extracts and analyzes binding information from DOM nodes,
 * managing all necessary data (node type, path, bind texts, creators) for binding generation.
 *
 * Main processing flow:
 * 1. Determine node type (HTMLElement/SVGElement/Text/Template)
 * 2. Extract binding expression from data-bind attribute or comment
 * 3. Replace comment nodes with Text nodes (restore template preprocessing)
 * 4. Remove processed data-bind attributes (prevent duplicate processing)
 * 5. Calculate absolute node path (index array from parent)
 * 6. Parse binding expression into structured metadata (properties, filters, decorates)
 * 7. Generate factory function pairs for each bind text:
 *    - createBindingNode: Creates runtime BindingNode instance
 *    - createBindingState: Creates runtime BindingState instance
 *
 * This centralizes binding definition management in templates and streamlines
 * subsequent binding construction processes.
 */
class DataBindAttributes implements IDataBindAttributes {
  /** ノードの種別（HTMLElement/SVGElement/Text/Template） / Node type classification */
  nodeType     : NodeType;
  
  /** ノードの絶対パス（親からのインデックス配列） / Absolute path from template root (index array) */
  nodePath     : NodePath;
  
  /** パース済みバインディング式の配列 / Array of parsed binding expressions */
  bindTexts    : IBindText[];
  
  /** バインドテキストから対応するファクトリ関数ペアへのマップ / Map from bind text to factory function pairs */
  creatorByText: Map<IBindText, IBindingCreator> = new Map();

  constructor(node: Node) {
    // ステップ1: ノード種別を判定
    // Step 1: Determine node type
    this.nodeType = getNodeType(node);

    // ステップ2: data-bind属性またはコメントからバインディング式を抽出
    // Step 2: Extract binding expression from data-bind attribute or comment
    const text = getDataBindText(this.nodeType, node);

    // ステップ3: コメントノードの場合はTextノードに置換
    // （テンプレート前処理でTextノード→コメントに変換されたものを復元）
    // 注意: template.contentが直接書き換わる
    // Step 3: Replace comment nodes with Text nodes
    // (Restores Text nodes that were converted to comments during template preprocessing)
    // Note: Directly modifies template.content
    node = replaceTextNodeFromComment(node, this.nodeType);

    // ステップ4: data-bind属性を削除（パース完了後は不要、重複処理を防止）
    // Step 4: Remove data-bind attribute (no longer needed after parsing, prevents duplicate processing)
    removeDataBindAttribute(node, this.nodeType);

    // ステップ5: ノードの絶対パスを計算（親ノードからのインデックス配列）
    // Step 5: Calculate absolute node path (index array from parent nodes)
    this.nodePath = getAbsoluteNodePath(node);

    // ステップ6: バインディング式をパースし、構造化されたメタデータに変換
    // （nodeProperty, stateProperty, filters, decorates を含む IBindText 配列）
    // Step 6: Parse binding expression into structured metadata
    // (Array of IBindText containing nodeProperty, stateProperty, filters, decorates)
    this.bindTexts = parseBindText(text);

    // ステップ7: 各バインドテキストごとにランタイムインスタンス生成用のファクトリ関数ペアを作成
    // Step 7: Create factory function pairs for runtime instance generation for each bind text
    for(let i = 0; i < this.bindTexts.length; i++) {
      const bindText = this.bindTexts[i];
      
      // ファクトリ関数ペアを生成:
      // - createBindingNode: BindingNodeサブクラス（Attribute/Event/For/If等）のファクトリ
      // - createBindingState: BindingStateサブクラス（通常/Index/Component等）のファクトリ
      // Generate factory function pair:
      // - createBindingNode: Factory for BindingNode subclass (Attribute/Event/For/If, etc.)
      // - createBindingState: Factory for BindingState subclass (normal/Index/Component, etc.)
      const creator: IBindingCreator = {
        createBindingNode : getBindingNodeCreator(
          node, 
          bindText.nodeProperty,      // 例: "value", "textContent", "for", "if"
          bindText.inputFilterTexts,  // 入力フィルタ（状態→ノード方向）
          bindText.decorates          // デコレータ（"required", "trim" 等）
        ),
        createBindingState: getBindingStateCreator(
          bindText.stateProperty,      // 例: "user.name", "items", "isVisible"
          bindText.outputFilterTexts   // 出力フィルタ（ノード→状態方向）
        ),
      }
      
      // バインドテキストとファクトリ関数ペアを関連付けて保存
      // Associate bind text with factory function pair
      this.creatorByText.set(bindText, creator);
    }
  }

}

/**
 * 指定ノードからDataBindAttributesインスタンスを生成するファクトリ関数。
 * テンプレートコンパイル時に各data-bind対象ノードに対して呼び出されます。
 * 
 * Factory function that creates a DataBindAttributes instance from the specified node.
 * Called for each data-bind target node during template compilation.
 * 
 * @param node - バインディング情報を抽出するDOMノード / DOM node to extract binding information from
 * @returns バインディングメタデータを含むIDataBindAttributesオブジェクト / IDataBindAttributes object containing binding metadata
 */
export function createDataBindAttributes(node: Node): IDataBindAttributes {
  return new DataBindAttributes(node);
}