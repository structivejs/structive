import { NodeType } from "./types";

/**
 * data-bind 属性名の定数
 * Constant for data-bind attribute name
 */
const DATASET_BIND_PROPERTY = 'data-bind';

/**
 * Element ノードから data-bind 属性を削除する内部関数。
 * HTMLElement と SVGElement の両方で共通して使用される。
 * 
 * 処理フロー:
 * 1. ノードを Element 型にキャスト
 * 2. removeAttribute で data-bind 属性を削除
 * 
 * Internal function to remove data-bind attribute from Element node.
 * Commonly used for both HTMLElement and SVGElement.
 * 
 * Processing flow:
 * 1. Cast node to Element type
 * 2. Remove data-bind attribute with removeAttribute
 * 
 * @param node - 対象ノード / Target node
 */
const removeAttributeFromElement = (node: Node): void => {
  const element = node as Element;
  element.removeAttribute(DATASET_BIND_PROPERTY);
}

/**
 * ノードタイプごとの属性削除関数のマップ型定義。
 * 各ノードタイプに対応する削除関数（または undefined）を保持。
 * 
 * Type definition for map of attribute removal functions per node type.
 * Holds removal function (or undefined) corresponding to each node type.
 */
type RemoveAttributeByNodeType = {
  [key in NodeType]: ((node: Node) => void) | undefined;
}

/**
 * ノードタイプごとの属性削除関数のマップ。
 * 
 * 削除対象:
 * - HTMLElement: data-bind 属性を削除
 * - SVGElement: data-bind 属性を削除
 * 
 * 削除非対象:
 * - Text: 属性を持たないため undefined
 * - Template: テンプレート自体は削除対象外のため undefined
 * 
 * Map of attribute removal functions per node type.
 * 
 * Removal targets:
 * - HTMLElement: Remove data-bind attribute
 * - SVGElement: Remove data-bind attribute
 * 
 * Non-removal targets:
 * - Text: undefined (no attributes)
 * - Template: undefined (template itself is not a removal target)
 */
const removeAttributeByNodeType: RemoveAttributeByNodeType = {
  HTMLElement: removeAttributeFromElement,
  SVGElement: removeAttributeFromElement,
  Text: undefined,
  Template: undefined,
}

/**
 * 指定ノードから data-bind 属性を削除するユーティリティ関数。
 *
 * ノードタイプに応じた適切な削除処理を実行する。
 * - HTMLElement, SVGElement: data-bind 属性を削除
 * - Text, Template: 何もしない（属性を持たない、または削除対象外）
 * 
 * オプショナルチェーン（?.）を使用することで、
 * undefined の場合は何も実行されず安全に処理される。
 * 
 * 処理フロー:
 * 1. nodeType に対応する削除関数を removeAttributeByNodeType から取得
 * 2. 関数が存在する場合のみ実行（HTMLElement, SVGElement）
 * 3. 関数が undefined の場合は何もしない（Text, Template）
 * 
 * 使用例:
 * ```typescript
 * // HTMLElement の場合
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:user.name');
 * removeDataBindAttribute(div, 'HTMLElement');
 * // → data-bind 属性が削除される
 * 
 * // SVGElement の場合
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * svg.setAttribute('data-bind', 'class:active');
 * removeDataBindAttribute(svg, 'SVGElement');
 * // → data-bind 属性が削除される
 * 
 * // Text ノードの場合
 * const text = document.createTextNode('Hello');
 * removeDataBindAttribute(text, 'Text');
 * // → 何もしない（属性を持たない）
 * 
 * // Template の場合
 * const template = document.createElement('template');
 * removeDataBindAttribute(template, 'Template');
 * // → 何もしない（削除対象外）
 * ```
 * 
 * Utility function to remove data-bind attribute from specified node.
 *
 * Executes appropriate removal processing based on node type.
 * - HTMLElement, SVGElement: Remove data-bind attribute
 * - Text, Template: Do nothing (no attributes or not a removal target)
 * 
 * By using optional chaining (?.),
 * nothing is executed if undefined, processing safely.
 * 
 * Processing flow:
 * 1. Get removal function corresponding to nodeType from removeAttributeByNodeType
 * 2. Execute only if function exists (HTMLElement, SVGElement)
 * 3. Do nothing if function is undefined (Text, Template)
 * 
 * Usage examples:
 * ```typescript
 * // For HTMLElement
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:user.name');
 * removeDataBindAttribute(div, 'HTMLElement');
 * // → data-bind attribute is removed
 * 
 * // For SVGElement
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * svg.setAttribute('data-bind', 'class:active');
 * removeDataBindAttribute(svg, 'SVGElement');
 * // → data-bind attribute is removed
 * 
 * // For Text node
 * const text = document.createTextNode('Hello');
 * removeDataBindAttribute(text, 'Text');
 * // → Do nothing (no attributes)
 * 
 * // For Template
 * const template = document.createElement('template');
 * removeDataBindAttribute(template, 'Template');
 * // → Do nothing (not a removal target)
 * ```
 * 
 * @param node - 対象ノード / Target node
 * @param nodeType - ノードタイプ（"HTMLElement" | "SVGElement" | "Text" | "Template"） / Node type
 */
export function removeDataBindAttribute(
  node: Node,
  nodeType: NodeType
): void {
  // ノードタイプに対応する削除関数を実行（存在しない場合は何もしない）
  // Execute removal function corresponding to node type (do nothing if not exists)
  return removeAttributeByNodeType[nodeType]?.(node);
}
