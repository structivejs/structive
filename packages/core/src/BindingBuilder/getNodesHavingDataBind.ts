import { DATA_BIND_ATTRIBUTE, COMMENT_EMBED_MARK, COMMENT_TEMPLATE_MARK } from "../constants.js";

/**
 * Internal function to determine if a comment node is a binding target.
 * 
 * Decision criteria:
 * - Must be a Comment node
 * - Text starts with "@@:" (COMMENT_EMBED_MARK) → Text content binding
 * - Or starts with "@@|" (COMMENT_TEMPLATE_MARK) → Template reference binding
 * 
 * Usage examples:
 * ```typescript
 * const comment1 = document.createComment("@@:user.name");
 * isCommentNode(comment1); // → true (text binding)
 * 
 * const comment2 = document.createComment("@@|123 if:isVisible");
 * isCommentNode(comment2); // → true (template reference)
 * 
 * const comment3 = document.createComment("regular comment");
 * isCommentNode(comment3); // → false
 * ```
 * 
 * @param node - Node to check
 * @returns true if binding target comment node
 */
function isCommentNode(node: Node): boolean {
  return node instanceof Comment && (
    (node.textContent?.indexOf(COMMENT_EMBED_MARK) === 0) || 
    (node.textContent?.indexOf(COMMENT_TEMPLATE_MARK) === 0)
  );
} 

/**
 * Utility function that retrieves all "elements with data-bind attribute" or
 * "comment nodes starting with specific marks (@@: or @@|)" from DOM tree below specified node.
 *
 * Search targets:
 * 1. Element (element nodes)
 *    - Extract only those with data-bind attribute
 *    - Example: <div data-bind="class:active">
 * 
 * 2. Comment (comment nodes)
 *    - Starting with "@@:" (text content binding)
 *    - Starting with "@@|" (template reference binding)
 * 
 * Processing flow:
 * 1. Create TreeWalker (SHOW_ELEMENT | SHOW_COMMENT flags)
 * 2. Custom filter ACCEPTs only matching nodes
 *    - Element: Check for data-bind attribute
 *    - Comment: Check with isCommentNode
 * 3. Efficiently traverse tree with nextNode()
 * 4. Add matching nodes to array
 * 5. Return array of all nodes
 * 
 * Performance:
 * - Achieves efficient DOM tree traversal using TreeWalker
 * - Skips unnecessary nodes with custom filter
 * 
 * Usage example:
 * ```typescript
 * const fragment = document.createDocumentFragment();
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'class:active');
 * const comment = document.createComment('@@:user.name');
 * fragment.appendChild(div);
 * fragment.appendChild(comment);
 * 
 * const nodes = getNodesHavingDataBind(fragment);
 * // nodes = [div, comment] (elements with data-bind and binding comments)
 * ```
 * 
 * @param root - Root node for search (typically DocumentFragment or Element)
 * @returns Array of nodes matching criteria
 */
export function getNodesHavingDataBind(root: Node): Node[] {
  // Array to store results
  const nodes: Node[] = [];
  
  // Create TreeWalker (target element and comment nodes)
  const walker = document.createTreeWalker(
    root, 
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT, 
    {
      // Custom filter: Determine ACCEPT/SKIP for each node
      acceptNode(node: Node) {
        // Case: Element
        if (node instanceof Element) {
          // ACCEPT only if has data-bind attribute, otherwise SKIP
          return node.hasAttribute(DATA_BIND_ATTRIBUTE) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_SKIP;
        } else {
          // Case: Comment
          // Check with isCommentNode if starts with "@@:" or "@@|"
          return isCommentNode(node) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_SKIP;
        }
      }
    }
  );
  
  // Move to next node with TreeWalker and add matching nodes to array
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  
  // Return array of binding target nodes
  return nodes;
}

