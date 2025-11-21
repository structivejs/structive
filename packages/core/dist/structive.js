const globalConfig = {
    "debug": false,
    "locale": "en-US", // The locale of the component, ex. "en-US", default is "en-US"
    "shadowDomMode": "auto", // Shadow DOM mode: "auto" (default) | "none" | "force"
    "enableMainWrapper": true, // Whether to use the main wrapper or not
    "enableRouter": true, // Whether to use the router or not
    "autoInsertMainWrapper": false, // Whether to automatically insert the main wrapper or not
    "autoInit": true, // Whether to automatically initialize the component or not
    "mainTagName": "app-main", // The tag name of the main wrapper, default is "app-main"
    "routerTagName": "view-router", // The tag name of the router, default is "view-router"
    "layoutPath": "", // The path to the layout file, default is ""
    "autoLoadFromImportMap": false, // Whether to automatically load the component from the import map or not
};
function getGlobalConfig() {
    return globalConfig;
}
const config$2 = getGlobalConfig();

function raiseError(messageOrPayload) {
    if (typeof messageOrPayload === "string") {
        throw new Error(messageOrPayload);
    }
    const { message, code, context, hint, docsUrl, severity, cause } = messageOrPayload;
    const err = new Error(message);
    // 追加情報はプロパティとして付与（メッセージは既存互換のまま）
    err.code = code;
    if (context)
        err.context = context;
    if (hint)
        err.hint = hint;
    if (docsUrl)
        err.docsUrl = docsUrl;
    if (severity)
        err.severity = severity;
    if (cause)
        err.cause = cause;
    throw err;
}

/**
 * errorMessages.ts
 *
 * フィルタ関数などで利用するエラーメッセージ生成ユーティリティです。
 *
 * 主な役割:
 * - フィルタのオプションや値の型チェックで条件を満たさない場合に、分かりやすいエラーメッセージを投げる
 * - 関数名を引数に取り、どのフィルタでエラーが発生したかを明示
 *
 * 設計ポイント:
 * - optionsRequired: オプションが必須なフィルタで未指定時にエラー
 * - optionMustBeNumber: オプション値が数値でない場合にエラー
 * - valueMustBeNumber: 値が数値でない場合にエラー
 * - valueMustBeBoolean: 値がbooleanでない場合にエラー
 * - valueMustBeDate: 値がDateでない場合にエラー
 */
function optionsRequired(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires at least one option`,
        context: { fnName },
        docsUrl: "./docs/error-codes.md#flt",
    });
}
function optionMustBeNumber(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a number as option`,
        context: { fnName },
        docsUrl: "./docs/error-codes.md#flt",
    });
}
function valueMustBeNumber(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a number value`,
        context: { fnName },
        docsUrl: "./docs/error-codes.md#flt",
    });
}
function valueMustBeBoolean(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a boolean value`,
        context: { fnName },
        docsUrl: "./docs/error-codes.md#flt",
    });
}
function valueMustBeDate(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a date value`,
        context: { fnName },
        docsUrl: "./docs/error-codes.md#flt",
    });
}

/**
 * builtinFilters.ts
 *
 * Structiveで利用可能な組み込みフィルタ関数群の実装ファイルです。
 *
 * 主な役割:
 * - 数値・文字列・日付・真偽値などの変換・比較・整形・判定用フィルタを提供
 * - フィルタ名ごとにオプション付きの関数を定義し、バインディング時に柔軟に利用可能
 * - input/output両方のフィルタとして共通利用できる設計
 *
 * 設計ポイント:
 * - eq, ne, lt, gt, inc, fix, locale, uc, lc, cap, trim, slice, pad, int, float, round, date, time, ymd, falsy, truthy, defaults, boolean, number, string, null など多彩なフィルタを網羅
 * - オプション値の型チェックやエラーハンドリングも充実
 * - FilterWithOptions型でフィルタ関数群を一元管理し、拡張も容易
 * - builtinFilterFnでフィルタ名・オプションからフィルタ関数を動的に取得可能
 */
const config$1 = getGlobalConfig();
const eq = (options) => {
    const opt = options?.[0] ?? optionsRequired('eq');
    return (value) => {
        // 型を揃えて比較
        if (typeof value === 'number') {
            const optValue = Number(opt);
            if (isNaN(optValue))
                optionMustBeNumber('eq');
            return value === optValue;
        }
        if (typeof value === 'string') {
            return value === opt;
        }
        // その他は厳密等価
        return value === opt;
    };
};
const ne = (options) => {
    const opt = options?.[0] ?? optionsRequired('ne');
    return (value) => {
        // 型を揃えて比較
        if (typeof value === 'number') {
            const optValue = Number(opt);
            if (isNaN(optValue))
                optionMustBeNumber('ne');
            return value !== optValue;
        }
        if (typeof value === 'string') {
            return value !== opt;
        }
        // その他は厳密等価
        return value !== opt;
    };
};
const not = (options) => {
    return (value) => {
        if (typeof value !== 'boolean')
            valueMustBeBoolean('not');
        return !value;
    };
};
const lt = (options) => {
    const opt = options?.[0] ?? optionsRequired('lt');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('lt');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('lt');
        return value < optValue;
    };
};
const le = (options) => {
    const opt = options?.[0] ?? optionsRequired('le');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('le');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('le');
        return value <= optValue;
    };
};
const gt = (options) => {
    const opt = options?.[0] ?? optionsRequired('gt');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('gt');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('gt');
        return value > optValue;
    };
};
const ge = (options) => {
    const opt = options?.[0] ?? optionsRequired('ge');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('ge');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('ge');
        return value >= optValue;
    };
};
const inc = (options) => {
    const opt = options?.[0] ?? optionsRequired('inc');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('inc');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('inc');
        return value + optValue;
    };
};
const dec = (options) => {
    const opt = options?.[0] ?? optionsRequired('dec');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('dec');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('dec');
        return value - optValue;
    };
};
const mul = (options) => {
    const opt = options?.[0] ?? optionsRequired('mul');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('mul');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('mul');
        return value * optValue;
    };
};
const div = (options) => {
    const opt = options?.[0] ?? optionsRequired('div');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('div');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('div');
        return value / optValue;
    };
};
const mod = (options) => {
    const opt = options?.[0] ?? optionsRequired('mod');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('mod');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('mod');
        return value % optValue;
    };
};
const fix = (options) => {
    const opt = options?.[0] ?? 0;
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('fix');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('fix');
        return value.toFixed(optValue);
    };
};
const locale = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('locale');
        return value.toLocaleString(opt);
    };
};
const uc = (options) => {
    return (value) => {
        return value.toString().toUpperCase();
    };
};
const lc = (options) => {
    return (value) => {
        return value.toString().toLowerCase();
    };
};
const cap = (options) => {
    return (value) => {
        const v = value.toString();
        if (v.length === 0)
            return v;
        if (v.length === 1)
            return v.toUpperCase();
        return v.charAt(0).toUpperCase() + v.slice(1);
    };
};
const trim$1 = (options) => {
    return (value) => {
        return value.toString().trim();
    };
};
const slice = (options) => {
    const opt = options?.[0] ?? optionsRequired('slice');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('slice');
    return (value) => {
        return value.toString().slice(optValue);
    };
};
const substr = (options) => {
    const opt1 = options?.[0] ?? optionsRequired('substr');
    const opt1Value = Number(opt1);
    if (isNaN(opt1Value))
        optionMustBeNumber('substr');
    const opt2 = options?.[1] ?? optionsRequired('substr');
    const opt2Value = Number(opt2);
    if (isNaN(opt2Value))
        optionMustBeNumber('substr');
    return (value) => {
        return value.toString().substr(opt1Value, opt2Value);
    };
};
const pad = (options) => {
    const opt1 = options?.[0] ?? optionsRequired('pad');
    const opt1Value = Number(opt1);
    if (isNaN(opt1Value))
        optionMustBeNumber('pad');
    const opt2 = options?.[1] ?? '0';
    const opt2Value = opt2;
    return (value) => {
        return value.toString().padStart(opt1Value, opt2Value);
    };
};
const rep = (options) => {
    const opt = options?.[0] ?? optionsRequired('rep');
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('rep');
    return (value) => {
        return value.toString().repeat(optValue);
    };
};
const rev = (options) => {
    return (value) => {
        return value.toString().split('').reverse().join('');
    };
};
const int = (options) => {
    return (value) => {
        return parseInt(value, 10);
    };
};
const float = (options) => {
    return (value) => {
        return parseFloat(value);
    };
};
const round = (options) => {
    const opt = options?.[0] ?? 0;
    const optValue = Math.pow(10, Number(opt));
    if (isNaN(optValue))
        optionMustBeNumber('round');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('round');
        return Math.round(value * optValue) / optValue;
    };
};
const floor = (options) => {
    const opt = options?.[0] ?? 0;
    const optValue = Math.pow(10, Number(opt));
    if (isNaN(optValue))
        optionMustBeNumber('floor');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('floor');
        return Math.floor(value * optValue) / optValue;
    };
};
const ceil = (options) => {
    const opt = options?.[0] ?? 0;
    const optValue = Math.pow(10, Number(opt));
    if (isNaN(optValue))
        optionMustBeNumber('ceil');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('ceil');
        return Math.ceil(value * optValue) / optValue;
    };
};
const percent = (options) => {
    const opt = options?.[0] ?? 0;
    const optValue = Number(opt);
    if (isNaN(optValue))
        optionMustBeNumber('percent');
    return (value) => {
        if (typeof value !== 'number')
            valueMustBeNumber('percent');
        return (value * 100).toFixed(optValue) + '%';
    };
};
const date = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date))
            valueMustBeDate('date');
        return value.toLocaleDateString(opt);
    };
};
const time = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date))
            valueMustBeDate('time');
        return value.toLocaleTimeString(opt);
    };
};
const datetime = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date))
            valueMustBeDate('datetime');
        return value.toLocaleString(opt);
    };
};
const ymd = (options) => {
    const opt = options?.[0] ?? '-';
    return (value) => {
        if (!(value instanceof Date))
            valueMustBeDate('ymd');
        const year = value.getFullYear().toString();
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const day = value.getDate().toString().padStart(2, '0');
        return `${year}${opt}${month}${opt}${day}`;
    };
};
const falsy = (options) => {
    return (value) => value === false || value === null || value === undefined || value === 0 || value === '' || Number.isNaN(value);
};
const truthy = (options) => {
    return (value) => value !== false && value !== null && value !== undefined && value !== 0 && value !== '' && !Number.isNaN(value);
};
const defaults = (options) => {
    const opt = options?.[0] ?? optionsRequired('defaults');
    return (value) => {
        if (value === false || value === null || value === undefined || value === 0 || value === '' || Number.isNaN(value))
            return opt;
        return value;
    };
};
const boolean = (options) => {
    return (value) => {
        return Boolean(value);
    };
};
const number = (options) => {
    return (value) => {
        return Number(value);
    };
};
const string = (options) => {
    return (value) => {
        return String(value);
    };
};
const _null = (options) => {
    return (value) => {
        return (value === "") ? null : value;
    };
};
const builtinFilters = {
    "eq": eq,
    "ne": ne,
    "not": not,
    "lt": lt,
    "le": le,
    "gt": gt,
    "ge": ge,
    "inc": inc,
    "dec": dec,
    "mul": mul,
    "div": div,
    "mod": mod,
    "fix": fix,
    "locale": locale,
    "uc": uc,
    "lc": lc,
    "cap": cap,
    "trim": trim$1,
    "slice": slice,
    "substr": substr,
    "pad": pad,
    "rep": rep,
    "rev": rev,
    "int": int,
    "float": float,
    "round": round,
    "floor": floor,
    "ceil": ceil,
    "percent": percent,
    "date": date,
    "time": time,
    "datetime": datetime,
    "ymd": ymd,
    "falsy": falsy,
    "truthy": truthy,
    "defaults": defaults,
    "boolean": boolean,
    "number": number,
    "string": string,
    "null": _null,
};
const outputBuiltinFilters = builtinFilters;
const inputBuiltinFilters = builtinFilters;

let id$2 = 0;
function generateId() {
    return ++id$2;
}

/**
 * registerStateClass.ts
 *
 * StateClassインスタンスをIDで登録・取得するための管理モジュールです。
 *
 * 主な役割:
 * - stateClassById: IDをキーにStateClassインスタンスを管理するレコード
 * - registerStateClass: 指定IDでStateClassインスタンスを登録
 * - getStateClassById: 指定IDのStateClassインスタンスを取得（未登録時はエラーを投げる）
 *
 * 設計ポイント:
 * - グローバルにStateClassインスタンスを一元管理し、ID経由で高速にアクセス可能
 * - 存在しないIDアクセス時はraiseErrorで明確な例外を発生
 */
const stateClassById = {};
function registerStateClass(id, stateClass) {
    stateClassById[id] = stateClass;
}
function getStateClassById(id) {
    return stateClassById[id] ?? raiseError({
        code: "STATE-101",
        message: `StateClass not found: ${id}`,
        context: { where: 'registerStateClass.getStateClassById', stateClassId: id },
        docsUrl: "./docs/error-codes.md#state",
    });
}

/**
 * registerStyleSheet.ts
 *
 * CSSStyleSheetインスタンスをIDで登録・取得するための管理モジュールです。
 *
 * 主な役割:
 * - styleSheetById: IDをキーにCSSStyleSheetインスタンスを管理するレコード
 * - registerStyleSheet: 指定IDでCSSStyleSheetインスタンスを登録
 * - getStyleSheetById: 指定IDのCSSStyleSheetインスタンスを取得（未登録時はエラーを投げる）
 *
 * 設計ポイント:
 * - グローバルにCSSStyleSheetインスタンスを一元管理し、ID経由で高速にアクセス可能
 * - 存在しないIDアクセス時はraiseErrorで明確な例外を発生
 */
const styleSheetById = {};
function registerStyleSheet(id, css) {
    styleSheetById[id] = css;
}
function getStyleSheetById(id) {
    return styleSheetById[id] ?? raiseError({
        code: "CSS-001",
        message: `Stylesheet not found: ${id}`,
        context: { where: 'registerStyleSheet.getStyleSheetById', styleSheetId: id },
        docsUrl: "./docs/error-codes.md#css",
    });
}

/**
 * regsiterCss.ts
 *
 * CSS文字列をCSSStyleSheetとして生成し、IDで登録するユーティリティ関数です。
 *
 * 主な役割:
 * - CSS文字列からCSSStyleSheetインスタンスを生成
 * - registerStyleSheetを利用して、指定IDでCSSStyleSheetを登録
 *
 * 設計ポイント:
 * - styleSheet.replaceSyncで同期的にCSSを適用
 * - グローバルなスタイル管理や動的スタイル適用に利用可能
 */
function registerCss(id, css) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(css);
    registerStyleSheet(id, styleSheet);
}

/**
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
 * @param root - Root node as starting point for traversal
 * @param path - Index array for each level (NodePath)
 * @returns Node specified by path, or null
 */
function resolveNodeFromPath(root, path) {
    // Step 1: Set root node as starting point
    let node = root;
    // Step 2: Return root node if path is empty
    if (path.length === 0)
        return node;
    // Step 3: Traverse each index in path sequentially
    // Using for loop instead of path.reduce() to explicitly check and break when null
    for (let i = 0; i < path.length; i++) {
        // Get childNodes[index] of current node (null if doesn't exist)
        node = node?.childNodes[path[i]] ?? null;
        // Break loop if node doesn't exist
        if (node === null)
            break;
    }
    // Step 4: Return final node (or null)
    return node;
}

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
function getAbsoluteNodePath(node) {
    // Array to store result (indexes arranged from root to leaf)
    let routeIndexes = [];
    // Loop while parent node exists (until reaching root)
    while (node.parentNode !== null) {
        // Convert parent node's childNodes to array
        const childNodes = Array.from(node.parentNode.childNodes);
        // Get index of current node within parent's childNodes and prepend to array
        // Prepending maintains root→leaf order
        routeIndexes = [childNodes.indexOf(node), ...routeIndexes];
        // Move to parent node for next iteration
        node = node.parentNode;
    }
    // Return index array from root
    return routeIndexes;
}

/**
 * Generates an executable filter function (FilterFn) from filter text metadata
 * (containing name and options).
 *
 * Processing flow:
 * 1. Look up filter function from registry by filter name
 * 2. Raise error if not found
 * 3. Apply options array and return customized filter function
 *
 * @param filters - Filter registry (name -> factory function map)
 * @param text - Filter metadata (name and options array)
 * @returns Customized filter function
 * @throws When filter is not found
 */
function textToFilter(filters, text) {
    // Look up filter from registry by name
    const filter = filters[text.name];
    if (!filter) {
        // Raise error when filter is not found
        raiseError({
            code: 'FLT-201',
            message: `Filter not found: ${text.name}`,
            context: { where: 'createFilters.textToFilter', name: text.name },
            docsUrl: './docs/error-codes.md#flt',
        });
    }
    // Pass options array to filter factory to generate executable function
    // Example: filters['currency'](['USD', '2']) => (value) => formatCurrency(value, 'USD', 2)
    return filter(text.options);
}
/**
 * Cache for filter text arrays
 * When the same filter array is used multiple times, return from cache instead of regenerating
 */
const cache$2 = new Map();
/**
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
 * @param filters - Filter registry (name -> factory function map)
 * @param texts - Array of filter metadata
 * @returns Array of executable filter functions
 */
function createFilters(filters, texts) {
    // Check cache
    let result = cache$2.get(texts);
    if (typeof result === "undefined") {
        // Cache miss: generate new
        result = [];
        // Transform each filter text into executable function
        for (let i = 0; i < texts.length; i++) {
            result.push(textToFilter(filters, texts[i]));
        }
        // Store generated function array in cache (reuse in subsequent calls)
        cache$2.set(texts, result);
    }
    // Return cached or newly generated result
    return result;
}

/**
 * BindingNode class is the base class for binding processing on a single target node (Element, Text, etc.).
 *
 * Architecture:
 * - _binding: Reference to parent binding (IBinding)
 * - _node: Target DOM node for binding
 * - _name: Property name of binding (e.g., "textContent", "value")
 * - _filters: Array of filter functions applied when retrieving value
 * - _decorates: Array of decorator strings (e.g., ["prevent", "stop"])
 * - _bindContents: Array of child BindContent (for structural control bindings)
 *
 * Main responsibilities:
 * 1. Hold node, property name, filters, decorators, and binding info
 * 2. Provide interface for binding value update (applyChange → assignValue)
 * 3. Manage multiple bind contents (bindContents) for structural control bindings
 * 4. Extend binding processing per node/property type by implementing assignValue, updateElements in subclasses
 *
 * Design patterns:
 * - Template Method: applyChange provides common flow, assignValue implemented in subclasses
 * - Strategy: Customize behavior with filters and decorators
 *
 * Subclasses:
 * - BindingNodeAttribute: Attribute binding
 * - BindingNodeProperty*: Property binding (value, checked, etc.)
 * - BindingNodeEvent*: Event binding
 * - BindingNodeFor, BindingNodeIf: Structural control binding
 *
 * Design points:
 * - assignValue, updateElements are unimplemented (must override in subclasses)
 * - isSelectElement, value, filteredValue etc. extended in subclasses as needed
 * - Flexible handling of filters, decorators, and bind contents
 */
class BindingNode {
    _binding;
    _node;
    _name;
    _subName;
    _filters;
    _decorates;
    /**
     * Getter to return target DOM node for binding.
     *
     * @returns Target DOM node
     */
    get node() {
        return this._node;
    }
    /**
     * Getter to return property name of binding (e.g., "textContent", "value").
     *
     * @returns Property name string
     */
    get name() {
        return this._name;
    }
    /**
     * Getter to return sub-property name (same as name in base class, can be overridden in subclasses).
     *
     * @returns Sub-property name string
     */
    get subName() {
        return this._subName;
    }
    /**
     * Getter to return parent binding (IBinding).
     *
     * @returns Parent IBinding instance
     */
    get binding() {
        return this._binding;
    }
    /**
     * Getter to return array of decorator strings (e.g., ["prevent", "stop"]).
     *
     * @returns Array of decorator strings
     */
    get decorates() {
        return this._decorates;
    }
    /**
     * Getter to return array of filter functions.
     *
     * @returns Array of filter functions
     */
    get filters() {
        return this._filters;
    }
    /**
     * Getter to return array of child BindContent (for structural control bindings).
     *
     * @returns Array of IBindContent instances (empty in base class)
     */
    get bindContents() {
        return [];
    }
    /**
     * Constructor.
     * - binding: Parent binding
     * - node: Target DOM node for binding
     * - name: Property name of binding
     * - filters: Array of filter functions
     * - decorates: Array of decorator strings
     *
     * Initialization process:
     * 1. Save all parameters to private fields
     * 2. bindContents initialized as empty array
     * 3. Subclasses can implement additional initialization in activate()
     *
     * @param binding - Parent IBinding instance
     * @param node - Target DOM node
     * @param name - Property name of binding
     * @param subName - Sub-property name
     * @param filters - Array of filter functions
     * @param decorates - Array of decorator strings
     */
    constructor(binding, node, name, subName, filters, decorates) {
        this._binding = binding;
        this._node = node;
        this._name = name;
        this._subName = subName;
        this._filters = filters;
        this._decorates = decorates;
    }
    /**
     * Method to assign value to DOM (unimplemented in base class, must override in subclasses).
     * - Attribute binding: Set attribute value
     * - Property binding: Set property value
     * - Event binding: Register event listener
     * - Structural control binding: Modify DOM structure
     *
     * @param value - Value to assign to DOM
     * @throws BIND-301 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Method to batch update multiple elements (unimplemented in base class, override in structural control bindings).
     * - BindingNodeFor: Batch update of loop items
     * - Other bindings: Normally not used
     *
     * @param listIndexes - Array of list indices
     * @param values - Array of values
     * @throws BIND-301 Not implemented
     */
    updateElements(listIndexes, values) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.updateElements', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Redraw notification method (empty implementation in base class, can override in subclasses).
     * - Used to update related bindings after dynamic dependency resolution
     * - Used in structural control bindings to notify child BindContent
     *
     * @param refs - Array of state references for redraw
     */
    notifyRedraw(refs) {
        // Subclasses can implement notification considering parent-child relationships
    }
    /**
     * Change application method (Template Method pattern).
     * - Retrieves filtered value from BindingState
     * - Calls assignValue to reflect to DOM
     * - Subclasses override assignValue to implement specific processing
     *
     * @param renderer - Renderer instance for state access
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        this.assignValue(filteredValue);
    }
    /**
     * Method to activate binding node (empty implementation in base class, can override in subclasses).
     * - Execute initial rendering
     * - Register event listeners (event binding)
     * - Initialize child BindContent (structural control binding)
     */
    activate() {
        // Subclasses can implement activation processing
    }
    /**
     * Method to inactivate binding node (empty implementation in base class, can override in subclasses).
     * - Unregister event listeners (event binding)
     * - Cleanup child BindContent (structural control binding)
     */
    inactivate() {
        // Subclasses can implement inactivation processing
    }
    /**
     * Getter to determine if node is HTMLSelectElement.
     * Used for special handling of select elements in property binding.
     *
     * @returns true if node is HTMLSelectElement, false otherwise
     */
    get isSelectElement() {
        return this.node instanceof HTMLSelectElement;
    }
    /**
     * Getter to return current value (null in base class, override in subclasses).
     * Used to get current DOM value in bidirectional binding.
     *
     * @returns Current value or null
     */
    get value() {
        return null;
    }
    /**
     * Getter to return filtered value (null in base class, override in subclasses).
     * Used to get filtered DOM value in bidirectional binding.
     *
     * @returns Filtered value or null
     */
    get filteredValue() {
        return null;
    }
}

/**
 * BindingNodeAttribute class implements binding node for attribute bindings (e.g., attr.src, attr.alt).
 * Converts null/undefined/NaN to empty string to conform to HTML spec.
 */
class BindingNodeAttribute extends BindingNode {
    /**
     * Assigns attribute value to DOM element.
     * Converts null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to attribute
     */
    assignValue(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        const element = this.node;
        element.setAttribute(this.subName, value.toString());
    }
}
/**
 * Factory function to generate attribute binding node.
 *
 * @param name - Binding name (e.g., "attr.src", "attr.alt")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeAttribute with binding, node, and filters
 */
const createBindingNodeAttribute = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeAttribute(binding, node, name, subName, filterFns, decorates);
};

const DATA_BIND_ATTRIBUTE = "data-bind";
const COMMENT_EMBED_MARK = "@@:"; // 埋め込み変数のマーク
const COMMENT_TEMPLATE_MARK = "@@|"; // テンプレートのマーク
const MAX_WILDCARD_DEPTH = 32; // ワイルドカードの最大深度
const WILDCARD = "*"; // ワイルドカード
const RESERVED_WORD_SET = new Set([
    "constructor", "prototype", "__proto__", "toString",
    "valueOf", "hasOwnProperty", "isPrototypeOf",
    "watch", "unwatch", "eval", "arguments",
    "let", "var", "const", "class", "function",
    "null", "true", "false", "new", "return",
]);
const CONNECTED_CALLBACK_FUNC_NAME = "$connectedCallback";
const DISCONNECTED_CALLBACK_FUNC_NAME = "$disconnectedCallback";
const UPDATED_CALLBACK_FUNC_NAME = "$updatedCallback";

/**
 * getStructuredPathInfo.ts
 *
 * Stateプロパティのパス文字列から、詳細な構造化パス情報（IStructuredPathInfo）を生成・キャッシュするユーティリティです。
 *
 * 主な役割:
 * - パス文字列を分割し、各セグメントやワイルドカード（*）の位置・親子関係などを解析
 * - cumulativePaths/wildcardPaths/parentPathなど、パス階層やワイルドカード階層の情報を構造化
 * - 解析結果をIStructuredPathInfoとしてキャッシュし、再利用性とパフォーマンスを両立
 * - reservedWords（予約語）チェックで安全性を担保
 *
 * 設計ポイント:
 * - パスごとにキャッシュし、同じパスへの複数回アクセスでも高速に取得可能
 * - ワイルドカードや親子関係、階層構造を厳密に解析し、バインディングや多重ループに最適化
 * - childrenプロパティでパス階層のツリー構造も構築
 * - 予約語や危険なパスはraiseErrorで例外を発生
 */
/**
 * プロパティ名に"constructor"や"toString"などの予約語やオブジェクトのプロパティ名を
 * 上書きするような名前も指定できるように、Mapを検討したが、そもそもそのような名前を
 * 指定することはないと考え、Mapを使わないことにした。
 */
const _cache$2 = {};
/**
 * パターン情報を取得します
 * @param pattern パターン
 * @returns {IPatternInfo} パターン情報
 */
class StructuredPathInfo {
    static id = 0;
    id = ++StructuredPathInfo.id;
    sid = this.id.toString();
    pattern;
    pathSegments;
    lastSegment;
    cumulativePaths;
    cumulativePathSet;
    cumulativeInfos;
    cumulativeInfoSet;
    wildcardPaths;
    wildcardPathSet;
    wildcardInfos;
    indexByWildcardPath;
    wildcardInfoSet;
    wildcardParentPaths;
    wildcardParentPathSet;
    wildcardParentInfos;
    wildcardParentInfoSet;
    lastWildcardPath;
    lastWildcardInfo;
    parentPath;
    parentInfo;
    wildcardCount;
    children = {};
    constructor(pattern) {
        const getPattern = (_pattern) => {
            return (pattern === _pattern) ? this : getStructuredPathInfo(_pattern);
        };
        const pathSegments = pattern.split(".");
        const cumulativePaths = [];
        const cumulativeInfos = [];
        const wildcardPaths = [];
        const indexByWildcardPath = {};
        const wildcardInfos = [];
        const wildcardParentPaths = [];
        const wildcardParentInfos = [];
        let currentPatternPath = "", prevPatternPath = "";
        let wildcardCount = 0;
        for (let i = 0; i < pathSegments.length; i++) {
            currentPatternPath += pathSegments[i];
            if (pathSegments[i] === "*") {
                wildcardPaths.push(currentPatternPath);
                indexByWildcardPath[currentPatternPath] = wildcardCount;
                wildcardInfos.push(getPattern(currentPatternPath));
                wildcardParentPaths.push(prevPatternPath);
                wildcardParentInfos.push(getPattern(prevPatternPath));
                wildcardCount++;
            }
            cumulativePaths.push(currentPatternPath);
            cumulativeInfos.push(getPattern(currentPatternPath));
            prevPatternPath = currentPatternPath;
            currentPatternPath += ".";
        }
        const lastWildcardPath = wildcardPaths.length > 0 ? wildcardPaths[wildcardPaths.length - 1] : null;
        const parentPath = cumulativePaths.length > 1 ? cumulativePaths[cumulativePaths.length - 2] : null;
        this.pattern = pattern;
        this.pathSegments = pathSegments;
        this.lastSegment = pathSegments[pathSegments.length - 1];
        this.cumulativePaths = cumulativePaths;
        this.cumulativePathSet = new Set(cumulativePaths);
        this.cumulativeInfos = cumulativeInfos;
        this.cumulativeInfoSet = new Set(cumulativeInfos);
        this.wildcardPaths = wildcardPaths;
        this.wildcardPathSet = new Set(wildcardPaths);
        this.indexByWildcardPath = indexByWildcardPath;
        this.wildcardInfos = wildcardInfos;
        this.wildcardInfoSet = new Set(wildcardInfos);
        this.wildcardParentPaths = wildcardParentPaths;
        this.wildcardParentPathSet = new Set(wildcardParentPaths);
        this.wildcardParentInfos = wildcardParentInfos;
        this.wildcardParentInfoSet = new Set(wildcardParentInfos);
        this.lastWildcardPath = lastWildcardPath;
        this.lastWildcardInfo = lastWildcardPath ? getPattern(lastWildcardPath) : null;
        this.parentPath = parentPath;
        this.parentInfo = parentPath ? getPattern(parentPath) : null;
        this.wildcardCount = wildcardCount;
        if (this.parentInfo) {
            this.parentInfo.children[this.lastSegment] = this;
        }
    }
}
function getStructuredPathInfo(structuredPath) {
    if (RESERVED_WORD_SET.has(structuredPath)) {
        raiseError({
            code: 'STATE-202',
            message: `Pattern is reserved word: ${structuredPath}`,
            context: { where: 'getStructuredPathInfo', structuredPath },
            docsUrl: './docs/error-codes.md#state',
        });
    }
    const info = _cache$2[structuredPath];
    if (typeof info !== "undefined") {
        return info;
    }
    return (_cache$2[structuredPath] = new StructuredPathInfo(structuredPath));
}

class NodePath {
    parentPath;
    currentPath;
    name;
    childNodeByName;
    level;
    constructor(parentPath, name, level) {
        this.parentPath = parentPath;
        this.currentPath = parentPath ? parentPath + "." + name : name;
        this.name = name;
        this.level = level;
        this.childNodeByName = new Map();
    }
    find(segments, segIndex = 0) {
        if (segIndex >= segments.length) {
            return null;
        }
        const currentSegment = segments[segIndex];
        const childNode = this.childNodeByName.get(currentSegment);
        if (childNode) {
            if (segIndex === segments.length - 1) {
                return childNode;
            }
            return childNode.find(segments, segIndex + 1);
        }
        return null;
    }
    appendChild(childName) {
        let childNode = this.childNodeByName.get(childName);
        if (!childNode) {
            const currentPath = this.parentPath ? this.parentPath + "." + this.name : this.name;
            childNode = new NodePath(currentPath, childName, this.level + 1);
            this.childNodeByName.set(childName, childNode);
        }
        return childNode;
    }
}
function createRootNode() {
    return new NodePath("", "", 0);
}
const cache$1 = new Map();
function findPathNodeByPath(rootNode, path) {
    let nodeCache = cache$1.get(rootNode);
    if (!nodeCache) {
        nodeCache = new Map();
        cache$1.set(rootNode, nodeCache);
    }
    let cachedNode = nodeCache.get(path) ?? null;
    if (cachedNode) {
        return cachedNode;
    }
    const info = getStructuredPathInfo(path);
    cachedNode = rootNode.find(info.pathSegments);
    nodeCache.set(path, cachedNode);
    return cachedNode;
}
function addPathNode(rootNode, path) {
    const info = getStructuredPathInfo(path);
    if (info.parentPath === null) {
        return rootNode.appendChild(path);
    }
    else {
        let parentNode = findPathNodeByPath(rootNode, info.parentPath);
        if (parentNode === null) {
            parentNode = addPathNode(rootNode, info.parentPath);
        }
        return parentNode.appendChild(info.lastSegment);
    }
}

const symbolName$1 = "state";
const GetByRefSymbol = Symbol.for(`${symbolName$1}.GetByRef`);
const SetByRefSymbol = Symbol.for(`${symbolName$1}.SetByRef`);
const ConnectedCallbackSymbol = Symbol.for(`${symbolName$1}.ConnectedCallback`);
const DisconnectedCallbackSymbol = Symbol.for(`${symbolName$1}.DisconnectedCallback`);
const UpdatedCallbackSymbol = Symbol.for(`${symbolName$1}.UpdatedCallback`);
const GetListIndexesByRefSymbol = Symbol.for(`${symbolName$1}.GetListIndexesByRef`);

/**
 * プロパティ名に"constructor"や"toString"などの予約語やオブジェクトのプロパティ名を
 * 上書きするような名前も指定できるように、Mapを検討したが、そもそもそのような名前を
 * 指定することはないと考え、Mapを使わないことにした。
 */
const _cache$1 = new Map();
class ResolvedPathInfo {
    static id = 0;
    id = ++ResolvedPathInfo.id;
    name;
    elements;
    paths;
    wildcardCount;
    wildcardType;
    wildcardIndexes;
    info;
    constructor(name) {
        const elements = name.split(".");
        const tmpPatternElements = elements.slice();
        const paths = [];
        let incompleteCount = 0;
        let completeCount = 0;
        let lastPath = "";
        let wildcardCount = 0;
        let wildcardType = "none";
        let wildcardIndexes = [];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element === "*") {
                tmpPatternElements[i] = "*";
                wildcardIndexes.push(null);
                incompleteCount++;
                wildcardCount++;
            }
            else {
                const number = Number(element);
                if (!Number.isNaN(number)) {
                    tmpPatternElements[i] = "*";
                    wildcardIndexes.push(number);
                    completeCount++;
                    wildcardCount++;
                }
            }
            lastPath += element;
            paths.push(lastPath);
            lastPath += (i < elements.length - 1 ? "." : "");
        }
        const pattern = tmpPatternElements.join(".");
        const info = getStructuredPathInfo(pattern);
        if (incompleteCount > 0 || completeCount > 0) {
            if (incompleteCount === wildcardCount) {
                wildcardType = "context";
            }
            else if (completeCount === wildcardCount) {
                wildcardType = "all";
            }
            else {
                wildcardType = "partial";
            }
        }
        this.name = name;
        this.elements = elements;
        this.paths = paths;
        this.wildcardCount = wildcardCount;
        this.wildcardType = wildcardType;
        this.wildcardIndexes = wildcardIndexes;
        this.info = info;
    }
}
function getResolvedPathInfo(name) {
    let nameInfo;
    return _cache$1.get(name) ?? (_cache$1.set(name, nameInfo = new ResolvedPathInfo(name)), nameInfo);
}

class StatePropertyRef {
    info;
    #listIndexRef;
    get listIndex() {
        if (this.#listIndexRef === null)
            return null;
        return this.#listIndexRef.deref() ?? raiseError({
            code: "LIST-201",
            message: "listIndex is null",
            context: { sid: this.info.sid, key: this.key },
            docsUrl: "./docs/error-codes.md#list",
        });
    }
    key;
    constructor(info, listIndex) {
        this.info = info;
        this.#listIndexRef = listIndex !== null ? new WeakRef(listIndex) : null;
        this.key = (listIndex == null) ? info.sid : (info.sid + "#" + listIndex.sid);
    }
    get parentRef() {
        const parentInfo = this.info.parentInfo;
        if (!parentInfo)
            return null;
        const parentListIndex = (this.info.wildcardCount > parentInfo.wildcardCount ? this.listIndex?.at(-2) : this.listIndex) ?? null;
        return getStatePropertyRef(parentInfo, parentListIndex);
    }
}
const refByInfoByListIndex = new WeakMap();
const refByInfoByNull = {};
function getStatePropertyRef(info, listIndex) {
    let ref = null;
    if (listIndex !== null) {
        let refByInfo;
        if (typeof (refByInfo = refByInfoByListIndex.get(listIndex)) === "undefined") {
            ref = new StatePropertyRef(info, listIndex);
            refByInfoByListIndex.set(listIndex, { [info.pattern]: ref });
        }
        else {
            if (typeof (ref = refByInfo[info.pattern]) === "undefined") {
                return refByInfo[info.pattern] = new StatePropertyRef(info, listIndex);
            }
        }
    }
    else {
        if (typeof (ref = refByInfoByNull[info.pattern]) === "undefined") {
            return refByInfoByNull[info.pattern] = new StatePropertyRef(info, null);
        }
    }
    return ref;
}

function getContextListIndex(handler, structuredPath) {
    const ref = handler.lastRefStack;
    if (ref == null) {
        return null;
    }
    if (ref.info == null) {
        return null;
    }
    if (ref.listIndex == null) {
        return null;
    }
    const index = ref.info.indexByWildcardPath[structuredPath];
    if (typeof index !== "undefined") {
        return ref.listIndex.at(index);
    }
    return null;
}

function getListIndex(resolvedPath, receiver, handler) {
    switch (resolvedPath.wildcardType) {
        case "none":
            return null;
        case "context":
            const lastWildcardPath = resolvedPath.info.lastWildcardPath ??
                raiseError({
                    code: 'STATE-202',
                    message: 'lastWildcardPath is null',
                    context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
                    docsUrl: '/docs/error-codes.md#state',
                });
            return getContextListIndex(handler, lastWildcardPath) ??
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${resolvedPath.info.pattern}`,
                    context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
                    docsUrl: '/docs/error-codes.md#list',
                });
        case "all":
            let parentListIndex = null;
            for (let i = 0; i < resolvedPath.info.wildcardCount; i++) {
                const wildcardParentPattern = resolvedPath.info.wildcardParentInfos[i] ??
                    raiseError({
                        code: 'STATE-202',
                        message: 'wildcardParentPattern is null',
                        context: { where: 'getListIndex', pattern: resolvedPath.info.pattern, index: i },
                        docsUrl: '/docs/error-codes.md#state',
                    });
                const wildcardRef = getStatePropertyRef(wildcardParentPattern, parentListIndex);
                const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef) ??
                    raiseError({
                        code: 'LIST-201',
                        message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                        context: { where: 'getListIndex', wildcardParent: wildcardParentPattern.pattern },
                        docsUrl: '/docs/error-codes.md#list',
                    });
                const wildcardIndex = resolvedPath.wildcardIndexes[i] ??
                    raiseError({
                        code: 'STATE-202',
                        message: 'wildcardIndex is null',
                        context: { where: 'getListIndex', pattern: resolvedPath.info.pattern, index: i },
                        docsUrl: '/docs/error-codes.md#state',
                    });
                parentListIndex = listIndexes[wildcardIndex] ??
                    raiseError({
                        code: 'LIST-201',
                        message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                        context: { where: 'getListIndex', wildcardParent: wildcardParentPattern.pattern, wildcardIndex },
                        docsUrl: '/docs/error-codes.md#list',
                    });
            }
            return parentListIndex;
        case "partial":
            raiseError({
                code: 'STATE-202',
                message: `Partial wildcard type is not supported yet: ${resolvedPath.info.pattern}`,
                context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
                docsUrl: '/docs/error-codes.md#state',
            });
    }
}

