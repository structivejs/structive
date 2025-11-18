import { raiseError } from "../utils.js";
/**
 * フィルターテキスト（nameとoptionsを持つメタデータ）から、
 * 実際に実行可能なフィルター関数（FilterFn）を生成します。
 *
 * 処理フロー:
 * 1. フィルター名でレジストリからフィルター関数を検索
 * 2. 見つからない場合はエラーを発生
 * 3. オプション配列を適用してカスタマイズされたフィルター関数を返す
 *
 * Generates an executable filter function (FilterFn) from filter text metadata
 * (containing name and options).
 *
 * Processing flow:
 * 1. Look up filter function from registry by filter name
 * 2. Raise error if not found
 * 3. Apply options array and return customized filter function
 *
 * @param filters - フィルターレジストリ（名前→ファクトリ関数のマップ） / Filter registry (name -> factory function map)
 * @param text - フィルターメタデータ（名前とオプション配列） / Filter metadata (name and options array)
 * @returns カスタマイズされたフィルター関数 / Customized filter function
 * @throws フィルターが見つからない場合 / When filter is not found
 */
function textToFilter(filters, text) {
    // フィルター名でレジストリから検索
    // Look up filter from registry by name
    const filter = filters[text.name];
    if (!filter) {
        // フィルターが見つからない場合はエラー
        // Raise error when filter is not found
        raiseError({
            code: 'FLT-201',
            message: `Filter not found: ${text.name}`,
            context: { where: 'createFilters.textToFilter', name: text.name },
            docsUrl: './docs/error-codes.md#flt',
        });
    }
    // フィルターファクトリにオプション配列を渡して実行可能な関数を生成
    // 例: filters['currency'](['USD', '2']) => (value) => formatCurrency(value, 'USD', 2)
    // Pass options array to filter factory to generate executable function
    // Example: filters['currency'](['USD', '2']) => (value) => formatCurrency(value, 'USD', 2)
    return filter(text.options);
}
/**
 * フィルターテキスト配列のキャッシュ
 * 同じフィルター配列が複数回使われる場合、毎回生成せずキャッシュから返す
 *
 * Cache for filter text arrays
 * When the same filter array is used multiple times, return from cache instead of regenerating
 */
const cache = new Map();
/**
 * フィルターテキスト配列（メタデータ）から実行可能なフィルター関数配列を生成します。
 * パフォーマンス最適化のため、同じtexts配列に対してはキャッシュを利用します。
 *
 * 処理フロー:
 * 1. キャッシュを確認（同じtexts配列が既に処理済みか）
 * 2. キャッシュヒット時はそれを返す
 * 3. キャッシュミス時は各フィルターテキストをtextToFilterで変換
 * 4. 生成した関数配列をキャッシュに保存
 * 5. フィルター関数配列を返す
 *
 * 使用例:
 * ```typescript
 * const filterTexts = [
 *   { name: 'trim', options: [] },
 *   { name: 'uppercase', options: [] }
 * ];
 * const filterFns = createFilters(registry, filterTexts);
 * // filterFns[0](value) -> trim(value)
 * // filterFns[1](value) -> uppercase(value)
 * ```
 *
 * Generates an array of executable filter functions from filter text array (metadata).
 * Uses cache for the same texts array to optimize performance.
 *
 * Processing flow:
 * 1. Check cache (has this texts array been processed before?)
 * 2. On cache hit, return cached result
 * 3. On cache miss, transform each filter text via textToFilter
 * 4. Store generated function array in cache
 * 5. Return filter function array
 *
 * Usage example:
 * ```typescript
 * const filterTexts = [
 *   { name: 'trim', options: [] },
 *   { name: 'uppercase', options: [] }
 * ];
 * const filterFns = createFilters(registry, filterTexts);
 * // filterFns[0](value) -> trim(value)
 * // filterFns[1](value) -> uppercase(value)
 * ```
 *
 * @param filters - フィルターレジストリ（名前→ファクトリ関数のマップ） / Filter registry (name -> factory function map)
 * @param texts - フィルターメタデータの配列 / Array of filter metadata
 * @returns 実行可能なフィルター関数の配列 / Array of executable filter functions
 */
export function createFilters(filters, texts) {
    // キャッシュを確認
    // Check cache
    let result = cache.get(texts);
    if (typeof result === "undefined") {
        // キャッシュミス: 新規に生成
        // Cache miss: generate new
        result = [];
        // 各フィルターテキストを実行可能な関数に変換
        // Transform each filter text into executable function
        for (let i = 0; i < texts.length; i++) {
            result.push(textToFilter(filters, texts[i]));
        }
        // 生成した関数配列をキャッシュに保存（次回以降の呼び出しで再利用）
        // Store generated function array in cache (reuse in subsequent calls)
        cache.set(texts, result);
    }
    // キャッシュヒットまたは新規生成した結果を返す
    // Return cached or newly generated result
    return result;
}
