import { NodePath } from "./types";

/**
 * 指定ノードの親ノードからのインデックスをルートまで辿り、
 * 絶対パス（NodePath）として返すユーティリティ関数。
 *
 * 処理フロー:
 * 1. 現在のノードから開始し、親ノードが存在する限りループ
 * 2. 親ノードのchildNodes内での現在ノードのインデックスを取得
 * 3. インデックスを配列の先頭に追加（逆順に構築）
 * 4. 親ノードに移動して繰り返し
 * 5. ルートノードに到達したらインデックス配列を返す
 *
 * 例: DOMツリーが以下の構造の場合
 * ```
 * root
 *   ├─ child[0]
 *   ├─ child[1]
 *   │   ├─ grandchild[0]
 *   │   ├─ grandchild[1]
 *   │   └─ grandchild[2] ← このノードを指定
 *   └─ child[2]
 * ```
 * 戻り値は `[1, 2]` となる（親のインデックス1、その中のインデックス2）
 *
 * この絶対パスは、後でテンプレートから同じノードを特定する際に使用されます。
 * （resolveNodeFromPath関数と対をなす）
 *
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
 * @param node - 絶対パスを取得する対象のDOMノード / Target DOM node to get absolute path for
 * @returns ルートからこのノードまでのインデックス配列（NodePath） / Index array from root to this node (NodePath)
 */
export function getAbsoluteNodePath(node: Node): NodePath {
  // 結果を格納する配列（ルート→リーフの順でインデックスが並ぶ）
  // Array to store result (indexes arranged from root to leaf)
  let routeIndexes: NodePath = [];
  
  // 親ノードが存在する限りループ（ルートに到達するまで）
  // Loop while parent node exists (until reaching root)
  while (node.parentNode !== null) {
    // 親ノードのchildNodesを配列に変換
    // Convert parent node's childNodes to array
    const childNodes = Array.from(node.parentNode.childNodes) as Node[];
    
    // 現在のノードが親のchildNodes内で何番目かを取得し、配列の先頭に追加
    // インデックスを先頭に追加することで、ルート→リーフの順序を保つ
    // Get index of current node within parent's childNodes and prepend to array
    // Prepending maintains root→leaf order
    routeIndexes = [childNodes.indexOf(node), ...routeIndexes];
    
    // 親ノードに移動して次のループへ
    // Move to parent node for next iteration
    node = node.parentNode;
  }
  
  // ルートからのインデックス配列を返す
  // Return index array from root
  return routeIndexes;
}