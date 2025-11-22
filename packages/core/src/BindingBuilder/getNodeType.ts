import { raiseError } from "../utils.js";
import { NodeType } from "./types";

/**
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
 * @param node - Node to generate key from
 * @returns Cache key string
 */
const createNodeKey = (node: Node): string => 
  `${node.constructor.name  }\t${  (node instanceof Comment) ? (node.textContent?.[2] ?? "") : ""}`;

/**
 * Cache of NodeType values keyed by node key
 * When the same type of node is determined multiple times, skip re-determination to improve performance
 */
type NodeTypeByNodeKey = {
  [nodeKey: string]: NodeType;
};

const nodeTypeByNodeKey: NodeTypeByNodeKey = {};

/**
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
 * @param node - Node to determine
 * @returns Node type
 * @throws When node type is unknown
 */
const getNodeTypeByNode = (node: Node): NodeType =>
  (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" : 
  (node instanceof HTMLElement) ? "HTMLElement" :
  (node instanceof Comment && node.textContent?.[2] === "|") ? "Template" : 
  (node instanceof SVGElement) ? "SVGElement" : 
  raiseError({
    code: 'BND-001',
    message: `Unknown NodeType: ${node.nodeType}`,
    context: { 
      where: 'getNodeType.getNodeTypeByNode',
      nodeType: node.nodeType,
      nodeName: node.nodeName,
      nodeConstructor: node.constructor.name
    },
    docsUrl: './docs/error-codes.md#bnd'
  });

/**
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
 * @param node - Node to determine
 * @param nodeKey - Node key for cache (auto-generated if omitted)
 * @returns Node type (NodeType)
 */
export function getNodeType(
  node   : Node, 
  nodeKey: string = createNodeKey(node)
): NodeType {
  // Check cache, if not exists, determine and save to cache
  return nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
}
