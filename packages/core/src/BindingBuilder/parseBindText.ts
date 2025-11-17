import { IFilterText, IBindText } from "./types";

/**
 * 文字列の前後の空白を除去するヘルパー関数
 * Helper function to trim whitespace from string
 */
const trim = (s: string): string => s.trim();

/**
 * 文字列が空でないかチェックするヘルパー関数
 * Helper function to check if string is not empty
 */
const has = (s: string): boolean => s.length > 0;

/**
 * URLエンコードされた文字列を検出するための正規表現
 * "#...#" の形式で囲まれた文字列をマッチング
 * 
 * Regular expression to detect URL-encoded strings
 * Matches strings enclosed in "#...#" format
 */
const re = new RegExp(/^#(.*)#$/);

/**
 * フィルターオプション値をデコードする内部関数。
 * "#...#" で囲まれている場合はURLデコード、それ以外はそのまま返す。
 * 
 * 使用例:
 * - "#Hello%20World#" → "Hello World" (URLデコード)
 * - "100" → "100" (そのまま)
 * - "true" → "true" (そのまま)
 * 
 * Internal function to decode filter option values.
 * URL-decodes if enclosed in "#...#", otherwise returns as-is.
 * 
 * Usage examples:
 * - "#Hello%20World#" → "Hello World" (URL decode)
 * - "100" → "100" (as-is)
 * - "true" → "true" (as-is)
 * 
 * @param s - デコード対象の文字列 / String to decode
 * @returns デコードされた文字列 / Decoded string
 */
const decode = (s: string): string => {
  const m = re.exec(s);
  return m ? decodeURIComponent(m[1]) : s;
};

/**
 * フィルター部分をパースする内部関数。
 * 
 * パース形式: "フィルター名,オプション1,オプション2,..."
 * 
 * 処理フロー:
 * 1. カンマ区切りで分割
 * 2. 最初の要素をフィルター名、残りをオプションとして抽出
 * 3. 各オプションをデコード（"#...#" 形式の場合URLデコード）
 * 4. IFilterText オブジェクトとして返す
 * 
 * 使用例:
 * - "eq,100" → { name: "eq", options: ["100"] }
 * - "default,#Hello%20World#" → { name: "default", options: ["Hello World"] }
 * - "trim" → { name: "trim", options: [] }
 * 
 * Internal function to parse filter part.
 * 
 * Parse format: "filterName,option1,option2,..."
 * 
 * Processing flow:
 * 1. Split by comma
 * 2. Extract first element as filter name, rest as options
 * 3. Decode each option (URL decode if "#...#" format)
 * 4. Return as IFilterText object
 * 
 * Usage examples:
 * - "eq,100" → { name: "eq", options: ["100"] }
 * - "default,#Hello%20World#" → { name: "default", options: ["Hello World"] }
 * - "trim" → { name: "trim", options: [] }
 * 
 * @param text - フィルター定義文字列 / Filter definition string
 * @returns パース済みフィルター情報 / Parsed filter information
 */
const parseFilter = (text: string): IFilterText => {
  // カンマ区切りで分割し、最初がフィルター名、残りがオプション
  // Split by comma, first is filter name, rest are options
  const [name, ...options] = text.split(",").map(trim);
  return { name, options: options.map(decode) };
};

/**
 * プロパティ解析結果の型定義
 * Type definition for property parse result
 */
type ReturnParseStateProperty = { property: string, filters: IFilterText[] };

/**
 * プロパティ式をパースする内部関数。
 * 
 * パース形式: "プロパティ名|フィルター1|フィルター2|..."
 * 
 * 処理フロー:
 * 1. パイプ（|）区切りで分割
 * 2. 最初の要素をプロパティ名として抽出
 * 3. 残りの要素を各々フィルターとしてパース（parseFilter）
 * 4. プロパティ名とフィルター配列のオブジェクトを返す
 * 
 * 使用例:
 * - "value" → { property: "value", filters: [] }
 * - "value|trim" → { property: "value", filters: [{ name: "trim", options: [] }] }
 * - "value|eq,100|falsey" → { property: "value", filters: [{ name: "eq", options: ["100"] }, { name: "falsey", options: [] }] }
 * 
 * Internal function to parse property expression.
 * 
 * Parse format: "propertyName|filter1|filter2|..."
 * 
 * Processing flow:
 * 1. Split by pipe (|)
 * 2. Extract first element as property name
 * 3. Parse remaining elements as filters (parseFilter)
 * 4. Return object with property name and filter array
 * 
 * Usage examples:
 * - "value" → { property: "value", filters: [] }
 * - "value|trim" → { property: "value", filters: [{ name: "trim", options: [] }] }
 * - "value|eq,100|falsey" → { property: "value", filters: [{ name: "eq", options: ["100"] }, { name: "falsey", options: [] }] }
 * 
 * @param text - プロパティ式文字列 / Property expression string
 * @returns プロパティ名とフィルター配列 / Property name and filter array
 */
const parseProperty = (text: string): ReturnParseStateProperty => {
  // パイプ区切りで分割し、最初がプロパティ名、残りがフィルター
  // Split by pipe, first is property name, rest are filters
  const [property, ...filterTexts] = text.split("|").map(trim);
  return { property, filters: filterTexts.map(parseFilter) };
};

/**
 * 単一のバインディング式をパースする内部関数。
 * 
 * パース形式: "ノードプロパティ:状態プロパティ@デコレータ1,デコレータ2"
 * 
 * 構文構造:
 * - コロン（:）: ノードプロパティと状態プロパティを区切る
 * - アットマーク（@）: バインディング式とデコレータを区切る
 * - パイプ（|）: プロパティとフィルターを区切る
 * - カンマ（,）: デコレータやフィルターオプションを区切る
 * 
 * 処理フロー:
 * 1. "@" で分割してバインディング式とデコレータ式を分離
 * 2. デコレータ式をカンマ区切りで配列化
 * 3. バインディング式を ":" で分割してノードプロパティと状態プロパティに分離
 * 4. 各プロパティを parseProperty でパース（プロパティ名とフィルター抽出）
 * 5. IBindText オブジェクトとして返す
 * 
 * フィルターの方向性:
 * - inputFilterTexts: 状態→ノード方向（表示時に適用）
 * - outputFilterTexts: ノード→状態方向（入力時に適用）
 * 
 * 使用例:
 * ```typescript
 * // 基本形
 * "textContent:user.name"
 * → { nodeProperty: "textContent", stateProperty: "user.name", 
 *     inputFilterTexts: [], outputFilterTexts: [], decorates: [] }
 * 
 * // フィルター付き
 * "value:amount|currency,USD"
 * → { nodeProperty: "value", stateProperty: "amount",
 *     inputFilterTexts: [{ name: "currency", options: ["USD"] }],
 *     outputFilterTexts: [], decorates: [] }
 * 
 * // デコレータ付き
 * "value:email@required,trim"
 * → { nodeProperty: "value", stateProperty: "email",
 *     inputFilterTexts: [], outputFilterTexts: [],
 *     decorates: ["required", "trim"] }
 * 
 * // 複合（双方向フィルター + デコレータ）
 * "value|trim:email|lowercase@required"
 * → { nodeProperty: "value", stateProperty: "email",
 *     inputFilterTexts: [{ name: "trim", options: [] }],
 *     outputFilterTexts: [{ name: "lowercase", options: [] }],
 *     decorates: ["required"] }
 * ```
 * 
 * Internal function to parse single binding expression.
 * 
 * Parse format: "nodeProperty:stateProperty@decorator1,decorator2"
 * 
 * Syntax structure:
 * - Colon (:): Separates node property and state property
 * - At-mark (@): Separates binding expression and decorators
 * - Pipe (|): Separates property and filters
 * - Comma (,): Separates decorators or filter options
 * 
 * Processing flow:
 * 1. Split by "@" to separate binding expression and decorator expression
 * 2. Convert decorator expression to array by comma separation
 * 3. Split binding expression by ":" into node property and state property
 * 4. Parse each property with parseProperty (extract property name and filters)
 * 5. Return as IBindText object
 * 
 * Filter directionality:
 * - inputFilterTexts: State→Node direction (applied during display)
 * - outputFilterTexts: Node→State direction (applied during input)
 * 
 * Usage examples:
 * ```typescript
 * // Basic form
 * "textContent:user.name"
 * → { nodeProperty: "textContent", stateProperty: "user.name", 
 *     inputFilterTexts: [], outputFilterTexts: [], decorates: [] }
 * 
 * // With filter
 * "value:amount|currency,USD"
 * → { nodeProperty: "value", stateProperty: "amount",
 *     inputFilterTexts: [{ name: "currency", options: ["USD"] }],
 *     outputFilterTexts: [], decorates: [] }
 * 
 * // With decorator
 * "value:email@required,trim"
 * → { nodeProperty: "value", stateProperty: "email",
 *     inputFilterTexts: [], outputFilterTexts: [],
 *     decorates: ["required", "trim"] }
 * 
 * // Combined (bidirectional filters + decorator)
 * "value|trim:email|lowercase@required"
 * → { nodeProperty: "value", stateProperty: "email",
 *     inputFilterTexts: [{ name: "trim", options: [] }],
 *     outputFilterTexts: [{ name: "lowercase", options: [] }],
 *     decorates: ["required"] }
 * ```
 * 
 * @param expression - バインディング式文字列 / Binding expression string
 * @returns パース済みバインディング情報 / Parsed binding information
 */
const parseExpression = (expression: string): IBindText => {
  // ステップ1: "@" でバインディング式とデコレータ式を分離
  // Step 1: Split by "@" to separate binding expression and decorator expression
  const [bindExpression, decoratesExpression = null] = expression.split("@").map(trim);
  
  // ステップ2: デコレータ式をカンマ区切りで配列化（存在しない場合は空配列）
  // Step 2: Convert decorator expression to array by comma (empty array if not exists)
  const decorates = decoratesExpression ? decoratesExpression.split(",").map(trim) : [];
  
  // ステップ3: バインディング式を ":" で分割してノードプロパティと状態プロパティに分離
  // Step 3: Split binding expression by ":" into node property and state property
  const [nodePropertyText, statePropertyText] = bindExpression.split(":").map(trim);
  
  // ステップ4: 各プロパティテキストをパースしてプロパティ名とフィルターを抽出
  // ノードプロパティのフィルター = inputFilterTexts（状態→ノード方向）
  // Step 4: Parse each property text to extract property name and filters
  // Node property filters = inputFilterTexts (state→node direction)
  const { property: nodeProperty, filters: inputFilterTexts } = parseProperty(nodePropertyText);
  
  // 状態プロパティのフィルター = outputFilterTexts（ノード→状態方向）
  // State property filters = outputFilterTexts (node→state direction)
  const { property: stateProperty, filters: outputFilterTexts } = parseProperty(statePropertyText);
  
  // ステップ5: 構造化されたバインディング情報として返す
  // Step 5: Return as structured binding information
  return { nodeProperty, stateProperty, inputFilterTexts, outputFilterTexts, decorates };
};

/**
 * バインドテキスト全体（複数のバインディング式を含む）をパースする内部関数。
 * 
 * パース形式: "式1;式2;式3"（セミコロン区切り）
 * 
 * 処理フロー:
 * 1. セミコロン（;）で分割
 * 2. 各要素をtrim
 * 3. 空文字列を除外（filter(has)）
 * 4. 各式を parseExpression でパース
 * 5. IBindText 配列として返す
 * 
 * 使用例:
 * ```typescript
 * // 単一バインディング
 * "textContent:user.name"
 * → [{ nodeProperty: "textContent", stateProperty: "user.name", ... }]
 * 
 * // 複数バインディング
 * "value:email;class:active"
 * → [
 *     { nodeProperty: "value", stateProperty: "email", ... },
 *     { nodeProperty: "class", stateProperty: "active", ... }
 *   ]
 * 
 * // 空の式を含む場合（自動的に除外される）
 * "value:name; ;class:active"
 * → [
 *     { nodeProperty: "value", stateProperty: "name", ... },
 *     { nodeProperty: "class", stateProperty: "active", ... }
 *   ]
 * ```
 * 
 * Internal function to parse entire bind text (containing multiple binding expressions).
 * 
 * Parse format: "expr1;expr2;expr3" (semicolon-separated)
 * 
 * Processing flow:
 * 1. Split by semicolon (;)
 * 2. Trim each element
 * 3. Filter out empty strings (filter(has))
 * 4. Parse each expression with parseExpression
 * 5. Return as IBindText array
 * 
 * Usage examples:
 * ```typescript
 * // Single binding
 * "textContent:user.name"
 * → [{ nodeProperty: "textContent", stateProperty: "user.name", ... }]
 * 
 * // Multiple bindings
 * "value:email;class:active"
 * → [
 *     { nodeProperty: "value", stateProperty: "email", ... },
 *     { nodeProperty: "class", stateProperty: "active", ... }
 *   ]
 * 
 * // With empty expressions (automatically filtered out)
 * "value:name; ;class:active"
 * → [
 *     { nodeProperty: "value", stateProperty: "name", ... },
 *     { nodeProperty: "class", stateProperty: "active", ... }
 *   ]
 * ```
 * 
 * @param text - バインドテキスト全体 / Entire bind text
 * @returns パース済みバインディング情報の配列 / Array of parsed binding information
 */
const parseExpressions = (text: string): IBindText[] => {
  // セミコロン区切りで分割 → trim → 空文字列除外 → 各式をパース
  // Split by semicolon → trim → filter empty → parse each expression
  return text.split(";").map(trim).filter(has).map(s => parseExpression(s));
};

/**
 * パース結果のキャッシュ
 * 同じバインドテキストが複数回パースされる場合、再パースを省略してパフォーマンスを向上
 * 
 * Cache for parse results
 * When same bind text is parsed multiple times, skip re-parsing to improve performance
 */
const cache: { [key: string]: IBindText[] } = {};

/**
 * バインドテキスト（data-bind属性やコメント等から取得した文字列）を解析し、
 * 構造化されたバインディング情報（IBindText[]）に変換するメインのユーティリティ関数。
 *
 * 対応する構文:
 * - 基本形: "nodeProperty:stateProperty"
 * - フィルター付き: "nodeProperty|filter1,opt1:stateProperty|filter2"
 * - デコレータ付き: "nodeProperty:stateProperty@decorator1,decorator2"
 * - 複数バインディング: "expr1;expr2;expr3"（セミコロン区切り）
 * - エンコードされたオプション: "filter,#encoded%20value#"
 * 
 * 構文要素:
 * - `:` (コロン): ノードプロパティと状態プロパティを区切る
 * - `|` (パイプ): プロパティとフィルターを区切る
 * - `,` (カンマ): フィルターオプションやデコレータを区切る
 * - `@` (アットマーク): バインディング式とデコレータを区切る
 * - `;` (セミコロン): 複数のバインディング式を区切る
 * - `#...#`: URLエンコードされた値を囲む
 * 
 * パフォーマンス最適化:
 * - パース結果をキャッシュ（同じテキストの再パースを防止）
 * - 空文字列の場合は即座に空配列を返す
 * 
 * 処理フロー:
 * 1. 入力が空文字列かチェック → 空なら空配列を返す
 * 2. キャッシュを確認 → ヒットすればキャッシュから返す
 * 3. キャッシュミス → parseExpressions で新規パース
 * 4. 結果をキャッシュに保存
 * 5. パース結果を返す
 * 
 * 使用例:
 * ```typescript
 * // 基本的なバインディング
 * parseBindText("textContent:user.name");
 * // → [{ nodeProperty: "textContent", stateProperty: "user.name", 
 * //      inputFilterTexts: [], outputFilterTexts: [], decorates: [] }]
 * 
 * // フィルター付き
 * parseBindText("value:amount|currency,USD,2");
 * // → [{ nodeProperty: "value", stateProperty: "amount",
 * //      inputFilterTexts: [{ name: "currency", options: ["USD", "2"] }],
 * //      outputFilterTexts: [], decorates: [] }]
 * 
 * // デコレータ付き
 * parseBindText("value:email@required,trim");
 * // → [{ nodeProperty: "value", stateProperty: "email",
 * //      inputFilterTexts: [], outputFilterTexts: [],
 * //      decorates: ["required", "trim"] }]
 * 
 * // 複数バインディング
 * parseBindText("value:name;class:active");
 * // → [
 * //   { nodeProperty: "value", stateProperty: "name", ... },
 * //   { nodeProperty: "class", stateProperty: "active", ... }
 * // ]
 * 
 * // 双方向フィルター
 * parseBindText("value|trim:data.text|uppercase");
 * // → [{ nodeProperty: "value", stateProperty: "data.text",
 * //      inputFilterTexts: [{ name: "trim", options: [] }],
 * //      outputFilterTexts: [{ name: "uppercase", options: [] }],
 * //      decorates: [] }]
 * 
 * // 空文字列
 * parseBindText("");
 * // → []
 * ```
 * 
 * Main utility function that parses bind text (string obtained from data-bind attribute or comment)
 * and converts it to structured binding information (IBindText[]).
 *
 * Supported syntax:
 * - Basic form: "nodeProperty:stateProperty"
 * - With filters: "nodeProperty|filter1,opt1:stateProperty|filter2"
 * - With decorators: "nodeProperty:stateProperty@decorator1,decorator2"
 * - Multiple bindings: "expr1;expr2;expr3" (semicolon-separated)
 * - Encoded options: "filter,#encoded%20value#"
 * 
 * Syntax elements:
 * - `:` (colon): Separates node property and state property
 * - `|` (pipe): Separates property and filters
 * - `,` (comma): Separates filter options or decorators
 * - `@` (at-mark): Separates binding expression and decorators
 * - `;` (semicolon): Separates multiple binding expressions
 * - `#...#`: Encloses URL-encoded values
 * 
 * Performance optimization:
 * - Caches parse results (prevents re-parsing of same text)
 * - Returns empty array immediately for empty string
 * 
 * Processing flow:
 * 1. Check if input is empty string → return empty array if empty
 * 2. Check cache → return from cache if hit
 * 3. Cache miss → parse with parseExpressions
 * 4. Save result to cache
 * 5. Return parse result
 * 
 * Usage examples:
 * ```typescript
 * // Basic binding
 * parseBindText("textContent:user.name");
 * // → [{ nodeProperty: "textContent", stateProperty: "user.name", 
 * //      inputFilterTexts: [], outputFilterTexts: [], decorates: [] }]
 * 
 * // With filter
 * parseBindText("value:amount|currency,USD,2");
 * // → [{ nodeProperty: "value", stateProperty: "amount",
 * //      inputFilterTexts: [{ name: "currency", options: ["USD", "2"] }],
 * //      outputFilterTexts: [], decorates: [] }]
 * 
 * // With decorator
 * parseBindText("value:email@required,trim");
 * // → [{ nodeProperty: "value", stateProperty: "email",
 * //      inputFilterTexts: [], outputFilterTexts: [],
 * //      decorates: ["required", "trim"] }]
 * 
 * // Multiple bindings
 * parseBindText("value:name;class:active");
 * // → [
 * //   { nodeProperty: "value", stateProperty: "name", ... },
 * //   { nodeProperty: "class", stateProperty: "active", ... }
 * // ]
 * 
 * // Bidirectional filters
 * parseBindText("value|trim:data.text|uppercase");
 * // → [{ nodeProperty: "value", stateProperty: "data.text",
 * //      inputFilterTexts: [{ name: "trim", options: [] }],
 * //      outputFilterTexts: [{ name: "uppercase", options: [] }],
 * //      decorates: [] }]
 * 
 * // Empty string
 * parseBindText("");
 * // → []
 * ```
 * 
 * @param text - バインドテキスト（data-bind属性値やコメント内容） / Bind text (data-bind attribute value or comment content)
 * @returns 構造化されたバインディング情報の配列 / Array of structured binding information
 */
export function parseBindText(
  text: string
): IBindText[] {
  // 空文字列の場合は即座に空配列を返す（パフォーマンス最適化）
  // Return empty array immediately for empty string (performance optimization)
  if (text.trim() === "") {
    return [];
  }
  
  // キャッシュを確認し、なければパースしてキャッシュに保存
  // Check cache, if not exists, parse and save to cache
  return cache[text] ?? (cache[text] = parseExpressions(text));
}
