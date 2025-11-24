import { NodePath } from "./types";

/**
 * Utility function that traces the index from parent node to root for the specified node,
 * and returns it as an absolute path (NodePath).
 *
 * Processing flow:
 * 1. Start from current node and loop while parent node exists
 * 2. Get index of current node within parent's childNodes
 * 3. Prepend index to array (build in reverse order)
 * 4. Move to parent node and repeat
 * 5. Return index array when root node is reached
 *
 * Example: Given the following DOM tree structure:
 * ```
 * root
 *   ├─ child[0]
 *   ├─ child[1]
 *   │   ├─ grandchild[0]
 *   │   ├─ grandchild[1]
 *   │   └─ grandchild[2] ← Specify this node
 *   └─ child[2]
 * ```
 * Returns `[1, 2]` (index 1 in parent, index 2 within that)
 *
 * This absolute path is used to locate the same node from template later.
 * (Forms a pair with resolveNodeFromPath function)
 *
 * @param node - Target DOM node to get absolute path for
 * @returns Index array from root to this node (NodePath)
 */
export function getAbsoluteNodePath(node: Node): NodePath {
  // Array to store result (indexes arranged from root to leaf)
  let routeIndexes: NodePath = [];
  let currentNode: Node | null = node;
  
  // Loop while parent node exists (until reaching root)
  while (currentNode.parentNode !== null) {
    // Convert parent node's childNodes to array
    const childNodes = Array.from(currentNode.parentNode.childNodes) as Node[];
    
    // Get index of current node within parent's childNodes and prepend to array
    // Prepending maintains root→leaf order
    routeIndexes = [childNodes.indexOf(currentNode), ...routeIndexes];
    
    // Move to parent node for next iteration
    currentNode = currentNode.parentNode;
  }
  
  // Return index array from root
  return routeIndexes;
}