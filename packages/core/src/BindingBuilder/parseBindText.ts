import { IFilterText, IBindText } from "./types";

/**
 * Helper function to trim whitespace from string
 */
const trim = (s: string): string => s.trim();

/**
 * Helper function to check if string is not empty
 */
const has = (s: string): boolean => s.length > 0;

/**
 * Regular expression to detect URL-encoded strings
 * Matches strings enclosed in "#...#" format
 */
const re = new RegExp(/^#(.*)#$/);

/**
 * Internal function to decode filter option values.
 * URL-decodes if enclosed in "#...#", otherwise returns as-is.
 * 
 * Usage examples:
 * - "#Hello%20World#" → "Hello World" (URL decode)
 * - "100" → "100" (as-is)
 * - "true" → "true" (as-is)
 * 
 * @param s - String to decode
 * @returns Decoded string
 */
const decode = (s: string): string => {
  const m = re.exec(s);
  return m ? decodeURIComponent(m[1]) : s;
};

/**
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
 * @param text - Filter definition string
 * @returns Parsed filter information
 */
const parseFilter = (text: string): IFilterText => {
  // Split by comma, first is filter name, rest are options
  const [name, ...options] = text.split(",").map(trim);
  return { name, options: options.map(decode) };
};

/**
 * Type definition for property parse result
 */
type ReturnParseStateProperty = { property: string, filters: IFilterText[] };

/**
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
 * @param text - Property expression string
 * @returns Property name and filter array
 */
const parseProperty = (text: string): ReturnParseStateProperty => {
  // Split by pipe, first is property name, rest are filters
  const [property, ...filterTexts] = text.split("|").map(trim);
  return { property, filters: filterTexts.map(parseFilter) };
};

/**
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
 * Usage examples:e examples:
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
 * @param expression - Binding expression string
 * @returns Parsed binding information
 */
const parseExpression = (expression: string): IBindText => {
  // Step 1: Split by "@" to separate binding expression and decorator expression
  const [bindExpression, decoratesExpression = null] = expression.split("@").map(trim);
  
  // Step 2: Convert decorator expression to array by comma (empty array if not exists)
  const decorates = decoratesExpression ? decoratesExpression.split(",").map(trim) : [];
  
  // Step 3: Split binding expression by ":" into node property and state property
  const [nodePropertyText, statePropertyText] = bindExpression.split(":").map(trim);
  
  // Step 4: Parse each property text to extract property name and filters
  // Node property filters = inputFilterTexts (state→node direction)
  const { property: nodeProperty, filters: inputFilterTexts } = parseProperty(nodePropertyText);
  
  // State property filters = outputFilterTexts (node→state direction)
  const { property: stateProperty, filters: outputFilterTexts } = parseProperty(statePropertyText);
  
  // Step 5: Return as structured binding information
  return { nodeProperty, stateProperty, inputFilterTexts, outputFilterTexts, decorates };
};

/**
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
 * @param text - Entire bind text
 * @returns Array of parsed binding information
 */
const parseExpressions = (text: string): IBindText[] => {
  // Split by semicolon → trim → filter empty → parse each expression
  return text.split(";").map(trim).filter(has).map(s => parseExpression(s));
};

/**
 * Cache for parse results
 * When same bind text is parsed multiple times, skip re-parsing to improve performance
 */
const cache: { [key: string]: IBindText[] } = {};

/**
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
 * @param text - Bind text (data-bind attribute value or comment content)
 * @returns Array of structured binding information
 */
export function parseBindText(
  text: string
): IBindText[] {
  // Return empty array immediately for empty string (performance optimization)
  if (text.trim() === "") {
    return [];
  }
  
  // Check cache, if not exists, parse and save to cache
  return cache[text] ?? (cache[text] = parseExpressions(text));
}
