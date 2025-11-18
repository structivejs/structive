/**
 * ルートノードとノードパス（インデックス配列）から、該当するノードを辿って取得するユーティリティ関数。
 *
 * NodePath の構造:
 * - 各階層での childNodes のインデックスを表す数値配列
 * - 例: [1, 2] は root.childNodes[1].childNodes[2] を表す
 * - 空配列 [] はルートノード自身を表す
 *
 * 処理の特徴:
 * - ルートから順に childNodes[index] を辿って目的のノードを取得
 * - 途中でノードが存在しない場合は null を返す（エラーセーフ）
 * - reduce ではなく for ループを使用（途中で null になった時点で中断）
 *
 * 処理フロー:
 * 1. ルートノードを起点として設定
 * 2. パスが空配列の場合はルートノードを返す（早期リターン）
 * 3. パスの各インデックスを順番に辿る:
 *    a. 現在のノードの childNodes[index] を取得
 *    b. ノードが存在しない場合は null を設定してループ中断
 * 4. 最終的なノード（または null）を返す
 *
 * DOM ツリー例:
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
 * 使用例:
 * ```typescript
 * const root = document.querySelector('#root');
 *
 * // 空パス → ルートノード自身を返す
 * const node1 = resolveNodeFromPath(root, []);
 * // → root
 *
 * // 単一インデックス
 * const node2 = resolveNodeFromPath(root, [1]);
 * // → root.childNodes[1] (<ul> 要素)
 *
 * // 複数階層
 * const node3 = resolveNodeFromPath(root, [1, 1]);
 * // → root.childNodes[1].childNodes[1] (<li>Item 2</li>)
 *
 * // 不正なパス（存在しないインデックス）
 * const node4 = resolveNodeFromPath(root, [1, 5]);
 * // → null（childNodes[5] が存在しない）
 *
 * // 不正なパス（途中でノードがない）
 * const node5 = resolveNodeFromPath(root, [0, 0, 0]);
 * // → null（<span>Hello</span> の childNodes[0] はテキストノード、
 * //         さらにその childNodes[0] は存在しない）
 * ```
 *
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
 * @param root - 探索の起点となるルートノード / Root node as starting point for traversal
 * @param path - 各階層のインデックス配列（NodePath） / Index array for each level (NodePath)
 * @returns パスで指定されたノード、またはnull / Node specified by path, or null
 */
export function resolveNodeFromPath(root, path) {
    // ステップ1: ルートノードを起点として設定
    // Step 1: Set root node as starting point
    let node = root;
    // ステップ2: 空パスの場合はルートノードを返す
    // Step 2: Return root node if path is empty
    if (path.length === 0)
        return node;
    // ステップ3: パスの各インデックスを順番に辿る
    // path.reduce() だと途中で null になっても継続してしまうため、
    // for ループで明示的にチェックして中断する
    // Step 3: Traverse each index in path sequentially
    // Using for loop instead of path.reduce() to explicitly check and break when null
    for (let i = 0; i < path.length; i++) {
        // 現在のノードの childNodes[index] を取得（存在しない場合は null）
        // Get childNodes[index] of current node (null if doesn't exist)
        node = node?.childNodes[path[i]] ?? null;
        // ノードが存在しない場合はループ中断
        // Break loop if node doesn't exist
        if (node === null)
            break;
    }
    // ステップ4: 最終的なノード（または null）を返す
    // Step 4: Return final node (or null)
    return node;
}
