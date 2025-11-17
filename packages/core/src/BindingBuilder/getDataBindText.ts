import { COMMENT_EMBED_MARK, COMMENT_TEMPLATE_MARK, DATA_BIND_ATTRIBUTE } from "../constants.js";
import { getTemplateById } from "../Template/registerTemplate.js";
import { raiseError } from "../utils.js";
import { NodeType } from "./types";

/**
 * コメントマークの長さをキャッシュ（パフォーマンス最適化）
 * Cache comment mark lengths (performance optimization)
 */
const COMMENT_EMBED_MARK_LEN = COMMENT_EMBED_MARK.length;
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;

/**
 * ノード種別ごとにdata-bindテキスト（バインディング定義文字列）を取得するユーティリティ関数。
 * テンプレート前処理でマスタッシュ構文やコメントバインディングがどのように変換されたかに応じて、
 * 適切な方法でバインディング式を抽出します。
 *
 * ノード種別ごとの処理:
 * 1. Text: コメントから復元されたテキストノード
 *    - COMMENT_EMBED_MARK（例: "@@:"）以降のテキストを取得
 *    - "textContent:"プレフィックスを付与してバインディング式化
 *    - 例: "@@:user.name" → "textContent:user.name"
 * 
 * 2. HTMLElement: 通常のHTML要素
 *    - data-bind属性の値をそのまま取得
 *    - 例: <div data-bind="class:active"> → "class:active"
 * 
 * 3. Template: テンプレート参照用コメント
 *    - COMMENT_TEMPLATE_MARK（例: "@@|"）以降のテンプレートIDを抽出
 *    - IDからテンプレートを取得し、そのdata-bind属性値を返す
 *    - 例: "@@|123 if:isVisible" → テンプレート123のdata-bind属性
 * 
 * 4. SVGElement: SVG要素
 *    - data-bind属性の値をそのまま取得（HTML要素と同様）
 * 
 * 使用例:
 * ```typescript
 * // テキストノード（マスタッシュ構文から変換）
 * const text = document.createTextNode("@@:user.name");
 * getDataBindText("Text", text); // → "textContent:user.name"
 * 
 * // HTML要素
 * const div = document.createElement("div");
 * div.setAttribute("data-bind", "class:active");
 * getDataBindText("HTMLElement", div); // → "class:active"
 * 
 * // テンプレート参照コメント
 * const comment = document.createComment("@@|123 if:isVisible");
 * getDataBindText("Template", comment); // → テンプレート123のdata-bind値
 * ```
 * 
 * Utility function that retrieves data-bind text (binding definition string) for each node type.
 * Extracts binding expressions appropriately based on how mustache syntax or comment bindings
 * were transformed during template preprocessing.
 *
 * Processing by node type:
 * 1. Text: Text node restored from comment
 *    - Get text after COMMENT_EMBED_MARK (e.g., "@@:")
 *    - Add "textContent:" prefix to create binding expression
 *    - Example: "@@:user.name" → "textContent:user.name"
 * 
 * 2. HTMLElement: Regular HTML element
 *    - Get data-bind attribute value as-is
 *    - Example: <div data-bind="class:active"> → "class:active"
 * 
 * 3. Template: Template reference comment
 *    - Extract template ID after COMMENT_TEMPLATE_MARK (e.g., "@@|")
 *    - Get template by ID and return its data-bind attribute value
 *    - Example: "@@|123 if:isVisible" → data-bind attribute of template 123
 * 
 * 4. SVGElement: SVG element
 *    - Get data-bind attribute value as-is (same as HTML element)
 * 
 * Usage examples:
 * ```typescript
 * // Text node (converted from mustache syntax)
 * const text = document.createTextNode("@@:user.name");
 * getDataBindText("Text", text); // → "textContent:user.name"
 * 
 * // HTML element
 * const div = document.createElement("div");
 * div.setAttribute("data-bind", "class:active");
 * getDataBindText("HTMLElement", div); // → "class:active"
 * 
 * // Template reference comment
 * const comment = document.createComment("@@|123 if:isVisible");
 * getDataBindText("Template", comment); // → data-bind value of template 123
 * ```
 * 
 * @param nodeType - ノード種別（"Text" | "HTMLElement" | "Template" | "SVGElement"） / Node type
 * @param node - 対象ノード / Target node
 * @returns バインディング定義文字列（空文字列の可能性あり） / Binding definition string (may be empty string)
 */
export function getDataBindText(nodeType: NodeType, node: Node): string {
  switch (nodeType) {
    case "Text": {
      // ケース1: Textノード（マスタッシュ構文から変換されたもの）
      // コメントマーク（例: "@@:"）以降のテキストを取得してtrim
      // "textContent:"プレフィックスを付与してバインディング式化
      // Case 1: Text node (converted from mustache syntax)
      // Get text after comment mark (e.g., "@@:") and trim
      // Add "textContent:" prefix to create binding expression
      const text = node.textContent?.slice(COMMENT_EMBED_MARK_LEN).trim() ?? "";
      return "textContent:" + text;
    }
    case "HTMLElement": {
      // ケース2: HTMLElement（通常のHTML要素）
      // data-bind属性の値をそのまま返す
      // 属性が存在しない場合は空文字列
      // Case 2: HTMLElement (regular HTML element)
      // Return data-bind attribute value as-is
      // Return empty string if attribute doesn't exist
      return (node as HTMLElement).getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
    }
    case "Template": {
      // ケース3: Template（テンプレート参照用コメントノード）
      // コメントテキストの形式: "@@|123 if:isVisible" のような形式
      // ステップ1: コメントマーク以降のテキストを取得
      // Case 3: Template (template reference comment node)
      // Comment text format: "@@|123 if:isVisible" format
      // Step 1: Get text after comment mark
      const text = node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN).trim();
      
      // ステップ2: スペース区切りで分割し、最初の要素をテンプレートIDとして取得
      // 例: "123 if:isVisible" → idText = "123"
      // Step 2: Split by space and get first element as template ID
      // Example: "123 if:isVisible" → idText = "123"
      const [idText, ] = text?.split(' ', 2) ?? [];
      const id = Number(idText);
      
      // ステップ3: IDからテンプレート要素を取得
      // Step 3: Get template element by ID
      const template = getTemplateById(id);
      
      // ステップ4: テンプレートのdata-bind属性値を返す
      // テンプレート自体が持つバインディング定義（例: "if:isVisible", "for:items"）
      // Step 4: Return data-bind attribute value of template
      // Binding definition that template itself has (e.g., "if:isVisible", "for:items")
      return template.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
    }
    case "SVGElement": {
      // ケース4: SVGElement（SVG要素）
      // HTML要素と同様にdata-bind属性の値をそのまま返す
      // Case 4: SVGElement (SVG element)
      // Return data-bind attribute value as-is, same as HTML element
      return (node as SVGElement).getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
    }
    default:
      // その他のノード種別（通常は到達しない）
      // 空文字列を返す
      // Other node types (normally unreachable)
      // Return empty string
      return "";
  }
}