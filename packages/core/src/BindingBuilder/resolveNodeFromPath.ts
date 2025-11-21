import { NodePath } from "./types";

/**
 * Utility function to traverse and retrieve the target node from root node and node path (index array).
 *
 * NodePath structure:
 * - Numeric array representing childNodes index at each level
 * - Example: [1, 2] represents root.childNodes[1].childNodes[2]
 * - Empty array [] represents root node itself
 * 
 * Processing characteristics:
 * - Traverse childNodes[index] sequentially from root to get target node
 * - Returns null if node doesn't exist midway (error-safe)
 * - Uses for loop instead of reduce (breaks immediately when null)
 * 
 * Processing flow:
 * 1. Set root node as starting point
 * 2. If path is empty array, return root node (early return)
 * 3. Traverse each index in path sequentially:
 *    a. Get childNodes[index] of current node
 *    b. If node doesn't exist, set null and break loop
 * 4. Return final node (or null)
 * 
 * DOM tree example:
 * ```html
 * <div>                    // root (index: -)
 *   <span>Hello</span>     // root.childNodes[0]
 *   <ul>                   // root.childNodes[1]
 *     <li>Item 1</li>      // root.childNodes[1].childNodes[0]
 *     <li>Item 2</li>      // root.childNodes[1].childNodes[1]
 *   </ul>
 * </div>
 * ```
 * 
 * Usage examples:
 * ```typescript
 * const root = document.querySelector('#root');
 * 
 * // Empty path → Returns root node itself
 * const node1 = resolveNodeFromPath(root, []);
 * // → root
 * 
 * // Single index
 * const node2 = resolveNodeFromPath(root, [1]);
 * // → root.childNodes[1] (<ul> element)
 * 
 * // Multiple levels
 * const node3 = resolveNodeFromPath(root, [1, 1]);
 * // → root.childNodes[1].childNodes[1] (<li>Item 2</li>)
 * 
 * // Invalid path (non-existent index)
 * const node4 = resolveNodeFromPath(root, [1, 5]);
 * // → null (childNodes[5] doesn't exist)
 * 
 * // Invalid path (no node midway)
 * const node5 = resolveNodeFromPath(root, [0, 0, 0]);
 * // → null (<span>Hello</span>'s childNodes[0] is text node,
 * //         its childNodes[0] doesn't exist)
 * ```
 * 
 * @param root - Root node as starting point for traversal
 * @param path - Index array for each level (NodePath)
 * @returns Node specified by path, or null
 */
export function resolveNodeFromPath(root: Node, path: NodePath): Node | null {
  // Step 1: Set root node as starting point
  let node = root;
  
  // Step 2: Return root node if path is empty
  if (path.length === 0) return node;
  
  // Step 3: Traverse each index in path sequentially
  // Using for loop instead of path.reduce() to explicitly check and break when null
  for (let i = 0; i < path.length; i++) {
    // Get childNodes[index] of current node (null if doesn't exist)
    node = node?.childNodes[path[i]] ?? null;
    
    // Break loop if node doesn't exist
    if (node === null) break;
  }
  
  // Step 4: Return final node (or null)
  return node;
}