import { raiseError } from "../utils.js";
import { NodeType } from "./types";

/**
 * ノードからキャッシュキーを生成する内部関数。
 * 
 * キーの構成:
 * - コンストラクタ名（例: "Comment", "HTMLDivElement", "SVGCircleElement"）
 * - タブ文字（"\t"）
 * - コメントノードの場合: textContent[2]の文字（":" または "|"）
 * - その他のノードの場合: 空文字列
 * 
 * 例:
 * - Comment("@@:user.name") → "Comment\t:"
 * - Comment("@@|123") → "Comment\t|"
 * - HTMLDivElement → "HTMLDivElement\t"
 * - SVGCircleElement → "SVGCircleElement\t"
 * 
 * Creates cache key from node (internal function).
 * 
 * Key composition:
 * - Constructor name (e.g., "Comment", "HTMLDivElement", "SVGCircleElement")
 * - Tab character ("\t")
 * - For comment nodes: character at textContent[2] (":" or "|")
 * - For other nodes: empty string
 * 
 * Examples:
 * - Comment("@@:user.name") → "Comment\t:"
 * - Comment("@@|123") → "Comment\t|"
 * - HTMLDivElement → "HTMLDivElement\t"
 * - SVGCircleElement → "SVGCircleElement\t"
 * 
 * @param node - キー生成対象のノード / Node to generate key from
 * @returns キャッシュキー文字列 / Cache key string
 */
const createNodeKey = (node: Node): string => 
  node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");

/**
 * ノードキーをキーとしたNodeType値のキャッシュ
 * 同じ種類のノードが複数回判定される場合、再判定を省略してパフォーマンスを向上
 * 
 * Cache of NodeType values keyed by node key
 * When the same type of node is determined multiple times, skip re-determination to improve performance
 */
type NodeTypeByNodeKey = {
  [nodeKey: string]: NodeType;
};

const nodeTypeByNodeKey: NodeTypeByNodeKey = {};

/**
 * ノードからNodeTypeを実際に判定する内部関数。
 * 
 * 判定ロジック（優先順位順）:
 * 1. Comment かつ textContent[2] === ":" → "Text"
 *    - 例: "@@:user.name" → テキストコンテンツバインディング
 * 
 * 2. HTMLElement → "HTMLElement"
 *    - 例: <div>, <input>, <span> など
 * 
 * 3. Comment かつ textContent[2] === "|" → "Template"
 *    - 例: "@@|123" → テンプレート参照バインディング
 * 
 * 4. SVGElement → "SVGElement"
 *    - 例: <circle>, <path>, <rect> など
 * 
 * 5. その他 → エラー
 * 
 * 注: HTMLElementの判定がSVGElementより前にある理由
 * → HTMLElementのチェックを先に行うことで、より一般的なケースを高速処理
 * 
 * Internal function that actually determines NodeType from node.
 * 
 * Decision logic (in priority order):
 * 1. Comment and textContent[2] === ":" → "Text"
 *    - Example: "@@:user.name" → Text content binding
 * 
 * 2. HTMLElement → "HTMLElement"
 *    - Example: <div>, <input>, <span>, etc.
 * 
 * 3. Comment and textContent[2] === "|" → "Template"
 *    - Example: "@@|123" → Template reference binding
 * 
 * 4. SVGElement → "SVGElement"
 *    - Example: <circle>, <path>, <rect>, etc.
 * 
 * 5. Others → Error
 * 
 * Note: Why HTMLElement check comes before SVGElement
 * → Checking HTMLElement first allows faster processing of more common cases
 * 
 * @param node - 判定対象のノード / Node to determine
 * @returns ノードタイプ / Node type
 * @throws 未知のノード型の場合 / When node type is unknown
 */
