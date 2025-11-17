import { NodeType } from "./types";

/**
 * コメントノードを空のテキストノードに置き換える内部関数。
 * 
 * バインディング用コメントノード（<!-- @@:textContent:value --> など）を
 * 実際の表示用テキストノードに置換する際に使用される。
 * 
 * 処理フロー:
 * 1. 空の文字列でテキストノードを新規作成
 * 2. 親ノードの replaceChild で元のコメントノードを置換
 * 3. 新しく作成したテキストノードを返す
 * 
 * 注意: 親ノードが存在しない場合、replaceChild は実行されないが
 *       新しいテキストノードは返される
 * 
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
 * @param node - 置換対象のコメントノード / Comment node to replace
 * @returns 新しく作成されたテキストノード / Newly created text node
 */
const replaceTextNodeText = (node: Node): Node => {
  // ステップ1: 空のテキストノードを作成
  // Step 1: Create empty text node
  const textNode = document.createTextNode("");
  
  // ステップ2: 親ノードでコメントノードを置換
  // Step 2: Replace comment node in parent node
  node.parentNode?.replaceChild(textNode, node);
  
  // ステップ3: 新しいテキストノードを返す
  // Step 3: Return new text node
  return textNode;
}

/**
 * ノードタイプごとのテキストノード置換関数のマップ型定義。
 * 各ノードタイプに対応する置換関数（または undefined）を保持。
 * 
 * Type definition for map of text node replacement functions per node type.
 * Holds replacement function (or undefined) corresponding to each node type.
 */
type ReplaceTextNodeFn = {
  [key in NodeType]: ((node: Node) => Node) | undefined;
}

/**
 * ノードタイプごとのテキストノード置換関数のマップ。
 * 
 * 置換対象:
 * - Text: コメントノードを空のテキストノードに置換
 *   （NodeType が "Text" だが、実際には Comment ノードを処理）
 * 
 * 置換非対象:
 * - HTMLElement: Element ノードは置換不要のため undefined
 * - Template: Template ノードは置換不要のため undefined
 * - SVGElement: SVGElement ノードは置換不要のため undefined
 * 
 * 注意: NodeType の "Text" は、実際にはテキストコンテンツのバインディングを
 *       表すコメントノードを指している（BindingBuilder の文脈では）
 * 
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
const replaceTextNodeFn: ReplaceTextNodeFn = {
  Text: replaceTextNodeText,
  HTMLElement: undefined,
  Template: undefined,
  SVGElement: undefined
}

/**
 * バインディング用コメントノードを実際の表示用ノードに置き換えるユーティリティ関数。
 *
 * テキストコンテンツのバインディング（<!-- @@:textContent:value --> など）を
 * 実際の DOM ノードに変換する際に使用される。
 * 
 * ノードタイプ別の処理:
 * - Text (実際はコメントノード): 空のテキストノードに置換
 * - HTMLElement, SVGElement, Template: 何もせず元のノードを返す
 * 
 * オプショナルチェーン（?.）とNull合体演算子（??）の組み合わせにより、
 * - 置換関数が存在する場合: 関数を実行して新しいノードを返す
 * - 置換関数が undefined の場合: 元のノードをそのまま返す
 * 
 * 処理フロー:
 * 1. nodeType に対応する置換関数を replaceTextNodeFn から取得
 * 2. 関数が存在する場合（Text）: 実行してコメントノードを置換
 * 3. 関数が undefined の場合（その他）: 元のノードを返す
 * 4. 置換後（または元の）ノードを返す
 * 
 * 使用例:
 * ```typescript
 * // Text（実際はコメントノード）の場合
 * const comment = document.createComment("@@:textContent:user.name");
 * const parent = document.createElement('div');
 * parent.appendChild(comment);
 * 
 * const textNode = replaceTextNodeFromComment(comment, 'Text');
 * // → 空のテキストノードが作成され、コメントノードが置換される
 * // parent.childNodes[0] === textNode (空の Text ノード)
 * 
 * // HTMLElement の場合
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:value');
 * 
 * const result = replaceTextNodeFromComment(div, 'HTMLElement');
 * // → 元の div ノードがそのまま返される（置換なし）
 * // result === div
 * 
 * // SVGElement の場合
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * const result = replaceTextNodeFromComment(svg, 'SVGElement');
 * // → 元の svg ノードがそのまま返される（置換なし）
 * 
 * // Template の場合
 * const template = document.createElement('template');
 * const result = replaceTextNodeFromComment(template, 'Template');
 * // → 元の template ノードがそのまま返される（置換なし）
 * ```
 * 
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
 * @param node - 対象ノード（コメントノードまたは Element ノード） / Target node (comment node or Element node)
 * @param nodeType - ノードタイプ（"Text" | "HTMLElement" | "Template" | "SVGElement"） / Node type
 * @returns 置換後のノード（Text の場合）または元のノード（その他の場合） / Replaced node (for Text) or original node (for others)
 */
export function replaceTextNodeFromComment(
  node: Node,
  nodeType: NodeType
): Node {
  // ノードタイプに対応する置換関数を実行（存在しない場合は元のノードを返す）
  // Execute replacement function corresponding to node type (return original node if not exists)
  return replaceTextNodeFn[nodeType]?.(node) ?? node;
}
