/**
 * Internal function to replace comment node with empty text node.
 *
 * Used when replacing binding comment nodes (<!-- @@:textContent:value --> etc.)
 * with actual text nodes for display.
 *
 * Processing flow:
 * 1. Create new text node with empty string
 * 2. Replace original comment node with parent node's replaceChild
 * 3. Return newly created text node
 *
 * Note: If parent node doesn't exist, replaceChild is not executed,
 *       but the new text node is still returned
 *
 * @param node - Comment node to replace
 * @returns Newly created text node
 */
const replaceTextNodeText = (node) => {
    // Step 1: Create empty text node
    const textNode = document.createTextNode("");
    // Step 2: Replace comment node in parent node
    node.parentNode?.replaceChild(textNode, node);
    // Step 3: Return new text node
    return textNode;
};
/**
 * Map of text node replacement functions per node type.
 *
 * Replacement target:
 * - Text: Replace comment node with empty text node
 *   (NodeType is "Text", but actually processes Comment node)
 *
 * Non-replacement targets:
 * - HTMLElement: undefined (Element nodes don't need replacement)
 * - Template: undefined (Template nodes don't need replacement)
 * - SVGElement: undefined (SVGElement nodes don't need replacement)
 *
 * Note: NodeType "Text" actually refers to comment nodes representing
 *       text content bindings (in BindingBuilder context)
 */
const replaceTextNodeFn = {
    Text: replaceTextNodeText,
    HTMLElement: undefined,
    Template: undefined,
    SVGElement: undefined
};
/**
 * Utility function to replace binding comment nodes with actual display nodes.
 *
 * Used when converting text content bindings (<!-- @@:textContent:value --> etc.)
 * to actual DOM nodes.
 *
 * Processing by node type:
 * - Text (actually comment node): Replace with empty text node
 * - HTMLElement, SVGElement, Template: Return original node without modification
 *
 * By combining optional chaining (?.) and nullish coalescing operator (??),
 * - If replacement function exists: Execute function and return new node
 * - If replacement function is undefined: Return original node as-is
 *
 * Processing flow:
 * 1. Get replacement function corresponding to nodeType from replaceTextNodeFn
 * 2. If function exists (Text): Execute to replace comment node
 * 3. If function is undefined (others): Return original node
 * 4. Return replaced (or original) node
 *
 * Usage examples:
 * ```typescript
 * // For Text (actually comment node)
 * const comment = document.createComment("@@:textContent:user.name");
 * const parent = document.createElement('div');
 * parent.appendChild(comment);
 *
 * const textNode = replaceTextNodeFromComment(comment, 'Text');
 * // → Empty text node is created and comment node is replaced
 * // parent.childNodes[0] === textNode (empty Text node)
 *
 * // For HTMLElement
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:value');
 *
 * const result = replaceTextNodeFromComment(div, 'HTMLElement');
 * // → Original div node is returned as-is (no replacement)
 * // result === div
 *
 * // For SVGElement
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * const result = replaceTextNodeFromComment(svg, 'SVGElement');
 * // → Original svg node is returned as-is (no replacement)
 *
 * // For Template
 * const template = document.createElement('template');
 * const result = replaceTextNodeFromComment(template, 'Template');
 * // → Original template node is returned as-is (no replacement)
 * ```
 *
 * @param node - Target node (comment node or Element node)
 * @param nodeType - Node type ("Text" | "HTMLElement" | "Template" | "SVGElement")
 * @returns Replaced node (for Text) or original node (for others)
 */
export function replaceTextNodeFromComment(node, nodeType) {
    // Execute replacement function corresponding to node type (return original node if not exists)
    return replaceTextNodeFn[nodeType]?.(node) ?? node;
}