const getNodeTypeByNode = (node: Node): NodeType =>
  (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" : 
  (node instanceof HTMLElement) ? "HTMLElement" :
  (node instanceof Comment && node.textContent?.[2] === "|") ? "Template" : 
  (node instanceof SVGElement) ? "SVGElement" : 
  raiseError(`Unknown NodeType: ${node.nodeType}`);

/**
 * ノードのタイプ（"Text" | "HTMLElement" | "Template" | "SVGElement"）を判定し、
 * キャッシュを利用して高速化するユーティリティ関数。
 *
 * ノード種別の判定基準:
 * 1. Text: Commentノードで textContent[2] が ":"
 *    - "@@:" で始まるコメント → テキストコンテンツバインディング
 *    - 例: <!--@@:user.name--> → "Text"
 * 
 * 2. Template: Commentノードで textContent[2] が "|"
 *    - "@@|" で始まるコメント → テンプレート参照バインディング
 *    - 例: <!--@@|123--> → "Template"
 * 
 * 3. HTMLElement: 通常のHTML要素
 *    - 例: <div>, <input>, <span> → "HTMLElement"
 * 
 * 4. SVGElement: SVG要素
 *    - 例: <circle>, <path>, <rect> → "SVGElement"
 * 
 * キャッシュ機構:
 * - ノードからキーを生成（コンストラクタ名 + コメント種別）
 * - 同じキーのノードは2回目以降キャッシュから返却
 * - パフォーマンス向上（特に大量のノードを処理する場合）
 * 
 * 処理フロー:
 * 1. ノードからキャッシュキーを生成（または引数から取得）
 * 2. キャッシュを確認
 * 3. キャッシュヒット → 保存された値を返す
 * 4. キャッシュミス → getNodeTypeByNodeで判定し、キャッシュに保存してから返す
 * 
 * 使用例:
 * ```typescript
 * // テキストバインディングコメント
 * const comment1 = document.createComment("@@:user.name");
 * getNodeType(comment1); // → "Text"
 * 
 * // テンプレート参照コメント
 * const comment2 = document.createComment("@@|123");
 * getNodeType(comment2); // → "Template"
 * 
 * // HTML要素
 * const div = document.createElement('div');
 * getNodeType(div); // → "HTMLElement"
 * 
 * // SVG要素
 * const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
 * getNodeType(circle); // → "SVGElement"
 * ```
 * 
 * Utility function that determines node type ("Text" | "HTMLElement" | "Template" | "SVGElement")
 * and uses cache for performance optimization.
 *
 * Node type determination criteria:
 * 1. Text: Comment node with textContent[2] === ":"
 *    - Comment starting with "@@:" → Text content binding
 *    - Example: <!--@@:user.name--> → "Text"
 * 
 * 2. Template: Comment node with textContent[2] === "|"
 *    - Comment starting with "@@|" → Template reference binding
 *    - Example: <!--@@|123--> → "Template"
 * 
 * 3. HTMLElement: Regular HTML element
 *    - Example: <div>, <input>, <span> → "HTMLElement"
 * 
 * 4. SVGElement: SVG element
 *    - Example: <circle>, <path>, <rect> → "SVGElement"
 * 
 * Cache mechanism:
 * - Generate key from node (constructor name + comment type)
 * - Same key nodes return from cache on second and subsequent calls
 * - Performance improvement (especially when processing large number of nodes)
 * 
 * Processing flow:
 * 1. Generate cache key from node (or get from argument)
 * 2. Check cache
 * 3. Cache hit → Return saved value
 * 4. Cache miss → Determine with getNodeTypeByNode, save to cache, then return
 * 
 * Usage examples:
 * ```typescript
 * // Text binding comment
 * const comment1 = document.createComment("@@:user.name");
 * getNodeType(comment1); // → "Text"
 * 
 * // Template reference comment
 * const comment2 = document.createComment("@@|123");
 * getNodeType(comment2); // → "Template"
 * 
 * // HTML element
 * const div = document.createElement('div');
 * getNodeType(div); // → "HTMLElement"
 * 
 * // SVG element
 * const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
 * getNodeType(circle); // → "SVGElement"
 * ```
 * 
 * @param node - 判定対象のノード / Node to determine
 * @param nodeKey - キャッシュ用のノードキー（省略時は自動生成） / Node key for cache (auto-generated if omitted)
 * @returns ノードタイプ（NodeType） / Node type (NodeType)
 */
export function getNodeType(
  node   : Node, 
  nodeKey: string = createNodeKey(node)
): NodeType {
  // キャッシュを確認し、なければ判定してキャッシュに保存
  // Check cache, if not exists, determine and save to cache
  return nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
}