/**
 * trackDependency.ts
 *
 * StateClassのAPIとして、getterチェーン中に参照されたパス間の
 * 依存関係を動的に登録するための関数（trackDependency）の実装です。
 *
 * 主な役割:
 * - 現在解決中のStatePropertyRef（lastRefStack）を取得
 * - pathManager.gettersに登録されているgetterの場合のみ依存を追跡
 * - 自身と同一パターンでない参照に対してaddDynamicDependencyを呼び出す
 *
 * 設計ポイント:
 * - lastRefStackが存在しない場合はSTATE-202エラーを発生させる
 * - getter同士の再帰（自己依存）は登録しない
 * - 動的依存はpathManagerに集約し、キャッシュの無効化に利用する
 */
/**
 * 現在解決中のgetterから、指定されたパスへの動的依存を登録する関数を返します。
 *
 * - pathManager.gettersに登録されているgetterのみ依存追跡を行う
 * - 自己参照は除外し、異なるパターン間の依存だけを記録
 * - 動的依存はpathManager.addDynamicDependencyで集中管理される
 *
 * @param target   プロキシ対象オブジェクト
 * @param prop     アクセスされたプロパティキー
 * @param receiver プロキシレシーバ
 * @param handler  StateClassハンドラ
 * @returns        引数pathで指定されたパターンへの依存を登録する無名関数
 */
function trackDependency(target, prop, receiver, handler) {
    return (path) => {
        const lastInfo = handler.lastRefStack?.info ?? raiseError({
            code: 'STATE-202',
            message: 'Internal error: lastRefStack is null',
            context: { where: 'trackDependency', path },
            docsUrl: '/docs/error-codes.md#state',
        });
        if (handler.engine.pathManager.getters.has(lastInfo.pattern) &&
            lastInfo.pattern !== path) {
            handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, path);
        }
    };
}

/**
 * stackIndexByIndexName
 * インデックス名からスタックインデックスへのマッピング
 * $1 => 0
 * $2 => 1
 * :
 * ${i + 1} => i
 * i < MAX_WILDCARD_DEPTH
 */
const indexByIndexName = {};
for (let i = 0; i < MAX_WILDCARD_DEPTH; i++) {
    indexByIndexName[`$${i + 1}`] = i;
}

let version = 0;
let id$1 = 0;
class ListIndex {
    #parentListIndex = null;
    #pos = 0;
    #index = 0;
    #version;
    #id = ++id$1;
    #sid = this.#id.toString();
    constructor(parentListIndex, index) {
        this.#parentListIndex = parentListIndex;
        this.#pos = parentListIndex ? parentListIndex.position + 1 : 0;
        this.#index = index;
        this.#version = version;
    }
    get parentListIndex() {
        return this.#parentListIndex;
    }
    get id() {
        return this.#id;
    }
    get sid() {
        return this.#sid;
    }
    get position() {
        return this.#pos;
    }
    get length() {
        return this.#pos + 1;
    }
    get index() {
        return this.#index;
    }
    set index(value) {
        this.#index = value;
        this.#version = ++version;
        this.indexes[this.#pos] = value;
    }
    get version() {
        return this.#version;
    }
    get dirty() {
        if (this.#parentListIndex === null) {
            return false;
        }
        else {
            return this.#parentListIndex.dirty || this.#parentListIndex.version > this.#version;
        }
    }
    #indexes;
    get indexes() {
        if (this.#parentListIndex === null) {
            if (typeof this.#indexes === "undefined") {
                this.#indexes = [this.#index];
            }
        }
        else {
            if (typeof this.#indexes === "undefined" || this.dirty) {
                this.#indexes = [...this.#parentListIndex.indexes, this.#index];
                this.#version = version;
            }
        }
        return this.#indexes;
    }
    #listIndexes;
    get listIndexes() {
        if (this.#parentListIndex === null) {
            if (typeof this.#listIndexes === "undefined") {
                this.#listIndexes = [new WeakRef(this)];
            }
        }
        else {
            if (typeof this.#listIndexes === "undefined") {
                this.#listIndexes = [...this.#parentListIndex.listIndexes, new WeakRef(this)];
            }
        }
        return this.#listIndexes;
    }
    get varName() {
        return `${this.position + 1}`;
    }
    at(pos) {
        if (pos >= 0) {
            return this.listIndexes[pos]?.deref() || null;
        }
        else {
            return this.listIndexes[this.listIndexes.length + pos]?.deref() || null;
        }
    }
}
function createListIndex(parentListIndex, index) {
    return new ListIndex(parentListIndex, index);
}

function checkDependency(handler, ref) {
    // 動的依存関係の登録
    if (handler.refIndex >= 0) {
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null) {
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern) &&
                lastInfo.pattern !== ref.info.pattern) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, ref.info.pattern);
            }
        }
    }
}

function isSameList(oldList, newList) {
    if (oldList.length !== newList.length) {
        return false;
    }
    for (let i = 0; i < oldList.length; i++) {
        if (oldList[i] !== newList[i]) {
            return false;
        }
    }
    return true;
}
function createListIndexes(parentListIndex, oldList, newList, oldIndexes) {
    oldList = Array.isArray(oldList) ? oldList : [];
    newList = Array.isArray(newList) ? newList : [];
    const newIndexes = [];
    if (newList.length === 0) {
        return [];
    }
    if (oldList.length === 0) {
        for (let i = 0; i < newList.length; i++) {
            const newListIndex = createListIndex(parentListIndex, i);
            newIndexes.push(newListIndex);
        }
        return newIndexes;
    }
    if (isSameList(oldList, newList)) {
        return oldIndexes;
    }
    // インデックスベースのマップを使用して効率化
    const indexByValue = new Map();
    for (let i = 0; i < oldList.length; i++) {
        // 重複値の場合は最後のインデックスが優先される（既存動作を維持）
        indexByValue.set(oldList[i], i);
    }
    for (let i = 0; i < newList.length; i++) {
        const newValue = newList[i];
        const oldIndex = indexByValue.get(newValue);
        if (typeof oldIndex === "undefined") {
            // 新しい要素
            const newListIndex = createListIndex(parentListIndex, i);
            newIndexes.push(newListIndex);
        }
        else {
            // 既存要素の再利用
            const existingListIndex = oldIndexes[oldIndex];
            if (existingListIndex.index !== i) {
                existingListIndex.index = i;
            }
            newIndexes.push(existingListIndex);
        }
    }
    return newIndexes;
}

/**
 * 構造化パス情報(info, listIndex)をもとに、状態オブジェクト(target)から値を取得する。
 *
 * - 依存関係の自動登録（trackedGetters対応時はsetTrackingでラップ）
 * - キャッシュ機構（handler.cacheable時はrefKeyでキャッシュ）
 * - ネスト・ワイルドカード対応（親infoやlistIndexを辿って再帰的に値を取得）
 * - getter経由で値取得時はSetStatePropertyRefSymbolでスコープを一時設定
 *
 * @param target    状態オブジェクト
 * @param info      構造化パス情報
 * @param listIndex リストインデックス（多重ループ対応）
 * @param receiver  プロキシ
 * @param handler   状態ハンドラ
 * @returns         対象プロパティの値
 */
function getByRef(target, ref, receiver, handler) {
    checkDependency(handler, ref);
    let value;
    const listable = handler.engine.pathManager.lists.has(ref.info.pattern);
    const cacheable = ref.info.wildcardCount > 0 ||
        handler.engine.pathManager.getters.has(ref.info.pattern);
    let lastCacheEntry = null;
    if (cacheable || listable) {
        lastCacheEntry = handler.engine.getCacheEntry(ref);
        const versionRevision = handler.engine.versionRevisionByPath.get(ref.info.pattern);
        if (lastCacheEntry !== null) {
            if (typeof versionRevision === "undefined") {
                // 更新なし
                return lastCacheEntry.value;
            }
            else {
                if (lastCacheEntry.version > handler.updater.version) {
                    // これは非同期更新が発生した場合にありえる
                    return lastCacheEntry.value;
                }
                if (lastCacheEntry.version < versionRevision.version || lastCacheEntry.revision < versionRevision.revision) ;
                else {
                    return lastCacheEntry.value;
                }
            }
        }
    }
    // 親子関係のあるgetterが存在する場合は、外部依存から取得
    // ToDo: stateにgetterが存在する（パスの先頭が一致する）場合はgetter経由で取得
    if (handler.engine.stateOutput.startsWith(ref.info) && handler.engine.pathManager.getters.intersection(ref.info.cumulativePathSet).size === 0) {
        return handler.engine.stateOutput.get(ref);
    }
    // パターンがtargetに存在する場合はgetter経由で取得
    if (ref.info.pattern in target) {
        if (handler.refStack.length === 0) {
            raiseError({
                code: 'STC-002',
                message: 'handler.refStack is empty in getByRef',
            });
        }
        handler.refIndex++;
        if (handler.refIndex >= handler.refStack.length) {
            handler.refStack.push(null);
        }
        handler.refStack[handler.refIndex] = handler.lastRefStack = ref;
        try {
            return value = Reflect.get(target, ref.info.pattern, receiver);
        }
        finally {
            handler.refStack[handler.refIndex] = null;
            handler.refIndex--;
            handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            // キャッシュへ格納
            if (cacheable || listable) {
                let newListIndexes = null;
                if (listable) {
                    // リストインデックスを計算する必要がある
                    if (handler.renderer !== null) {
                        if (!handler.renderer.lastListInfoByRef.has(ref)) {
                            const listInfo = {
                                listIndexes: lastCacheEntry?.listIndexes ?? [],
                                value: lastCacheEntry?.value,
                            };
                            handler.renderer.lastListInfoByRef.set(ref, listInfo);
                        }
                    }
                    newListIndexes = createListIndexes(ref.listIndex, lastCacheEntry?.value, value, lastCacheEntry?.listIndexes ?? []);
                }
                let cacheEntry = lastCacheEntry ?? {
                    value: null,
                    listIndexes: null,
                    version: 0,
                    revision: 0,
                };
                cacheEntry.value = value;
                cacheEntry.listIndexes = newListIndexes;
                cacheEntry.version = handler.updater.version;
                cacheEntry.revision = handler.updater.revision;
                handler.engine.setCacheEntry(ref, cacheEntry);
            }
        }
    }
    else {
        // 存在しない場合エラー
        raiseError({
            code: "STC-001",
            message: `Property "${ref.info.pattern}" does not exist in state.`,
            docsUrl: "./docs/error-codes.md#stc",
        });
    }
}

/**
 * setByRef.ts
 *
 * StateClassの内部APIとして、構造化パス情報（IStructuredPathInfo）とリストインデックス（IListIndex）を指定して
 * 状態オブジェクト（target）に値を設定するための関数（setByRef）の実装です。
 *
 * 主な役割:
 * - 指定されたパス・インデックスに対応するState値を設定（多重ループやワイルドカードにも対応）
 * - getter/setter経由で値設定時はSetStatePropertyRefSymbolでスコープを一時設定
 * - 存在しない場合は親infoやlistIndexを辿って再帰的に値を設定
 * - 設定後はengine.updater.addUpdatedStatePropertyRefValueで更新情報を登録
 *
 * 設計ポイント:
 * - ワイルドカードや多重ループにも柔軟に対応し、再帰的な値設定を実現
 * - finallyで必ず更新情報を登録し、再描画や依存解決に利用
 * - getter/setter経由のスコープ切り替えも考慮した設計
 */
