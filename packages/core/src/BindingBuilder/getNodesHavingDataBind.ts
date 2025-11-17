import { DATA_BIND_ATTRIBUTE, COMMENT_EMBED_MARK, COMMENT_TEMPLATE_MARK } from "../constants.js";

/**
 * コメントノードがバインディング対象かどうかを判定する内部関数。
 * 
 * 判定条件:
 * - Commentノードであること
 * - テキストが "@@:" で始まる（COMMENT_EMBED_MARK）→ テキストコンテンツバインディング
 * - または "@@|" で始まる（COMMENT_TEMPLATE_MARK）→ テンプレート参照バインディング
 * 
 * 使用例:
 * ```typescript
 * const comment1 = document.createComment("@@:user.name");
 * isCommentNode(comment1); // → true (テキストバインディング)
 * 
 * const comment2 = document.createComment("@@|123 if:isVisible");
 * isCommentNode(comment2); // → true (テンプレート参照)
 * 
 * const comment3 = document.createComment("通常のコメント");
 * isCommentNode(comment3); // → false
 * ```
 * 
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
 * @param node - 判定対象のノード / Node to check
 * @returns バインディング対象のコメントノードならtrue / true if binding target comment node
 */
function isCommentNode(node: Node): boolean {
  return node instanceof Comment && (
    (node.textContent?.indexOf(COMMENT_EMBED_MARK) === 0) || 
    (node.textContent?.indexOf(COMMENT_TEMPLATE_MARK) === 0)
  );
} 

/**
 * 指定ノード以下のDOMツリーから「data-bind属性を持つ要素」または
 * 「特定のマーク（@@: または @@|）で始まるコメントノード」をすべて取得するユーティリティ関数。
 *
 * 探索対象:
 * 1. Element（要素ノード）
 *    - data-bind属性を持つものだけを抽出
 *    - 例: <div data-bind="class:active">
 * 
 * 2. Comment（コメントノード）
 *    - "@@:" で始まるもの（テキストコンテンツバインディング）
 *    - "@@|" で始まるもの（テンプレート参照バインディング）
 * 
 * 処理フロー:
 * 1. TreeWalkerを生成（SHOW_ELEMENT | SHOW_COMMENT フラグ）
 * 2. カスタムフィルタで条件に合致するノードのみACCEPT
 *    - Element: data-bind属性の有無で判定
 *    - Comment: isCommentNodeで判定
 * 3. nextNode()でツリーを効率的に走査
 * 4. 合致したノードを配列に追加
 * 5. 全ノードの配列を返す
 * 
 * パフォーマンス:
 * - TreeWalkerを使用することで、DOMツリーの効率的な走査を実現
 * - カスタムフィルタにより不要なノードをスキップ
 * 
 * 使用例:
 * ```typescript
 * const fragment = document.createDocumentFragment();
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'class:active');
 * const comment = document.createComment('@@:user.name');
 * fragment.appendChild(div);
 * fragment.appendChild(comment);
 * 
 * const nodes = getNodesHavingDataBind(fragment);
 * // nodes = [div, comment] (data-bind属性を持つ要素とバインディングコメント)
 * ```
 * 
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
 * @param root - 探索の起点となるノード（通常はDocumentFragmentまたはElement） / Root node for search (typically DocumentFragment or Element)
 * @returns 条件に合致したノードの配列 / Array of nodes matching criteria
 */
export function getNodesHavingDataBind(root: Node): Node[] {
  // 結果を格納する配列
  // Array to store results
  const nodes: Node[] = [];
  
  // TreeWalkerを生成（要素ノードとコメントノードを走査対象にする）
  // Create TreeWalker (target element and comment nodes)
  const walker = document.createTreeWalker(
    root, 
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT, 
    {
      // カスタムフィルタ: 各ノードに対してACCEPT/SKIPを判定
      // Custom filter: Determine ACCEPT/SKIP for each node
      acceptNode(node: Node) {
        // Element（要素）の場合
        // Case: Element
        if (node instanceof Element) {
          // data-bind属性を持つ場合のみACCEPT、それ以外はSKIP
          // ACCEPT only if has data-bind attribute, otherwise SKIP
          return node.hasAttribute(DATA_BIND_ATTRIBUTE) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_SKIP;
        } else {
          // Comment（コメント）の場合
          // isCommentNodeで "@@:" または "@@|" で始まるかチェック
          // Case: Comment
          // Check with isCommentNode if starts with "@@:" or "@@|"
          return isCommentNode(node) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_SKIP;
        }
      }
    }
  );
  
  // TreeWalkerで次のノードへ順次移動し、合致したノードを配列に追加
  // Move to next node with TreeWalker and add matching nodes to array
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  
  // バインディング対象ノードの配列を返す
  // Return array of binding target nodes
  return nodes;
}

