import { NodeType } from "./types";

/**
 * Constant for data-bind attribute name
 */
const DATASET_BIND_PROPERTY = 'data-bind';

/**
 * Internal function to remove data-bind attribute from Element node.
 * Commonly used for both HTMLElement and SVGElement.
 * 
 * Processing flow:
 * 1. Cast node to Element type
 * 2. Remove data-bind attribute with removeAttribute
 * 
 * @param node - Target node
 */
const removeAttributeFromElement = (node: Node): void => {
  const element = node as Element;
  element.removeAttribute(DATASET_BIND_PROPERTY);
}

/**
 * Type definition for map of attribute removal functions per node type.
 * Holds removal function (or undefined) corresponding to each node type.
 */
type RemoveAttributeByNodeType = {
  [key in NodeType]: ((node: Node) => void) | undefined;
}

/**
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
 * @param node - Target node
 * @param nodeType - Node type ("HTMLElement" | "SVGElement" | "Text" | "Template")
 */
export function removeDataBindAttribute(
  node: Node,
  nodeType: NodeType
): void {
  // Execute removal function corresponding to node type (do nothing if not exists)
  return removeAttributeByNodeType[nodeType]?.(node);
}