function setByRef(target, ref, value, receiver, handler) {
    const isElements = handler.engine.pathManager.elements.has(ref.info.pattern);
    let parentRef = null;
    let swapInfo = null;
    // elementsの場合はswapInfoを準備
    if (isElements) {
        parentRef = ref.parentRef ?? raiseError({
            code: 'STATE-202',
            message: 'propRef.stateProp.parentInfo is undefined',
            context: { where: 'setByRef (element)', refPath: ref.info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
        swapInfo = handler.updater.swapInfoByRef.get(parentRef) || null;
        if (swapInfo === null) {
            swapInfo = {
                value: [...(receiver[GetByRefSymbol](parentRef) ?? [])],
                listIndexes: [...(receiver[GetListIndexesByRefSymbol](parentRef) ?? [])]
            };
            handler.updater.swapInfoByRef.set(parentRef, swapInfo);
        }
    }
    try {
        // 親子関係のあるgetterが存在する場合は、外部依存を通じて値を設定
        // ToDo: stateにgetterが存在する（パスの先頭が一致する）場合はgetter経由で取得
        if (handler.engine.stateOutput.startsWith(ref.info) && handler.engine.pathManager.setters.intersection(ref.info.cumulativePathSet).size === 0) {
            return handler.engine.stateOutput.set(ref, value);
        }
        if (ref.info.pattern in target) {
            handler.refIndex++;
            if (handler.refIndex >= handler.refStack.length) {
                handler.refStack.push(null);
            }
            handler.refStack[handler.refIndex] = handler.lastRefStack = ref;
            try {
                return Reflect.set(target, ref.info.pattern, value, receiver);
            }
            finally {
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            }
        }
        else {
            const parentInfo = ref.info.parentInfo ?? raiseError({
                code: 'STATE-202',
                message: 'propRef.stateProp.parentInfo is undefined',
                context: { where: 'setByRef', refPath: ref.info.pattern },
                docsUrl: '/docs/error-codes.md#state',
            });
            const parentListIndex = parentInfo.wildcardCount < ref.info.wildcardCount ? (ref.listIndex?.parentListIndex ?? null) : ref.listIndex;
            const parentRef = getStatePropertyRef(parentInfo, parentListIndex);
            const parentValue = getByRef(target, parentRef, receiver, handler);
            const lastSegment = ref.info.lastSegment;
            if (lastSegment === "*") {
                const index = ref.listIndex?.index ?? raiseError({
                    code: 'STATE-202',
                    message: 'propRef.listIndex?.index is undefined',
                    context: { where: 'setByRef', refPath: ref.info.pattern },
                    docsUrl: '/docs/error-codes.md#state',
                });
                return Reflect.set(parentValue, index, value);
            }
            else {
                return Reflect.set(parentValue, lastSegment, value);
            }
        }
    }
    finally {
        handler.updater.enqueueRef(ref);
        if (isElements) {
            const index = swapInfo.value.indexOf(value);
            const currentListIndexes = receiver[GetListIndexesByRefSymbol](parentRef) ?? [];
            const curIndex = ref.listIndex.index;
            const listIndex = (index !== -1) ? swapInfo.listIndexes[index] : createListIndex(parentRef.listIndex, -1);
            currentListIndexes[curIndex] = listIndex;
            // 重複チェック
            // 重複していない場合、swapが完了したとみなし、インデックスを更新
            const listValueSet = new Set(receiver[GetByRefSymbol](parentRef) ?? []);
            if (listValueSet.size === swapInfo.value.length) {
                for (let i = 0; i < currentListIndexes.length; i++) {
                    currentListIndexes[i].index = i;
                }
                // 完了したのでswapInfoを削除
                handler.updater.swapInfoByRef.delete(parentRef);
            }
        }
    }
}

/**
 * resolve.ts
 *
 * StateClassのAPIとして、パス（path）とインデックス（indexes）を指定して
 * Stateの値を取得・設定するための関数（resolve）の実装です。
 *
 * 主な役割:
 * - 文字列パス（path）とインデックス配列（indexes）から、該当するState値の取得・設定を行う
 * - ワイルドカードや多重ループを含むパスにも対応
 * - value未指定時は取得（getByRef）、指定時は設定（setByRef）を実行
 *
 * 設計ポイント:
 * - getStructuredPathInfoでパスを解析し、ワイルドカード階層ごとにリストインデックスを解決
 * - handler.engine.getListIndexesSetで各階層のリストインデックス集合を取得
 * - getByRef/setByRefで値の取得・設定を一元的に処理
 * - 柔軟なバインディングやAPI経由での利用が可能
 */
function resolve(target, prop, receiver, handler) {
    return (path, indexes, value) => {
        const info = getStructuredPathInfo(path);
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
            // gettersに含まれる場合は依存関係を登録
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
            }
        }
        if (info.wildcardParentInfos.length > indexes.length) {
            raiseError({
                code: 'STATE-202',
                message: `indexes length is insufficient: ${path}`,
                context: { path, expected: info.wildcardParentInfos.length, received: indexes.length },
                docsUrl: '/docs/error-codes.md#state',
                severity: 'error',
            });
        }
        // ワイルドカード階層ごとにListIndexを解決していく
        let listIndex = null;
        for (let i = 0; i < info.wildcardParentInfos.length; i++) {
            const wildcardParentPattern = info.wildcardParentInfos[i];
            const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
            getByRef(target, wildcardRef, receiver, handler);
            const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
            if (listIndexes == null) {
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndexes not found: ${wildcardParentPattern.pattern}`,
                    context: { pattern: wildcardParentPattern.pattern },
                    docsUrl: '/docs/error-codes.md#list',
                    severity: 'error',
                });
            }
            const index = indexes[i];
            listIndex = listIndexes[index] ?? raiseError({
                code: 'LIST-201',
                message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                context: { pattern: wildcardParentPattern.pattern, index },
                docsUrl: '/docs/error-codes.md#list',
                severity: 'error',
            });
        }
        // WritableかReadonlyかを判定して適切なメソッドを呼び出す
        const ref = getStatePropertyRef(info, listIndex);
        const hasSetValue = typeof value !== "undefined";
        if (SetByRefSymbol in receiver) {
            if (!hasSetValue) {
                return getByRef(target, ref, receiver, handler);
            }
            else {
                setByRef(target, ref, value, receiver, handler);
            }
        }
        else {
            if (!hasSetValue) {
                return getByRef(target, ref, receiver, handler);
            }
            else {
                // readonlyなので、setはできない
                raiseError({
                    code: 'STATE-202',
                    message: `Cannot set value on a readonly proxy: ${path}`,
                    context: { path },
                    docsUrl: '/docs/error-codes.md#state',
                    severity: 'error',
                });
            }
        }
    };
}

/**
 * connectedCallback.ts
 *
 * StateClassのライフサイクルフック「$connectedCallback」を呼び出すユーティリティ関数です。
 *
 * 主な役割:
 * - オブジェクト（target）に$connectedCallbackメソッドが定義されていれば呼び出す
 * - コールバックはtargetのthisコンテキストで呼び出し、IReadonlyStateProxy（receiver）を引数として渡す
 * - 非同期関数として実行可能（await対応）
 *
 * 設計ポイント:
 * - Reflect.getで$connectedCallbackプロパティを安全に取得
 * - 存在しない場合は何もしない
 * - ライフサイクル管理やカスタム初期化処理に利用
 */
function connectedCallback(target, prop, receiver, handler) {
    const callback = Reflect.get(target, CONNECTED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        return callback.call(receiver);
    }
}

/**
 * disconnectedCallback.ts
 *
 * StateClassのライフサイクルフック「$disconnectedCallback」を呼び出すユーティリティ関数です。
 *
 * 主な役割:
 * - オブジェクト（target）に$disconnectedCallbackメソッドが定義されていれば呼び出す
 * - コールバックはtargetのthisコンテキストで呼び出し、IReadonlyStateProxy（receiver）を引数として渡す
 * - 非同期関数として実行可能（await対応）
 *
 * 設計ポイント:
 * - Reflect.getで$disconnectedCallbackプロパティを安全に取得
 * - 存在しない場合は何もしない
 * - ライフサイクル管理やクリーンアップ処理に利用
 */
function disconnectedCallback(target, prop, receiver, handler) {
    const callback = Reflect.get(target, DISCONNECTED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        callback.call(receiver);
    }
}

/**
 * getAllReadonly
 *
 * ワイルドカードを含む State パスから、対象となる全要素を配列で取得する。
 * Throws: LIST-201（インデックス未解決）、BIND-201（ワイルドカード情報不整合）
 */
function getAll(target, prop, receiver, handler) {
    const resolveFn = resolve(target, prop, receiver, handler);
    return (path, indexes) => {
        const info = getStructuredPathInfo(path);
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
            // gettersに含まれる場合は依存関係を登録
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
            }
        }
        if (typeof indexes === "undefined") {
            for (let i = 0; i < info.wildcardInfos.length; i++) {
                const wildcardPattern = info.wildcardInfos[i] ?? raiseError({
                    code: 'BIND-201',
                    message: 'wildcardPattern is null',
                    context: { index: i, infoPattern: info.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
                const listIndex = getContextListIndex(handler, wildcardPattern.pattern);
                if (listIndex) {
                    indexes = listIndex.indexes;
                    break;
                }
            }
            if (typeof indexes === "undefined") {
                indexes = [];
            }
        }
        const walkWildcardPattern = (wildcardParentInfos, wildardIndexPos, listIndex, indexes, indexPos, parentIndexes, results) => {
            const wildcardParentPattern = wildcardParentInfos[wildardIndexPos] ?? null;
            if (wildcardParentPattern === null) {
                results.push(parentIndexes);
                return;
            }
            const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
            getByRef(target, wildcardRef, receiver, handler);
            const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
            if (listIndexes === null) {
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: { pattern: wildcardParentPattern.pattern },
                    docsUrl: '/docs/error-codes.md#list',
                    severity: 'error',
                });
            }
            const index = indexes[indexPos] ?? null;
            if (index === null) {
                for (let i = 0; i < listIndexes.length; i++) {
                    const listIndex = listIndexes[i];
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
            }
            else {
                const listIndex = listIndexes[index] ?? raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: { pattern: wildcardParentPattern.pattern, index },
                    docsUrl: '/docs/error-codes.md#list',
                    severity: 'error',
                });
                if ((wildardIndexPos + 1) < wildcardParentInfos.length) {
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
                else {
                    // 最終ワイルドカード層まで到達しているので、結果を確定
                    results.push(parentIndexes.concat(listIndex.index));
                }
            }
        };
        const resultIndexes = [];
        walkWildcardPattern(info.wildcardParentInfos, 0, null, indexes, 0, [], resultIndexes);
        const resultValues = [];
        for (let i = 0; i < resultIndexes.length; i++) {
            resultValues.push(resolveFn(info.pattern, resultIndexes[i]));
        }
        return resultValues;
    };
}

function getListIndexesByRef(target, ref, receiver, handler) {
    if (!handler.engine.pathManager.lists.has(ref.info.pattern)) {
        raiseError({
            code: 'LIST-201',
            message: `path is not a list: ${ref.info.pattern}`,
            context: { where: 'getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    if (handler.engine.stateOutput.startsWith(ref.info) && handler.engine.pathManager.getters.intersection(ref.info.cumulativePathSet).size === 0) {
        return handler.engine.stateOutput.getListIndexes(ref) ?? [];
    }
    getByRef(target, ref, receiver, handler); // キャッシュ更新を兼ねる
    const cacheEntry = handler.engine.getCacheEntry(ref);
    if (cacheEntry === null) {
        raiseError({
            code: 'LIST-202',
            message: `List cache entry not found: ${ref.info.pattern}`,
            context: { where: 'getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    const listIndexes = cacheEntry.listIndexes;
    if (listIndexes == null) {
        raiseError({
            code: 'LIST-203',
            message: `List indexes not found in cache entry: ${ref.info.pattern}`,
            context: { where: 'getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    return listIndexes;
}

/**
 * updatedCallback.ts
 *
 * StateClassのライフサイクルフック「$updatedCallback」を呼び出すユーティリティ関数です。
 *
 * 主な役割:
 * - オブジェクト（target）に$updatedCallbackメソッドが定義されていれば呼び出す
 * - コールバックはtargetのthisコンテキストで呼び出し、IReadonlyStateProxy（receiver）を引数として渡す
 * - 非同期関数として実行可能（await対応）
 *
 * 設計ポイント:
 * - Reflect.getで$disconnectedCallbackプロパティを安全に取得
 * - 存在しない場合は何もしない
 * - ライフサイクル管理やクリーンアップ処理に利用
 */
function updatedCallback(target, refs, receiver, handler) {
    const callback = Reflect.get(target, UPDATED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        const paths = new Set();
        const indexesByPath = {};
        for (const ref of refs) {
            const path = ref.info.pattern;
            paths.add(path);
            if (ref.info.wildcardCount > 0) {
                const index = ref.listIndex.index;
                let indexes = indexesByPath[path];
                if (typeof indexes === "undefined") {
                    indexesByPath[path] = [index];
                }
                else {
                    indexes.push(index);
                }
            }
        }
        return callback.call(receiver, Array.from(paths), indexesByPath);
    }
}

/**
 * get.ts
 *
 * StateClassのProxyトラップとして、プロパティアクセス時の値取得処理を担う関数（get）の実装です。
 *
 * 主な役割:
 * - 文字列プロパティの場合、特殊プロパティ（$1〜$9, $resolve, $getAll, $navigate）に応じた値やAPIを返却
 * - 通常のプロパティはgetResolvedPathInfoでパス情報を解決し、getListIndexでリストインデックスを取得
 * - getByRefで構造化パス・リストインデックスに対応した値を取得
 * - シンボルプロパティの場合はhandler.callableApi経由でAPIを呼び出し
 * - それ以外はReflect.getで通常のプロパティアクセスを実行
 *
 * 設計ポイント:
 * - $1〜$9は直近のStatePropertyRefのリストインデックス値を返す特殊プロパティ
 * - $resolve, $getAll, $navigateはAPI関数やルーターインスタンスを返す
 * - 通常のプロパティアクセスもバインディングや多重ループに対応
 * - シンボルAPIやReflect.getで拡張性・互換性も確保
 */
function get(target, prop, receiver, handler) {
    const index = indexByIndexName[prop];
    if (typeof index !== "undefined") {
        const listIndex = handler.lastRefStack?.listIndex;
        return listIndex?.indexes[index] ?? raiseError({
            code: 'LIST-201',
            message: `ListIndex not found: ${prop.toString()}`,
            context: { prop: String(prop), indexes: listIndex?.indexes ?? null, index },
            docsUrl: '/docs/error-codes.md#list',
            severity: 'error',
        });
    }
    if (typeof prop === "string") {
        if (prop[0] === "$") {
            switch (prop) {
                case "$resolve":
                    return resolve(target, prop, receiver, handler);
                case "$getAll":
                    return getAll(target, prop, receiver, handler);
                case "$trackDependency":
                    return trackDependency(target, prop, receiver, handler);
                case "$navigate":
                    return (to) => getRouter()?.navigate(to);
                case "$component":
                    return handler.engine.owner;
            }
        }
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        return getByRef(target, ref, receiver, handler);
    }
    else if (typeof prop === "symbol") {
        if (handler.symbols.has(prop)) {
            switch (prop) {
                case GetByRefSymbol:
                    return (ref) => getByRef(target, ref, receiver, handler);
                case SetByRefSymbol:
                    return (ref, value) => setByRef(target, ref, value, receiver, handler);
                case GetListIndexesByRefSymbol:
                    return (ref) => getListIndexesByRef(target, ref, receiver, handler);
                case ConnectedCallbackSymbol:
                    return () => connectedCallback(target, prop, receiver);
                case DisconnectedCallbackSymbol:
                    return () => disconnectedCallback(target, prop, receiver);
                case UpdatedCallbackSymbol:
                    return (refs) => updatedCallback(target, refs, receiver);
            }
        }
        else {
            return Reflect.get(target, prop, receiver);
        }
    }
}

const STACK_DEPTH$1 = 32;
let StateHandler$1 = class StateHandler {
    engine;
    updater;
    renderer;
    refStack = Array(STACK_DEPTH$1).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = null;
    symbols = new Set([GetByRefSymbol, GetListIndexesByRefSymbol]);
    apis = new Set(["$resolve", "$getAll", "$trackDependency", "$navigate", "$component"]);
    constructor(engine, updater, renderer) {
        this.engine = engine;
        this.updater = updater;
        this.renderer = renderer;
    }
    get(target, prop, receiver) {
        return get(target, prop, receiver, this);
    }
    set(target, prop, value, receiver) {
        raiseError({
            code: 'STATE-202',
            message: `Cannot set property ${String(prop)} of readonly state`,
            context: { where: 'createReadonlyStateProxy.set', prop: String(prop) },
            docsUrl: './docs/error-codes.md#state',
        });
    }
    has(target, prop) {
        return Reflect.has(target, prop) || this.symbols.has(prop) || this.apis.has(prop);
    }
};
function createReadonlyStateHandler(engine, updater, renderer) {
    return new StateHandler$1(engine, updater, renderer);
}
function createReadonlyStateProxy(state, handler) {
    return new Proxy(state, handler);
}

/**
 * set.ts
 *
 * StateClassのProxyトラップとして、プロパティ設定時の値セット処理を担う関数（set）の実装です。
 *
 * 主な役割:
 * - 文字列プロパティの場合、getResolvedPathInfoでパス情報を解決し、getListIndexでリストインデックスを取得
 * - setByRefで構造化パス・リストインデックスに対応した値設定を実行
 * - それ以外（シンボル等）の場合はReflect.setで通常のプロパティ設定を実行
 *
 * 設計ポイント:
 * - バインディングや多重ループ、ワイルドカードを含むパスにも柔軟に対応
 * - setByRefを利用することで、依存解決や再描画などの副作用も一元管理
 * - Reflect.setで標準的なプロパティ設定の互換性も確保
 */
function set(target, prop, value, receiver, handler) {
    if (typeof prop === "string") {
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        return setByRef(target, ref, value, receiver, handler);
    }
    else {
        return Reflect.set(target, prop, value, receiver);
    }
}

function setLoopContext(handler, loopContext, callback) {
    if (handler.loopContext) {
        raiseError({
            code: 'STATE-301',
            message: 'already in loop context',
            context: { where: 'setLoopContext' },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    handler.loopContext = loopContext;
    let resultPromise;
    try {
        if (loopContext) {
            if (handler.refStack.length === 0) {
                raiseError({
                    code: 'STC-002',
                    message: 'handler.refStack is empty in getByRef',
                });
            }
            handler.refIndex++;
            if (handler.refIndex >= handler.refStack.length) {
                handler.refStack.push(null);
            }
            handler.refStack[handler.refIndex] = handler.lastRefStack = loopContext.ref;
            try {
                resultPromise = callback();
            }
            finally {
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            }
        }
        else {
            resultPromise = callback();
        }
    }
    finally {
        // Promiseの場合は新しいPromiseチェーンを返してfinallyを適用
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.loopContext = null;
            });
        }
        // 同期の場合は即座にリセット
        handler.loopContext = null;
    }
    return resultPromise;
}

const STACK_DEPTH = 32;
class StateHandler {
    engine;
    refStack = Array(STACK_DEPTH).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = null;
    updater;
    renderer = null;
    symbols = new Set([
        GetByRefSymbol, SetByRefSymbol, GetListIndexesByRefSymbol,
        ConnectedCallbackSymbol, DisconnectedCallbackSymbol,
        UpdatedCallbackSymbol
    ]);
    apis = new Set(["$resolve", "$getAll", "$trackDependency", "$navigate", "$component"]);
    constructor(engine, updater) {
        this.engine = engine;
        this.updater = updater;
    }
    get(target, prop, receiver) {
        return get(target, prop, receiver, this);
    }
    set(target, prop, value, receiver) {
        return set(target, prop, value, receiver, this);
    }
    has(target, prop) {
        return Reflect.has(target, prop) || this.symbols.has(prop) || this.apis.has(prop);
    }
}
function useWritableStateProxy(engine, updater, state, loopContext, callback) {
    const handler = new StateHandler(engine, updater);
    const stateProxy = new Proxy(state, handler);
    return setLoopContext(handler, loopContext, () => {
        return callback(stateProxy, handler);
    });
}

/**
 * Renderer は、State の変更（参照 IStatePropertyRef の集合）に対応して、
 * PathTree を辿りつつ各 Binding（IBinding）へ applyChange を委譲するコーディネータです。
 *
 * 主な役割
 * - reorderList: 要素単位の並べ替え要求を収集し、親リスト単位の差分（IListDiff）へ変換して適用
 * - render: エントリポイント。ReadonlyState を生成し、reorder → 各 ref の描画（renderItem）の順で実行
 * - renderItem: 指定 ref に紐づく Binding を更新し、静的依存（子 PathNode）と動的依存を再帰的に辿る
 *
 * コントラクト
 * - Binding#applyChange(renderer): 変更があった場合は renderer.updatedBindings に自分自身を追加すること
 * - readonlyState[GetByRefSymbol](ref): ref の新しい値（読み取り専用ビュー）を返すこと
 *
 * スレッド/再入
 * - 同期実行前提。
 *
 * 代表的な例外
 * - UPD-001/002: Engine/ReadonlyState の未初期化
 * - UPD-003/004/005/006: ListIndex/ParentInfo/OldList* の不整合や ListDiff 未生成
 * - PATH-101: PathNode が見つからない
 */
class Renderer {
    #updatingRefs = [];
    #updatingRefSet = new Set();
    /**
     * このレンダリングサイクルで「変更あり」となった Binding の集合。
     * 注意: 実際に追加するのは各 binding.applyChange 実装側の責務。
     */
    #updatedBindings = new Set();
    /**
     * 二重適用を避けるために処理済みとした参照。
     * renderItem の再帰や依存関係の横断時に循環/重複を防ぐ。
     */
    #processedRefs = new Set();
    /**
     * レンダリング対象のエンジン。state, pathManager, bindings などのファサード。
     */
    #engine;
    #readonlyState = null;
    #readonlyHandler = null;
    /**
     * 親リスト参照ごとに「要素の新しい並び位置」を記録するためのインデックス配列。
     * reorderList で収集し、後段で仮の IListDiff を生成するために用いる。
     */
    #reorderIndexesByRef = new Map();
    #lastListInfoByRef = new Map();
    #updater;
    constructor(engine, updater) {
        this.#engine = engine;
        this.#updater = updater;
    }
    get updatingRefs() {
        return this.#updatingRefs;
    }
    get updatingRefSet() {
        return this.#updatingRefSet;
    }
    /**
     * このサイクル中に更新された Binding の集合を返す（読み取り専用的に使用）。
     */
    get updatedBindings() {
        return this.#updatedBindings;
    }
    /**
     * 既に処理済みの参照集合を返す。二重適用の防止に利用する。
     */
    get processedRefs() {
        return this.#processedRefs;
    }
    /**
     * 読み取り専用 State ビューを取得する。render 実行中でなければ例外。
     * Throws: UPD-002
     */
    get readonlyState() {
        if (!this.#readonlyState) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyState not initialized",
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this.#readonlyState;
    }
    get readonlyHandler() {
        if (!this.#readonlyHandler) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyHandler not initialized",
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this.#readonlyHandler;
    }
    /**
     * バッキングエンジンを取得する。未初期化の場合は例外。
     * Throws: UPD-001
     */
    get engine() {
        if (!this.#engine) {
            raiseError({
                code: "UPD-001",
                message: "Engine not initialized",
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this.#engine;
    }
    get lastListInfoByRef() {
        return this.#lastListInfoByRef;
    }
    /**
     * リードオンリーな状態を生成し、コールバックに渡す
     * @param callback
     * @returns
     */
    createReadonlyState(callback) {
        const handler = createReadonlyStateHandler(this.#engine, this.#updater, this);
        const stateProxy = createReadonlyStateProxy(this.#engine.state, handler);
        this.#readonlyState = stateProxy;
        this.#readonlyHandler = handler;
        try {
            return callback(stateProxy, handler);
        }
        finally {
            this.#readonlyState = null;
            this.#readonlyHandler = null;
        }
    }
    /**
     * レンダリングのエントリポイント。ReadonlyState を生成し、
     * 並べ替え処理→各参照の描画の順に処理します。
     *
     * 注意
     * - readonlyState はこのメソッドのスコープ内でのみ有効。
     * - SetCacheableSymbol により参照解決のキャッシュをまとめて有効化できる。
     */
    render(items) {
        this.#reorderIndexesByRef.clear();
        this.#processedRefs.clear();
        this.#updatedBindings.clear();
        this.#updatingRefs = [...items];
        this.#updatingRefSet = new Set(items);
        // 実際のレンダリングロジックを実装
        this.createReadonlyState((readonlyState, readonlyHandler) => {
            // まずはリストの並び替えを処理
            const remainItems = [];
            const itemsByListRef = new Map();
            const refSet = new Set();
            for (let i = 0; i < items.length; i++) {
                const ref = items[i];
                refSet.add(ref);
                if (!this.#engine.pathManager.elements.has(ref.info.pattern)) {
                    remainItems.push(ref);
                    continue;
                }
                const listRef = ref.parentRef ?? raiseError({
                    code: "UPD-004",
                    message: `ParentInfo is null for ref: ${ref.key}`,
                    context: { refKey: ref.key, pattern: ref.info.pattern },
                    docsUrl: "./docs/error-codes.md#upd",
                });
                if (!itemsByListRef.has(listRef)) {
                    itemsByListRef.set(listRef, new Set());
                }
                itemsByListRef.get(listRef).add(ref);
            }
            for (const [listRef, refs] of itemsByListRef) {
                if (refSet.has(listRef)) {
                    for (const ref of refs) {
                        this.#processedRefs.add(ref); // 終了済み
                    }
                    continue; // 親リストが存在する場合はスキップ
                }
                const bindings = this.#engine.getBindings(listRef);
                for (let i = 0; i < bindings.length; i++) {
                    if (this.#updatedBindings.has(bindings[i]))
                        continue;
                    bindings[i].applyChange(this);
                }
                this.processedRefs.add(listRef);
            }
            for (let i = 0; i < remainItems.length; i++) {
                const ref = remainItems[i];
                const node = findPathNodeByPath(this.#engine.pathManager.rootNode, ref.info.pattern);
                if (node === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${ref.info.pattern}`,
                        context: { pattern: ref.info.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (!this.processedRefs.has(ref)) {
                    this.renderItem(ref, node);
                }
            }
            // 子コンポーネントへの再描画通知
            if (this.#engine.structiveChildComponents.size > 0) {
                for (const structiveComponent of this.#engine.structiveChildComponents) {
                    const structiveComponentBindings = this.#engine.bindingsByComponent.get(structiveComponent) ?? new Set();
                    for (const binding of structiveComponentBindings) {
                        binding.notifyRedraw(remainItems);
                    }
                }
            }
        });
    }
    /**
     * 単一の参照 ref と対応する PathNode を描画します。
     *
     * - まず自身のバインディング適用
     * - 次に静的依存（ワイルドカード含む）
     * - 最後に動的依存（ワイルドカードは階層的に展開）
     *
     * 静的依存（子ノード）
     * - それ以外: 親の listIndex を引き継いで子参照を生成して再帰描画
     *
     * 動的依存
     * - pathManager.dynamicDependencies に登録されたパスを基に、ワイルドカードを展開しつつ描画を再帰
     *
     * Throws
     * - UPD-006: WILDCARD 分岐で ListDiff が未計算（null）の場合
     * - PATH-101: 動的依存の PathNode 未検出
     */
    renderItem(ref, node) {
        this.processedRefs.add(ref);
        // バインディングに変更を適用する
        // 変更があったバインディングは updatedBindings に追加する（applyChange 実装の責務）
        const bindings = this.#engine.getBindings(ref);
        for (let i = 0; i < bindings.length; i++) {
            if (this.#updatedBindings.has(bindings[i]))
                continue;
            bindings[i].applyChange(this);
        }
        let diffListIndexes = new Set();
        if (this.#engine.pathManager.lists.has(ref.info.pattern)) {
            const currentListIndexes = new Set(this.readonlyState[GetListIndexesByRefSymbol](ref) ?? []);
            const { listIndexes } = this.lastListInfoByRef.get(ref) ?? {};
            const lastListIndexSet = new Set(listIndexes ?? []);
            diffListIndexes = currentListIndexes.difference(lastListIndexSet);
        }
        // 静的な依存関係を辿る
        for (const [name, childNode] of node.childNodeByName) {
            const childInfo = getStructuredPathInfo(childNode.currentPath);
            if (name === WILDCARD) {
                for (const listIndex of diffListIndexes) {
                    const childRef = getStatePropertyRef(childInfo, listIndex);
                    if (!this.processedRefs.has(childRef)) {
                        this.renderItem(childRef, childNode);
                    }
                }
            }
            else {
                const childRef = getStatePropertyRef(childInfo, ref.listIndex);
                if (!this.processedRefs.has(childRef)) {
                    this.renderItem(childRef, childNode);
                }
            }
        }
        // 動的な依存関係を辿る
        const deps = this.#engine.pathManager.dynamicDependencies.get(ref.info.pattern);
        if (deps) {
            for (const depPath of deps) {
                const depInfo = getStructuredPathInfo(depPath);
                const depNode = findPathNodeByPath(this.#engine.pathManager.rootNode, depInfo.pattern);
                if (depNode === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${depInfo.pattern}`,
                        context: { pattern: depInfo.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (depInfo.wildcardCount > 0) {
                    const infos = depInfo.wildcardParentInfos;
                    const walk = (depRef, index, nextInfo) => {
                        const listIndexes = this.readonlyState[GetListIndexesByRefSymbol](depRef) || [];
                        if ((index + 1) < infos.length) {
                            for (let i = 0; i < listIndexes.length; i++) {
                                const nextRef = getStatePropertyRef(nextInfo, listIndexes[i]);
                                walk(nextRef, index + 1, infos[index + 1]);
                            }
                        }
                        else {
                            for (let i = 0; i < listIndexes.length; i++) {
                                const subDepRef = getStatePropertyRef(depInfo, listIndexes[i]);
                                if (!this.processedRefs.has(subDepRef)) {
                                    this.renderItem(subDepRef, depNode);
                                }
                            }
                        }
                    };
                    const startRef = getStatePropertyRef(depInfo.wildcardParentInfos[0], null);
                    walk(startRef, 0, depInfo.wildcardParentInfos[1] || null);
                }
                else {
                    const depRef = getStatePropertyRef(depInfo, null);
                    if (!this.processedRefs.has(depRef)) {
                        this.renderItem(depRef, depNode);
                    }
                }
            }
        }
    }
}
/**
 * 便宜関数。Renderer のインスタンス化と render 呼び出しをまとめて行う。
 */
function render(refs, engine, updater) {
    const renderer = new Renderer(engine, updater);
    renderer.render(refs);
}
function createRenderer(engine, updater) {
    return new Renderer(engine, updater);
}

/**
 * Updaterクラスは、状態管理と更新の中心的な役割を果たします。
 * 状態更新が必要な場合に、都度インスタンスを作成して使用します。
 * 主な機能は以下の通りです:
 */
class Updater {
    queue = [];
    #rendering = false;
    #engine;
    #version;
    #revision = 0;
    #swapInfoByRef = new Map();
    #saveQueue = [];
    constructor(engine) {
        this.#engine = engine;
        this.#version = engine.versionUp();
    }
    get version() {
        return this.#version;
    }
    get revision() {
        return this.#revision;
    }
    get swapInfoByRef() {
        return this.#swapInfoByRef;
    }
    /**
     * 更新したRefをキューに追加し、レンダリングをスケジュールする
     * @param ref
     * @returns
     */
    enqueueRef(ref) {
        this.#revision++;
        this.queue.push(ref);
        this.#saveQueue.push(ref);
        this.collectMaybeUpdates(this.#engine, ref.info.pattern, this.#engine.versionRevisionByPath, this.#revision);
        // レンダリング中はスキップ
        if (this.#rendering)
            return;
        this.#rendering = true;
        queueMicrotask(() => {
            // 非同期処理で中断するか、更新処理が完了した後にレンダリングを実行
            this.rendering();
        });
    }
    /**
     * 状態更新処理開始
     * @param loopContext
     * @param callback
     */
    update(loopContext, callback) {
        let resultPromise;
        resultPromise = useWritableStateProxy(this.#engine, this, this.#engine.state, loopContext, (state, handler) => {
            // 状態更新処理
            return callback(state, handler);
        });
        const updatedCallbackHandler = () => {
            if (this.#engine.pathManager.hasUpdatedCallback && this.#saveQueue.length > 0) {
                const saveQueue = this.#saveQueue;
                this.#saveQueue = [];
                queueMicrotask(() => {
                    this.update(null, (state, handler) => {
                        state[UpdatedCallbackSymbol](saveQueue);
                    });
                });
            }
        };
        if (resultPromise instanceof Promise) {
            resultPromise.finally(() => {
                updatedCallbackHandler();
            });
        }
        else {
            updatedCallbackHandler();
        }
        return resultPromise;
    }
    /**
     * レンダリング処理
     */
    rendering() {
        try {
            while (this.queue.length > 0) {
                // キュー取得
                const queue = this.queue;
                this.queue = [];
                // レンダリング実行
                render(queue, this.#engine, this);
            }
        }
        finally {
            this.#rendering = false;
        }
    }
    initialRender(callback) {
        const renderer = createRenderer(this.#engine, this);
        callback(renderer);
    }
    /**
     * 更新したパスに対して影響があるパスを再帰的に収集する
     * @param engine
     * @param path
     * @param node
     * @param revisionByUpdatedPath
     * @param revision
     * @param visitedInfo
     * @returns
     */
    recursiveCollectMaybeUpdates(engine, path, node, visitedInfo, isSource) {
        if (visitedInfo.has(path))
            return;
        // swapの場合スキップしたい
        if (isSource && engine.pathManager.elements.has(path)) {
            return;
        }
        visitedInfo.add(path);
        for (const [name, childNode] of node.childNodeByName.entries()) {
            const childPath = childNode.currentPath;
            this.recursiveCollectMaybeUpdates(engine, childPath, childNode, visitedInfo, false);
        }
        const deps = engine.pathManager.dynamicDependencies.get(path) ?? [];
        for (const depPath of deps) {
            const depNode = findPathNodeByPath(engine.pathManager.rootNode, depPath);
            if (depNode === null) {
                raiseError({
                    code: "UPD-004",
                    message: `Path node not found for pattern: ${depPath}`,
                    docsUrl: "./docs/error-codes.md#upd",
                });
            }
            this.recursiveCollectMaybeUpdates(engine, depPath, depNode, visitedInfo, false);
        }
    }
    #cacheUpdatedPathsByPath = new Map();
    collectMaybeUpdates(engine, path, versionRevisionByPath, revision) {
        const node = findPathNodeByPath(engine.pathManager.rootNode, path);
        if (node === null) {
            raiseError({
                code: "UPD-003",
                message: `Path node not found for pattern: ${path}`,
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        // キャッシュ
        let updatedPaths = this.#cacheUpdatedPathsByPath.get(path);
        if (typeof updatedPaths === "undefined") {
            updatedPaths = new Set();
            this.recursiveCollectMaybeUpdates(engine, path, node, updatedPaths, true);
        }
        const versionRevision = {
            version: this.version,
            revision: revision,
        };
        for (const updatedPath of updatedPaths) {
            versionRevisionByPath.set(updatedPath, versionRevision);
        }
        this.#cacheUpdatedPathsByPath.set(path, updatedPaths);
    }
    /**
     * リードオンリーな状態を生成し、コールバックに渡す
     * @param callback
     * @returns
     */
    createReadonlyState(callback) {
        const handler = createReadonlyStateHandler(this.#engine, this, null);
        const stateProxy = createReadonlyStateProxy(this.#engine.state, handler);
        return callback(stateProxy, handler);
    }
}
/**
 * Updaterを生成しコールバックに渡す
 * スコープを明確にするための関数
 * @param engine
 * @param callback
 */
function createUpdater(engine, callback) {
    const updater = new Updater(engine);
    return callback(updater);
}

/**
 * BindingNodeCheckbox class implements binding for checkboxes (input[type="checkbox"]).
 * Controls checked state by comparing array value with checkbox value.
 * Supports bidirectional binding and readonly mode.
 *
 * @throws BIND-201 Value is not array: When non-array value is passed
 * @throws BIND-201 Has multiple decorators: When multiple decorators are specified
 */
class BindingNodeCheckbox extends BindingNode {
    /**
     * Returns raw value attribute of checkbox input element.
     *
     * @returns Value attribute string
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * Returns value with all filters applied.
     *
     * @returns Filtered value
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Sets up bidirectional binding with event listener.
     * Event name: "input" (default), "change" (if onchange/change decorator), or none (if readonly/ro).
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node (should be HTMLInputElement with type="checkbox")
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators (event name or "readonly"/"ro")
     * @throws BIND-201 Has multiple decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement)
            return;
        const inputElement = this.node;
        if (inputElement.type !== "checkbox")
            return;
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        if (eventName === "readonly" || eventName === "ro")
            return;
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async (e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * Sets checked state based on whether array includes filteredValue.
     *
     * @param value - Array of checked values
     * @throws BIND-201 Value is not array
     */
    assignValue(value) {
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const filteredValue = this.filteredValue;
        const element = this.node;
        element.checked = value.includes(filteredValue);
    }
}
/**
 * Factory function to generate checkbox binding node.
 *
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeCheckbox with binding, node, and filters
 */
const createBindingNodeCheckbox = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeCheckbox(binding, node, name, "", filterFns, decorates);
};

/**
 * BindingNodeClassList class implements binding for class attribute (classList).
 * Converts array value to space-separated string and sets to className.
 * One-way binding only.
 *
 * @throws BIND-201 Value is not array: When non-array value is passed
 */
class BindingNodeClassList extends BindingNode {
    /**
     * Converts array to space-separated string and sets to element.className.
     *
     * @param value - Array of class names
     * @throws BIND-201 Value is not array
     */
    assignValue(value) {
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.className = value.join(" ");
    }
}
/**
 * Factory function to generate classList binding node.
 *
 * @param name - Binding name ("class")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeClassList with binding, node, and filters
 */
const createBindingNodeClassList = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeClassList(binding, node, name, "", filterFns, decorates);
};

/**
 * BindingNodeClassName class implements toggle control for individual class names.
 * Uses classList.toggle based on boolean value.
 *
 * @throws BIND-201 Value is not boolean: When non-boolean value is passed
 */
class BindingNodeClassName extends BindingNode {
    /**
     * Adds or removes class based on boolean value using classList.toggle.
     *
     * @param value - Boolean value (true: add class, false: remove class)
     * @throws BIND-201 Value is not boolean
     */
    assignValue(value) {
        if (typeof value !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeClassName.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.classList.toggle(this.subName, value);
    }
}
/**
 * Factory function to generate class name binding node.
 *
 * @param name - Binding name (e.g., "class.active")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeClassName with binding, node, and filters
 */
const createBindingNodeClassName = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeClassName(binding, node, name, subName, filterFns, decorates);
};

/**
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 * Extracts event name from binding name ("onClick" → "click") and registers as event listener.
 * Supports preventDefault/stopPropagation decorators and passes loop indexes to handlers.
 *
 * @throws BIND-201 is not a function: When binding value is not a function
 */
class BindingNodeEvent extends BindingNode {
    /**
     * Registers event listener once at initialization.
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node to attach event listener
     * @param name - Binding name (e.g., "onClick", "onInput")
     * @param subName - Event name extracted from binding name (e.g., "click", "input")
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators ("preventDefault", "stopPropagation")
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const element = node;
        element.addEventListener(this.subName, (e) => this.handler(e));
    }
    /**
     * Event binding does nothing on state change.
     */
    update() {
    }
    /**
     * Executes bound function with event object and loop indexes as arguments.
     * Supports preventDefault/stopPropagation decorators.
     *
     * @param e - DOM event object
     * @returns Promise if handler returns Promise, void otherwise
     * @throws BIND-201 Binding value is not a function
     */
    async handler(e) {
        const engine = this.binding.engine;
        const loopContext = this.binding.parentBindContent.currentLoopContext;
        const indexes = loopContext?.serialize().map((context) => context.listIndex.index) ?? [];
        const options = this.decorates;
        if (options.includes("preventDefault")) {
            e.preventDefault();
        }
        if (options.includes("stopPropagation")) {
            e.stopPropagation();
        }
        const resultPromise = createUpdater(engine, (updater) => {
            return updater.update(loopContext, (state, handler) => {
                const func = this.binding.bindingState.getValue(state, handler);
                if (typeof func !== "function") {
                    raiseError({
                        code: 'BIND-201',
                        message: `${this.name} is not a function`,
                        context: { where: 'BindingNodeEvent.handler', name: this.name, receivedType: typeof func },
                        docsUrl: '/docs/error-codes.md#bind',
                        severity: 'error',
                    });
                }
                return Reflect.apply(func, state, [e, ...indexes]);
            });
        });
        if (resultPromise instanceof Promise) {
            await resultPromise;
        }
    }
    /**
     * Event binding does nothing on state change.
     *
     * @param renderer - Renderer instance (unused)
     */
    applyChange(renderer) {
    }
}
/**
 * Factory function to generate event binding node.
 *
 * @param name - Binding name (e.g., "onClick", "onInput")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators ("preventDefault", "stopPropagation")
 * @returns Function that creates BindingNodeEvent with binding, node, and filters
 */
const createBindingNodeEvent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const subName = name.slice(2);
    return new BindingNodeEvent(binding, node, name, subName, filterFns, decorates);
};

const COMMENT_TEMPLATE_MARK_LEN$1 = COMMENT_TEMPLATE_MARK.length;
/**
 * BindingNodeBlock is the base class for template blocks (for, if, etc.).
 * Extracts and validates template ID from comment node format: "@@|<id> <pattern>"
 *
 * Validation: Non-negative integer only, no leading zeros.
 *
 * @throws BIND-201 Invalid node: When ID cannot be extracted from comment node
 */
class BindingNodeBlock extends BindingNode {
    #id;
    /**
     * Returns template ID extracted from comment node.
     *
     * @returns Template ID (non-negative integer)
     */
    get id() {
        return this.#id;
    }
    /**
     * Extracts and validates template ID from comment node.
     * Rejects leading zeros, decimals, negatives, NaN, and Infinity.
     *
     * @param binding - Parent IBinding instance
     * @param node - Comment node containing template ID
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators
     * @throws BIND-201 Invalid node (cannot extract valid template ID)
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const commentText = this.node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN$1) ?? raiseError({
            code: 'BIND-201',
            message: 'Invalid node',
            context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent ?? null },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
        const [id,] = commentText.split(' ', 2);
        const numId = Number(id);
        if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
            raiseError({
                code: 'BIND-201',
                message: 'Invalid node',
                context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        this.#id = numId;
    }
}

/**
 * BindingNode for conditional rendering (if binding).
 * Controls BindContent mount/unmount based on boolean value.
 * Uses comment node as marker to insert/remove content.
 *
 * @throws BIND-201 assignValue not implemented
 * @throws BIND-201 Value must be boolean
 * @throws BIND-201 ParentNode is null
 */
class BindingNodeIf extends BindingNodeBlock {
    _bindContent;
    _trueBindContents;
    _falseBindContents = [];
    _bindContents;
    /**
     * Initializes BindContent with blank reference.
     * Initial state treated as false (unmounted).
     *
     * @param binding - Parent IBinding instance
     * @param node - Comment node as marker
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const blankInfo = getStructuredPathInfo("");
        const blankRef = getStatePropertyRef(blankInfo, null);
        this._bindContent = createBindContent(this.binding, this.id, this.binding.engine, blankRef);
        this._trueBindContents = [this._bindContent];
        this._bindContents = this._falseBindContents;
    }
    /**
     * Returns active BindContent array (true: [_bindContent], false: []).
     *
     * @returns Array of active IBindContent instances
     */
    get bindContents() {
        return this._bindContents;
    }
    /**
     * Not implemented. Use applyChange for mount/unmount control.
     *
     * @param value - Value (unused)
     * @throws BIND-201 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-201',
            message: 'Not implemented',
            context: { where: 'BindingNodeIf.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
    }
    /**
     * Validates boolean value and controls mount/unmount.
     * True: activate + mount + applyChange
     * False: unmount + inactivate
     *
     * @param renderer - Renderer instance for state access
     * @throws BIND-201 Value is not boolean
     * @throws BIND-201 ParentNode is null
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        if (typeof filteredValue !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeIf.applyChange', valueType: typeof filteredValue },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const parentNode = this.node.parentNode;
        if (parentNode == null) {
            raiseError({
                code: 'BIND-201',
                message: 'ParentNode is null',
                context: { where: 'BindingNodeIf.applyChange', nodeType: this.node.nodeType },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        if (filteredValue) {
            this._bindContent.activate();
            this._bindContent.mountAfter(parentNode, this.node);
            this._bindContent.applyChange(renderer);
            this._bindContents = this._trueBindContents;
        }
        else {
            this._bindContent.unmount();
            this._bindContent.inactivate();
            this._bindContents = this._falseBindContents;
        }
    }
    /**
     * Cleanup: unmount and inactivate content.
     */
    inactivate() {
        this._bindContent.unmount();
        this._bindContent.inactivate();
        this._bindContents = this._falseBindContents;
    }
}
/**
 * Factory function to create BindingNodeIf instances.
 *
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeIf with binding, node, and filters
 */
const createBindingNodeIf = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeIf(binding, node, name, "", filterFns, decorates);
};

const EMPTY_SET = new Set();
const USE_ALL_APPEND = globalThis.__STRUCTIVE_USE_ALL_APPEND__ === true;
/**
 * BindingNode for loop rendering (for binding).
 * Manages BindContent instances for each list element with efficient diff detection and pooling.
 */
class BindingNodeFor extends BindingNodeBlock {
    _bindContents = [];
    _bindContentByListIndex = new WeakMap();
    _bindContentPool = [];
    _bindContentLastIndex = 0;
    _loopInfo = undefined;
    _oldList = undefined;
    _oldListIndexes = [];
    _oldListIndexSet = new Set();
    /**
     * Returns array of active BindContent instances for each list element.
     *
     * @returns Array of IBindContent instances
     */
    get bindContents() {
        return this._bindContents;
    }
    /**
     * Returns last index of available BindContent in pool.
     *
     * @returns Last pool index (-1 if pool is empty)
     */
    get bindContentLastIndex() {
        return this._bindContentLastIndex;
    }
    /**
     * Sets last index of available BindContent in pool.
     *
     * @param value - New last index value
     */
    set bindContentLastIndex(value) {
        this._bindContentLastIndex = value;
    }
    /**
     * Returns current pool size.
     *
     * @returns Number of BindContent instances in pool
     */
    get poolLength() {
        return this._bindContentPool.length;
    }
    /**
     * Sets pool size, truncating if smaller than current size.
     *
     * @param length - New pool length
     * @throws BIND-202 Length is negative
     */
    set poolLength(length) {
        if (length < 0) {
            raiseError({
                code: 'BIND-202',
                message: 'Length is negative',
                context: { where: 'BindingNodeFor.setPoolLength', length },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        this._bindContentPool.length = length;
    }
    /**
     * Returns structured path info for loop with wildcard (lazy-initialized).
     *
     * @returns IStructuredPathInfo for loop elements
     */
    get loopInfo() {
        if (typeof this._loopInfo === "undefined") {
            const loopPath = this.binding.bindingState.pattern + ".*";
            this._loopInfo = getStructuredPathInfo(loopPath);
        }
        return this._loopInfo;
    }
    /**
     * Creates or reuses BindContent from pool for given list index.
     *
     * @param renderer - Renderer instance (unused)
     * @param listIndex - List index for new BindContent
     * @returns Created or reused IBindContent instance
     */
    createBindContent(renderer, listIndex) {
        let bindContent;
        if (this._bindContentLastIndex >= 0) {
            bindContent = this._bindContentPool[this._bindContentLastIndex];
            this._bindContentLastIndex--;
            bindContent.assignListIndex(listIndex);
        }
        else {
            const loopRef = getStatePropertyRef(this.loopInfo, listIndex);
            bindContent = createBindContent(this.binding, this.id, this.binding.engine, loopRef);
        }
        this._bindContentByListIndex.set(listIndex, bindContent);
        bindContent.activate();
        return bindContent;
    }
    /**
     * Unmounts and inactivates BindContent (returned to pool later).
     *
     * @param bindContent - BindContent to delete
     */
    deleteBindContent(bindContent) {
        bindContent.unmount();
        bindContent.inactivate();
    }
    /**
     * Not implemented. Use applyChange for list updates.
     *
     * @param value - Value (unused)
     * @throws BIND-301 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented. Use update or applyChange',
            context: { where: 'BindingNodeFor.assignValue' },
            docsUrl: './docs/error-codes.md#bind',
        });
    }
    /**
     * Applies list changes using diff detection algorithm.
     * Handles adds, removes, reorders, and overwrites efficiently.
     *
     * @param renderer - Renderer instance for state access
     * @throws BIND-201 ListIndex is null, BindContent not found, ParentNode is null, Last content is null
     */
    applyChange(renderer) {
        let newBindContents = [];
        // Detect changes: adds, removes, changeIndexes, overwrites
        const newList = renderer.readonlyState[GetByRefSymbol](this.binding.bindingState.ref);
        const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
        const newListIndexesSet = new Set(newListIndexes);
        new Set(this._oldList ?? EMPTY_SET);
        const oldListLength = this._oldList?.length ?? 0;
        const removesSet = newListIndexesSet.size === 0 ? this._oldListIndexSet : this._oldListIndexSet.difference(newListIndexesSet);
        const addsSet = this._oldListIndexSet.size === 0 ? newListIndexesSet : newListIndexesSet.difference(this._oldListIndexSet);
        const newListLength = newList?.length ?? 0;
        const changeIndexesSet = new Set();
        const overwritesSet = new Set();
        // Classify updating refs into changeIndexes or overwrites
        const elementsPath = this.binding.bindingState.info.pattern + ".*";
        for (let i = 0; i < renderer.updatingRefs.length; i++) {
            const updatingRef = renderer.updatingRefs[i];
            if (updatingRef.info.pattern !== elementsPath)
                continue;
            if (renderer.processedRefs.has(updatingRef))
                continue;
            const listIndex = updatingRef.listIndex;
            if (listIndex === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'ListIndex is null',
                    context: { where: 'BindingNodeFor.applyChange', ref: updatingRef },
                    docsUrl: './docs/error-codes.md#bind',
                });
            }
            if (this._oldListIndexSet.has(listIndex)) {
                changeIndexesSet.add(listIndex);
            }
            else {
                overwritesSet.add(listIndex);
            }
            renderer.processedRefs.add(updatingRef);
        }
        const parentNode = this.node.parentNode ?? raiseError({
            code: 'BIND-201',
            message: 'ParentNode is null',
            context: { where: 'BindingNodeFor.applyChange' },
            docsUrl: './docs/error-codes.md#bind',
        });
        const removeBindContentsSet = new Set();
        const isAllRemove = (oldListLength === removesSet.size && oldListLength > 0);
        // Optimization: clear parent node if removing all elements
        let isParentNodeHasOnlyThisNode = false;
        if (isAllRemove) {
            const parentChildNodes = Array.from(parentNode.childNodes);
            const lastContent = this._bindContents.at(-1) ?? raiseError({
                code: 'BIND-201',
                message: 'Last content is null',
                context: { where: 'BindingNodeFor.applyChange' },
                docsUrl: '/docs/error-codes.md#bind',
            });
            let firstNode = parentChildNodes[0];
            while (firstNode && firstNode.nodeType === Node.TEXT_NODE && firstNode.textContent?.trim() === "") {
                firstNode = firstNode.nextSibling;
            }
            let lastNode = parentChildNodes.at(-1) ?? null;
            while (lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent?.trim() === "") {
                lastNode = lastNode.previousSibling;
            }
            if (firstNode === this.node && lastNode === lastContent.getLastNode(parentNode)) {
                isParentNodeHasOnlyThisNode = true;
            }
        }
        if (isAllRemove && isParentNodeHasOnlyThisNode) {
            parentNode.textContent = "";
            parentNode.append(this.node);
            for (let i = 0; i < this._bindContents.length; i++) {
                this._bindContents[i].inactivate();
            }
            this._bindContentPool.push(...this._bindContents);
        }
        else {
            if (removesSet.size > 0) {
                for (const listIndex of removesSet) {
                    const bindContent = this._bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'removes' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    this.deleteBindContent(bindContent);
                    removeBindContentsSet.add(bindContent);
                }
                this._bindContentPool.push(...removeBindContentsSet);
            }
        }
        let lastBindContent = null;
        const firstNode = this.node;
        this.bindContentLastIndex = this.poolLength - 1;
        const isAllAppend = USE_ALL_APPEND && (newListLength === addsSet.size && newListLength > 0);
        // Optimization: reorder-only path when no adds/removes
        const isReorder = addsSet.size === 0 && removesSet.size === 0 &&
            (changeIndexesSet.size > 0 || overwritesSet.size > 0);
        if (!isReorder) {
            // Rebuild path: create/reuse BindContents in new order
            const oldIndexByListIndex = new Map();
            for (let i = 0; i < this._oldListIndexes.length; i++) {
                oldIndexByListIndex.set(this._oldListIndexes[i], i);
            }
            const fragmentParentNode = isAllAppend ? document.createDocumentFragment() : parentNode;
            const fragmentFirstNode = isAllAppend ? null : firstNode;
            const changeListIndexes = [];
            for (let i = 0; i < newListIndexes.length; i++) {
                const listIndex = newListIndexes[i];
                const lastNode = lastBindContent?.getLastNode(fragmentParentNode) ?? fragmentFirstNode;
                let bindContent;
                if (addsSet.has(listIndex)) {
                    bindContent = this.createBindContent(renderer, listIndex);
                    bindContent.mountAfter(fragmentParentNode, lastNode);
                    bindContent.applyChange(renderer);
                }
                else {
                    bindContent = this._bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'reuse' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    if (lastNode?.nextSibling !== bindContent.firstChildNode) {
                        bindContent.mountAfter(fragmentParentNode, lastNode);
                    }
                    const oldIndex = oldIndexByListIndex.get(listIndex);
                    if (typeof oldIndex !== "undefined" && oldIndex !== i) {
                        changeListIndexes.push(listIndex);
                    }
                }
                newBindContents.push(bindContent);
                lastBindContent = bindContent;
            }
            if (isAllAppend) {
                const beforeNode = firstNode.nextSibling;
                parentNode.insertBefore(fragmentParentNode, beforeNode);
            }
            for (const listIndex of changeListIndexes) {
                const bindings = this.binding.bindingsByListIndex.get(listIndex) ?? [];
                for (const binding of bindings) {
                    if (renderer.updatedBindings.has(binding))
                        continue;
                    binding.applyChange(renderer);
                }
            }
        }
        else {
            // Reorder path: only move DOM nodes without recreating
            if (changeIndexesSet.size > 0) {
                const bindContents = Array.from(this._bindContents);
                const changeIndexes = Array.from(changeIndexesSet);
                changeIndexes.sort((a, b) => a.index - b.index);
                for (const listIndex of changeIndexes) {
                    const bindContent = this._bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'reorder' },
                            docsUrl: '/docs/error-codes.md#bind',
                        });
                    }
                    bindContents[listIndex.index] = bindContent;
                    const lastNode = bindContents[listIndex.index - 1]?.getLastNode(parentNode) ?? firstNode;
                    bindContent.mountAfter(parentNode, lastNode);
                }
                newBindContents = bindContents;
            }
            if (overwritesSet.size > 0) {
                for (const listIndex of overwritesSet) {
                    const bindContent = this._bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'overwrites' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    bindContent.applyChange(renderer);
                }
            }
        }
        // Update state for next diff detection
        this.poolLength = this.bindContentLastIndex + 1;
        this._bindContents = newBindContents;
        this._oldList = [...newList];
        this._oldListIndexes = [...newListIndexes];
        this._oldListIndexSet = newListIndexesSet;
    }
    /**
     * Inactivates all BindContents and resets state.
     */
    inactivate() {
        for (let i = 0; i < this._bindContents.length; i++) {
            const bindContent = this._bindContents[i];
            bindContent.unmount();
            bindContent.inactivate();
        }
        this._bindContentPool.push(...this._bindContents);
        this._bindContents = [];
        this._bindContentByListIndex = new WeakMap();
        this._bindContentLastIndex = 0;
        this._oldList = undefined;
        this._oldListIndexes = [];
        this._oldListIndexSet = new Set();
    }
}
/**
 * Factory function to create BindingNodeFor instances.
 *
 * @param name - Binding name (list property path)
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeFor with binding, node, and filters
 */
const createBindingNodeFor = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeFor(binding, node, name, "", filterFns, decorates);
};

/**
 * Checks if element supports bidirectional binding.
 *
 * @param element - HTML element to check
 * @returns true if element is input/textarea/select, false otherwise
 */
function isTwoWayBindable(element) {
    return element instanceof HTMLInputElement
        || element instanceof HTMLTextAreaElement
        || element instanceof HTMLSelectElement;
}
/**
 * Default event names for bidirectional binding by property name.
 */
const defaultEventByName = {
    value: "input",
    valueAsNumber: "input",
    valueAsDate: "input",
    checked: "change",
    selected: "change",
};
/**
 * Bidirectional bindable properties by input type.
 */
const twoWayPropertyByElementType = {
    radio: new Set(["checked"]),
    checkbox: new Set(["checked"]),
};
const VALUES_SET = new Set(["value", "valueAsNumber", "valueAsDate"]);
const BLANK_SET = new Set();
/**
 * Returns bidirectional bindable property set for element.
 *
 * @param node - DOM node to check
 * @returns Set of bindable property names (e.g., "value", "checked")
 */
const getTwoWayPropertiesHTMLElement = (node) => node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement
    ? VALUES_SET
    : node instanceof HTMLInputElement
        ? (twoWayPropertyByElementType[node.type] ?? VALUES_SET)
        : BLANK_SET;
/**
 * BindingNode for property binding (value, checked, etc.).
 * Supports bidirectional binding with event listeners.
 * Converts null/undefined/NaN to empty string.
 */
class BindingNodeProperty extends BindingNode {
    /**
     * Returns raw property value from DOM node.
     *
     * @returns Property value
     */
    get value() {
        // @ts-ignore
        return this.node[this.name];
    }
    /**
     * Returns property value with filters applied.
     *
     * @returns Filtered property value
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Registers event listener for bidirectional binding if:
     * - Element supports two-way binding (input/textarea/select)
     * - Property name is bindable (value, checked, etc.)
     * - Not readonly decorator
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node
     * @param name - Property name (e.g., "value", "checked")
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators (event name or "readonly"/"ro")
     * @throws BIND-201 Has multiple decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const isElement = this.node instanceof HTMLElement;
        if (!isElement)
            return;
        if (!isTwoWayBindable(this.node))
            return;
        const defaultNames = getTwoWayPropertiesHTMLElement(this.node);
        if (!defaultNames.has(this.name))
            return;
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeProperty.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? defaultEventByName[this.name] ?? "readonly";
        if (eventName === "readonly" || eventName === "ro")
            return;
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async () => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * Assigns value to property, converting null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to property
     */
    assignValue(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        // @ts-ignore
        this.node[this.name] = value;
    }
}
/**
 * Factory function to create BindingNodeProperty instances.
 *
 * @param name - Property name (e.g., "value", "checked")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeProperty with binding, node, and filters
 */
const createBindingNodeProperty = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeProperty(binding, node, name, "", filterFns, decorates);
};

/**
 * BindingNodeRadio class implements binding processing for radio buttons.
 * - Controls checked state by comparing binding value with input element value
 * - Supports bidirectional binding (auto-updates state on user selection)
 * - Converts null/undefined to empty string for comparison
 */
class BindingNodeRadio extends BindingNode {
    /**
     * Returns raw value attribute of radio input element.
     *
     * @returns Value attribute string
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * Returns value with all filters applied.
     *
     * @returns Filtered value
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Constructor sets up radio button bidirectional binding.
     * - Validates decorates count (max 1)
     * - Registers event listener for state updates (skipped if readonly/ro)
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node (should be HTMLInputElement with type="radio")
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators (event name or "readonly"/"ro")
     * @throws BIND-201 Has multiple decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement)
            return;
        const inputElement = this.node;
        if (inputElement.type !== "radio")
            return;
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeRadio.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        if (eventName === "readonly" || eventName === "ro")
            return;
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async (e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * Sets checked state by comparing binding value with filteredValue.
     * Converts null/undefined to empty string for comparison.
     *
     * @param value - Value from state binding
     */
    assignValue(value) {
        if (value === null || value === undefined) {
            value = "";
        }
        const element = this.node;
        element.checked = value === this.filteredValue;
    }
}
/**
 * Factory function to generate radio button binding node.
 *
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeRadio with binding, node, and filters
 */
const createBindingNodeRadio = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeRadio(binding, node, name, "", filterFns, decorates);
};

/**
 * BindingNodeStyle class implements binding processing for style attributes.
 * - Extracts CSS property name (subName) from name and sets value with style.setProperty
 * - Converts null/undefined/NaN to empty string
 */
class BindingNodeStyle extends BindingNode {
    /**
     * Sets CSS property value. Converts null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to CSS property
     */
    assignValue(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        const element = this.node;
        element.style.setProperty(this.subName, value.toString());
    }
}
/**
 * Factory function to generate style attribute binding node.
 *
 * @param name - Binding name (e.g., "style.color")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeStyle with binding, node, and filters
 */
const createBindingNodeStyle = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeStyle(binding, node, name, subName, filterFns, decorates);
};

const symbolName = "component-state-input";
const AssignStateSymbol = Symbol.for(`${symbolName}.AssignState`);
const NotifyRedrawSymbol = Symbol.for(`${symbolName}.NotifyRedraw`);

const parentStructiveComponentByStructiveComponent = new WeakMap();
function findStructiveParent(el) {
    return parentStructiveComponentByStructiveComponent.get(el) ?? null;
}
function registerStructiveComponent(parentComponent, component) {
    parentStructiveComponentByStructiveComponent.set(component, parentComponent);
}
function removeStructiveComponent(component) {
    parentStructiveComponentByStructiveComponent.delete(component);
}

function getCustomTagName(component) {
    if (component.tagName.includes('-')) {
        return component.tagName.toLowerCase();
    }
    else if (component.getAttribute('is')?.includes('-')) {
        return component.getAttribute('is').toLowerCase();
    }
    else {
        raiseError({
            code: 'CE-001',
            message: 'Custom tag name not found',
            context: { where: 'ComponentEngine.customTagName.get' },
            docsUrl: './docs/error-codes.md#ce',
        });
    }
}

/**
 * BindingNodeComponent class implements binding processing to StructiveComponent (custom component).
 *
 * Responsibilities:
 * - Binds parent component state to child component state property
 * - Propagates state changes via NotifyRedrawSymbol
 * - Manages parent-child component relationships and lifecycle
 *
 * @throws COMP-401 Cannot determine custom element tag name: When tag name cannot be determined
 */
class BindingNodeComponent extends BindingNode {
    tagName;
    /**
     * Determines custom element tag name from element's tagName or is attribute.
     *
     * @param binding - Parent IBinding instance
     * @param node - Custom element node
     * @param name - Binding name
     * @param subName - Sub-property name (component state property)
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators
     * @throws COMP-401 Cannot determine custom element tag name
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const element = this.node;
        if (element.tagName.includes("-")) {
            this.tagName = element.tagName.toLowerCase();
        }
        else if (element.getAttribute("is")?.includes("-")) {
            this.tagName = element.getAttribute("is").toLowerCase();
        }
        else {
            raiseError({
                code: 'COMP-401',
                message: 'Cannot determine custom element tag name',
                context: { where: 'BindingNodeComponent.constructor' },
                docsUrl: '/docs/error-codes.md#comp',
            });
        }
    }
    /**
     * Sends redraw notification to child component after custom element is defined.
     *
     * @param refs - Array of state property references to notify
     */
    _notifyRedraw(refs) {
        const component = this.node;
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            component.state[NotifyRedrawSymbol](refs);
        });
    }
    /**
     * Filters and propagates only related references to child component.
     * Skips refs that:
     * 1. Match this binding's pattern (already processed by applyChange)
     * 2. Are not in cumulative path set
     * 3. Have mismatched loop indices
     *
     * @param refs - Array of state property references to filter and propagate
     */
    notifyRedraw(refs) {
        const notifyRefs = [];
        const compRef = this.binding.bindingState.ref;
        const listIndex = compRef.listIndex;
        const atIndex = (listIndex?.length ?? 0) - 1;
        for (const ref of refs) {
            if (ref.info.pattern === compRef.info.pattern) {
                continue;
            }
            if (!ref.info.cumulativePathSet.has(compRef.info.pattern)) {
                continue;
            }
            if (atIndex >= 0) {
                if (ref.listIndex?.at(atIndex) !== listIndex) {
                    continue;
                }
            }
            notifyRefs.push(ref);
        }
        if (notifyRefs.length === 0) {
            return;
        }
        this._notifyRedraw(notifyRefs);
    }
    /**
     * Notifies child component of this binding's state change.
     *
     * @param renderer - Renderer instance
     */
    applyChange(renderer) {
        this._notifyRedraw([this.binding.bindingState.ref]);
    }
    /**
     * Registers parent-child component relationship and adds binding to tracking structures.
     */
    activate() {
        const engine = this.binding.engine;
        const parentComponent = engine.owner;
        const component = this.node;
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            parentComponent.registerChildComponent(component);
            component.stateBinding.addBinding(this.binding);
        });
        registerStructiveComponent(parentComponent, component);
        let bindings = engine.bindingsByComponent.get(component);
        if (typeof bindings === "undefined") {
            engine.bindingsByComponent.set(component, bindings = new Set());
        }
        bindings.add(this.binding);
    }
    /**
     * Unregisters component relationships and cleans up binding tracking.
     */
    inactivate() {
        const engine = this.binding.engine;
        removeStructiveComponent(this.node);
        let bindings = engine.bindingsByComponent.get(this.node);
        if (typeof bindings !== "undefined") {
            bindings.delete(this.binding);
        }
    }
}
/**
 * Factory function to generate component binding node.
 *
 * @param name - Binding name (e.g., "component.stateProp")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeComponent with binding, node, and filters
 */
const createBindingNodeComponent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeComponent(binding, node, name, subName, filterFns, decorates);
};

/**
 * Map defining specific binding node creator functions by combination of
 * node type (Element/Comment) and property name
 *
 * Index 0 (Element): Element-specific bindings
 *   - "class": classList manipulation (class attribute token list operations)
 *   - "checkbox": Checkbox checked state binding
 *   - "radio": Radio button checked state binding
 *
 * Index 1 (Comment): Comment node-specific bindings
 *   - "if": Conditional binding (element show/hide)
 */
const nodePropertyConstructorByNameByIsComment = {
    0: {
        "class": createBindingNodeClassList,
        "checkbox": createBindingNodeCheckbox,
        "radio": createBindingNodeRadio,
    },
    1: {
        "if": createBindingNodeIf,
    },
};
/**
 * Map of binding node creator functions determined by property name prefix
 * (first element before dot separator)
 *
 * Supported patterns:
 *   - "class.xxx": className binding (set entire class attribute)
 *   - "attr.xxx": attribute binding (set arbitrary attribute)
 *   - "style.xxx": style binding (set inline style)
 *   - "state.xxx": component state binding (pass state to child component)
 *
 * Examples:
 *   - "class.active" → BindingNodeClassName (set class attribute to "active")
 *   - "attr.src" → BindingNodeAttribute (set src attribute)
 *   - "style.color" → BindingNodeStyle (set color style)
 *   - "state.user" → BindingNodeComponent (pass value to child component's user state)
 */
const nodePropertyConstructorByFirstName = {
    "class": createBindingNodeClassName,
    "attr": createBindingNodeAttribute,
    "style": createBindingNodeStyle,
    "state": createBindingNodeComponent,
    //  "popover": PopoverTarget,      // For future extension
    //  "commandfor": CommandForTarget, // For future extension
};
/**
 * Internal function that returns the appropriate binding node creator function
 * (CreateBindingNodeFn) based on target node type (Element/Comment) and property name.
 *
 * Decision logic (in priority order):
 * 1. Exact match by node type and property name (nodePropertyConstructorByNameByIsComment)
 *    - Element: "class", "checkbox", "radio"
 *    - Comment: "if"
 *
 * 2. Comment node with "for" → createBindingNodeFor
 *
 * 3. Comment node with unknown property → Error
 *
 * 4. Match by property name prefix (nodePropertyConstructorByFirstName)
 *    - "class.xxx", "attr.xxx", "style.xxx", "state.xxx"
 *
 * 5. Element node starting with "on" → createBindingNodeEvent
 *    - Examples: "onclick", "onchange", "onkeydown"
 *
 * 6. Others → createBindingNodeProperty (generic property binding)
 *    - Examples: "value", "textContent", "disabled", "innerHTML"
 *
 * @param isComment - Whether it's a comment node
 * @param isElement - Whether it's an element node
 * @param propertyName - Binding property name
 * @returns Binding node creator function
 * @throws When property name is invalid
 */
function _getBindingNodeCreator(isComment, isElement, propertyName) {
    // Step 1: Get dedicated creator function by exact match of node type and property name
    const bindingNodeCreatorByName = nodePropertyConstructorByNameByIsComment[isComment ? 1 : 0][propertyName];
    if (typeof bindingNodeCreatorByName !== "undefined") {
        return bindingNodeCreatorByName;
    }
    // Step 2: For comment node with "for", use dedicated loop binding
    if (isComment && propertyName === "for") {
        return createBindingNodeFor;
    }
    // Step 3: Error for unsupported properties on comment node
    // (Only "if" and "for" are allowed on comment nodes)
    if (isComment) {
        raiseError(`getBindingNodeCreator: unknown node property ${propertyName}`);
    }
    // Step 4: Determine by property name prefix (first part before dot)
    // Example: "attr.src" → nameElements[0] = "attr"
    const nameElements = propertyName.split(".");
    const bindingNodeCreatorByFirstName = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof bindingNodeCreatorByFirstName !== "undefined") {
        return bindingNodeCreatorByFirstName;
    }
    // Step 5: For element node starting with "on", use event binding
    // Examples: "onclick", "onchange", "onsubmit"
    if (isElement) {
        if (propertyName.startsWith("on")) {
            return createBindingNodeEvent;
        }
        else {
            // Step 6a: Other element properties use generic property binding
            // Examples: "value", "textContent", "disabled"
            return createBindingNodeProperty;
        }
    }
    else {
        // Step 6b: For nodes that are neither element nor comment (Text nodes, etc.), use generic binding
        return createBindingNodeProperty;
    }
}
/**
 * Cache for binding node creator functions
 * Key format: "{isComment}\t{isElement}\t{propertyName}"
 *
 * When the same combination of node type and property name is used multiple times,
 * retrieve from cache instead of re-executing decision logic to improve performance
 */
const _cache = {};
/**
 * Factory function that retrieves the appropriate binding node creator function
 * from node, property name, filter, and decorator information.
 *
 * Processing flow:
 * 1. Determine node type (Comment/Element)
 * 2. Generate cache key ("{isComment}\t{isElement}\t{propertyName}")
 * 3. Check cache, if not exists, get via _getBindingNodeCreator and cache it
 * 4. Execute obtained creator function with property name, filters, and decorates
 * 5. Return actual binding node creator function (CreateBindingNodeByNodeFn)
 *
 * Usage example:
 * ```typescript
 * const node = document.querySelector('input');
 * const creator = getBindingNodeCreator(
 *   node,
 *   'value',
 *   [{ name: 'trim', options: [] }],
 *   ['required']
 * );
 * // creator is a function like (binding, node, filters) => BindingNodeProperty
 * ```
 *
 * @param node - Target DOM node for binding
 * @param propertyName - Binding property name (e.g., "value", "onclick", "attr.src")
 * @param filterTexts - Array of input filter metadata
 * @param decorates - Array of decorators (e.g., ["required", "trim"])
 * @returns Function that creates actual binding node instance
 */
function getBindingNodeCreator(node, propertyName, filterTexts, decorates) {
    // Determine node type
    const isComment = node instanceof Comment;
    const isElement = node instanceof Element;
    // Generate cache key (concatenate with tab separator)
    const key = isComment + "\t" + isElement + "\t" + propertyName;
    // Get from cache, if not exists, determine and save to cache
    const fn = _cache[key] ?? (_cache[key] = _getBindingNodeCreator(isComment, isElement, propertyName));
    // Execute obtained creator function with property name, filters, and decorates
    return fn(propertyName, filterTexts, decorates);
}

/**
 * BindingState class manages state property access, filtering, and updates for bindings.
 * - Supports wildcard paths for array bindings with dynamic index resolution
 * - Handles bidirectional binding via assignValue
 */
class BindingState {
    pattern;
    info;
    filters;
    isLoopIndex = false;
    _binding;
    _nullRef = null;
    _ref = null;
    _loopContext = null;
    /**
     * Constructor initializes BindingState for property binding.
     *
     * @param binding - Parent IBinding instance
     * @param pattern - State property pattern (e.g., "user.name", "items.*.value")
     * @param filters - Filter functions to apply
     */
    constructor(binding, pattern, filters) {
        this._binding = binding;
        this.pattern = pattern;
        this.info = getStructuredPathInfo(pattern);
        this.filters = filters;
        this._nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
    }
    /**
     * Returns list index from state property reference.
     *
     * @returns IListIndex or null
     */
    get listIndex() {
        return this.ref.listIndex;
    }
    /**
     * Returns state property reference, dynamically resolved for wildcard paths.
     *
     * @returns IStatePropertyRef instance
     * @throws BIND-201 LoopContext is null or ref is null
     */
    get ref() {
        if (this._nullRef === null) {
            if (this._loopContext === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            }
            if (this._ref === null) {
                this._ref = getStatePropertyRef(this.info, this._loopContext.listIndex);
            }
            return this._ref;
        }
        else {
            return this._nullRef ?? raiseError({
                code: 'BIND-201',
                message: 'ref is null',
                context: { pattern: this.pattern },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
    }
    /**
     * Retrieves raw value from state without applying filters.
     *
     * @param state - State proxy
     * @param handler - State handler
     * @returns Raw value from state
     */
    getValue(state, handler) {
        return getByRef(this._binding.engine.state, this.ref, state, handler);
    }
    /**
     * Retrieves value from state and applies all filters.
     *
     * @param state - State proxy
     * @param handler - State handler
     * @returns Filtered value
     */
    getFilteredValue(state, handler) {
        let value = getByRef(this._binding.engine.state, this.ref, state, handler);
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Assigns value to state (for bidirectional binding).
     *
     * @param writeState - Writable state proxy
     * @param handler - Writable state handler
     * @param value - Value to assign
     */
    assignValue(writeState, handler, value) {
        setByRef(this._binding.engine.state, this.ref, value, writeState, handler);
    }
    /**
     * Activates binding. Resolves loop context for wildcard bindings.
     *
     * @throws BIND-201 Wildcard last parentPath is null or LoopContext is null
     */
    activate() {
        if (this.info.wildcardCount > 0) {
            const lastWildcardPath = this.info.lastWildcardPath ??
                raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard last parentPath is null',
                    context: { where: 'BindingState.init', pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this._loopContext = this._binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ??
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { where: 'BindingState.init', lastWildcardPath },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
        }
        this._binding.engine.saveBinding(this.ref, this._binding);
    }
    /**
     * Inactivates binding and clears references.
     */
    inactivate() {
        this._binding.engine.removeBinding(this.ref, this._binding);
        this._ref = null;
        this._loopContext = null;
    }
}
/**
 * Factory function to generate BindingState instance.
 *
 * @param name - State property pattern
 * @param filterTexts - Array of filter text definitions
 * @returns Function that creates BindingState with binding and filters
 */
const createBindingState = (name, filterTexts) => (binding, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingState(binding, name, filterFns);
};

/**
 * BindingStateIndex manages binding state for loop index values ($1, $2, ...).
 * - Extracts index from loop context, supports filtering
 * - Read-only (assignValue not implemented)
 */
class BindingStateIndex {
    filters;
    _binding;
    _indexNumber;
    _loopContext = null;
    /**
     * Constructor initializes BindingStateIndex for loop index binding.
     *
     * @param binding - Parent IBinding instance
     * @param pattern - Index pattern string (e.g., "$1", "$2")
     * @param filters - Filter functions to apply
     * @throws BIND-202 Pattern is not a number
     */
    constructor(binding, pattern, filters) {
        this._binding = binding;
        const indexNumber = Number(pattern.slice(1));
        if (isNaN(indexNumber)) {
            raiseError({
                code: 'BIND-202',
                message: 'Pattern is not a number',
                context: { where: 'BindingStateIndex.constructor', pattern },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        this._indexNumber = indexNumber;
        this.filters = filters;
    }
    /**
     * Not implemented for index binding.
     *
     * @throws BIND-301 Not implemented
     */
    get pattern() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.pattern' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Not implemented for index binding.
     *
     * @throws BIND-301 Not implemented
     */
    get info() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.info' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Returns list index from current loop context.
     *
     * @returns IListIndex instance
     * @throws LIST-201 listIndex is null
     */
    get listIndex() {
        return this._loopContext?.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.listIndex' },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * Returns state property reference from loop context.
     *
     * @returns IStatePropertyRef instance
     * @throws STATE-202 ref is null
     */
    get ref() {
        return this._loopContext?.ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'BindingStateIndex.ref' },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    /**
     * Always returns true for index binding.
     *
     * @returns true
     */
    get isLoopIndex() {
        return true;
    }
    /**
     * Returns raw index value from list index.
     *
     * @param state - State proxy (unused)
     * @param handler - State handler (unused)
     * @returns Index number
     * @throws LIST-201 listIndex is null
     */
    getValue(state, handler) {
        return this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.getValue' },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * Returns filtered index value.
     *
     * @param state - State proxy (unused)
     * @param handler - State handler (unused)
     * @returns Filtered index value
     * @throws LIST-201 listIndex is null
     */
    getFilteredValue(state, handler) {
        let value = this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.getFilteredValue' },
            docsUrl: '/docs/error-codes.md#list',
        });
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Not implemented (index is read-only).
     *
     * @param writeState - Writable state proxy (unused)
     * @param handler - Writable state handler (unused)
     * @param value - Value to assign (unused)
     * @throws BIND-301 Not implemented
     */
    assignValue(writeState, handler, value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.assignValue' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Activates binding. Resolves loop context and registers to bindingsByListIndex.
     *
     * @throws BIND-201 LoopContext is null or binding for list is null
     */
    activate() {
        const loopContext = this._binding.parentBindContent.currentLoopContext ??
            raiseError({
                code: 'BIND-201',
                message: 'LoopContext is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const loopContexts = loopContext.serialize();
        this._loopContext = loopContexts[this._indexNumber - 1] ??
            raiseError({
                code: 'BIND-201',
                message: 'Current loopContext is null',
                context: { where: 'BindingStateIndex.init', indexNumber: this._indexNumber },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const bindingForList = this._loopContext.bindContent.parentBinding;
        if (bindingForList == null) {
            raiseError({
                code: 'BIND-201',
                message: 'Binding for list is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        const bindings = bindingForList.bindingsByListIndex.get(this.listIndex);
        if (typeof bindings === "undefined") {
            bindingForList.bindingsByListIndex.set(this.listIndex, new Set([this._binding]));
        }
        else {
            bindings.add(this._binding);
        }
    }
    /**
     * Inactivates binding and clears loop context reference.
     */
    inactivate() {
        this._loopContext = null;
    }
}
/**
 * Factory function to generate BindingStateIndex instance.
 *
 * @param name - Index pattern string (e.g., "$1", "$2")
 * @param filterTexts - Array of filter text definitions
 * @returns Function that creates BindingStateIndex with binding and filters
 */
const createBindingStateIndex = (name, filterTexts) => (binding, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingStateIndex(binding, name, filterFns);
};

/**
 * Regular expression to identify index references within loop context
 * Pattern: "$" + digit (e.g., "$1", "$2", "$3")
 *
 * Hierarchy structure (1-based, from outer to inner):
 * - "$1": Index of outermost loop
 * - "$2": Index of one level inner loop
 * - "$3": Index of further inner loop
 *
 * Usage example (nested loops):
 * ```
 * <ul data-bind="for:categories">              ← $1
 *   <li>
 *     <ul data-bind="for:categories.*.items">  ← $2 (child list is property of parent list element)
 *       <li data-bind="text:$1">...            ← categories index
 *       <li data-bind="text:$2">...            ← items index
 *     </ul>
 *   </li>
 * </ul>
 * ```
 *
 * Note: In nested loops, child list must be defined as property of parent list element
 * (e.g., categories.*.items means categories[i].items)
 */
const ereg = new RegExp(/^\$\d+$/);
/**
 * Factory function that returns the appropriate binding state creator function
 * (CreateBindingStateByStateFn) from target state property name and filter information.
 *
 * Decision logic:
 * 1. Check if property name matches "$digit" pattern with regex
 *    - If matches: Use createBindingStateIndex
 *      Loop index binding (e.g., $1, $2 inside for statement)
 *    - If not matches: Use createBindingState
 *      Normal state property binding (e.g., user.name)
 *
 * 2. Execute creator function with filter information
 *
 * 3. Return function that creates actual binding state instance
 *
 * Usage examples:
 * ```typescript
 * // Normal property binding
 * const creator1 = getBindingStateCreator('user.name', []);
 * // creator1 generates normal BindingState
 *
 * // Outermost loop index binding
 * const creator2 = getBindingStateCreator('$1', []);
 * // creator2 generates BindingStateIndex (accesses outermost loop index value)
 *
 * // Inner loop index in nested loops
 * const creator3 = getBindingStateCreator('$2', []);
 * // creator3 accesses index of one level inner loop
 * ```
 *
 * @param name - Target state property name (e.g., "user.name", "$1", "$2")
 * @param filterTexts - Array of output filter metadata (node→state direction)
 * @returns Function that creates actual binding state instance
 */
function getBindingStateCreator(name, filterTexts) {
    // Check if property name matches "$digit" pattern
    if (ereg.test(name)) {
        // Return creator function for loop index binding
        // "$1" → Outermost loop index (1-based)
        // "$2" → One level inner loop index
        // "$3" → Further inner loop index
        // ...and so on, proceeding inward
        return createBindingStateIndex(name, filterTexts);
    }
    else {
        // Return standard binding state creator function for normal property names
        // Examples: "user.name", "items", "isVisible"
        return createBindingState(name, filterTexts);
    }
}

/**
 * Cache comment mark lengths (performance optimization)
 */
const COMMENT_EMBED_MARK_LEN = COMMENT_EMBED_MARK.length;
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;
/**
 * Utility function that retrieves data-bind text (binding definition string) for each node type.
 * Extracts binding expressions appropriately based on how mustache syntax or comment bindings
 * were transformed during template preprocessing.
 *
 * Processing by node type:
 * 1. Text: Text node restored from comment
 *    - Get text after COMMENT_EMBED_MARK (e.g., "@@:")
 *    - Add "textContent:" prefix to create binding expression
 *    - Example: "@@:user.name" → "textContent:user.name"
 *
 * 2. HTMLElement: Regular HTML element
 *    - Get data-bind attribute value as-is
 *    - Example: <div data-bind="class:active"> → "class:active"
 *
 * 3. Template: Template reference comment
 *    - Extract template ID after COMMENT_TEMPLATE_MARK (e.g., "@@|")
 *    - Get template by ID and return its data-bind attribute value
 *    - Example: "@@|123 if:isVisible" → data-bind attribute of template 123
 *
 * 4. SVGElement: SVG element
 *    - Get data-bind attribute value as-is (same as HTML element)
 *
 * Usage examples:
 * ```typescript
 * // Text node (converted from mustache syntax)
 * const text = document.createTextNode("@@:user.name");
 * getDataBindText("Text", text); // → "textContent:user.name"
 *
 * // HTML element
 * const div = document.createElement("div");
 * div.setAttribute("data-bind", "class:active");
 * getDataBindText("HTMLElement", div); // → "class:active"
 *
 * // Template reference comment
 * const comment = document.createComment("@@|123 if:isVisible");
 * getDataBindText("Template", comment); // → data-bind value of template 123
 * ```
 *
 * @param nodeType - Node type
 * @param node - Target node
 * @returns Binding definition string (may be empty string)
 */
function getDataBindText(nodeType, node) {
    switch (nodeType) {
        case "Text": {
            // Case 1: Text node (converted from mustache syntax)
            // Get text after comment mark (e.g., "@@:") and trim
            // Add "textContent:" prefix to create binding expression
            const text = node.textContent?.slice(COMMENT_EMBED_MARK_LEN).trim() ?? "";
            return "textContent:" + text;
        }
        case "HTMLElement": {
            // Case 2: HTMLElement (regular HTML element)
            // Return data-bind attribute value as-is
            // Return empty string if attribute doesn't exist
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "Template": {
            // Case 3: Template (template reference comment node)
            // Comment text format: "@@|123 if:isVisible" format
            // Step 1: Get text after comment mark
            const text = node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN).trim();
            // Step 2: Split by space and get first element as template ID
            // Example: "123 if:isVisible" → idText = "123"
            const [idText,] = text?.split(' ', 2) ?? [];
            const id = Number(idText);
            // Step 3: Get template element by ID
            const template = getTemplateById(id);
            // Step 4: Return data-bind attribute value of template
            // Binding definition that template itself has (e.g., "if:isVisible", "for:items")
            return template.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "SVGElement": {
            // Case 4: SVGElement (SVG element)
            // Return data-bind attribute value as-is, same as HTML element
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        default:
            // Other node types (normally unreachable)
            // Return empty string
            return "";
    }
}

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
const createNodeKey = (node) => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");
const nodeTypeByNodeKey = {};
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
const getNodeTypeByNode = (node) => (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" :
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
function getNodeType(node, nodeKey = createNodeKey(node)) {
    // Check cache, if not exists, determine and save to cache
    return nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
}

/**
 * Helper function to trim whitespace from string
 */
const trim = (s) => s.trim();
/**
 * Helper function to check if string is not empty
 */
const has = (s) => s.length > 0;
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
const decode = (s) => {
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
const parseFilter = (text) => {
    // Split by comma, first is filter name, rest are options
    const [name, ...options] = text.split(",").map(trim);
    return { name, options: options.map(decode) };
};
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
const parseProperty = (text) => {
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
const parseExpression = (expression) => {
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
const parseExpressions = (text) => {
    // Split by semicolon → trim → filter empty → parse each expression
    return text.split(";").map(trim).filter(has).map(s => parseExpression(s));
};
/**
 * Cache for parse results
 * When same bind text is parsed multiple times, skip re-parsing to improve performance
 */
const cache = {};
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
function parseBindText(text) {
    // Return empty array immediately for empty string (performance optimization)
    if (text.trim() === "") {
        return [];
    }
    // Check cache, if not exists, parse and save to cache
    return cache[text] ?? (cache[text] = parseExpressions(text));
}

/**
 * Constant for data-bind attribute name
 */
const DATASET_BIND_PROPERTY = 'data-bind';
/**
 * Internal function to remove data-bind attribute from Element node.
 * Commonly used for both HTMLElement and SVGElement.
 *
 * Processing flow:
 * 1. Cast node to Element type
 * 2. Remove data-bind attribute with removeAttribute
 *
 * @param node - Target node
 */
const removeAttributeFromElement = (node) => {
    const element = node;
    element.removeAttribute(DATASET_BIND_PROPERTY);
};
/**
 * Map of attribute removal functions per node type.
 *
 * Removal targets:
 * - HTMLElement: Remove data-bind attribute
 * - SVGElement: Remove data-bind attribute
 *
 * Non-removal targets:
 * - Text: undefined (no attributes)
 * - Template: undefined (template itself is not a removal target)
 */
const removeAttributeByNodeType = {
    HTMLElement: removeAttributeFromElement,
    SVGElement: removeAttributeFromElement,
    Text: undefined,
    Template: undefined,
};
/**
 * Utility function to remove data-bind attribute from specified node.
 *
 * Executes appropriate removal processing based on node type.
 * - HTMLElement, SVGElement: Remove data-bind attribute
 * - Text, Template: Do nothing (no attributes or not a removal target)
 *
 * By using optional chaining (?.),
 * nothing is executed if undefined, processing safely.
 *
 * Processing flow:
 * 1. Get removal function corresponding to nodeType from removeAttributeByNodeType
 * 2. Execute only if function exists (HTMLElement, SVGElement)
 * 3. Do nothing if function is undefined (Text, Template)
 *
 * Usage examples:
 * ```typescript
 * // For HTMLElement
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:user.name');
 * removeDataBindAttribute(div, 'HTMLElement');
 * // → data-bind attribute is removed
 *
 * // For SVGElement
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * svg.setAttribute('data-bind', 'class:active');
 * removeDataBindAttribute(svg, 'SVGElement');
 * // → data-bind attribute is removed
 *
 * // For Text node
 * const text = document.createTextNode('Hello');
 * removeDataBindAttribute(text, 'Text');
 * // → Do nothing (no attributes)
 *
 * // For Template
 * const template = document.createElement('template');
 * removeDataBindAttribute(template, 'Template');
 * // → Do nothing (not a removal target)
 * ```
 *
 * @param node - Target node
 * @param nodeType - Node type ("HTMLElement" | "SVGElement" | "Text" | "Template")
 */
function removeDataBindAttribute(node, nodeType) {
    // Execute removal function corresponding to node type (do nothing if not exists)
    return removeAttributeByNodeType[nodeType]?.(node);
}

/**
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
 * @param node - Comment node to replace
 * @returns Newly created text node
 */
const replaceTextNodeText = (node) => {
    // Step 1: Create empty text node
    const textNode = document.createTextNode("");
    // Step 2: Replace comment node in parent node
    node.parentNode?.replaceChild(textNode, node);
    // Step 3: Return new text node
    return textNode;
};
/**
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
const replaceTextNodeFn = {
    Text: replaceTextNodeText,
    HTMLElement: undefined,
    Template: undefined,
    SVGElement: undefined
};
/**
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
 * @param node - Target node (comment node or Element node)
 * @param nodeType - Node type ("Text" | "HTMLElement" | "Template" | "SVGElement")
 * @returns Replaced node (for Text) or original node (for others)
 */
function replaceTextNodeFromComment(node, nodeType) {
    // Execute replacement function corresponding to node type (return original node if not exists)
    return replaceTextNodeFn[nodeType]?.(node) ?? node;
}

/**
 * DataBindAttributes class extracts and analyzes binding information from DOM nodes,
 * managing all necessary data (node type, path, bind texts, creators) for binding generation.
 *
 * Main processing flow:
 * 1. Determine node type (HTMLElement/SVGElement/Text/Template)
 * 2. Extract binding expression from data-bind attribute or comment
 * 3. Replace comment nodes with Text nodes (restore template preprocessing)
 * 4. Remove processed data-bind attributes (prevent duplicate processing)
 * 5. Calculate absolute node path (index array from parent)
 * 6. Parse binding expression into structured metadata (properties, filters, decorates)
 * 7. Generate factory function pairs for each bind text:
 *    - createBindingNode: Creates runtime BindingNode instance
 *    - createBindingState: Creates runtime BindingState instance
 *
 * This centralizes binding definition management in templates and streamlines
 * subsequent binding construction processes.
 */
class DataBindAttributes {
    /** Node type classification */
    nodeType;
    /** Absolute path from template root (index array) */
    nodePath;
    /** Array of parsed binding expressions */
    bindTexts;
    /** Map from bind text to factory function pairs */
    creatorByText = new Map();
    /**
     * Constructor that initializes DataBindAttributes by analyzing the provided node.
     * Extracts binding information, processes the DOM, and generates factory functions.
     *
     * @param node - DOM node to extract binding information from
     */
    constructor(node) {
        // Step 1: Determine node type
        this.nodeType = getNodeType(node);
        // Step 2: Extract binding expression from data-bind attribute or comment
        const text = getDataBindText(this.nodeType, node);
        // Step 3: Replace comment nodes with Text nodes
        // (Restores Text nodes that were converted to comments during template preprocessing)
        // Note: Directly modifies template.content
        node = replaceTextNodeFromComment(node, this.nodeType);
        // Step 4: Remove data-bind attribute (no longer needed after parsing, prevents duplicate processing)
        removeDataBindAttribute(node, this.nodeType);
        // Step 5: Calculate absolute node path (index array from parent nodes)
        this.nodePath = getAbsoluteNodePath(node);
        // Step 6: Parse binding expression into structured metadata
        // (Array of IBindText containing nodeProperty, stateProperty, filters, decorates)
        this.bindTexts = parseBindText(text);
        // Step 7: Create factory function pairs for runtime instance generation for each bind text
        for (let i = 0; i < this.bindTexts.length; i++) {
            const bindText = this.bindTexts[i];
            // Generate factory function pair:
            // - createBindingNode: Factory for BindingNode subclass (Attribute/Event/For/If, etc.)
            // - createBindingState: Factory for BindingState subclass (normal/Index/Component, etc.)
            const creator = {
                createBindingNode: getBindingNodeCreator(node, bindText.nodeProperty, bindText.inputFilterTexts, bindText.decorates),
                createBindingState: getBindingStateCreator(bindText.stateProperty, bindText.outputFilterTexts),
            };
            // Associate bind text with factory function pair
            this.creatorByText.set(bindText, creator);
        }
    }
}
/**
 * Factory function that creates a DataBindAttributes instance from the specified node.
 * Called for each data-bind target node during template compilation.
 *
 * @param node - DOM node to extract binding information from
 * @returns IDataBindAttributes object containing binding metadata
 */
function createDataBindAttributes(node) {
    return new DataBindAttributes(node);
}

/**
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
 * @param node - Node to check
 * @returns true if binding target comment node
 */
function isCommentNode(node) {
    return node instanceof Comment && ((node.textContent?.indexOf(COMMENT_EMBED_MARK) === 0) ||
        (node.textContent?.indexOf(COMMENT_TEMPLATE_MARK) === 0));
}
/**
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
 * @param root - Root node for search (typically DocumentFragment or Element)
 * @returns Array of nodes matching criteria
 */
function getNodesHavingDataBind(root) {
    // Array to store results
    const nodes = [];
    // Create TreeWalker (target element and comment nodes)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT, {
        // Custom filter: Determine ACCEPT/SKIP for each node
        acceptNode(node) {
            // Case: Element
            if (node instanceof Element) {
                // ACCEPT only if has data-bind attribute, otherwise SKIP
                return node.hasAttribute(DATA_BIND_ATTRIBUTE)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
            else {
                // Case: Comment
                // Check with isCommentNode if starts with "@@:" or "@@|"
                return isCommentNode(node)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
        }
    });
    // Move to next node with TreeWalker and add matching nodes to array
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }
    // Return array of binding target nodes
    return nodes;
}

/**
 * Cache of binding attribute lists per template ID.
 * When a template is registered, stores all binding information within that template.
 */
const listDataBindAttributesById = {};
/**
 * Cache of "for" binding stateProperty sets per template ID.
 * Used to identify state paths related to loops (lists).
 *
 * Example: "for:items" → "items" is added to listPathsSetById[id]
 */
const listPathsSetById = {};
/**
 * Cache of all binding stateProperty sets per template ID.
 * Tracks all state paths referenced within the template.
 *
 * Example: "textContent:user.name", "value:email" → "user.name", "email" are added to pathsSetById[id]
 */
const pathsSetById = {};
/**
 * Internal utility function that extracts data-bind target nodes from template's DocumentFragment
 * and converts them to IDataBindAttributes array.
 *
 * Processing flow:
 * 1. Extract nodes with bindings using getNodesHavingDataBind
 * 2. Convert each node to attribute information using createDataBindAttributes
 * 3. Return as IDataBindAttributes array
 *
 * @param content - Template's DocumentFragment
 * @returns Array of binding attribute information
 */
function getDataBindAttributesFromTemplate(content) {
    // Step 1: Get all nodes with bindings
    const nodes = getNodesHavingDataBind(content);
    // Step 2: Convert each node to attribute information
    return nodes.map(node => createDataBindAttributes(node));
}
/**
 * Parses and registers binding information (data-bind attributes and comments) within a template,
 * building and caching attribute lists and state path sets per template ID.
 *
 * Main features:
 * 1. Detects and converts all binding nodes within the template
 * 2. Registers all binding stateProperty values to pathsSetById
 * 3. Also registers "for" binding stateProperty values to listPathsSetById
 * 4. Caches parse results in listDataBindAttributesById
 *
 * rootId parameter:
 * - When templates are nested, specify the root template's ID
 * - State path sets are managed collectively by root ID
 * - If omitted, id is used as rootId
 *
 * Processing flow:
 * 1. Extract binding information using getDataBindAttributesFromTemplate
 * 2. Get paths and listPaths Sets corresponding to rootId (create new if first time)
 * 3. Traverse each binding attribute:
 *    a. Add each bindText's stateProperty to paths
 *    b. If nodeProperty is "for", also add to listPaths
 * 4. Save parse result to listDataBindAttributesById[id] and return
 *
 * Usage example:e example:
 * ```typescript
 * // Template HTML:
 * // <div data-bind="textContent:user.name"></div>
 * // <ul>
 * //   <!-- @@:for:items -->
 * //   <li data-bind="textContent:name"></li>
 * //   <!-- @@:end -->
 * // </ul>
 *
 * const template = document.getElementById('myTemplate');
 * const attributes = registerDataBindAttributes(1, template.content);
 *
 * // Result:
 * // listDataBindAttributesById[1] = [
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "user.name", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "for", stateProperty: "items", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "name", ... }], ... }
 * // ]
 * // pathsSetById[1] = Set { "user.name", "items", "name" }
 * // listPathsSetById[1] = Set { "items" }
 * ```
 *
 * @param id - Template ID
 * @param content - Template's DocumentFragment
 * @param rootId - Root template ID (defaults to id if omitted)
 * @returns Parsed binding attribute list
 */
function registerDataBindAttributes(id, content, rootId = id) {
    // Step 1: Extract all binding information from template
    const dataBindAttributes = getDataBindAttributesFromTemplate(content);
    // Step 2: Get state path sets corresponding to rootId (create new if first time)
    const paths = pathsSetById[rootId] ?? (pathsSetById[rootId] = new Set());
    const listPaths = listPathsSetById[rootId] ?? (listPathsSetById[rootId] = new Set());
    // Step 3: Traverse each binding attribute and register state paths
    for (let i = 0; i < dataBindAttributes.length; i++) {
        const attribute = dataBindAttributes[i];
        // Process stateProperty of each binding text
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            // Add stateProperty of all bindings to paths
            paths.add(bindText.stateProperty);
            // If "for" binding (loop), also add to listPaths
            if (bindText.nodeProperty === "for") {
                listPaths.add(bindText.stateProperty);
            }
        }
    }
    // Step 4: Save parse result to cache and return
    return listDataBindAttributesById[id] = dataBindAttributes;
}
/**
 * Gets registered binding attribute list from template ID.
 *
 * Used to retrieve binding information of templates
 * registered with registerDataBindAttributes.
 *
 * Usage example:
 * ```typescript
 * registerDataBindAttributes(1, template.content);
 * const attributes = getDataBindAttributesById(1);
 * // → [{ bindTexts: [...], nodeType: "Element", nodePath: [...], ... }]
 * ```
 *
 * @param id - Template ID
 * @returns Binding attribute list
 */
const getDataBindAttributesById = (id) => {
    return listDataBindAttributesById[id];
};
/**
 * Gets "for" binding (loop) stateProperty set from template ID.
 *
 * Used to identify state paths related to loops.
 * Returns empty array if not registered.
 *
 * Usage example:
 * ```typescript
 * // Assuming template contains <!-- @@:for:items -->
 * registerDataBindAttributes(1, template.content);
 * const listPaths = getListPathsSetById(1);
 * // → Set { "items" }
 *
 * // Monitor loop state changes
 * if (listPaths.has("items")) {
 *   // Process assuming items is an array
 * }
 * ```
 *
 * @param id - Template ID
 * @returns State path set of "for" bindings (empty array if not registered)
 */
const getListPathsSetById = (id) => {
    return listPathsSetById[id] ?? [];
};
/**
 * Gets all binding stateProperty set from template ID.
 *
 * Used to track all state paths referenced within the template.
 * Returns empty array if not registered.
 *
 * Usage example:
 * ```typescript
 * // Assuming template has following bindings:
 * // - textContent:user.name
 * // - value:email
 * // - for:items
 * registerDataBindAttributes(1, template.content);
 * const allPaths = getPathsSetById(1);
 * // → Set { "user.name", "email", "items" }
 *
 * // Monitor state changes
 * if (allPaths.has("user.name")) {
 *   // Process user.name change
 * }
 * ```
 *
 * @param id - Template ID
 * @returns State path set of all bindings (empty array if not registered)
 */
const getPathsSetById = (id) => {
    return pathsSetById[id] ?? [];
};

/**
 * removeEmptyTextNodes.ts
 *
 * DocumentFragment内の空テキストノードを削除するユーティリティ関数です。
 *
 * 主な役割:
 * - content（DocumentFragment）の直下にある空白のみのテキストノードを検出し、削除する
 *
 * 設計ポイント:
 * - childNodesをArray.fromで配列化し、forEachで全ノードを走査
 * - nodeTypeがTEXT_NODEかつ、nodeValueが空白のみの場合にremoveChildで削除
 * - テンプレート処理やクリーンなDOM生成時に利用
 */
function removeEmptyTextNodes(content) {
    Array.from(content.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && !(node.nodeValue ?? "").trim()) {
            content.removeChild(node);
        }
    });
}

/**
 * HTMLTemplateElement を ID で登録・取得するための管理モジュール。
 *
 * 役割:
 * - registerTemplate: 指定 ID でテンプレートを登録（空テキスト除去と data-bind 解析を実行）
 * - getTemplateById: 指定 ID のテンプレートを取得（未登録時はエラー）
 *
 * Throws（getTemplateById）:
 * - TMP-001 Template not found: 未登録のテンプレート ID を要求
 */
const templateById = {};
/**
 * テンプレートを ID で登録し、内部インデックスと data-bind 情報を構築する。
 *
 * @param id       テンプレート ID
 * @param template HTMLTemplateElement
 * @param rootId   ルートテンプレート ID（ネスト解析用）
 * @returns       登録した ID
 */
function registerTemplate(id, template, rootId) {
    removeEmptyTextNodes(template.content);
    registerDataBindAttributes(id, template.content, rootId);
    templateById[id] = template;
    return id;
}
/**
 * 登録済みテンプレートを取得する。
 *
 * @throws TMP-001 Template not found
 */
function getTemplateById(id) {
    return templateById[id] ?? raiseError({
        code: "TMP-001",
        message: `Template not found: ${id}`,
        context: { where: 'registerTemplate.getTemplateById', templateId: id },
        docsUrl: "./docs/error-codes.md#tmp",
    });
}

/**
 * Coordinates BindingNode (DOM operations) and BindingState (state management) to achieve reactive binding.
 *
 * Optimizations:
 * - Duplicate update prevention via updatedBindings set
 * - Single binding optimization: Add non-dynamic single ref to processedRefs
 * - WeakMap cache for loop index bindings
 */
class Binding {
    parentBindContent;
    engine;
    node;
    bindingNode;
    bindingState;
    bindingsByListIndex = new WeakMap();
    _isActive = false;
    /**
     * Initialize binding with factories for BindingNode and BindingState.
     * Call activate() after construction to enable.
     *
     * @param parentBindContent - Parent BindContent instance
     * @param node - DOM node to bind
     * @param engine - Component engine instance
     * @param createBindingNode - Factory function to create BindingNode
     * @param createBindingState - Factory function to create BindingState
     */
    constructor(parentBindContent, node, engine, createBindingNode, createBindingState) {
        this.parentBindContent = parentBindContent;
        this.node = node;
        this.engine = engine;
        this.bindingNode = createBindingNode(this, node, engine.inputFilters);
        this.bindingState = createBindingState(this, engine.outputFilters);
    }
    /**
     * Returns child BindContent managed by structural control bindings (for, if, etc.)
     *
     * @returns Array of child BindContent instances (empty for non-structural bindings)
     */
    get bindContents() {
        return this.bindingNode.bindContents;
    }
    /**
     * Returns whether binding is currently active.
     *
     * @returns true if binding is active, false otherwise
     */
    get isActive() {
        return this._isActive;
    }
    /**
     * Update state value for bidirectional binding (used by input, checkbox, etc.)
     *
     * @param writeState - Writable state proxy
     * @param handler - State update handler
     * @param value - Value to assign to state
     */
    updateStateValue(writeState, handler, value) {
        return this.bindingState.assignValue(writeState, handler, value);
    }
    /**
     * Notify BindingNode to redraw if its ref matches any in the provided refs array.
     *
     * @param refs - Array of state property references that require redraw
     */
    notifyRedraw(refs) {
        this.bindingNode.notifyRedraw(refs);
    }
    /**
     * Apply state changes to DOM with duplicate update prevention.
     * Optimization: Mark single binding refs as processed to avoid redundant checks.
     *
     * @param renderer - Renderer instance managing update cycle
     */
    applyChange(renderer) {
        if (renderer.updatedBindings.has(this))
            return;
        renderer.updatedBindings.add(this);
        this.bindingNode.applyChange(renderer);
        const ref = this.bindingState.ref;
        if (!this.bindingState.isLoopIndex && !this.engine.pathManager.dynamicDependencies.has(ref.info.pattern)) {
            const bindings = this.engine.getBindings(ref);
            if (bindings.length === 1) {
                renderer.processedRefs.add(ref);
            }
        }
    }
    /** Activate binding: subscribe to state and render to DOM. Not idempotent. */
    activate() {
        this._isActive = true;
        this.bindingState.activate();
        this.bindingNode.activate();
    }
    /** Inactivate binding: unsubscribe from state and cleanup resources. Idempotent. */
    inactivate() {
        if (this.isActive) {
            this.bindingNode.inactivate();
            this.bindingState.inactivate();
            this._isActive = false;
        }
    }
}
/**
 * Factory function to create Binding instance. Call activate() after creation.
 *
 * @param parentBindContent - Parent BindContent instance
 * @param node - DOM node to bind
 * @param engine - Component engine instance
 * @param createBindingNode - Factory function to create BindingNode
 * @param createBindingState - Factory function to create BindingState
 * @returns New Binding instance
 */
function createBinding(parentBindContent, node, engine, createBindingNode, createBindingState) {
    return new Binding(parentBindContent, node, engine, createBindingNode, createBindingState);
}

class LoopContext {
    #ref;
    #info;
    #bindContent;
    constructor(ref, bindContent) {
        this.#ref = ref;
        this.#info = ref.info;
        this.#bindContent = bindContent;
    }
    get ref() {
        return this.#ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'LoopContext.ref', path: this.#info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    get path() {
        return this.ref.info.pattern;
    }
    get info() {
        return this.ref.info;
    }
    get listIndex() {
        return this.ref.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is required',
            context: { where: 'LoopContext.listIndex', path: this.#info.pattern },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    assignListIndex(listIndex) {
        this.#ref = getStatePropertyRef(this.#info, listIndex);
        // 構造は変わらないので、#parentLoopContext、#cacheはクリアする必要はない
    }
    clearListIndex() {
        this.#ref = null;
    }
    get bindContent() {
        return this.#bindContent;
    }
    #parentLoopContext;
    get parentLoopContext() {
        if (typeof this.#parentLoopContext === "undefined") {
            let currentBindContent = this.bindContent;
            while (currentBindContent !== null) {
                if (currentBindContent.loopContext !== null && currentBindContent.loopContext !== this) {
                    this.#parentLoopContext = currentBindContent.loopContext;
                    break;
                }
                currentBindContent = currentBindContent.parentBinding?.parentBindContent ?? null;
            }
            if (typeof this.#parentLoopContext === "undefined")
                this.#parentLoopContext = null;
        }
        return this.#parentLoopContext;
    }
    #cache = {};
    find(name) {
        let loopContext = this.#cache[name];
        if (typeof loopContext === "undefined") {
            let currentLoopContext = this;
            while (currentLoopContext !== null) {
                if (currentLoopContext.path === name)
                    break;
                currentLoopContext = currentLoopContext.parentLoopContext;
            }
            loopContext = this.#cache[name] = currentLoopContext;
        }
        return loopContext;
    }
    walk(callback) {
        let currentLoopContext = this;
        while (currentLoopContext !== null) {
            callback(currentLoopContext);
            currentLoopContext = currentLoopContext.parentLoopContext;
        }
    }
    serialize() {
        const results = [];
        this.walk((loopContext) => {
            results.unshift(loopContext);
        });
        return results;
    }
}
// 生成されたあと、IBindContentのloopContextに登録される
// IBindContentにずっと保持される
function createLoopContext(ref, bindContent) {
    return new LoopContext(ref, bindContent);
}

/**
 * Internal helper function to generate DocumentFragment from template ID.
 * Automatically loads lazy-load components if present.
 *
 * @param id - Registered template ID
 * @returns DocumentFragment with copied template content
 * @throws BIND-101 Template not found
 */
function createContent(id) {
    const template = getTemplateById(id) ??
        raiseError({
            code: "BIND-101",
            message: `Template not found: ${id}`,
            context: { where: 'BindContent.createContent', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    const fragment = document.importNode(template.content, true);
    if (hasLazyLoadComponents()) {
        const lazyLoadElements = fragment.querySelectorAll(":not(:defined)");
        for (let i = 0; i < lazyLoadElements.length; i++) {
            const tagName = lazyLoadElements[i].tagName.toLowerCase();
            loadLazyLoadComponent(tagName);
        }
    }
    return fragment;
}
/**
 * Internal function to construct IBinding array from data-bind information within template.
 * Uses factory functions to generate appropriate binding types.
 *
 * @param bindContent - Parent BindContent
 * @param id - Template ID
 * @param engine - Component engine
 * @param content - Fragment copied from template
 * @returns Array of generated IBinding
 * @throws BIND-101 Data-bind is not set
 * @throws BIND-102 Node not found
 * @throws BIND-103 Creator not found
 */
function createBindings(bindContent, id, engine, content) {
    const attributes = getDataBindAttributesById(id) ??
        raiseError({
            code: "BIND-101",
            message: "Data-bind is not set",
            context: { where: 'BindContent.createBindings', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    const bindings = [];
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        const node = resolveNodeFromPath(content, attribute.nodePath) ??
            raiseError({
                code: "BIND-102",
                message: `Node not found: ${attribute.nodePath}`,
                context: { where: 'BindContent.createBindings', templateId: id, nodePath: attribute.nodePath },
                docsUrl: "./docs/error-codes.md#bind",
            });
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            const creator = attribute.creatorByText.get(bindText) ??
                raiseError({
                    code: "BIND-103",
                    message: `Creator not found: ${bindText}`,
                    context: { where: 'BindContent.createBindings', templateId: id, bindText },
                    docsUrl: "./docs/error-codes.md#bind",
                });
            // Generate Binding instance (includes BindingNode and BindingState)
            const binding = createBinding(bindContent, node, engine, creator.createBindingNode, creator.createBindingState);
            // Add to array
            bindings.push(binding);
        }
    }
    // Step 4: Return generated IBinding array
    return bindings;
}
/**
 * BindContent class manages DOM fragments generated from templates and their binding information.
 * Supports hierarchical structure, loops, and lifecycle management.
 *
 * @throws BIND-101 Template not found (in createContent)
 * @throws BIND-101/102/103 data-bind info issues (in createBindings)
 * @throws BIND-104 Child bindContent not found (getLastNode)
 * @throws BIND-201 LoopContext is null (assignListIndex)
 */
class BindContent {
    parentBinding;
    loopContext;
    id;
    firstChildNode;
    lastChildNode;
    fragment;
    childNodes;
    bindings = [];
    _engine;
    _isActive = false;
    _currentLoopContext;
    /**
     * Recursively retrieves the last node, including those under trailing bindings.
     * Used for determining DOM insertion position in BindingNodeFor.
     *
     * @param parentNode - Parent node for validation
     * @returns Last node or null if parent-child relationship broken
     * @throws BIND-104 Child bindContent not found
     */
    getLastNode(parentNode) {
        const lastBinding = this.bindings[this.bindings.length - 1];
        const lastChildNode = this.lastChildNode;
        if (typeof lastBinding !== "undefined" && lastBinding.node === lastChildNode) {
            if (lastBinding.bindContents.length > 0) {
                const childBindContent = lastBinding.bindContents.at(-1) ?? raiseError({
                    code: "BIND-104",
                    message: "Child bindContent not found",
                    context: { where: 'BindContent.getLastNode', templateId: this.id },
                    docsUrl: "./docs/error-codes.md#bind",
                });
                const lastNode = childBindContent.getLastNode(parentNode);
                if (lastNode !== null) {
                    return lastNode;
                }
            }
        }
        if (parentNode !== lastChildNode?.parentNode) {
            return null;
        }
        return lastChildNode;
    }
    /**
     * Getter to retrieve current loop context with caching.
     * Traverses parent direction on first access, cached thereafter.
     *
     * @returns Current ILoopContext or null if not in loop
     */
    get currentLoopContext() {
        if (typeof this._currentLoopContext === "undefined") {
            let bindContent = this;
            while (bindContent !== null) {
                if (bindContent.loopContext !== null)
                    break;
                bindContent = bindContent.parentBinding?.parentBindContent ?? null;
            }
            this._currentLoopContext = bindContent?.loopContext ?? null;
        }
        return this._currentLoopContext;
    }
    /**
     * Constructor initializes BindContent from template ID.
     * Generates LoopContext if loopRef has listIndex.
     * Call activate() after construction to enable bindings.
     *
     * @param parentBinding - Parent IBinding (null if root)
     * @param id - Template ID
     * @param engine - Component engine instance
     * @param loopRef - StatePropertyRef for loop context
     * @throws BIND-101 Template not found or data-bind not set
     * @throws BIND-102 Node not found in template
     * @throws BIND-103 Creator not found for bindText
     */
    constructor(parentBinding, id, engine, loopRef) {
        this.parentBinding = parentBinding;
        this.id = id;
        this.fragment = createContent(id);
        this.childNodes = Array.from(this.fragment.childNodes);
        this.firstChildNode = this.childNodes[0] ?? null;
        this.lastChildNode = this.childNodes[this.childNodes.length - 1] ?? null;
        this._engine = engine;
        this.loopContext = (loopRef.listIndex !== null) ? createLoopContext(loopRef, this) : null;
        const bindings = createBindings(this, id, engine, this.fragment);
        this.bindings = bindings;
    }
    /**
     * Returns whether BindContent is currently active.
     *
     * @returns true if active, false otherwise
     */
    get isActive() {
        return this._isActive;
    }
    /**
     * Mounts childNodes to end of parent node (appendChild).
     * Not idempotent - caller must avoid duplicate mounts.
     *
     * @param parentNode - Parent node for mount destination
     */
    mount(parentNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.appendChild(this.childNodes[i]);
        }
    }
    /**
     * Mounts childNodes immediately before specified node (insertBefore).
     * If beforeNode is null, appends to end.
     *
     * @param parentNode - Parent node for mount destination
     * @param beforeNode - Reference node for insertion position (null = append to end)
     */
    mountBefore(parentNode, beforeNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * Mounts childNodes immediately after specified node.
     *
     * @param parentNode - Parent node for mount destination
     * @param afterNode - Reference node for insertion position (null = prepend to start)
     */
    mountAfter(parentNode, afterNode) {
        const beforeNode = afterNode?.nextSibling ?? null;
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * Unmounts (detaches) childNodes from DOM.
     * Clears currentLoopContext cache.
     */
    unmount() {
        this._currentLoopContext = undefined;
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return;
        }
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.removeChild(this.childNodes[i]);
        }
    }
    /**
     * Reassigns ListIndex within loop.
     * Used when reordering array elements in BindingNodeFor.
     *
     * @param listIndex - New list index to assign
     * @throws BIND-201 LoopContext is null
     */
    assignListIndex(listIndex) {
        if (this.loopContext == null)
            raiseError({
                code: "BIND-201",
                message: "LoopContext is null",
                context: { where: 'BindContent.assignListIndex', templateId: this.id },
                docsUrl: "./docs/error-codes.md#bind",
            });
        this.loopContext.assignListIndex(listIndex);
    }
    /**
     * Applies changes to all bindings.
     * Called from Renderer, prevents duplicate updates.
     *
     * @param renderer - Renderer instance managing update cycle
     */
    applyChange(renderer) {
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return;
        }
        for (let i = 0; i < this.bindings.length; i++) {
            const binding = this.bindings[i];
            if (renderer.updatedBindings.has(binding))
                continue;
            binding.applyChange(renderer);
        }
    }
    /**
     * Activates all bindings in this BindContent.
     * Subscribes to state and renders to DOM.
     */
    activate() {
        this._isActive = true;
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].activate();
        }
    }
    /**
     * Inactivates all bindings and clears loop context.
     * Unsubscribes from state and cleans up resources.
     */
    inactivate() {
        this._isActive = false;
        this.loopContext?.clearListIndex();
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].inactivate();
        }
    }
}
/**
 * Factory function to generate BindContent instance.
 * Call activate() after creation to enable bindings.
 *
 * @param parentBinding - Parent IBinding (null if root)
 * @param id - Template ID
 * @param engine - Component engine instance
 * @param loopRef - StatePropertyRef for loop context
 * @returns Generated IBindContent instance
 * @throws BIND-101 Template not found or data-bind not set
 * @throws BIND-102 Node not found in template
 * @throws BIND-103 Creator not found for bindText
 */
function createBindContent(parentBinding, id, engine, loopRef) {
    const bindContent = new BindContent(parentBinding, id, engine, loopRef);
    return bindContent;
}

/**
 * Utility function to determine whether an element with the specified tag name can have a ShadowRoot.
 *
 * - Creates an element with the specified tag name and checks if the attachShadow method exists
 * - Returns false for invalid tag names or elements that don't support attachShadow
 *
 * @param tagName - Tag name of the element to check (e.g., "div", "span", "input")
 * @returns true if the element can have a ShadowRoot, false otherwise
 */
function canHaveShadowRoot(tagName) {
    try {
        // Temporarily create an element
        const element = document.createElement(tagName);
        // Check if the `attachShadow` method exists and is callable
        if (typeof element.attachShadow !== "function") {
            return false;
        }
        // Attempt to attach a ShadowRoot temporarily
        const shadowRoot = element.attachShadow({ mode: 'open' });
        return true;
    }
    catch {
        // Return false if an invalid tag name or other error occurs
        return false;
    }
}

/**
 * Traverses up the DOM tree to find the nearest parent ShadowRoot.
 * Returns undefined if no ShadowRoot is found in the ancestor chain.
 *
 * @param parentNode - The starting node to traverse from
 * @returns The nearest parent ShadowRoot, or undefined if none exists
 */
function getParentShadowRoot(parentNode) {
    let node = parentNode;
    while (node) {
        if (node instanceof ShadowRoot) {
            return node;
        }
        node = node.parentNode;
    }
}
/**
 * Light DOM mode: Adds styles to the parent ShadowRoot or document without using Shadow DOM.
 * Prevents duplicate stylesheet additions.
 *
 * @param element    - Target HTMLElement
 * @param styleSheet - CSSStyleSheet to apply
 */
function attachStyleInLightMode(element, styleSheet) {
    const shadowRootOrDocument = getParentShadowRoot(element.parentNode) || document;
    const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
    if (!styleSheets.includes(styleSheet)) {
        shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, styleSheet];
    }
}
/**
 * Creates a ShadowRoot and applies the stylesheet.
 * Skips creation if a ShadowRoot already exists.
 *
 * @param element    - Target HTMLElement
 * @param styleSheet - CSSStyleSheet to apply
 */
function createShadowRootWithStyle(element, styleSheet) {
    if (!element.shadowRoot) {
        const shadowRoot = element.attachShadow({ mode: 'open' });
        shadowRoot.adoptedStyleSheets = [styleSheet];
    }
}
/**
 * Utility function to attach Shadow DOM to the specified HTMLElement and apply a stylesheet.
 *
 * - config.shadowDomMode="auto": Creates ShadowRoot only for elements that support Shadow DOM, falls back to Light DOM for unsupported elements
 *   - Autonomous custom elements: Always creates ShadowRoot
 *   - Built-in element extensions: Determined by canHaveShadowRoot; creates ShadowRoot if supported, falls back to Light DOM otherwise
 * - config.shadowDomMode="force": Forcefully creates ShadowRoot without validation (throws exception if unsupported)
 * - config.shadowDomMode="none": Does not use Shadow DOM; adds styles to parent ShadowRoot or document
 * - Prevents duplicate additions if the same stylesheet is already included
 *
 * @param element - Target HTMLElement
 * @param config - Component configuration
 * @param styleSheet - CSSStyleSheet to apply
 * @throws DOMException if shadowDomMode is "force" and element doesn't support Shadow DOM
 */
function attachShadow(element, config, styleSheet) {
    if (config.shadowDomMode === "none") {
        attachStyleInLightMode(element, styleSheet);
    }
    else if (config.shadowDomMode === "force") {
        createShadowRootWithStyle(element, styleSheet);
    }
    else {
        // Auto mode: Creates ShadowRoot only for elements that support Shadow DOM, falls back to Light DOM for unsupported elements
        if (config.extends === null || canHaveShadowRoot(config.extends)) {
            // Autonomous custom element or Shadow DOM-supported built-in element extension
            createShadowRootWithStyle(element, styleSheet);
        }
        else {
            // Shadow DOM-unsupported built-in element extension → Falls back to Light DOM
            attachStyleInLightMode(element, styleSheet);
        }
    }
}

/**
 * ComponentStateBinding
 *
 * Purpose:
 * - Associates parent component state paths with child component sub-paths in a one-to-one relationship,
 *   enabling bidirectional path conversion and referencing (parent->child/child->parent).
 *
 * Constraints:
 * - Parent path/child path is 1:1 only (duplicate registration results in STATE-303)
 * - Performs path conversion with longest match, concatenating lower segments as-is
 */
class ComponentStateBinding {
    childPaths = new Set();
    parentPaths = new Set();
    bindingByParentPath = new Map();
    bindingByChildPath = new Map();
    _childPathByParentPath = new Map();
    _parentPathByChildPath = new Map();
    _bindings = new WeakSet();
    /**
     * Adds a binding to establish parent-child path mapping.
     * Validates that paths are not already mapped and registers the binding.
     *
     * @param binding - IBinding instance to register
     * @throws STATE-303 Parent path already has a child path or child path already has a parent path
     */
    addBinding(binding) {
        if (this._bindings.has(binding)) {
            return; // Skip if binding is already added
        }
        const parentPath = binding.bindingState.pattern;
        const childPath = binding.bindingNode.subName;
        if (this._childPathByParentPath.has(parentPath)) {
            raiseError({
                code: "STATE-303",
                message: `Parent path "${parentPath}" already has a child path`,
                context: { parentPath, existingChildPath: this._childPathByParentPath.get(parentPath) },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        if (this._parentPathByChildPath.has(childPath)) {
            raiseError({
                code: "STATE-303",
                message: `Child path "${childPath}" already has a parent path`,
                context: { childPath, existingParentPath: this._parentPathByChildPath.get(childPath) },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        this._childPathByParentPath.set(parentPath, childPath);
        this._parentPathByChildPath.set(childPath, parentPath);
        this.parentPaths.add(parentPath);
        this.childPaths.add(childPath);
        this.bindingByParentPath.set(parentPath, binding);
        this.bindingByChildPath.set(childPath, binding);
        this._bindings.add(binding);
    }
    /**
     * Gets the child path mapped to the given parent path.
     * Returns undefined if no mapping exists.
     *
     * @param parentPath - Parent component state path
     * @returns Child path string or undefined
     */
    getChildPath(parentPath) {
        return this._childPathByParentPath.get(parentPath);
    }
    /**
     * Gets the parent path mapped to the given child path.
     * Returns undefined if no mapping exists.
     *
     * @param childPath - Child component state path
     * @returns Parent path string or undefined
     */
    getParentPath(childPath) {
        return this._parentPathByChildPath.get(childPath);
    }
    /**
     * Converts a child path to its corresponding parent path.
     * Uses longest match algorithm and concatenates remaining segments.
     * Throws error if no matching parent path is found.
     *
     * @param childPath - Child component state path
     * @returns Corresponding parent path string
     * @throws STATE-302 No parent path found for child path
     */
    toParentPathFromChildPath(childPath) {
        // Child to parent: Find longest matching entry in childPaths, concatenate remaining segments to parent
        const childPathInfo = getStructuredPathInfo(childPath);
        const matchPaths = childPathInfo.cumulativePathSet.intersection(this.childPaths);
        if (matchPaths.size === 0) {
            raiseError({
                code: "STATE-302",
                message: `No parent path found for child path "${childPath}"`,
                context: { childPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        const matchPathArray = Array.from(matchPaths);
        const longestMatchPath = matchPathArray[matchPathArray.length - 1];
        const remainPath = childPath.slice(longestMatchPath.length); // include the dot
        const matchParentPath = this._parentPathByChildPath.get(longestMatchPath);
        if (typeof matchParentPath === "undefined") {
            raiseError({
                code: "STATE-302",
                message: `No parent path found for child path "${childPath}"`,
                context: { childPath, longestMatchPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        return matchParentPath + remainPath;
    }
    /**
     * Converts a parent path to its corresponding child path.
     * Uses longest match algorithm and concatenates remaining segments.
     * Throws error if no matching child path is found.
     *
     * @param parentPath - Parent component state path
     * @returns Corresponding child path string
     * @throws STATE-302 No child path found for parent path
     */
    toChildPathFromParentPath(parentPath) {
        // Parent to child: Find longest matching entry in parentPaths, concatenate remaining segments to child
        const parentPathInfo = getStructuredPathInfo(parentPath);
        const matchPaths = parentPathInfo.cumulativePathSet.intersection(this.parentPaths);
        if (matchPaths.size === 0) {
            raiseError({
                code: "STATE-302",
                message: `No child path found for parent path "${parentPath}"`,
                context: { parentPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        const matchPathArray = Array.from(matchPaths);
        const longestMatchPath = matchPathArray[matchPathArray.length - 1];
        const remainPath = parentPath.slice(longestMatchPath.length); // include the dot
        const matchChildPath = this._childPathByParentPath.get(longestMatchPath);
        if (typeof matchChildPath === "undefined") {
            raiseError({
                code: "STATE-302",
                message: `No child path found for parent path "${parentPath}"`,
                context: { parentPath, longestMatchPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        return matchChildPath + remainPath;
    }
    /**
     * Checks if the given child path has a registered mapping.
     * Returns the longest matching child path, or null if no match exists.
     *
     * @param childPathInfo - Structured path information for child path
     * @returns Longest matching child path string or null
     */
    startsWithByChildPath(childPathInfo) {
        if (this.childPaths.size === 0) {
            return null;
        }
        const matchPaths = childPathInfo.cumulativePathSet.intersection(this.childPaths);
        if (matchPaths.size === 0) {
            return null;
        }
        else {
            const matches = Array.from(matchPaths);
            const longestMatchPath = matches[matches.length - 1];
            return longestMatchPath;
        }
    }
    /**
     * Binds parent and child components by collecting and registering all bindings
     * from parent to child component.
     *
     * @param parentComponent - Parent StructiveComponent instance
     * @param childComponent - Child StructiveComponent instance
     */
    bind(parentComponent, childComponent) {
        // bindParentComponent
        const bindings = parentComponent.getBindingsFromChild(childComponent);
        for (const binding of bindings ?? []) {
            this.addBinding(binding);
        }
    }
}
/**
 * Creates a component state binding instance for managing parent-child state mappings.
 *
 * @returns IComponentStateBinding instance
 */
function createComponentStateBinding() {
    return new ComponentStateBinding();
}

/**
 * Handler class for ComponentStateInput proxy.
 * Manages state property access, assignment, and redraw notifications
 * by coordinating with the component engine and state binding.
 */
class ComponentStateInputHandler {
    _componentStateBinding;
    _engine;
    /**
     * Constructor initializes component state input handler.
     *
     * @param engine - Component engine instance
     * @param componentStateBinding - State binding configuration for path mapping
     */
    constructor(engine, componentStateBinding) {
        this._componentStateBinding = componentStateBinding;
        this._engine = engine;
    }
    /**
     * Assigns multiple state properties from an object synchronously.
     *
     * @param object - Key-value pairs of state properties to assign
     */
    assignState(object) {
        // Synchronous processing
        createUpdater(this._engine, (updater) => {
            updater.update(null, (stateProxy, handler) => {
                for (const [key, value] of Object.entries(object)) {
                    const childPathInfo = getStructuredPathInfo(key);
                    const childRef = getStatePropertyRef(childPathInfo, null);
                    stateProxy[SetByRefSymbol](childRef, value);
                }
            });
        });
    }
    /**
     * Notifies the component to redraw based on parent state property changes.
     * Translates parent paths to child paths and enqueues update references.
     *
     * @param refs - Array of parent state property references that have changed
     * @throws LIST-201 ListIndex not found for parent ref
     */
    notifyRedraw(refs) {
        createUpdater(this._engine, (updater) => {
            for (const parentPathRef of refs) {
                let childPath;
                try {
                    childPath = this._componentStateBinding.toChildPathFromParentPath(parentPathRef.info.pattern);
                }
                catch (e) {
                    // Ignore non-target paths
                    continue;
                }
                const childPathInfo = getStructuredPathInfo(childPath);
                const atIndex = childPathInfo.wildcardCount - 1;
                const childListIndex = (atIndex >= 0) ? (parentPathRef.listIndex?.at(atIndex) ?? null) : null;
                if (atIndex >= 0 && childListIndex === null) {
                    raiseError({
                        code: 'LIST-201',
                        message: `ListIndex not found for parent ref: ${parentPathRef.info.pattern}`,
                        context: {
                            where: 'ComponentStateInput.notifyRedraw',
                            parentPattern: parentPathRef.info.pattern,
                            childPattern: childPathInfo.pattern,
                        },
                        docsUrl: '/docs/error-codes.md#list',
                    });
                }
                const childRef = getStatePropertyRef(childPathInfo, childListIndex);
                this._engine.getPropertyValue(childRef);
                // Add to state update queue based on ref information
                updater.enqueueRef(childRef);
            }
        });
    }
    /**
     * Proxy get trap for accessing state properties and symbol-based methods.
     *
     * @param target - Proxy target object
     * @param prop - Property key being accessed
     * @param receiver - Proxy receiver
     * @returns Property value or bound method
     * @throws Error if property is not supported
     */
    get(target, prop, receiver) {
        if (prop === AssignStateSymbol) {
            return this.assignState.bind(this);
        }
        else if (prop === NotifyRedrawSymbol) {
            return this.notifyRedraw.bind(this);
        }
        else if (typeof prop === "string") {
            const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
            return this._engine.getPropertyValue(ref);
        }
        raiseError(`Property "${String(prop)}" is not supported in ComponentStateInput.`);
    }
    /**
     * Proxy set trap for updating state properties.
     *
     * @param target - Proxy target object
     * @param prop - Property key being set
     * @param value - New value to assign
     * @param receiver - Proxy receiver
     * @returns true if set operation succeeded
     * @throws Error if property is not supported
     */
    set(target, prop, value, receiver) {
        if (typeof prop === "string") {
            const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
            this._engine.setPropertyValue(ref, value);
            return true;
        }
        raiseError(`Property "${String(prop)}" is not supported in ComponentStateInput.`);
    }
}
/**
 * Creates a component state input proxy for managing parent-child state bindings.
 *
 * @param engine - Component engine instance
 * @param componentStateBinding - State binding configuration for parent-child path mapping
 * @returns Proxied component state input interface
 */
function createComponentStateInput(engine, componentStateBinding) {
    const handler = new ComponentStateInputHandler(engine, componentStateBinding);
    return new Proxy({}, handler);
}

/**
 * Implementation of component state output that bridges child and parent component states.
 * Translates child component state operations to parent component state operations
 * using path mapping from the component state binding.
 */
class ComponentStateOutput {
    _binding;
    _childEngine;
    _parentPaths = new Set();
    /**
     * Constructor initializes component state output.
     *
     * @param binding - Component state binding for path mapping
     * @param childEngine - Child component engine
     */
    constructor(binding, childEngine) {
        this._binding = binding;
        this._childEngine = childEngine;
    }
    /**
     * Gets the value of a child state property by delegating to the parent component.
     * Translates the child path to parent path and retrieves the value from parent engine.
     *
     * @param ref - Child state property reference
     * @returns The value from the parent component state
     * @throws CSO-101 No child path found for path
     * @throws CSO-102 No binding found for child path
     */
    get(ref) {
        const childPath = this._binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError({
                code: 'CSO-101',
                message: `No child path found for path "${ref.info.toString()}".`,
                context: { where: 'ComponentStateOutput.get', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `No binding found for child path "${childPath}".`,
                context: { where: 'ComponentStateOutput.get', childPath },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentPath = this._binding.toParentPathFromChildPath(ref.info.pattern);
        const parentInfo = getStructuredPathInfo(parentPath);
        const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
        if (!this._parentPaths.has(parentRef.info.pattern)) {
            const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this._parentPaths.add(parentRef.info.pattern);
        }
        return parentBinding.engine.getPropertyValue(parentRef);
    }
    /**
     * Sets the value of a child state property by delegating to the parent component.
     * Translates the child path to parent path and sets the value in parent engine.
     *
     * @param ref - Child state property reference
     * @param value - New value to set
     * @returns true if the operation succeeded
     * @throws CSO-101 No child path found for path
     * @throws CSO-102 No binding found for child path
     */
    set(ref, value) {
        const childPath = this._binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError({
                code: 'CSO-101',
                message: `No child path found for path "${ref.info.toString()}".`,
                context: { where: 'ComponentStateOutput.set', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `No binding found for child path "${childPath}".`,
                context: { where: 'ComponentStateOutput.set', childPath },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentPath = this._binding.toParentPathFromChildPath(ref.info.pattern);
        const parentInfo = getStructuredPathInfo(parentPath);
        const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
        if (!this._parentPaths.has(parentRef.info.pattern)) {
            const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this._parentPaths.add(parentRef.info.pattern);
        }
        parentBinding.engine.setPropertyValue(parentRef, value);
        return true;
    }
    /**
     * Checks if a given path pattern is handled by this state output.
     *
     * @param pathInfo - Structured path information to check
     * @returns true if the path matches a child path in the binding
     */
    startsWith(pathInfo) {
        return this._binding.startsWithByChildPath(pathInfo) !== null;
    }
    /**
     * Gets list indexes for a child state property by delegating to the parent component.
     * Translates the child path to parent path and retrieves list indexes from parent engine.
     *
     * @param ref - Child state property reference
     * @returns Array of list indexes or null if not a list
     * @throws CSO-101 No child path found for path
     * @throws CSO-102 No binding found for child path
     */
    getListIndexes(ref) {
        const childPath = this._binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError({
                code: 'CSO-101',
                message: `No child path found for path "${ref.info.toString()}".`,
                context: { where: 'ComponentStateOutput.getListIndexes', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `No binding found for child path "${childPath}".`,
                context: { where: 'ComponentStateOutput.getListIndexes', childPath },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentPathInfo = getStructuredPathInfo(this._binding.toParentPathFromChildPath(ref.info.pattern));
        const parentRef = getStatePropertyRef(parentPathInfo, ref.listIndex);
        if (!this._parentPaths.has(parentRef.info.pattern)) {
            const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this._parentPaths.add(parentRef.info.pattern);
        }
        return parentBinding.engine.getListIndexes(parentRef);
    }
}
/**
 * Creates a component state output instance for bridging child and parent component states.
 *
 * @param binding - Component state binding for path mapping between child and parent
 * @param childEngine - Child component engine for accessing child state metadata
 * @returns Component state output interface
 */
function createComponentStateOutput(binding, childEngine) {
    return new ComponentStateOutput(binding, childEngine);
}

/**
 * ComponentEngine integrates state, dependencies, bindings, lifecycle, and rendering
 * for Structive components as the core engine.
 *
 * Key Responsibilities:
 * - State instance and proxy generation/management
 * - Template/stylesheet/filter/binding management
 * - Dependency graph (PathTree) construction and maintenance
 * - Binding and list information storage/retrieval
 * - Lifecycle (connected/disconnected) processing
 * - Shadow DOM application or block mode placeholder management
 * - State property get/set operations
 * - Binding addition, existence checking, and list management
 *
 * Error Codes:
 * - BIND-201: bindContent not initialized yet / Block parent node is not set
 * - STATE-202: Failed to parse state from dataset
 *
 * Design Notes:
 * - Provides async initialization via readyResolvers
 * - Achieves efficient rendering through batch updates with Updater
 */
class ComponentEngine {
    // ===== Readonly fields (Core component resources) =====
    /** Component type: 'autonomous' or 'builtin' */
    type = 'autonomous';
    /** Component configuration */
    config;
    /** HTMLTemplateElement for component rendering */
    template;
    /** CSSStyleSheet for component styling */
    styleSheet;
    /** State class constructor */
    stateClass;
    /** State instance */
    state;
    /** Input filter functions */
    inputFilters;
    /** Output filter functions */
    outputFilters;
    /** Base HTML element class */
    baseClass = HTMLElement;
    /** Owner component instance */
    owner;
    /** Path manager for dependency tracking */
    pathManager;
    /** Promise resolvers for async initialization */
    readyResolvers = Promise.withResolvers();
    /** State input proxy for parent-to-child communication */
    stateInput;
    /** State output proxy for child-to-parent communication */
    stateOutput;
    /** State binding for parent-child relationship */
    stateBinding;
    /** Map of child components to their bindings */
    bindingsByComponent = new WeakMap();
    /** Set of child Structive components */
    structiveChildComponents = new Set();
    /** Version and revision tracking by path */
    versionRevisionByPath = new Map();
    // ===== Private fields (Internal state) =====
    /** Bind content instance (initialized in setup()) */
    _bindContent = null;
    /** Block mode placeholder comment node */
    _blockPlaceholder = null;
    /** Block mode placeholder parent node */
    _blockParentNode = null;
    /** Flag to ignore disconnectedCallback during replaceWith */
    _ignoreDissconnectedCallback = false;
    /** Current version number for change tracking */
    _currentVersion = 0;
    /** WeakMap storing binding metadata by property reference */
    _propertyRefMetadataByRef = new WeakMap();
    /**
     * Constructs a new ComponentEngine instance.
     * Initializes all readonly fields and creates state management infrastructure.
     *
     * @param config - Component configuration
     * @param owner - Owner component instance
     */
    constructor(config, owner) {
        this.config = config;
        // Set type to 'builtin' if extending native elements
        if (this.config.extends) {
            this.type = 'builtin';
        }
        const componentClass = owner.constructor;
        this.template = componentClass.template;
        this.styleSheet = componentClass.styleSheet;
        this.stateClass = componentClass.stateClass;
        this.state = new this.stateClass();
        this.inputFilters = componentClass.inputFilters;
        this.outputFilters = componentClass.outputFilters;
        this.owner = owner;
        this.stateBinding = createComponentStateBinding();
        this.stateInput = createComponentStateInput(this, this.stateBinding);
        this.stateOutput = createComponentStateOutput(this.stateBinding, this);
        this.pathManager = componentClass.pathManager;
    }
    // ===== Getters =====
    /**
     * Gets the bind content instance.
     * Throws BIND-201 if accessed before setup() is called.
     *
     * @returns IBindContent instance
     * @throws BIND-201 bindContent not initialized yet
     */
    get bindContent() {
        if (this._bindContent === null) {
            raiseError({
                code: 'BIND-201',
                message: 'bindContent not initialized yet',
                context: { where: 'ComponentEngine.bindContent.get', componentId: this.owner.constructor.id },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        return this._bindContent;
    }
    /**
     * Gets the current version number for change tracking.
     *
     * @returns Current version number
     */
    get currentVersion() {
        return this._currentVersion;
    }
    // ===== Public methods =====
    /**
     * Increments and returns the version number.
     * Used for invalidating caches when state changes.
     *
     * @returns New version number
     */
    versionUp() {
        return ++this._currentVersion;
    }
    /**
     * Sets up the component engine.
     * Registers all state properties to PathManager and creates bindContent.
     * Must be called after construction and before connectedCallback.
     */
    setup() {
        // Register all instantiated state object properties to PathManager
        // TODO: Should traverse prototype chain for inherited properties
        for (const path in this.state) {
            if (RESERVED_WORD_SET.has(path) || this.pathManager.alls.has(path)) {
                continue;
            }
            this.pathManager.alls.add(path);
            addPathNode(this.pathManager.rootNode, path);
        }
        const componentClass = this.owner.constructor;
        const rootRef = getStatePropertyRef(getStructuredPathInfo(''), null);
        // Create bindContent (may modify stateArrayPropertyNamePatterns)
        this._bindContent = createBindContent(null, componentClass.id, this, rootRef);
    }
    /**
     * Handles component connection to DOM.
     * - Attaches Shadow DOM or sets up block mode placeholder
     * - Mounts bindContent
     * - Initializes state from data-state attribute if present
     * - Performs initial render
     * - Calls state's connectedCallback if defined
     *
     * Why not do this in setup():
     * - setup() is called at component instantiation
     * - connectedCallback() is called when connected to DOM
     * - State initialization and rendering must be redone if reconnected after disconnect
     *
     * @throws BIND-201 Block parent node is not set
     * @throws STATE-202 Failed to parse state from dataset
     */
    async connectedCallback() {
        if (this.config.enableWebComponents) {
            attachShadow(this.owner, this.config, this.styleSheet);
        }
        else {
            // Block mode: Replace component with placeholder
            this._blockParentNode = this.owner.parentNode;
            this._blockPlaceholder = document.createComment("Structive block placeholder");
            try {
                // Set flag to ignore disconnectedCallback triggered by replaceWith
                this._ignoreDissconnectedCallback = true;
                this.owner.replaceWith(this._blockPlaceholder);
            }
            finally {
                this._ignoreDissconnectedCallback = false;
            }
        }
        if (this.config.enableWebComponents) {
            // Mount bind content to Shadow DOM
            this.bindContent.mount(this.owner.shadowRoot ?? this.owner);
        }
        else {
            // Mount bind content after block placeholder
            const parentNode = this._blockParentNode ?? raiseError({
                code: 'BIND-201',
                message: 'Block parent node is not set',
                context: { where: 'ComponentEngine.connectedCallback', mode: 'block' },
                docsUrl: './docs/error-codes.md#bind',
            });
            this.bindContent.mountAfter(parentNode, this._blockPlaceholder);
        }
        // Initialize component state from data-state attribute if present
        if (this.owner.dataset.state) {
            try {
                const json = JSON.parse(this.owner.dataset.state);
                this.stateInput[AssignStateSymbol](json);
            }
            catch (e) {
                raiseError({
                    code: 'STATE-202',
                    message: 'Failed to parse state from dataset',
                    context: { where: 'ComponentEngine.connectedCallback', datasetState: this.owner.dataset.state },
                    docsUrl: './docs/error-codes.md#state',
                    cause: e,
                });
            }
        }
        // Perform initial render
        createUpdater(this, (updater) => {
            updater.initialRender((renderer) => {
                this.bindContent.activate();
                renderer.createReadonlyState((readonlyState, readonlyHandler) => {
                    this.bindContent.applyChange(renderer);
                });
            });
        });
        // Call state's connectedCallback if implemented
        if (this.pathManager.hasConnectedCallback) {
            const resultPromise = createUpdater(this, async (updater) => {
                return updater.update(null, async (stateProxy, handler) => {
                    stateProxy[ConnectedCallbackSymbol]();
                });
            });
            if (resultPromise instanceof Promise) {
                await resultPromise;
            }
        }
        this.readyResolvers.resolve();
    }
    /**
     * Handles component disconnection from DOM.
     * - Calls state's disconnectedCallback if defined
     * - Unregisters from parent component
     * - Removes block placeholder if in block mode
     * - Inactivates and unmounts bindContent
     */
    async disconnectedCallback() {
        // Ignore if flag is set (during replaceWith in connectedCallback)
        if (this._ignoreDissconnectedCallback)
            return;
        try {
            // Call state's disconnectedCallback if implemented (synchronous)
            if (this.pathManager.hasDisconnectedCallback) {
                createUpdater(this, (updater) => {
                    updater.update(null, (stateProxy, handler) => {
                        stateProxy[DisconnectedCallbackSymbol]();
                    });
                });
            }
        }
        finally {
            // Unregister from parent component
            this.owner.parentStructiveComponent?.unregisterChildComponent(this.owner);
            if (!this.config.enableWebComponents) {
                this._blockPlaceholder?.remove();
                this._blockPlaceholder = null;
                this._blockParentNode = null;
            }
            // Inactivate state and unmount (bindContent.unmount is called within inactivate)
            createUpdater(this, (updater) => {
                updater.initialRender((renderer) => {
                    this.bindContent.inactivate();
                });
            });
        }
    }
    /**
     * Gets list indexes for a property reference.
     * Delegates to stateOutput if the path matches parent-child binding.
     *
     * @param ref - State property reference
     * @returns Array of list indexes or null if not a list
     */
    getListIndexes(ref) {
        if (this.stateOutput.startsWith(ref.info)) {
            return this.stateOutput.getListIndexes(ref);
        }
        let value = null;
        // Synchronous operation
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetListIndexesByRefSymbol](ref);
            });
        });
        return value;
    }
    /**
     * Gets a property value by reference.
     * Uses readonly state proxy to access the value synchronously.
     *
     * @param ref - State property reference
     * @returns Property value
     */
    getPropertyValue(ref) {
        let value;
        // Synchronous operation
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetByRefSymbol](ref);
            });
        });
        return value;
    }
    /**
     * Sets a property value by reference.
     * Uses writable state proxy to set the value synchronously.
     *
     * @param ref - State property reference
     * @param value - New value to set
     */
    setPropertyValue(ref, value) {
        // Synchronous operation
        createUpdater(this, (updater) => {
            updater.update(null, (stateProxy, handler) => {
                stateProxy[SetByRefSymbol](ref, value);
            });
        });
    }
    /**
     * Registers a child Structive component.
     * Used for parent-child relationship tracking.
     *
     * @param component - Child StructiveComponent instance to register
     */
    registerChildComponent(component) {
        this.structiveChildComponents.add(component);
    }
    /**
     * Unregisters a child Structive component.
     * Called when child is disconnected or destroyed.
     *
     * @param component - Child StructiveComponent instance to unregister
     */
    unregisterChildComponent(component) {
        this.structiveChildComponents.delete(component);
    }
    /**
     * Gets the cache entry for a property reference.
     * Returns null if no cache exists.
     *
     * @param ref - State property reference
     * @returns Cache entry or null
     */
    getCacheEntry(ref) {
        return this._propertyRefMetadataByRef.get(ref)?.cacheEntry ?? null;
    }
    /**
     * Sets the cache entry for a property reference.
     * Creates a new PropertyRefMetadata if it doesn't exist.
     *
     * @param ref - State property reference
     * @param entry - Cache entry to set
     */
    setCacheEntry(ref, entry) {
        let metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata === "undefined") {
            this._propertyRefMetadataByRef.set(ref, { bindings: [], cacheEntry: entry });
        }
        else {
            metadata.cacheEntry = entry;
        }
    }
    /**
     * Gets all bindings associated with a property reference.
     * Returns empty array if no bindings exist.
     *
     * @param ref - State property reference
     * @returns Array of IBinding instances
     */
    getBindings(ref) {
        return this._propertyRefMetadataByRef.get(ref)?.bindings ?? [];
    }
    /**
     * Saves a binding for a property reference.
     * Creates a new PropertyRefMetadata if it doesn't exist.
     *
     * @param ref - State property reference
     * @param binding - IBinding instance to save
     */
    saveBinding(ref, binding) {
        const metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata === "undefined") {
            this._propertyRefMetadataByRef.set(ref, { bindings: [binding], cacheEntry: null });
        }
        else {
            metadata.bindings.push(binding);
        }
    }
    /**
     * Removes a binding from a property reference.
     * Does nothing if the binding doesn't exist.
     *
     * @param ref - State property reference
     * @param binding - IBinding instance to remove
     */
    removeBinding(ref, binding) {
        const metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata !== "undefined") {
            const index = metadata.bindings.indexOf(binding);
            if (index >= 0) {
                metadata.bindings.splice(index, 1);
            }
        }
    }
}
/**
 * Factory function to create a ComponentEngine instance.
 *
 * @param config - Component configuration
 * @param component - Owner component instance
 * @returns A new ComponentEngine instance
 */
function createComponentEngine(config, component) {
    return new ComponentEngine(config, component);
}

/**
 * replaceMustacheWithTemplateTag.ts
 *
 * Mustache構文（{{if:条件}}, {{for:式}}, {{endif}}, {{endfor}}, {{elseif:条件}}, {{else}} など）を
 * <template>タグやコメントノードに変換するユーティリティ関数です。
 *
 * 主な役割:
 * - HTML文字列内のMustache構文を正規表現で検出し、<template data-bind="...">やコメントノードに変換
 * - if/for/endif/endfor/elseif/elseなどの制御構文をネスト対応で<template>タグに変換
 * - 通常の埋め込み式（{{expr}}）はコメントノード（<!--embed:expr-->）に変換
 *
 * 設計ポイント:
 * - stackでネスト構造を管理し、endif/endfor/elseif/elseの対応関係を厳密にチェック
 * - 不正なネストや対応しない構文にはraiseErrorで例外を発生
 * - elseif/elseはnot条件のtemplateを自動生成し、条件分岐を表現
 * - コメントノードへの変換で埋め込み式の安全なDOM挿入を実現
 */
const MUSTACHE_REGEXP = /\{\{([^\}]+)\}\}/g;
const MUSTACHE_TYPES = new Set(['if', 'for', 'endif', 'endfor', 'elseif', 'else']);
function replaceMustacheWithTemplateTag(html) {
    const stack = [];
    return html.replaceAll(MUSTACHE_REGEXP, (match, expr) => {
        expr = expr.trim();
        const [type] = expr.split(':');
        if (!MUSTACHE_TYPES.has(type)) {
            // embed
            return `<!--${COMMENT_EMBED_MARK}${expr}-->`;
        }
        const remain = expr.slice(type.length + 1).trim();
        const currentInfo = { type, expr, remain };
        if (type === 'if' || type === 'for') {
            stack.push(currentInfo);
            return `<template data-bind="${expr}">`;
        }
        else if (type === 'endif') {
            const endTags = [];
            do {
                const info = stack.pop() ?? raiseError({
                    code: 'TMP-102',
                    message: 'Endif without if',
                    context: { where: 'replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                    docsUrl: './docs/error-codes.md#tmp',
                });
                if (info.type === 'if') {
                    endTags.push('</template>');
                    break;
                }
                else if (info.type === 'elseif') {
                    endTags.push('</template>');
                }
                else {
                    raiseError({
                        code: 'TMP-102',
                        message: 'Endif without if',
                        context: { where: 'replaceMustacheWithTemplateTag', got: info.type, expr },
                        docsUrl: './docs/error-codes.md#tmp',
                    });
                }
            } while (true);
            return endTags.join('');
        }
        else if (type === 'endfor') {
            const info = stack.pop() ?? raiseError({
                code: 'TMP-102',
                message: 'Endfor without for',
                context: { where: 'replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (info.type === 'for') {
                return '</template>';
            }
            else {
                raiseError({
                    code: 'TMP-102',
                    message: 'Endfor without for',
                    context: { where: 'replaceMustacheWithTemplateTag', got: info.type, expr },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
        }
        else if (type === 'elseif') {
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Elseif without if',
                context: { where: 'replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if' || lastInfo.type === 'elseif') {
                stack.push(currentInfo);
                return `</template><template data-bind="if:${lastInfo.remain}|not"><template data-bind="if:${remain}">`;
            }
            else {
                raiseError({
                    code: 'TMP-102',
                    message: 'Elseif without if',
                    context: { where: 'replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
        }
        else if (type === 'else') {
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Else without if',
                context: { where: 'replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if') {
                return `</template><template data-bind="if:${lastInfo.remain}|not">`;
            }
            else {
                raiseError({
                    code: 'TMP-102',
                    message: 'Else without if',
                    context: { where: 'replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
        }
        else {
            raiseError({
                code: 'TMP-102',
                message: 'Unknown type',
                context: { where: 'replaceMustacheWithTemplateTag', type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
    });
}

/**
 * replaceTemplateTagWithComment.ts
 *
 * <template>タグをコメントノードに置換し、テンプレートを再帰的に登録するユーティリティ関数です。
 *
 * 主な役割:
 * - 指定したHTMLTemplateElementをコメントノード（<!--template:id-->）に置換
 * - SVG内のtemplateタグは通常のtemplate要素に変換し、属性や子ノードを引き継ぐ
 * - テンプレート内の入れ子templateも再帰的に置換・登録
 * - registerTemplateでテンプレートをID付きで管理
 *
 * 設計ポイント:
 * - テンプレートの階層構造を維持しつつ、DOM上はコメントノードでマーク
 * - SVG対応や属性引き継ぎなど、汎用的なテンプレート処理に対応
 * - generateIdでユニークIDを割り当て、テンプレート管理を一元化
 */
const SVG_NS = "http://www.w3.org/2000/svg";
function replaceTemplateTagWithComment(id, template, rootId = id) {
    // テンプレートの親ノードが存在する場合は、テンプレートをコメントノードに置き換える
    // デバッグ時、bindTextの内容をコメントに含める
    const bindText = template.getAttribute(DATA_BIND_ATTRIBUTE);
    const bindTextForDebug = config$2.debug ? (bindText ?? "") : "";
    template.parentNode?.replaceChild(document.createComment(`${COMMENT_TEMPLATE_MARK}${id} ${bindTextForDebug}`), template);
    if (template.namespaceURI === SVG_NS) {
        // SVGタグ内のtemplateタグを想定
        const newTemplate = document.createElement("template");
        const childNodes = Array.from(template.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            newTemplate.content.appendChild(childNode);
        }
        newTemplate.setAttribute(DATA_BIND_ATTRIBUTE, bindText ?? "");
        template = newTemplate;
    }
    template.content.querySelectorAll("template").forEach(template => {
        replaceTemplateTagWithComment(generateId(), template, rootId);
    });
    registerTemplate(id, template, rootId);
    return id;
}

/**
 * registerHtml.ts
 *
 * HTML文字列をテンプレートとして登録するユーティリティ関数です。
 *
 * 主な役割:
 * - 指定IDでHTMLテンプレートを生成し、data-id属性を付与
 * - Mustache構文（{{ }})をテンプレートタグに変換（replaceMustacheWithTemplateTagを利用）
 * - テンプレートタグをコメントに置換（replaceTemplateTagWithCommentを利用）
 *
 * 設計ポイント:
 * - テンプレートの動的生成・管理や、構文変換による柔軟なテンプレート処理に対応
 * - テンプレートはdocument.createElement("template")で生成し、data-idで識別
 */
function registerHtml(id, html) {
    const template = document.createElement("template");
    template.dataset.id = id.toString();
    template.innerHTML = replaceMustacheWithTemplateTag(html);
    replaceTemplateTagWithComment(id, template);
}

function getBaseClass(extendTagName) {
    return extendTagName ? document.createElement(extendTagName).constructor : HTMLElement;
}

/**
 * getComponentConfig.ts
 *
 * ユーザー設定（IUserConfig）とグローバル設定を統合し、コンポーネントの設定（IComponentConfig）を生成するユーティリティ関数です。
 *
 * 主な役割:
 * - getGlobalConfigでグローバル設定を取得
 * - ユーザー設定が優先され、未指定の場合はグローバル設定値を利用
 * - shadowDomModeやextendsなどの設定値を一元的に返却
 *
 * 設計ポイント:
 * - ユーザーごとの個別設定と全体のデフォルト設定を柔軟に統合
 * - 設定値のデフォルト化や拡張性を考慮した設計
 */
function getComponentConfig(userConfig) {
    const globalConfig = getGlobalConfig();
    return {
        enableWebComponents: typeof userConfig.enableWebComponents === "undefined" ? true : userConfig.enableWebComponents,
        shadowDomMode: userConfig.shadowDomMode ?? globalConfig.shadowDomMode,
        extends: userConfig.extends ?? null,
    };
}

/**
 * createAccessorFunctions.ts
 *
 * Stateプロパティのパス情報（IStructuredPathInfo）から、動的なgetter/setter関数を生成するユーティリティです。
 *
 * 主な役割:
 * - パス情報とgetter集合から、最適なアクセサ関数（get/set）を動的に生成
 * - ワイルドカード（*）やネストしたプロパティパスにも対応
 * - パスやセグメントのバリデーションも実施
 *
 * 設計ポイント:
 * - matchPathsから最長一致のgetterパスを探索し、そこからの相対パスでアクセサを構築
 * - パスが一致しない場合はinfo.pathSegmentsから直接アクセサを生成
 * - new Functionで高速なgetter/setterを動的生成
 * - パスやセグメント名は正規表現で厳密にチェックし、安全性を担保
 */
const checkSegmentRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
const checkPathRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*(\.[a-zA-Z_$][0-9a-zA-Z_$]*|\.\*)*$/;
function createAccessorFunctions(info, getters) {
    const matchPaths = new Set(info.cumulativePaths).intersection(getters);
    let len = -1;
    let matchPath = '';
    for (const curPath of matchPaths) {
        const pathSegments = curPath.split('.');
        if (pathSegments.length === 1) {
            continue;
        }
        if (pathSegments.length > len) {
            len = pathSegments.length;
            matchPath = curPath;
        }
    }
    if (matchPath.length > 0) {
        if (!checkPathRegexp.test(matchPath)) {
            raiseError({
                code: "STATE-202",
                message: `Invalid path: ${matchPath}`,
                context: { matchPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        const matchInfo = getStructuredPathInfo(matchPath);
        const segments = [];
        let count = matchInfo.wildcardCount;
        for (let i = matchInfo.pathSegments.length; i < info.pathSegments.length; i++) {
            const segment = info.pathSegments[i];
            if (segment === '*') {
                segments.push("[this.$" + (count + 1) + "]");
                count++;
            }
            else {
                if (!checkSegmentRegexp.test(segment)) {
                    raiseError({
                        code: "STATE-202",
                        message: `Invalid segment name: ${segment}`,
                        context: { segment, matchPath },
                        docsUrl: "./docs/error-codes.md#state",
                    });
                }
                segments.push("." + segment);
            }
        }
        const path = segments.join('');
        const getterFuncText = `return this["${matchPath}"]${path};`;
        const setterFuncText = `this["${matchPath}"]${path} = value;`;
        //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
        return {
            get: new Function('', getterFuncText),
            set: new Function('value', setterFuncText),
        };
    }
    else {
        const segments = [];
        let count = 0;
        for (let i = 0; i < info.pathSegments.length; i++) {
            const segment = info.pathSegments[i];
            if (segment === '*') {
                segments.push("[this.$" + (count + 1) + "]");
                count++;
            }
            else {
                if (!checkSegmentRegexp.test(segment)) {
                    raiseError({
                        code: "STATE-202",
                        message: `Invalid segment name: ${segment}`,
                        context: { segment },
                        docsUrl: "./docs/error-codes.md#state",
                    });
                }
                segments.push((segments.length > 0 ? "." : "") + segment);
            }
        }
        const path = segments.join('');
        const getterFuncText = `return this.${path};`;
        const setterFuncText = `this.${path} = value;`;
        //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
        return {
            get: new Function('', getterFuncText),
            set: new Function('value', setterFuncText),
        };
    }
}

class PathManager {
    alls = new Set();
    lists = new Set();
    elements = new Set();
    funcs = new Set();
    getters = new Set();
    onlyGetters = new Set();
    setters = new Set();
    getterSetters = new Set();
    optimizes = new Set();
    staticDependencies = new Map();
    dynamicDependencies = new Map();
    rootNode = createRootNode();
    hasConnectedCallback = false;
    hasDisconnectedCallback = false;
    hasUpdatedCallback = false;
    #id;
    #stateClass;
    constructor(componentClass) {
        this.#id = componentClass.id;
        this.#stateClass = componentClass.stateClass;
        const alls = getPathsSetById(this.#id);
        const listsFromAlls = new Set();
        for (const path of alls) {
            const info = getStructuredPathInfo(path);
            this.alls = this.alls.union(info.cumulativePathSet);
            // Check all paths in cumulativePathSet for wildcards
            for (const cumulativePath of info.cumulativePathSet) {
                const cumulativeInfo = getStructuredPathInfo(cumulativePath);
                if (cumulativeInfo.lastSegment === "*") {
                    listsFromAlls.add(cumulativeInfo.parentPath);
                }
            }
        }
        const lists = getListPathsSetById(this.#id);
        this.lists = this.lists.union(lists).union(listsFromAlls);
        for (const listPath of this.lists) {
            const elementPath = listPath + ".*";
            this.elements.add(elementPath);
        }
        let currentProto = this.#stateClass.prototype;
        while (currentProto && currentProto !== Object.prototype) {
            const getters = Object.getOwnPropertyDescriptors(currentProto);
            if (getters) {
                for (const [key, desc] of Object.entries(getters)) {
                    if (RESERVED_WORD_SET.has(key)) {
                        continue;
                    }
                    if (typeof desc.value === "function") {
                        this.funcs.add(key);
                        if (key === CONNECTED_CALLBACK_FUNC_NAME) {
                            this.hasConnectedCallback = true;
                        }
                        if (key === DISCONNECTED_CALLBACK_FUNC_NAME) {
                            this.hasDisconnectedCallback = true;
                        }
                        if (key === UPDATED_CALLBACK_FUNC_NAME) {
                            this.hasUpdatedCallback = true;
                        }
                        continue;
                    }
                    const hasGetter = desc.get !== undefined;
                    const hasSetter = desc.set !== undefined;
                    const info = getStructuredPathInfo(key);
                    this.alls = this.alls.union(info.cumulativePathSet);
                    if (hasGetter) {
                        this.getters.add(key);
                    }
                    if (hasSetter) {
                        this.setters.add(key);
                    }
                    if (hasGetter && !hasSetter) {
                        this.onlyGetters.add(key);
                    }
                    if (hasGetter && hasSetter) {
                        this.getterSetters.add(key);
                    }
                }
            }
            currentProto = Object.getPrototypeOf(currentProto);
        }
        // 最適化対象のパスを決定し、最適化する
        for (const path of this.alls) {
            if (this.getters.has(path)) {
                continue;
            }
            if (this.setters.has(path)) {
                continue;
            }
            const info = getStructuredPathInfo(path);
            if (info.pathSegments.length === 1) {
                continue;
            }
            const funcs = createAccessorFunctions(info, this.getters);
            Object.defineProperty(this.#stateClass.prototype, path, {
                get: funcs.get,
                set: funcs.set,
                enumerable: true,
                configurable: true,
            });
            this.optimizes.add(path);
        }
        // 静的依存関係の設定
        for (const path of this.alls) {
            addPathNode(this.rootNode, path);
            const info = getStructuredPathInfo(path);
            if (info.parentPath) {
                this.staticDependencies.get(info.parentPath)?.add(path) ??
                    this.staticDependencies.set(info.parentPath, new Set([path]));
            }
        }
    }
    addPath(addPath, isList = false) {
        const info = getStructuredPathInfo(addPath);
        if (isList && !this.lists.has(addPath)) {
            this.lists.add(addPath);
            const elementPath = addPath + ".*";
            this.elements.add(elementPath);
        }
        else if (info.lastSegment === "*") {
            this.elements.add(addPath);
            this.lists.add(info.parentPath);
        }
        for (const path of info.cumulativePathSet) {
            if (this.alls.has(path))
                continue;
            this.alls.add(path);
            addPathNode(this.rootNode, path);
            const pathInfo = getStructuredPathInfo(path);
            if (pathInfo.lastSegment === "*") {
                this.elements.add(path);
                this.lists.add(pathInfo.parentPath);
            }
            if (pathInfo.pathSegments.length > 1) {
                const funcs = createAccessorFunctions(pathInfo, this.getters);
                Object.defineProperty(this.#stateClass.prototype, path, {
                    get: funcs.get,
                    set: funcs.set,
                    enumerable: true,
                    configurable: true,
                });
                this.optimizes.add(path);
            }
            if (pathInfo.parentPath) {
                this.staticDependencies.get(pathInfo.parentPath)?.add(path) ??
                    this.staticDependencies.set(pathInfo.parentPath, new Set([path]));
            }
        }
    }
    #dynamicDependencyKeys = new Set();
    addDynamicDependency(target, source) {
        const key = source + "=>" + target;
        if (this.#dynamicDependencyKeys.has(key)) {
            return;
        }
        if (!this.alls.has(source)) {
            this.addPath(source);
        }
        this.#dynamicDependencyKeys.add(key);
        this.dynamicDependencies.get(source)?.add(target) ??
            this.dynamicDependencies.set(source, new Set([target]));
    }
}
function createPathManager(componentClass) {
    return new PathManager(componentClass);
}

/**
 * createComponentClass.ts
 *
 * StructiveのWeb Components用カスタム要素クラスを動的に生成するユーティリティです。
 *
 * 主な役割:
 * - ユーザー定義のcomponentData（stateClass, html, css等）からWeb Componentsクラスを生成
 * - StateClass/テンプレート/CSS/バインディング情報などをIDで一元管理・登録
 * - 独自のget/setトラップやバインディング、親子コンポーネント探索、フィルター拡張など多機能な基盤を提供
 * - 静的プロパティでテンプレート・スタイル・StateClass・フィルター・getter情報などにアクセス可能
 * - defineメソッドでカスタム要素として登録
 *
 * 設計ポイント:
 * - findStructiveParentで親Structiveコンポーネントを探索し、階層的な状態管理を実現
 * - getter/setter/バインディング最適化に対応
 * - テンプレート・CSS・StateClass・バインディング情報をIDで一元管理し、再利用性・拡張性を確保
 * - フィルターやバインディング情報も静的プロパティで柔軟に拡張可能
 */
function createComponentClass(componentData) {
    const config = (componentData.stateClass.$config ?? {});
    const componentConfig = getComponentConfig(config);
    const id = generateId();
    const { html, css, stateClass } = componentData;
    const inputFilters = Object.assign({}, inputBuiltinFilters);
    const outputFilters = Object.assign({}, outputBuiltinFilters);
    stateClass.$isStructive = true;
    registerHtml(id, html);
    registerCss(id, css);
    registerStateClass(id, stateClass);
    const baseClass = getBaseClass(componentConfig.extends);
    const extendTagName = componentConfig.extends;
    return class extends baseClass {
        #engine;
        constructor() {
            super();
            this.#engine = createComponentEngine(componentConfig, this);
            this.#engine.setup();
        }
        connectedCallback() {
            this.#engine.connectedCallback();
        }
        disconnectedCallback() {
            this.#engine.disconnectedCallback();
        }
        #parentStructiveComponent;
        get parentStructiveComponent() {
            if (typeof this.#parentStructiveComponent === "undefined") {
                this.#parentStructiveComponent = findStructiveParent(this);
            }
            return this.#parentStructiveComponent;
        }
        get state() {
            return this.#engine.stateInput;
        }
        get stateBinding() {
            return this.#engine.stateBinding;
        }
        get isStructive() {
            return this.#engine.stateClass.$isStructive ?? false;
        }
        get readyResolvers() {
            return this.#engine.readyResolvers;
        }
        getBindingsFromChild(component) {
            return this.#engine.bindingsByComponent.get(component) ?? null;
        }
        registerChildComponent(component) {
            this.#engine.registerChildComponent(component);
        }
        unregisterChildComponent(component) {
            this.#engine.unregisterChildComponent(component);
        }
        static define(tagName) {
            if (extendTagName) {
                customElements.define(tagName, this, { extends: extendTagName });
            }
            else {
                customElements.define(tagName, this);
            }
        }
        static get id() {
            return id;
        }
        static #html = html;
        static get html() {
            return this.#html;
        }
        static set html(value) {
            this.#html = value;
            registerHtml(this.id, value);
            this.#template = null;
            this.#pathManager = null; // パス情報をリセット
        }
        static #css = css;
        static get css() {
            return this.#css;
        }
        static set css(value) {
            this.#css = value;
            registerCss(this.id, value);
            this.#styleSheet = null;
        }
        static #template = null;
        static get template() {
            if (!this.#template) {
                this.#template = getTemplateById(this.id);
            }
            return this.#template;
        }
        static #styleSheet = null;
        static get styleSheet() {
            if (!this.#styleSheet) {
                this.#styleSheet = getStyleSheetById(this.id);
            }
            return this.#styleSheet;
        }
        static #stateClass = null;
        static get stateClass() {
            if (!this.#stateClass) {
                this.#stateClass = getStateClassById(this.id);
            }
            return this.#stateClass;
        }
        static #inputFilters = inputFilters;
        static get inputFilters() {
            return this.#inputFilters;
        }
        static #outputFilters = outputFilters;
        static get outputFilters() {
            return this.#outputFilters;
        }
        static #pathManager = null;
        static get pathManager() {
            if (!this.#pathManager) {
                this.#pathManager = createPathManager(this);
            }
            return this.#pathManager;
        }
    };
}

function loadImportmap() {
    const importmap = {};
    document.querySelectorAll("script[type='importmap']").forEach(script => {
        const scriptImportmap = JSON.parse(script.innerHTML);
        if (scriptImportmap.imports) {
            importmap.imports = Object.assign(importmap.imports || {}, scriptImportmap.imports);
        }
    });
    return importmap;
}

function escapeEmbed(html) {
    return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
        return `<!--{{${expr}}}-->`;
    });
}
function unescapeEmbed(html) {
    return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
        return `{{${expr}}}`;
    });
}
let id = 0;
async function createSingleFileComponent(path, text) {
    const template = document.createElement("template");
    template.innerHTML = escapeEmbed(text);
    const html = template.content.querySelector("template");
    html?.remove();
    const script = template.content.querySelector("script[type=module]");
    let scriptModule = {};
    if (script) {
        const uniq_comment = `\n// uniq id: ${id++}\n//# sourceURL=${path}\n`;
        // blob URLを使用（ブラウザ環境）
        // テスト環境（jsdom）ではURL.createObjectURLが存在しないためフォールバック
        if (typeof URL.createObjectURL === 'function') {
            const blob = new Blob([script.text + uniq_comment], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            try {
                scriptModule = await import(url);
            }
            finally {
                URL.revokeObjectURL(url);
            }
        }
        else {
            // フォールバック: Base64エンコード方式（テスト環境用）
            const b64 = btoa(String.fromCodePoint(...new TextEncoder().encode(script.text + uniq_comment)));
            scriptModule = await import("data:application/javascript;base64," + b64);
        }
    }
    script?.remove();
    const style = template.content.querySelector("style");
    style?.remove();
    const stateClass = (scriptModule.default ?? class {
    });
    return {
        text,
        html: unescapeEmbed(html?.innerHTML ?? "").trim(),
        css: style?.textContent ?? "",
        stateClass,
    };
}

/**
 * loadSingleFileComponent.ts
 *
 * 指定パスのシングルファイルコンポーネント（SFC）をfetchし、パースしてIUserComponentDataとして返すユーティリティ関数です。
 *
 * 主な役割:
 * - fetchで指定パスのSFCファイルを取得
 * - テキストとして読み込み、createSingleFileComponentでパース
 * - パース結果（IUserComponentData）を返却
 *
 * 設計ポイント:
 * - import.meta.resolveを利用し、パス解決の柔軟性を確保
 * - 非同期処理で動的なコンポーネントロードに対応
 */
async function loadSingleFileComponent(path) {
    // Node/Vitest 等の SSR 環境では import.meta.resolve が存在しない場合があるためフォールバック
    const resolved = import.meta.resolve ? import.meta.resolve(path) : path;
    const response = await fetch(resolved);
    const text = await response.text();
    return createSingleFileComponent(path, text);
}

function registerComponentClass(tagName, componentClass) {
    componentClass.define(tagName);
}

/**
 * loadFromImportMap
 *
 * importmap のエイリアスを走査し、ルート/コンポーネントを自動登録する。
 * - @routes/*: entryRoute でルーティング登録（/root → / に正規化）
 * - @components/*: SFC を読み込み、ComponentClass を生成して registerComponentClass
 * - #lazy サフィックスが付与されている場合は遅延ロード用に保持
 *
 * 戻り値: Promise<void>
 * Throws: 重大な例外は基本なし（見つからないエイリアスは warn として扱う）
 */
const ROUTES_KEY = "@routes/";
const COMPONENTS_KEY = "@components/";
const LAZY_LOAD_SUFFIX = "#lazy";
const LAZY_LOAD_SUFFIX_LEN = LAZY_LOAD_SUFFIX.length;
const lazyLoadComponentAliasByTagName = {};
async function loadFromImportMap() {
    const importmap = loadImportmap();
    if (importmap.imports) {
        const loadAliasByTagName = new Map();
        for (const [alias, value] of Object.entries(importmap.imports)) {
            let tagName, isLazyLoad;
            if (alias.startsWith(ROUTES_KEY)) {
                isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
                // remove the prefix '@routes' and the suffix '#lazy' if it exists
                const path = alias.slice(ROUTES_KEY.length - 1, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined);
                const pathWithoutParams = path.replace(/:[^\s/]+/g, ""); // remove the params
                tagName = "routes" + pathWithoutParams.replace(/\//g, "-"); // replace '/' with '-'
                entryRoute(tagName, path === "/root" ? "/" : path); // routing
            }
            if (alias.startsWith(COMPONENTS_KEY)) {
                isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
                // remove the prefix '@components/' and the suffix '#lazy' if it exists
                tagName = alias.slice(COMPONENTS_KEY.length, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined);
            }
            if (!tagName) {
                continue;
            }
            if (isLazyLoad) {
                // Lazy Load用のコンポーネントのエイリアスを格納
                lazyLoadComponentAliasByTagName[tagName] = alias;
                continue; // Lazy Loadの場合はここでスキップ
            }
            loadAliasByTagName.set(tagName, alias);
        }
        for (const [tagName, alias] of loadAliasByTagName.entries()) {
            // 非Lazy Loadのコンポーネントはここで登録
            const componentData = await loadSingleFileComponent(alias);
            const componentClass = createComponentClass(componentData);
            registerComponentClass(tagName, componentClass);
        }
    }
}
function hasLazyLoadComponents() {
    return Object.keys(lazyLoadComponentAliasByTagName).length > 0;
}
function isLazyLoadComponent(tagName) {
    return lazyLoadComponentAliasByTagName.hasOwnProperty(tagName);
}
function loadLazyLoadComponent(tagName) {
    const alias = lazyLoadComponentAliasByTagName[tagName];
    if (!alias) {
        // 警告として扱うが、構造化メタ情報を付加
        const err = {
            code: "IMP-201",
            message: `Alias not found for tagName: ${tagName}`,
            context: { where: 'loadFromImportMap.loadLazyLoadComponent', tagName },
            docsUrl: "./docs/error-codes.md#imp",
            severity: "warn",
        };
        // 既存挙動は warn + return のため、throw はせず console.warn にメタを付与
        console.warn(err.message, { code: err.code, context: err.context, docsUrl: err.docsUrl, severity: err.severity });
        return;
    }
    delete lazyLoadComponentAliasByTagName[tagName]; // 一度ロードしたら削除
    queueMicrotask(async () => {
        const componentData = await loadSingleFileComponent(alias);
        const componentClass = createComponentClass(componentData);
        registerComponentClass(tagName, componentClass);
    });
}

/**
 * Router.ts
 *
 * シングルページアプリケーション（SPA）向けのカスタムエレメント Router の実装です。
 *
 * 主な役割:
 * - ルート定義（entryRoute）に基づき、URLパスに応じてカスタム要素を動的に生成・表示
 * - pushState/popstateイベントを利用した履歴管理とルーティング制御
 * - ルートパラメータの抽出とカスタム要素への受け渡し
 * - 404ページ（未定義ルート時）の表示
 *
 * 設計ポイント:
 * - entryRouteでルートパスとカスタム要素タグ名のペアを登録
 * - popstateイベントでURL変更時に自動で再描画
 * - ルートパスのパラメータ（:id等）も正規表現で抽出し、data-state属性で渡す
 * - getRouterでグローバルなRouterインスタンスを取得可能
 */
const DEFAULT_ROUTE_PATH = '/'; // Default route path
const ROUTE_PATH_PREFIX = 'routes:'; // Prefix for route paths
/**
 * example:
 * ```ts
 * entryRoute('my-view', '/my-view/:id');
 */
const routeEntries = [];
let globalRouter = null;
class Router extends HTMLElement {
    originalPathName = window.location.pathname; // Store the original path name
    originalFileName = window.location.pathname.split('/').pop() || ''; // Store the original file name
    basePath = document.querySelector('base')?.href.replace(window.location.origin, "") || DEFAULT_ROUTE_PATH;
    _popstateHandler;
    constructor() {
        super();
        this._popstateHandler = this.popstateHandler.bind(this);
    }
    connectedCallback() {
        globalRouter = this;
        this.innerHTML = '<slot name="content"></slot>';
        window.addEventListener('popstate', this._popstateHandler);
        window.dispatchEvent(new Event("popstate")); // Dispatch popstate event to trigger the initial render
    }
    disconnectedCallback() {
        window.removeEventListener('popstate', this._popstateHandler);
        globalRouter = null;
    }
    popstateHandler(event) {
        event.preventDefault();
        this.render();
    }
    navigate(to) {
        const toPath = to[0] === '/' ? (this.basePath + to.slice(1)) : to; // Ensure the path starts with '/'
        history.pushState({}, '', toPath);
        this.render();
    }
    render() {
        // スロットコンテントをクリア
        const slotChildren = Array.from(this.childNodes).filter(n => n.getAttribute?.('slot') === 'content');
        slotChildren.forEach(n => this.removeChild(n));
        const paths = window.location.pathname.split('/');
        if (paths.at(-1) === this.originalFileName) {
            paths[paths.length - 1] = ''; // Ensure the last path is empty for root
        }
        const pathName = paths.join('/');
        const replacedPath = pathName.replace(this.basePath, ''); // Remove base path and ensure default route
        const currentPath = replacedPath[0] !== '/' ? '/' + replacedPath : replacedPath; // Ensure the path starts with '/'
        let tagName = undefined;
        let params = {};
        // Check if the routePath matches any of the defined routes
        for (const [path, tag] of routeEntries) {
            const regex = new RegExp("^" + path.replace(/:[^\s/]+/g, '([^/]+)') + "$");
            if (regex.test(currentPath)) {
                tagName = tag;
                // Extract the parameters from the routePath
                const matches = currentPath.match(regex);
                if (matches) {
                    const keys = path.match(/:[^\s/]+/g) || [];
                    keys.forEach((key, index) => {
                        params[key.substring(1)] = matches[index + 1]; // +1 to skip the full match
                    });
                }
                break;
            }
        }
        if (tagName) {
            // If a route matches, create the custom element and set its state
            // Create the custom element with the tag name
            // project the custom element into the router slot
            const customElement = document.createElement(tagName);
            customElement.setAttribute('data-state', JSON.stringify(params));
            customElement.setAttribute('slot', 'content');
            this.appendChild(customElement);
            if (isLazyLoadComponent(tagName)) {
                loadLazyLoadComponent(tagName); // Load lazy load component if necessary
            }
        }
        else {
            // If no route matches, show 404 content
            const messageElement = document.createElement('h1');
            messageElement.setAttribute('slot', 'content');
            messageElement.textContent = '404 Not Found';
            this.appendChild(messageElement);
        }
    }
}
function entryRoute(tagName, routePath) {
    if (routePath.startsWith(ROUTE_PATH_PREFIX)) {
        routePath = routePath.substring(ROUTE_PATH_PREFIX.length); // Remove 'routes:' prefix
    }
    routeEntries.push([routePath, tagName]);
}
function getRouter() {
    return globalRouter;
}

/**
 * registerSingleFileComponents.ts
 *
 * 複数のシングルファイルコンポーネント（SFC）をまとめてStructiveのWeb Componentsとして登録するユーティリティ関数です。
 *
 * 主な役割:
 * - singleFileComponents（tagNameとパスのマップ）を走査し、各SFCを非同期で取得・パース
 * - enableRouterが有効な場合はentryRouteでルーティング情報も登録
 * - createComponentClassでWeb Componentsクラスを生成し、registerComponentClassでカスタム要素として登録
 *
 * 設計ポイント:
 * - SFCのロードからWeb Components登録、ルーティング登録までを一括で自動化
 * - 非同期処理で複数コンポーネントの動的登録に対応
 * - ルートパス"/root"の正規化や、@routesプレフィックスの除去など柔軟なパス処理
 */
async function registerSingleFileComponents(singleFileComponents) {
    for (const [tagName, path] of Object.entries(singleFileComponents)) {
        let componentData = null;
        if (config$2.enableRouter) {
            const routePath = path.startsWith("@routes") ? path.slice(7) : path; // remove the prefix 'routes:'
            entryRoute(tagName, routePath === "/root" ? "/" : routePath); // routing
        }
        componentData = await loadSingleFileComponent(path);
        const componentClass = createComponentClass(componentData);
        registerComponentClass(tagName, componentClass);
    }
}

/**
 * MainWrapper.ts
 *
 * アプリ全体のレイアウトやルーティングを管理するカスタムエレメント MainWrapper の実装です。
 *
 * 主な役割:
 * - Shadow DOMの有効化やレイアウトテンプレートの動的読み込み
 * - レイアウトテンプレートやスタイルの適用
 * - ルーター要素（routerTagName）の動的追加
 *
 * 設計ポイント:
 * - config.shadowDomMode で Shadow DOMの有効/無効を切り替え
 * - config.layoutPath が指定されていればfetchでレイアウトHTMLを取得し、テンプレート・スタイルを適用
 * - スタイルはadoptedStyleSheetsでShadowRootまたはdocumentに適用
 * - レイアウトが指定されていない場合はデフォルトのslotを挿入
 * - config.enableRouter が有効な場合はrouter要素をslotに追加
 */
const SLOT_KEY = "router";
const DEFAULT_LAYOUT = `<slot name="${SLOT_KEY}"></slot>`;
class MainWrapper extends HTMLElement {
    constructor() {
        super();
        if (config$2.shadowDomMode !== "none") {
            this.attachShadow({ mode: 'open' });
        }
    }
    async connectedCallback() {
        await this.loadLayout();
        this.render();
    }
    get root() {
        return this.shadowRoot ?? this;
    }
    async loadLayout() {
        if (config$2.layoutPath) {
            const response = await fetch(config$2.layoutPath);
            if (response.ok) {
                const layoutText = await response.text();
                const workTemplate = document.createElement("template");
                workTemplate.innerHTML = layoutText;
                const template = workTemplate.content.querySelector("template");
                const style = workTemplate.content.querySelector("style");
                this.root.appendChild(template?.content ?? document.createDocumentFragment());
                if (style) {
                    const shadowRootOrDocument = this.shadowRoot ?? document;
                    const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
                    if (!styleSheets.includes(style)) {
                        shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, style];
                    }
                }
            }
            else {
                raiseError({
                    code: 'TMP-101',
                    message: `Failed to load layout from ${config$2.layoutPath}`,
                    context: { layoutPath: config$2.layoutPath },
                    docsUrl: '/docs/error-codes.md#tmp',
                    severity: 'error',
                });
            }
        }
        else {
            this.root.innerHTML = DEFAULT_LAYOUT;
        }
    }
    render() {
        // add router
        if (config$2.enableRouter) {
            const router = document.createElement(config$2.routerTagName);
            router.setAttribute('slot', SLOT_KEY);
            this.root.appendChild(router);
        }
    }
}

/**
 * bootstrap.ts
 *
 * Structiveアプリケーションの初期化処理を行うエントリーポイントです。
 *
 * 主な役割:
 * - グローバル設定(config)に従い、必要なコンポーネントやルーター、メインラッパーを登録・初期化
 * - autoLoadFromImportMapが有効な場合はimportmapからルートやコンポーネントを動的ロード
 * - enableRouterが有効な場合はRouterコンポーネントをカスタム要素として登録
 * - enableMainWrapperが有効な場合はMainWrapperをカスタム要素として登録し、autoInsertMainWrapperが有効ならbodyに自動挿入
 *
 * 設計ポイント:
 * - 設定値に応じて初期化処理を柔軟に制御
 * - importmapやカスタム要素の登録、DOMへの自動挿入など、Structiveの起動に必要な処理を一元化
 */
async function bootstrap() {
    if (config$2.autoLoadFromImportMap) {
        await loadFromImportMap();
    }
    if (config$2.enableRouter) {
        customElements.define(config$2.routerTagName, Router);
    }
    if (config$2.enableMainWrapper) {
        customElements.define(config$2.mainTagName, MainWrapper);
        if (config$2.autoInsertMainWrapper) {
            const mainWrapper = document.createElement(config$2.mainTagName);
            document.body.appendChild(mainWrapper);
        }
    }
}

/**
 * exports.ts
 *
 * Structiveの主要なエントリーポイント・APIを外部公開するモジュールです。
 *
 * 主な役割:
 * - registerSingleFileComponents, bootstrap, config などの主要APIをエクスポート
 * - defineComponents: SFC群をまとめて登録し、autoInitが有効なら自動で初期化
 * - bootstrapStructive: 初期化処理を一度だけ実行
 *
 * 設計ポイント:
 * - グローバル設定(config)を外部から参照・変更可能
 * - 初期化処理の多重実行を防止し、安全な起動を保証
 */
const config = config$2;
let initialized = false;
async function defineComponents(singleFileComponents) {
    await registerSingleFileComponents(singleFileComponents);
    if (config.autoInit) {
        await bootstrapStructive();
    }
}
async function bootstrapStructive() {
    if (!initialized) {
        await bootstrap();
        initialized = true;
    }
}

export { bootstrapStructive, config, defineComponents };
//# sourceMappingURL=structive.js.map
