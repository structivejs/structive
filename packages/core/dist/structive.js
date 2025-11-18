const globalConfig = {
    "debug": false,
    "locale": "en-US", // The locale of the component, ex. "en-US", default is "en-US"
    "enableShadowDom": true, // Whether to use Shadow DOM or not
    "enableMainWrapper": true, // Whether to use the main wrapper or not
    "enableRouter": true, // Whether to use the router or not
    "autoInsertMainWrapper": false, // Whether to automatically insert the main wrapper or not
    "autoInit": true, // Whether to automatically initialize the component or not
    "mainTagName": "app-main", // The tag name of the main wrapper, default is "app-main"
    "routerTagName": "view-router", // The tag name of the router, default is "view-router"
    "layoutPath": "", // The path to the layout file, default is ""
    "autoLoadFromImportMap": false, // Whether to automatically load the component from the import map or not
    "optimizeList": true, // Whether to optimize the list or not
    "optimizeListElements": true, // Whether to optimize the list elements or not
    "optimizeAccessor": true, // Whether to optimize the accessors or not
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
function resolveNodeFromPath(root, path) {
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
function getAbsoluteNodePath(node) {
    // 結果を格納する配列（ルート→リーフの順でインデックスが並ぶ）
    // Array to store result (indexes arranged from root to leaf)
    let routeIndexes = [];
    // 親ノードが存在する限りループ（ルートに到達するまで）
    // Loop while parent node exists (until reaching root)
    while (node.parentNode !== null) {
        // 親ノードのchildNodesを配列に変換
        // Convert parent node's childNodes to array
        const childNodes = Array.from(node.parentNode.childNodes);
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
const cache$2 = new Map();
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
function createFilters(filters, texts) {
    // キャッシュを確認
    // Check cache
    let result = cache$2.get(texts);
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
        cache$2.set(texts, result);
    }
    // キャッシュヒットまたは新規生成した結果を返す
    // Return cached or newly generated result
    return result;
}

/**
 * BindingNode クラスは、1つのバインディング対象ノード（ElementやTextなど）に対する
 * バインディング処理の基底クラスです。
 *
 * アーキテクチャ:
 * - #binding: 親バインディング（IBinding）への参照
 * - #node: バインディング対象のDOMノード
 * - #name: バインディングのプロパティ名（例: "textContent", "value"）
 * - #filters: 値取得時に適用するフィルタ関数群
 * - #decorates: デコレータ文字列配列（例: ["prevent", "stop"]）
 * - #bindContents: 子BindContent配列（構造制御バインディング用）
 *
 * 主な役割:
 * 1. ノード・プロパティ名・フィルタ・デコレータ・バインディング情報の保持
 * 2. バインディング値の更新（applyChange → assignValue）のインターフェース提供
 * 3. 複数バインド内容（bindContents）の管理（構造制御バインディング用）
 * 4. サブクラスでassignValue, updateElementsを実装し、各種ノード・プロパティごとのバインディング処理を拡張
 *
 * 設計パターン:
 * - Template Method: applyChange が共通フロー、assignValue をサブクラスで実装
 * - Strategy: フィルタ・デコレータで振る舞いをカスタマイズ
 *
 * サブクラス:
 * - BindingNodeAttribute: 属性バインディング
 * - BindingNodeProperty*: プロパティバインディング（value, checked, etc.）
 * - BindingNodeEvent*: イベントバインディング
 * - BindingNodeFor, BindingNodeIf: 構造制御バインディング
 *
 * 設計ポイント:
 * - assignValue, updateElementsは未実装（サブクラスでオーバーライド必須）
 * - isSelectElement, value, filteredValueなどはサブクラスで用途に応じて拡張
 * - フィルタやデコレータ、バインド内容の管理も柔軟に対応
 *
 * ---
 *
 * BindingNode class is the base class for binding processing on a single target node (Element, Text, etc.).
 *
 * Architecture:
 * - #binding: Reference to parent binding (IBinding)
 * - #node: Target DOM node for binding
 * - #name: Property name of binding (e.g., "textContent", "value")
 * - #filters: Array of filter functions applied when retrieving value
 * - #decorates: Array of decorator strings (e.g., ["prevent", "stop"])
 * - #bindContents: Array of child BindContent (for structural control bindings)
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
    #binding;
    #node;
    #name;
    #filters;
    #decorates;
    #bindContents = [];
    /**
     * バインディング対象のDOMノードを返すgetter。
     * Getter to return target DOM node for binding.
     */
    get node() {
        return this.#node;
    }
    /**
     * バインディングのプロパティ名を返すgetter（例: "textContent", "value"）。
     * Getter to return property name of binding (e.g., "textContent", "value").
     */
    get name() {
        return this.#name;
    }
    /**
     * サブプロパティ名を返すgetter（基底クラスでは name と同じ、サブクラスでオーバーライド可能）。
     * Getter to return sub-property name (same as name in base class, can be overridden in subclasses).
     */
    get subName() {
        return this.#name;
    }
    /**
     * 親バインディング（IBinding）を返すgetter。
     * Getter to return parent binding (IBinding).
     */
    get binding() {
        return this.#binding;
    }
    /**
     * デコレータ文字列配列を返すgetter（例: ["prevent", "stop"]）。
     * Getter to return array of decorator strings (e.g., ["prevent", "stop"]).
     */
    get decorates() {
        return this.#decorates;
    }
    /**
     * フィルタ関数群を返すgetter。
     * Getter to return array of filter functions.
     */
    get filters() {
        return this.#filters;
    }
    /**
     * 子BindContent配列を返すgetter（構造制御バインディング用）。
     * Getter to return array of child BindContent (for structural control bindings).
     */
    get bindContents() {
        return this.#bindContents;
    }
    /**
     * コンストラクタ。
     * - binding: 親バインディング
     * - node: バインディング対象のDOMノード
     * - name: バインディングのプロパティ名
     * - filters: フィルタ関数群
     * - decorates: デコレータ文字列配列
     *
     * 初期化処理:
     * 1. 全パラメータをプライベートフィールドに保存
     * 2. bindContents は空配列で初期化
     * 3. サブクラスで activate() 時に追加の初期化処理を実装可能
     *
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
     */
    constructor(binding, node, name, filters, decorates) {
        this.#binding = binding;
        this.#node = node;
        this.#name = name;
        this.#filters = filters;
        this.#decorates = decorates;
    }
    /**
     * 初期化メソッド（基底クラスでは空実装）。
     * サブクラスで初期化処理を実装可能。
     * 注意: 現在は activate() が推奨されており、このメソッドは非推奨。
     *
     * Initialization method (empty implementation in base class).
     * Subclasses can implement initialization processing.
     * Note: activate() is now recommended, this method is deprecated.
     */
    init() {
        // サブクラスで初期化処理を実装可能 / Subclasses can implement initialization
    }
    /**
     * 値をDOMに割り当てるメソッド（基底クラスでは未実装、サブクラスで必須オーバーライド）。
     * - 属性バインディング: 属性値を設定
     * - プロパティバインディング: プロパティ値を設定
     * - イベントバインディング: イベントリスナーを登録
     * - 構造制御バインディング: DOM構造を変更
     *
     * Method to assign value to DOM (unimplemented in base class, must override in subclasses).
     * - Attribute binding: Set attribute value
     * - Property binding: Set property value
     * - Event binding: Register event listener
     * - Structural control binding: Modify DOM structure
     *
     * @param value - DOMに割り当てる値 / Value to assign to DOM
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
     * 複数要素を一括更新するメソッド（基底クラスでは未実装、構造制御バインディングでオーバーライド）。
     * - BindingNodeFor: ループアイテムの一括更新
     * - その他のバインディング: 通常は使用しない
     *
     * Method to batch update multiple elements (unimplemented in base class, override in structural control bindings).
     * - BindingNodeFor: Batch update of loop items
     * - Other bindings: Normally not used
     *
     * @param listIndexes - リストインデックス配列 / Array of list indices
     * @param values - 値配列 / Array of values
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
     * 再描画通知メソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - 動的依存関係解決後に関連バインディングを更新する際に使用
     * - 構造制御バインディングで子BindContentへの通知に使用
     *
     * Redraw notification method (empty implementation in base class, can override in subclasses).
     * - Used to update related bindings after dynamic dependency resolution
     * - Used in structural control bindings to notify child BindContent
     *
     * @param refs - 再描画対象の状態参照配列 / Array of state references for redraw
     */
    notifyRedraw(refs) {
        // サブクラスで親子関係を考慮してバインディングの更新を通知する実装が可能
        // Subclasses can implement notification considering parent-child relationships
    }
    /**
     * 変更適用メソッド（Template Methodパターン）。
     * - BindingStateからフィルタ適用後の値を取得
     * - assignValue を呼び出してDOMに反映
     * - サブクラスは assignValue をオーバーライドして具体的な処理を実装
     *
     * Change application method (Template Method pattern).
     * - Retrieves filtered value from BindingState
     * - Calls assignValue to reflect to DOM
     * - Subclasses override assignValue to implement specific processing
     *
     * @param renderer - レンダラーインスタンス / Renderer instance
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        this.assignValue(filteredValue);
    }
    /**
     * バインディングノードを有効化するメソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - 初期レンダリング実行
     * - イベントリスナー登録（イベントバインディング）
     * - 子BindContentの初期化（構造制御バインディング）
     *
     * Method to activate binding node (empty implementation in base class, can override in subclasses).
     * - Execute initial rendering
     * - Register event listeners (event binding)
     * - Initialize child BindContent (structural control binding)
     */
    activate() {
        // サブクラスでバインディングノードの有効化処理を実装可能
        // Subclasses can implement activation processing
    }
    /**
     * バインディングノードを無効化するメソッド（基底クラスでは空実装、サブクラスでオーバーライド可能）。
     * - イベントリスナー解除（イベントバインディング）
     * - 子BindContentのクリーンアップ（構造制御バインディング）
     *
     * Method to inactivate binding node (empty implementation in base class, can override in subclasses).
     * - Unregister event listeners (event binding)
     * - Cleanup child BindContent (structural control binding)
     */
    inactivate() {
        // サブクラスでバインディングノードの無効化処理を実装可能
        // Subclasses can implement inactivation processing
    }
    /**
     * ノードがHTMLSelectElementかどうかを判定するgetter。
     * プロパティバインディングで select 要素の特殊処理に使用。
     *
     * Getter to determine if node is HTMLSelectElement.
     * Used for special handling of select elements in property binding.
     */
    get isSelectElement() {
        return this.node instanceof HTMLSelectElement;
    }
    /**
     * 現在の値を返すgetter（基底クラスでは null、サブクラスでオーバーライド）。
     * 双方向バインディングで現在のDOM値を取得する際に使用。
     *
     * Getter to return current value (null in base class, override in subclasses).
     * Used to get current DOM value in bidirectional binding.
     */
    get value() {
        return null;
    }
    /**
     * フィルタ適用後の値を返すgetter（基底クラスでは null、サブクラスでオーバーライド）。
     * 双方向バインディングでフィルタ適用後のDOM値を取得する際に使用。
     *
     * Getter to return filtered value (null in base class, override in subclasses).
     * Used to get filtered DOM value in bidirectional binding.
     */
    get filteredValue() {
        return null;
    }
}

/**
 * BindingNodeAttribute クラスは、属性バインディング（例: attr.src, attr.alt など）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、属性バインディング固有の処理を実装
 * - #subName: name から抽出した属性名（例: "attr.src" → "src"）
 *
 * 主な役割:
 * 1. ノード属性名（subName）を抽出し、値を属性としてElementにセット
 * 2. null/undefined/NaN の場合は空文字列に変換してセット
 * 3. フィルタやデコレータにも対応
 * 4. 値を常に文字列に変換して setAttribute で設定
 *
 * 使用例:
 * - <img :attr.src="imageUrl"> → <img src="https://example.com/image.png">
 * - <a :attr.href="linkUrl"> → <a href="/about">
 * - <div :attr.data-id="itemId"> → <div data-id="123">
 *
 * 設計ポイント:
 * - name から属性名（subName）を抽出（例: "attr.src" → "src"）
 * - assignValue で属性値を常に文字列として設定
 * - null/undefined/NaN は空文字列に変換（HTML仕様に準拠）
 * - createBindingNodeAttribute ファクトリでフィルタ適用済みインスタンスを生成
 *
 * ---
 *
 * BindingNodeAttribute class implements binding node for attribute bindings (e.g., attr.src, attr.alt).
 *
 * Architecture:
 * - Inherits BindingNode, implements attribute binding-specific processing
 * - #subName: Attribute name extracted from name (e.g., "attr.src" → "src")
 *
 * Main responsibilities:
 * 1. Extract node attribute name (subName), set value as element attribute
 * 2. Convert null/undefined/NaN to empty string
 * 3. Support filters and decorators
 * 4. Always convert value to string and set with setAttribute
 *
 * Usage examples:
 * - <img :attr.src="imageUrl"> → <img src="https://example.com/image.png">
 * - <a :attr.href="linkUrl"> → <a href="/about">
 * - <div :attr.data-id="itemId"> → <div data-id="123">
 *
 * Design points:
 * - Extract attribute name (subName) from name (e.g., "attr.src" → "src")
 * - Always set attribute value as string in assignValue
 * - Convert null/undefined/NaN to empty string (conforms to HTML spec)
 * - createBindingNodeAttribute factory generates filter-applied instance
 */
class BindingNodeAttribute extends BindingNode {
    #subName;
    /**
     * 属性名を返す getter。
     * 例: "attr.src" から "src" を返す。
     *
     * Getter to return attribute name.
     * Example: Returns "src" from "attr.src".
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - name から属性名（subName）を抽出（"attr." の後の部分）
     * - 親クラス（BindingNode）を初期化
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割し、2番目の要素を subName として保存
     *    例: "attr.src" → ["attr", "src"] → subName = "src"
     *
     * Constructor.
     * - Extracts attribute name (subName) from name (part after "attr.")
     * - Initializes parent class (BindingNode)
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by ".", save second element as subName
     *    Example: "attr.src" → ["attr", "src"] → subName = "src"
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        const [, subName] = this.name.split(".");
        this.#subName = subName;
    }
    /**
     * 属性値を DOM に割り当てるメソッド。
     *
     * 処理フロー:
     * 1. null/undefined/NaN の場合は空文字列に変換
     *    - HTML仕様に準拠（属性値は常に文字列）
     *    - これにより、属性が完全に削除されず、空文字列として保持される
     * 2. ノードを Element としてキャスト
     * 3. setAttribute で subName に値を文字列として設定
     *    - value.toString() で明示的に文字列変換
     *
     * 設計意図:
     * - HTML属性は常に文字列として扱われる
     * - null等の特殊値を空文字列に統一することで、一貫性を保つ
     * - setAttribute を使用することで、標準DOM APIに準拠
     *
     * Method to assign attribute value to DOM.
     *
     * Processing flow:
     * 1. Convert null/undefined/NaN to empty string
     *    - Conforms to HTML spec (attribute values are always strings)
     *    - This keeps attribute instead of removing it completely
     * 2. Cast node as Element
     * 3. Set value as string to subName with setAttribute
     *    - Explicitly convert to string with value.toString()
     *
     * Design intent:
     * - HTML attributes are always treated as strings
     * - Unify special values like null to empty string for consistency
     * - Conform to standard DOM API by using setAttribute
     *
     * @param value - 属性に割り当てる値 / Value to assign to attribute
     */
    assignValue(value) {
        // ステップ1: null/undefined/NaN を空文字列に変換
        // Step 1: Convert null/undefined/NaN to empty string
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        // ステップ2-3: 属性値を文字列として設定
        // Step 2-3: Set attribute value as string
        const element = this.node;
        element.setAttribute(this.subName, value.toString());
    }
}
/**
 * 属性バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "attr.src"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeAttribute を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeAttribute インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate attribute binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "attr.src")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeAttribute
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeAttribute instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeAttribute = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeAttribute(binding, node, name, filterFns, decorates);
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
 * BindingNodeCheckbox クラスは、チェックボックス（input[type="checkbox"]）のバインディングを担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、チェックボックス固有の処理を実装
 * - 配列値とチェックボックスの value を比較して checked 状態を制御
 * - 双方向バインディング対応（ユーザー操作時に状態を自動更新）
 *
 * 主な役割:
 * 1. 配列値に input.value が含まれるかで checked 状態を制御
 * 2. チェックボックスのチェック/チェック解除時に配列を自動更新（双方向バインディング）
 * 3. イベント名のカスタマイズ対応（decorates で "onchange" 等を指定可能）
 * 4. readonly モード対応（decorates に "readonly" または "ro" を指定）
 *
 * 使用例:
 * - <input type="checkbox" value="apple" :prop.checked="selectedFruits"> → selectedFruits に "apple" が含まれるときチェック
 * - <input type="checkbox" value="banana" :prop.checked.onchange="selectedFruits"> → change イベントで更新
 * - <input type="checkbox" value="orange" :prop.checked.readonly="selectedFruits"> → 読み取り専用（状態更新なし）
 *
 * 設計ポイント:
 * - assignValue で配列値と input.value を比較し、checked プロパティを設定
 * - constructor でイベントリスナーを登録し、双方向バインディングを実現
 * - decorates の数は1つまで（複数指定はエラー）
 * - readonly/ro 指定時はイベントリスナーを登録しない
 * - フィルタ適用後の値を使用して状態比較・更新を実行
 *
 * ---
 *
 * BindingNodeCheckbox class implements binding for checkboxes (input[type="checkbox"]).
 *
 * Architecture:
 * - Inherits BindingNode, implements checkbox-specific processing
 * - Controls checked state by comparing array value with checkbox value
 * - Supports bidirectional binding (auto-updates state on user interaction)
 *
 * Main responsibilities:
 * 1. Control checked state by checking if input.value is in array value
 * 2. Auto-update array on checkbox check/uncheck (bidirectional binding)
 * 3. Support custom event names (can specify "onchange" etc. in decorates)
 * 4. Support readonly mode (specify "readonly" or "ro" in decorates)
 *
 * Usage examples:
 * - <input type="checkbox" value="apple" :prop.checked="selectedFruits"> → Checked when "apple" is in selectedFruits
 * - <input type="checkbox" value="banana" :prop.checked.onchange="selectedFruits"> → Updates on change event
 * - <input type="checkbox" value="orange" :prop.checked.readonly="selectedFruits"> → Read-only (no state update)
 *
 * Design points:
 * - assignValue compares array value with input.value, sets checked property
 * - constructor registers event listener to achieve bidirectional binding
 * - decorates limited to 1 (multiple decorators cause error)
 * - No event listener when readonly/ro is specified
 * - Uses filtered value for state comparison and update
 *
 * @throws BIND-201 Value is not array: 配列以外が渡された場合 / When non-array value is passed
 * @throws BIND-201 Has multiple decorators: decorates が複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeCheckbox extends BindingNode {
    /**
     * チェックボックスの value 属性を返す getter。
     * 双方向バインディング時に現在のチェックボックスの値を取得するために使用。
     *
     * Getter to return checkbox value attribute.
     * Used to get current checkbox value in bidirectional binding.
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * フィルタ適用後のチェックボックス value を返す getter。
     * 双方向バインディング時に状態更新する値を取得するために使用。
     *
     * Getter to return filtered checkbox value.
     * Used to get value for state update in bidirectional binding.
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - チェックボックスの双方向バインディングを設定（イベントリスナー登録）
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. ノードが HTMLInputElement かつ type="checkbox" であることを確認
     * 3. decorates の数が1つ以下であることを確認（複数はエラー）
     * 4. decorates からイベント名を抽出（デフォルトは "input"）
     * 5. readonly/ro の場合は早期リターン（イベントリスナー登録なし）
     * 6. イベントリスナーを登録し、双方向バインディングを実現
     *
     * イベント名の処理:
     * - decorates[0] が "onchange" の場合 → "change"
     * - decorates[0] が "change" の場合 → "change"
     * - decorates[0] が未指定の場合 → "input"（デフォルト）
     * - "readonly" または "ro" の場合 → イベントリスナー登録なし
     *
     * 双方向バインディングの仕組み:
     * 1. ユーザーがチェックボックスをクリック
     * 2. イベントが発火
     * 3. filteredValue（フィルタ適用後の value）を取得
     * 4. createUpdater で状態更新トランザクションを開始
     * 5. binding.updateStateValue で配列に value を追加/削除
     * 6. 状態変更が他のバインディングに伝播
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Sets up checkbox bidirectional binding (registers event listener)
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Verify node is HTMLInputElement and type="checkbox"
     * 3. Verify decorates count is 1 or less (multiple causes error)
     * 4. Extract event name from decorates (default is "input")
     * 5. Early return if readonly/ro (no event listener registration)
     * 6. Register event listener to achieve bidirectional binding
     *
     * Event name processing:
     * - If decorates[0] is "onchange" → "change"
     * - If decorates[0] is "change" → "change"
     * - If decorates[0] is unspecified → "input" (default)
     * - If "readonly" or "ro" → No event listener registration
     *
     * Bidirectional binding mechanism:
     * 1. User clicks checkbox
     * 2. Event fires
     * 3. Get filteredValue (filtered value)
     * 4. Start state update transaction with createUpdater
     * 5. Add/remove value to/from array with binding.updateStateValue
     * 6. State change propagates to other bindings
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // ステップ1-2: ノードタイプとチェックボックスタイプの確認
        // Step 1-2: Verify node type and checkbox type
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement)
            return;
        const inputElement = this.node;
        if (inputElement.type !== "checkbox")
            return;
        // ステップ3: decorates の数を確認（複数はエラー）
        // Step 3: Verify decorates count (multiple causes error)
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        // ステップ4: イベント名を抽出（"on" プレフィックスを削除）
        // Step 4: Extract event name (remove "on" prefix)
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        // ステップ5: readonly/ro の場合は早期リターン
        // Step 5: Early return if readonly/ro
        if (eventName === "readonly" || eventName === "ro")
            return;
        // ステップ6: イベントリスナーを登録（双方向バインディング）
        // Step 6: Register event listener (bidirectional binding)
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async (e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            // 同期処理で状態を更新
            // Update state synchronously
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * 配列値に基づいて checked 状態を設定するメソッド。
     *
     * 処理フロー:
     * 1. 値が配列であることを確認（配列でない場合はエラー）
     * 2. filteredValue（フィルタ適用後の input.value）を取得
     * 3. 配列に filteredValue が含まれるかを判定
     * 4. 判定結果を element.checked に設定
     *
     * チェックボックスの動作:
     * - value=['apple', 'banana'], filteredValue='apple' → checked=true
     * - value=['apple', 'banana'], filteredValue='orange' → checked=false
     * - value=[], filteredValue='apple' → checked=false
     *
     * エラー条件:
     * - value が配列でない場合（文字列、数値、オブジェクト等）
     *
     * Method to set checked state based on array value.
     *
     * Processing flow:
     * 1. Verify value is array (error if not array)
     * 2. Get filteredValue (filtered input.value)
     * 3. Determine if array includes filteredValue
     * 4. Set determination result to element.checked
     *
     * Checkbox behavior:
     * - value=['apple', 'banana'], filteredValue='apple' → checked=true
     * - value=['apple', 'banana'], filteredValue='orange' → checked=false
     * - value=[], filteredValue='apple' → checked=false
     *
     * Error conditions:
     * - When value is not array (string, number, object, etc.)
     *
     * @param value - 配列値（チェックボックスの value が含まれるか判定） / Array value (determines if checkbox value is included)
     */
    assignValue(value) {
        // ステップ1: 配列であることを確認
        // Step 1: Verify it's an array
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-4: filteredValue を取得し、配列に含まれるかで checked を設定
        // Step 2-4: Get filteredValue, set checked based on array inclusion
        const filteredValue = this.filteredValue;
        const element = this.node;
        element.checked = value.includes(filteredValue);
    }
}
/**
 * チェックボックス用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "prop.checked"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（イベント名または "readonly"/"ro"）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeCheckbox を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeCheckbox インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate checkbox binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "prop.checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (event name or "readonly"/"ro")
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeCheckbox
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeCheckbox instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeCheckbox = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeCheckbox(binding, node, name, filterFns, decorates);
};

/**
 * BindingNodeClassList クラスは、class 属性（classList）のバインディングを担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、classList 固有の処理を実装
 * - 配列値を空白区切りで結合して className プロパティに反映
 * - 単方向バインディング（状態 → DOM のみ）
 *
 * 主な役割:
 * 1. 配列形式のクラス名リストを受け取り、空白区切りの文字列に変換
 * 2. 変換した文字列を element.className に設定
 * 3. 配列以外の値が渡された場合はエラーを発生
 *
 * 使用例:
 * - <div data-bind="class: buttonClasses"> (buttonClasses=['btn', 'btn-primary']) → class="btn btn-primary"
 * - <div data-bind="class: activeClasses"> (activeClasses=['active', 'highlight']) → class="active highlight"
 * - <div data-bind="class: emptyClasses"> (emptyClasses=[]) → class=""
 *
 * 設計ポイント:
 * - assignValue で配列検証と文字列変換を実行
 * - join(" ") で配列を空白区切りの文字列に変換
 * - 配列以外の値（文字列、数値、オブジェクト等）はエラー
 * - 双方向バインディングは未対応（DOM → 状態への更新なし）
 *
 * ---
 *
 * BindingNodeClassList class implements binding for class attribute (classList).
 *
 * Architecture:
 * - Inherits BindingNode, implements classList-specific processing
 * - Converts array value to space-separated string and reflects to className property
 * - One-way binding (state → DOM only)
 *
 * Main responsibilities:
 * 1. Receive array of class names and convert to space-separated string
 * 2. Set converted string to element.className
 * 3. Raise error if non-array value is passed
 *
 * Usage examples:
 * - <div data-bind="class: buttonClasses"> (buttonClasses=['btn', 'btn-primary']) → class="btn btn-primary"
 * - <div data-bind="class: activeClasses"> (activeClasses=['active', 'highlight']) → class="active highlight"
 * - <div data-bind="class: emptyClasses"> (emptyClasses=[]) → class=""
 *
 * Design points:
 * - assignValue performs array validation and string conversion
 * - join(" ") converts array to space-separated string
 * - Non-array values (string, number, object, etc.) cause error
 * - Bidirectional binding not supported (no DOM → state update)
 *
 * @throws BIND-201 Value is not array: 配列以外が渡された場合 / When non-array value is passed
 */
class BindingNodeClassList extends BindingNode {
    /**
     * 配列値を空白区切りの文字列に変換し、className に設定するメソッド。
     *
     * 処理フロー:
     * 1. 値が配列であることを確認（配列でない場合はエラー）
     * 2. ノードを Element にキャスト
     * 3. 配列を空白区切りで結合（join(" ")）
     * 4. 結合した文字列を element.className に設定
     *
     * 変換例:
     * - ['btn', 'btn-primary'] → "btn btn-primary"
     * - ['active', 'highlight', 'selected'] → "active highlight selected"
     * - [] → "" (空文字列)
     * - ['single'] → "single"
     *
     * エラー条件:
     * - value が配列でない場合（文字列、数値、オブジェクト、null、undefined 等）
     *
     * 注意点:
     * - 配列要素は toString() で文字列化されるため、数値やオブジェクトも含められる
     * - undefined や null が配列に含まれる場合、"undefined" "null" という文字列になる
     * - 重複するクラス名もそのまま出力される（DOM が自動で重複除去）
     *
     * Method to convert array value to space-separated string and set to className.
     *
     * Processing flow:
     * 1. Verify value is array (error if not array)
     * 2. Cast node to Element
     * 3. Join array with spaces (join(" "))
     * 4. Set joined string to element.className
     *
     * Conversion examples:
     * - ['btn', 'btn-primary'] → "btn btn-primary"
     * - ['active', 'highlight', 'selected'] → "active highlight selected"
     * - [] → "" (empty string)
     * - ['single'] → "single"
     *
     * Error conditions:
     * - When value is not array (string, number, object, null, undefined, etc.)
     *
     * Notes:
     * - Array elements are stringified with toString(), so numbers and objects can be included
     * - If undefined or null in array, becomes "undefined" "null" string
     * - Duplicate class names are output as-is (DOM auto-deduplicates)
     *
     * @param value - 配列値（クラス名のリスト） / Array value (list of class names)
     */
    assignValue(value) {
        // ステップ1: 配列であることを確認
        // Step 1: Verify it's an array
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-4: 配列を空白区切りで結合し、className に設定
        // Step 2-4: Join array with spaces, set to className
        const element = this.node;
        element.className = value.join(" ");
    }
}
/**
 * classList 用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "class")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(classList では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeClassList を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeClassList インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate classList binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "class")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for classList)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeClassList
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeClassList instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeClassList = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeClassList(binding, node, name, filterFns, decorates);
};

/**
 * BindingNodeClassName クラスは、個別クラス名のトグル制御を担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、特定のクラス名の追加/削除を実装
 * - name から subName（実際のクラス名）を抽出
 * - boolean 値に基づいて classList.toggle で制御
 *
 * 主な役割:
 * 1. name から「class.」以降のクラス名を抽出（例: "class.active" → "active"）
 * 2. boolean 値が true のときクラスを追加、false のとき削除
 * 3. classList.toggle API を使用した効率的な制御
 * 4. boolean 以外の値が渡された場合はエラーを発生
 *
 * 使用例:
 * - <div data-bind="class.active: isActive"> (isActive=true) → class="active" を追加
 * - <div data-bind="class.highlight: isHighlighted"> (isHighlighted=false) → class="highlight" を削除
 * - <div data-bind="class.btn-primary: isPrimary"> (isPrimary=true) → class="btn-primary" を追加
 *
 * 設計ポイント:
 * - subName はコンストラクタで一度だけ抽出し、プライベートフィールドに保存
 * - assignValue で boolean 検証と classList.toggle を実行
 * - classList.toggle(className, force) の第2引数で明示的に追加/削除を制御
 * - 単一のクラス名のみを制御（複数クラスの場合は BindingNodeClassList を使用）
 *
 * ---
 *
 * BindingNodeClassName class implements toggle control for individual class names.
 *
 * Architecture:
 * - Inherits BindingNode, implements add/remove of specific class name
 * - Extracts subName (actual class name) from name
 * - Controls with classList.toggle based on boolean value
 *
 * Main responsibilities:
 * 1. Extract class name after "class." from name (e.g., "class.active" → "active")
 * 2. Add class when boolean value is true, remove when false
 * 3. Efficient control using classList.toggle API
 * 4. Raise error if non-boolean value is passed
 *
 * Usage examples:
 * - <div data-bind="class.active: isActive"> (isActive=true) → Adds class="active"
 * - <div data-bind="class.highlight: isHighlighted"> (isHighlighted=false) → Removes class="highlight"
 * - <div data-bind="class.btn-primary: isPrimary"> (isPrimary=true) → Adds class="btn-primary"
 *
 * Design points:
 * - subName is extracted once in constructor and stored in private field
 * - assignValue performs boolean validation and classList.toggle
 * - Second argument of classList.toggle(className, force) explicitly controls add/remove
 * - Controls only single class name (use BindingNodeClassList for multiple classes)
 *
 * @throws BIND-201 Value is not boolean: boolean 以外が渡された場合 / When non-boolean value is passed
 */
class BindingNodeClassName extends BindingNode {
    #subName;
    /**
     * 制御対象のクラス名を返す getter。
     * name から抽出されたクラス名（"class.active" の "active" 部分）。
     *
     * Getter to return target class name.
     * Class name extracted from name ("active" part of "class.active").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - name からクラス名（subName）を抽出
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割（例: "class.active" → ["class", "active"]）
     * 3. 分割結果の2番目の要素（インデックス1）を subName として保存
     *
     * 抽出例:
     * - "class.active" → subName = "active"
     * - "class.btn-primary" → subName = "btn-primary"
     * - "class.is-visible" → subName = "is-visible"
     *
     * 注意点:
     * - name は必ず "class.<className>" の形式を想定
     * - "." が含まれない場合、subName は undefined になる可能性がある
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts class name (subName) from name
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by "." (e.g., "class.active" → ["class", "active"])
     * 3. Save second element (index 1) of split result as subName
     *
     * Extraction examples:
     * - "class.active" → subName = "active"
     * - "class.btn-primary" → subName = "btn-primary"
     * - "class.is-visible" → subName = "is-visible"
     *
     * Notes:
     * - name is expected to be in "class.<className>" format
     * - If "." is not included, subName may be undefined
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // name を分割してクラス名を抽出（"class.active" → "active"）
        // Split name to extract class name ("class.active" → "active")
        const [, subName] = this.name.split(".");
        this.#subName = subName;
    }
    /**
     * boolean 値に基づいてクラス名を追加/削除するメソッド。
     *
     * 処理フロー:
     * 1. 値が boolean 型であることを確認（boolean でない場合はエラー）
     * 2. ノードを Element にキャスト
     * 3. classList.toggle(subName, value) でクラスを追加/削除
     *
     * classList.toggle の動作:
     * - toggle(className, true) → クラスを追加（既に存在する場合は何もしない）
     * - toggle(className, false) → クラスを削除（存在しない場合は何もしない）
     *
     * 実行例:
     * - value=true, subName="active" → element.classList に "active" を追加
     * - value=false, subName="active" → element.classList から "active" を削除
     * - value=true, subName="btn-primary" → element.classList に "btn-primary" を追加
     *
     * エラー条件:
     * - value が boolean 以外の型（string, number, object, null, undefined 等）
     *
     * 利点:
     * - classList.toggle の第2引数（force）を使用することで、条件分岐なしで制御可能
     * - ブラウザネイティブ API のため、パフォーマンスが高い
     * - 冪等性が保証される（同じ操作を複数回実行しても安全）
     *
     * Method to add/remove class name based on boolean value.
     *
     * Processing flow:
     * 1. Verify value is boolean type (error if not boolean)
     * 2. Cast node to Element
     * 3. Add/remove class with classList.toggle(subName, value)
     *
     * classList.toggle behavior:
     * - toggle(className, true) → Adds class (no action if already exists)
     * - toggle(className, false) → Removes class (no action if doesn't exist)
     *
     * Execution examples:
     * - value=true, subName="active" → Adds "active" to element.classList
     * - value=false, subName="active" → Removes "active" from element.classList
     * - value=true, subName="btn-primary" → Adds "btn-primary" to element.classList
     *
     * Error conditions:
     * - When value is non-boolean type (string, number, object, null, undefined, etc.)
     *
     * Advantages:
     * - Using second argument (force) of classList.toggle enables control without conditional branching
     * - High performance as browser native API
     * - Idempotency guaranteed (safe to execute same operation multiple times)
     *
     * @param value - boolean 値（true でクラス追加、false でクラス削除）/ Boolean value (add class on true, remove on false)
     */
    assignValue(value) {
        // ステップ1: boolean 型であることを確認
        // Step 1: Verify it's boolean type
        if (typeof value !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeClassName.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-3: classList.toggle でクラスを追加/削除
        // Step 2-3: Add/remove class with classList.toggle
        const element = this.node;
        element.classList.toggle(this.subName, value);
    }
}
/**
 * class 名バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "class.active"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（className では通常未使用）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeClassName を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeClassName インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate class name binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "class.active")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for className)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeClassName
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeClassName instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeClassName = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeClassName(binding, node, name, filterFns, decorates);
};

/**
 * BindingNodeEvent クラスは、イベントバインディング（onClick, onInput など）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、イベント固有の処理を実装
 * - name からイベント名（subName）を抽出し、addEventListener で登録
 * - バインディング値（関数）をイベントハンドラとして実行
 * - デコレータで preventDefault/stopPropagation を制御
 *
 * 主な役割:
 * 1. name から "on" を除去してイベント名を抽出（例: "onClick" → "click"）
 * 2. 指定イベントに対して、バインディングされた関数をイベントリスナーとして登録
 * 3. デコレータ（preventDefault, stopPropagation）によるイベント制御に対応
 * 4. ループコンテキストやリストインデックスも引数としてイベントハンドラに渡す
 * 5. ハンドラ実行時は stateProxy を生成し、Updater 経由で非同期的に状態を更新
 *
 * 使用例:
 * - <button data-bind="onClick: handleClick"> → クリック時に handleClick を実行
 * - <input data-bind="onInput: handleInput"> → 入力時に handleInput を実行
 * - <form data-bind="onSubmit.preventDefault: handleSubmit"> → submit 時に preventDefault して handleSubmit を実行
 *
 * 設計ポイント:
 * - constructor でイベントリスナーを登録（初期化時のみ）
 * - update/applyChange は空実装（イベントバインディングは状態変更時に何もしない）
 * - handler で createUpdater 経由で状態更新トランザクションを実行
 * - バインディング値が関数でない場合はエラー（BIND-201）
 * - デコレータで preventDefault/stopPropagation を柔軟に制御
 * - ループ内イベントにも対応し、リストインデックスを引数展開
 * - 非同期関数にも対応（Promise を await）
 *
 * ---
 *
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 *
 * Architecture:
 * - Inherits BindingNode, implements event-specific processing
 * - Extracts event name (subName) from name and registers with addEventListener
 * - Executes binding value (function) as event handler
 * - Controls preventDefault/stopPropagation with decorators
 *
 * Main responsibilities:
 * 1. Extract event name by removing "on" from name (e.g., "onClick" → "click")
 * 2. Register bound function as event listener for specified event
 * 3. Support event control with decorators (preventDefault, stopPropagation)
 * 4. Pass loop context and list index as arguments to event handler
 * 5. Generate stateProxy on handler execution, update state asynchronously via Updater
 *
 * Usage examples:
 * - <button data-bind="onClick: handleClick"> → Execute handleClick on click
 * - <input data-bind="onInput: handleInput"> → Execute handleInput on input
 * - <form data-bind="onSubmit.preventDefault: handleSubmit"> → preventDefault and execute handleSubmit on submit
 *
 * Design points:
 * - Register event listener in constructor (initialization only)
 * - update/applyChange are empty implementations (event binding does nothing on state change)
 * - handler executes state update transaction via createUpdater
 * - Error (BIND-201) if binding value is not a function
 * - Flexible control of preventDefault/stopPropagation with decorators
 * - Supports events within loops, expands list index as arguments
 * - Supports async functions (await Promise)
 *
 * @throws BIND-201 is not a function: バインディング値が関数でない場合 / When binding value is not a function
 */
class BindingNodeEvent extends BindingNode {
    #subName;
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - name からイベント名（subName）を抽出
     * - イベントリスナーを登録
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name から "on" を除去してイベント名を抽出（例: "onClick" → "click"）
     * 3. ノードを HTMLElement にキャスト
     * 4. addEventListener でイベントリスナーを登録（handler メソッドを呼び出し）
     *
     * イベント名抽出:
     * - "onClick" → "click"
     * - "onInput" → "input"
     * - "onSubmit" → "submit"
     * - "onChange" → "change"
     *
     * 設計意図:
     * - constructor で一度だけイベントリスナーを登録（状態変更時には再登録しない）
     * - handler メソッドをバインドせず直接参照（this コンテキストを維持）
     * - 全てのイベントで同じ handler メソッドを使用
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts event name (subName) from name
     * - Registers event listener
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Extract event name by removing "on" from name (e.g., "onClick" → "click")
     * 3. Cast node to HTMLElement
     * 4. Register event listener with addEventListener (calls handler method)
     *
     * Event name extraction:
     * - "onClick" → "click"
     * - "onInput" → "input"
     * - "onSubmit" → "submit"
     * - "onChange" → "change"
     *
     * Design intent:
     * - Register event listener once in constructor (don't re-register on state change)
     * - Direct reference to handler method without binding (maintains this context)
     * - Use same handler method for all events
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // "on" を除去してイベント名を抽出（"onClick" → "click"）
        // Extract event name by removing "on" ("onClick" → "click")
        this.#subName = this.name.slice(2);
        // イベントリスナーを登録
        // Register event listener
        const element = node;
        element.addEventListener(this.subName, (e) => this.handler(e));
    }
    /**
     * イベント名を返す getter。
     * name から "on" を除去したイベント名（"onClick" の "click" 部分）。
     *
     * Getter to return event name.
     * Event name with "on" removed from name ("click" part of "onClick").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * 状態変更時の更新処理（空実装）。
     * イベントバインディングは初期化時にリスナーを登録するのみで、状態変更時には何もしない。
     *
     * 設計意図:
     * - イベントリスナーは一度登録すれば変更不要
     * - 状態変更時にリスナーを再登録する必要がない
     * - パフォーマンス向上のため、空実装にしている
     *
     * Update processing on state change (empty implementation).
     * Event binding only registers listener at initialization, does nothing on state change.
     *
     * Design intent:
     * - Event listener doesn't need to change once registered
     * - No need to re-register listener on state change
     * - Empty implementation for performance improvement
     */
    update() {
        // 何もしない（イベントバインディングは初期化時のみ）
        // Do nothing (event binding is initialization only)
    }
    /**
     * イベント発火時に実行されるハンドラメソッド。
     * デコレータでイベント制御を行い、バインディング値（関数）を実行する。
     *
     * 処理フロー:
     * 1. エンジンとループコンテキストを取得
     * 2. ループコンテキストからリストインデックス配列を抽出
     * 3. デコレータに "preventDefault" が含まれる場合、e.preventDefault() を実行
     * 4. デコレータに "stopPropagation" が含まれる場合、e.stopPropagation() を実行
     * 5. createUpdater で状態更新トランザクションを開始
     * 6. バインディング値（関数）を取得し、関数でなければエラー
     * 7. 関数を実行（引数: イベントオブジェクト、リストインデックス展開）
     * 8. 戻り値が Promise の場合は await
     *
     * 引数展開の例:
     * - ループ外: func.call(state, event)
     * - ループ1層: func.call(state, event, index1)
     * - ループ2層: func.call(state, event, index1, index2)
     *
     * デコレータの動作:
     * - preventDefault: e.preventDefault() を実行（デフォルト動作を防止）
     * - stopPropagation: e.stopPropagation() を実行（イベント伝播を停止）
     *
     * 設計意図:
     * - createUpdater でトランザクション管理し、状態更新を一括処理
     * - Reflect.apply で関数を実行し、this コンテキストを state に設定
     * - ループインデックスを引数展開することで、ループ内要素の識別が可能
     * - 非同期関数にも対応（Promise を await）
     * - デコレータで柔軟なイベント制御を実現
     *
     * Event handler method executed on event firing.
     * Controls event with decorators and executes binding value (function).
     *
     * Processing flow:
     * 1. Get engine and loop context
     * 2. Extract list index array from loop context
     * 3. Execute e.preventDefault() if "preventDefault" is in decorators
     * 4. Execute e.stopPropagation() if "stopPropagation" is in decorators
     * 5. Start state update transaction with createUpdater
     * 6. Get binding value (function), error if not a function
     * 7. Execute function (arguments: event object, list index expansion)
     * 8. Await if return value is Promise
     *
     * Argument expansion examples:
     * - Outside loop: func.call(state, event)
     * - Loop 1 level: func.call(state, event, index1)
     * - Loop 2 levels: func.call(state, event, index1, index2)
     *
     * Decorator behavior:
     * - preventDefault: Execute e.preventDefault() (prevent default behavior)
     * - stopPropagation: Execute e.stopPropagation() (stop event propagation)
     *
     * Design intent:
     * - Manage transaction with createUpdater, batch process state updates
     * - Execute function with Reflect.apply, set this context to state
     * - Enable identification of loop elements by expanding loop index as arguments
     * - Support async functions (await Promise)
     * - Achieve flexible event control with decorators
     *
     * @param e - イベントオブジェクト / Event object
     */
    async handler(e) {
        const engine = this.binding.engine;
        const loopContext = this.binding.parentBindContent.currentLoopContext;
        // ループコンテキストからリストインデックス配列を抽出
        // Extract list index array from loop context
        const indexes = loopContext?.serialize().map((context) => context.listIndex.index) ?? [];
        const options = this.decorates;
        // デコレータに応じてイベント制御
        // Control event according to decorators
        if (options.includes("preventDefault")) {
            e.preventDefault();
        }
        if (options.includes("stopPropagation")) {
            e.stopPropagation();
        }
        // 非同期処理の可能性あり
        // Possible async processing
        const resultPromise = createUpdater(engine, (updater) => {
            return updater.update(loopContext, (state, handler) => {
                // stateProxy を生成し、バインディング値を実行
                // Generate stateProxy and execute binding value
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
                // 関数を実行（引数: イベント、リストインデックス展開）
                // Execute function (arguments: event, list index expansion)
                return Reflect.apply(func, state, [e, ...indexes]);
            });
        });
        // Promise の場合は await
        // Await if Promise
        if (resultPromise instanceof Promise) {
            await resultPromise;
        }
    }
    /**
     * 状態変更時の適用処理（空実装）。
     * イベントバインディングは初期化時にリスナーを登録するのみで、状態変更時には何もしない。
     *
     * 設計意図:
     * - イベントリスナーは状態変更に依存しない
     * - 状態が変わってもリスナーの再登録は不要
     * - パフォーマンス向上のため、空実装にしている
     *
     * Apply processing on state change (empty implementation).
     * Event binding only registers listener at initialization, does nothing on state change.
     *
     * Design intent:
     * - Event listener doesn't depend on state change
     * - No need to re-register listener when state changes
     * - Empty implementation for performance improvement
     *
     * @param renderer - レンダラー（未使用） / Renderer (unused)
     */
    applyChange(renderer) {
        // イベントバインディングは初期化時のみで、状態変更時に何もしない
        // Event binding is initialization only, does nothing on state change
    }
}
/**
 * イベントバインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "onClick"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（"preventDefault", "stopPropagation" など）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeEvent を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeEvent インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate event binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "onClick")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings ("preventDefault", "stopPropagation", etc.)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeEvent
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeEvent instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeEvent = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeEvent(binding, node, name, filterFns, decorates);
};

const COMMENT_TEMPLATE_MARK_LEN$1 = COMMENT_TEMPLATE_MARK.length;
/**
 * BindingNodeBlock は、テンプレートブロック（コメントノードで示すテンプレート挿入部）を
 * バインディング対象とする基底クラス。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、ブロックバインディング（for, if等）の共通処理を提供
 * - #id: コメントノードから抽出したテンプレートID（テンプレート登録時のID）
 * - コメント形式: "@@|<id> <pattern>" （例: "@@|123 items.*"）
 *
 * 役割:
 * 1. コメントのテキストからテンプレートIDを抽出し id として保持
 * 2. Block 系バインディング（BindingNodeFor, BindingNodeIf等）の共通処理を提供
 * 3. テンプレートIDの妥当性を厳密に検証（非負整数のみ許可）
 *
 * サブクラス:
 * - BindingNodeFor: ループバインディング
 * - BindingNodeIf: 条件分岐バインディング
 * - その他の構造制御バインディング
 *
 * コメント形式の詳細:
 * - COMMENT_TEMPLATE_MARK ("@@|") で始まる
 * - 形式: "@@|<テンプレートID> <バインディングパターン>"
 * - 例: "@@|123 items.*" → id=123, pattern="items.*"
 *
 * バリデーション:
 * 1. コメントテキストが存在すること
 * 2. テンプレートIDが数値に変換可能であること
 * 3. 変換後の数値が元の文字列と一致すること（先頭0等を排除）
 * 4. NaN, Infinity でないこと
 * 5. 整数であること
 * 6. 非負であること（0以上）
 *
 * ---
 *
 * BindingNodeBlock is the base class for template blocks (template insertion indicated by comment nodes).
 *
 * Architecture:
 * - Inherits BindingNode, provides common processing for block bindings (for, if, etc.)
 * - #id: Template ID extracted from comment node (ID during template registration)
 * - Comment format: "@@|<id> <pattern>" (e.g., "@@|123 items.*")
 *
 * Responsibilities:
 * 1. Extract template ID from comment text and hold as id
 * 2. Provide common processing for Block-type bindings (BindingNodeFor, BindingNodeIf, etc.)
 * 3. Strictly validate template ID (only non-negative integers allowed)
 *
 * Subclasses:
 * - BindingNodeFor: Loop binding
 * - BindingNodeIf: Conditional branch binding
 * - Other structural control bindings
 *
 * Comment format details:
 * - Starts with COMMENT_TEMPLATE_MARK ("@@|")
 * - Format: "@@|<template ID> <binding pattern>"
 * - Example: "@@|123 items.*" → id=123, pattern="items.*"
 *
 * Validation:
 * 1. Comment text must exist
 * 2. Template ID must be convertible to number
 * 3. Converted number must match original string (exclude leading zeros, etc.)
 * 4. Not NaN or Infinity
 * 5. Must be integer
 * 6. Non-negative (0 or greater)
 *
 * @throws BIND-201 Invalid node: コメントノードからIDを抽出できない場合 / When ID cannot be extracted from comment node
 */
class BindingNodeBlock extends BindingNode {
    #id;
    /**
     * テンプレートIDを返すgetter。
     * コメントノードから抽出された、テンプレート登録時のID。
     *
     * Getter to return template ID.
     * ID extracted from comment node, used during template registration.
     */
    get id() {
        return this.#id;
    }
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - コメントノードからテンプレートIDを抽出し、厳密に検証
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. コメントノードのテキストから COMMENT_TEMPLATE_MARK ("@@|") 以降を取得
     * 3. スペースで分割し、最初の要素をテンプレートIDとして抽出
     * 4. 数値に変換し、厳密なバリデーションを実行
     * 5. 検証通過後、#id に保存
     *
     * バリデーションの詳細:
     * - numId.toString() !== id: 先頭0等の不正な形式を排除（例: "007" → 7 → "7" ≠ "007"）
     * - isNaN(numId): 数値変換失敗を検出
     * - !isFinite(numId): 無限大（Infinity, -Infinity）を排除
     * - !Number.isInteger(numId): 小数を排除（整数のみ許可）
     * - numId < 0: 負数を排除（0以上のみ許可）
     *
     * Number('') は 0 を返すため、文字列比較で妥当性を確認する必要がある。
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts template ID from comment node and strictly validates
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Get text after COMMENT_TEMPLATE_MARK ("@@|") from comment node
     * 3. Split by space, extract first element as template ID
     * 4. Convert to number, execute strict validation
     * 5. After validation passes, save to #id
     *
     * Validation details:
     * - numId.toString() !== id: Exclude invalid formats like leading zeros (e.g., "007" → 7 → "7" ≠ "007")
     * - isNaN(numId): Detect number conversion failure
     * - !isFinite(numId): Exclude infinity (Infinity, -Infinity)
     * - !Number.isInteger(numId): Exclude decimals (only integers allowed)
     * - numId < 0: Exclude negatives (only 0 or greater allowed)
     *
     * Note: Number('') returns 0, so string comparison is needed for validity check.
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // ステップ1: コメントテキストからテンプレートマーク以降を取得
        // Step 1: Get text after template mark from comment text
        const commentText = this.node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN$1) ?? raiseError({
            code: 'BIND-201',
            message: 'Invalid node',
            context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent ?? null },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
        // ステップ2-3: スペースで分割し、最初の要素をテンプレートIDとして抽出
        // Step 2-3: Split by space, extract first element as template ID
        const [id,] = commentText.split(' ', 2);
        const numId = Number(id);
        // ステップ4: 厳密なバリデーション
        // Step 4: Strict validation
        // - Number('') は 0 を返すため、文字列としての比較で妥当性を確認
        // - また isFinite で無限大も排除
        // - Integer であることも確認
        // - 負の数も不可
        // - Number('') returns 0, so string comparison confirms validity
        // - isFinite also excludes infinity
        // - Confirm it's an integer
        // - Negatives not allowed
        if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
            raiseError({
                code: 'BIND-201',
                message: 'Invalid node',
                context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ5: 検証済みIDを保存
        // Step 5: Save validated ID
        this.#id = numId;
    }
}

/**
 * BindingNodeIf クラスは、if バインディング(条件付き描画)を担当するノード実装です。
 *
 * アーキテクチャ:
 * - BindingNodeBlock を継承し、条件分岐による描画制御を実装
 * - boolean 値に応じて BindContent(描画内容)の mount/unmount を制御
 * - コメントノード(@@|<id> if)をマーカーとして使用し、その直後に内容を挿入
 * - 内部でテンプレート ID を使用して BindContent を生成
 *
 * 主な役割:
 * 1. boolean 値が true の場合、テンプレート内容を DOM に挿入(mount)
 * 2. boolean 値が false の場合、挿入した内容を DOM から削除(unmount)
 * 3. 現在表示中の BindContent 集合を bindContents で参照可能
 * 4. activate/inactivate でライフサイクルを管理
 * 5. applyChange で状態変更時の再描画を制御
 *
 * 使用例:
 * - {{ if:isVisible }}<div></div>{{ endif: }} → isVisible が true の時のみ表示
 * - {{ if:hasData }}<section></section>{{ endif: }} → hasData が true の時のみ表示
 * - {{ if:showMessage }}<p></p>{{ endif: }} → showMessage が true の時のみ表示
 *
 * 設計ポイント:
 * - #bindContent: コメントノード配下のテンプレート内容を管理
 * - #trueBindContents: true 時に表示する BindContent の配列([#bindContent])
 * - #falseBindContents: false 時に表示する BindContent の配列(空配列[])
 * - #bindContents: 現在表示中の BindContent を指すポインタ(true/false で切り替え)
 * - assignValue は未実装(applyChange で直接 mount/unmount を制御)
 * - applyChange で boolean 値を評価し、mount/unmount を実行
 * - inactivate で unmount して非表示状態にリセット
 *
 * ---
 *
 * BindingNodeIf class implements if binding (conditional rendering).
 *
 * Architecture:
 * - Inherits BindingNodeBlock, implements rendering control by conditional branching
 * - Controls BindContent (rendering content) mount/unmount according to boolean value
 * - Uses comment node (@@|<id> if) as marker, inserts content immediately after
 * - Generates BindContent using template ID internally
 *
 * Main responsibilities:
 * 1. If boolean value is true, insert template content into DOM (mount)
 * 2. If boolean value is false, remove inserted content from DOM (unmount)
 * 3. Currently displayed BindContent set accessible via bindContents
 * 4. Manage lifecycle with activate/inactivate
 * 5. Control re-rendering on state change with applyChange
 *
 * Usage examples:
 * - {{ if:isVisible }}<div></div>{{ endif: }} → Display only when isVisible is true
 * - {{ if:hasData }}<section></section>{{ endif: }} → Display only when hasData is true
 * - {{ if:showMessage }}<p></p>{{ endif: }} → Display only when showMessage is true
 *
 * Design points:
 * - #bindContent: Manages template content under comment node
 * - #trueBindContents: BindContent array to display when true ([#bindContent])
 * - #falseBindContents: BindContent array to display when false (empty array [])
 * - #bindContents: Pointer to currently displayed BindContent (switches between true/false)
 * - assignValue not implemented (directly control mount/unmount in applyChange)
 * - applyChange evaluates boolean value and executes mount/unmount
 * - inactivate unmounts and resets to hidden state
 *
 * @throws BIND-201 Not implemented: assignValue は未実装 / assignValue not implemented
 * @throws BIND-201 Value is not boolean: applyChange で値が boolean ではない / Value is not boolean in applyChange
 * @throws BIND-201 ParentNode is null: マウント先の親ノードが存在しない / Parent node for mounting doesn't exist
 * @throws TMP-001 Template not found: 内部で参照するテンプレート未登録 / Template referenced internally not registered
 */
class BindingNodeIf extends BindingNodeBlock {
    /**
     * コメントノード配下のテンプレート内容を管理する BindContent。
     * BindContent that manages template content under comment node.
     */
    #bindContent;
    /**
     * true 時に表示する BindContent の配列。
     * 常に [#bindContent] を指す。
     * BindContent array to display when true.
     * Always points to [#bindContent].
     */
    #trueBindContents;
    /**
     * false 時に表示する BindContent の配列。
     * 常に空配列 [] を指す。
     * BindContent array to display when false.
     * Always points to empty array [].
     */
    #falseBindContents = [];
    /**
     * 現在表示中の BindContent を指すポインタ。
     * true 時は #trueBindContents、false 時は #falseBindContents を指す。
     * Pointer to currently displayed BindContent.
     * Points to #trueBindContents when true, #falseBindContents when false.
     */
    #bindContents;
    /**
     * 現在表示中の BindContent の配列を返す getter。
     * true 時は [#bindContent]、false 時は [] を返す。
     *
     * Getter to return currently displayed BindContent array.
     * Returns [#bindContent] when true, [] when false.
     */
    get bindContents() {
        return this.#bindContents;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNodeBlock)を初期化
     * - テンプレート ID に対応する BindContent を生成
     * - true/false 時の BindContent 配列を初期化
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化(id を抽出)
     * 2. 空のパス情報と状態参照を生成(blankInfo, blankRef)
     * 3. createBindContent でテンプレート ID に対応する BindContent を生成
     * 4. #trueBindContents を [#bindContent] に設定
     * 5. #bindContents を #falseBindContents に設定(初期状態は false として扱う)
     *
     * 初期化される情報:
     * - #bindContent: テンプレート ID に対応する BindContent
     * - #trueBindContents: [#bindContent] (true 時に表示)
     * - #falseBindContents: [] (false 時は空)
     * - #bindContents: #falseBindContents (初期状態)
     *
     * 設計意図:
     * - コンストラクタでは BindContent の構造のみを準備し、実際の mount/unmount は applyChange で制御
     * - blankRef を使用することで、BindContent 自体は状態に依存しない形で初期化
     * - 初期状態を false として扱うことで、最初の applyChange で適切に mount/unmount される
     *
     * Constructor.
     * - Initializes parent class (BindingNodeBlock)
     * - Generates BindContent corresponding to template ID
     * - Initializes BindContent arrays for true/false
     *
     * Processing flow:
     * 1. Initialize parent class with super() (extract id)
     * 2. Generate empty path info and state reference (blankInfo, blankRef)
     * 3. Generate BindContent corresponding to template ID with createBindContent
     * 4. Set #trueBindContents to [#bindContent]
     * 5. Set #bindContents to #falseBindContents (initial state treated as false)
     *
     * Initialized information:
     * - #bindContent: BindContent corresponding to template ID
     * - #trueBindContents: [#bindContent] (display when true)
     * - #falseBindContents: [] (empty when false)
     * - #bindContents: #falseBindContents (initial state)
     *
     * Design intent:
     * - Constructor only prepares BindContent structure, actual mount/unmount controlled in applyChange
     * - Using blankRef initializes BindContent in form independent of state
     * - Treating initial state as false ensures proper mount/unmount on first applyChange
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // 空のパス情報と状態参照を生成
        // Generate empty path info and state reference
        const blankInfo = getStructuredPathInfo("");
        const blankRef = getStatePropertyRef(blankInfo, null);
        // テンプレート ID に対応する BindContent を生成
        // Generate BindContent corresponding to template ID
        this.#bindContent = createBindContent(this.binding, this.id, this.binding.engine, blankRef);
        // true 時の BindContent を設定
        // Set BindContent for true
        this.#trueBindContents = [this.#bindContent];
        // 初期状態は false として扱う
        // Treat initial state as false
        this.#bindContents = this.#falseBindContents;
    }
    /**
     * 値の直接代入は未実装。
     * if バインディングでは applyChange で直接 mount/unmount を制御するため、assignValue は使用しない。
     *
     * 設計意図:
     * - if バインディングは boolean 値の評価と mount/unmount がセットで必要
     * - assignValue では mount/unmount の制御ができないため、未実装としている
     * - applyChange で一括して処理することで、整合性を保つ
     *
     * Direct value assignment not implemented.
     * If binding doesn't use assignValue as applyChange directly controls mount/unmount.
     *
     * Design intent:
     * - If binding requires boolean value evaluation and mount/unmount as a set
     * - assignValue cannot control mount/unmount, so left unimplemented
     * - Processing together in applyChange maintains consistency
     *
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
     * 値を評価して true なら mount+applyChange、false なら unmount。
     * 状態変更時の条件付き描画を制御するメソッド。
     *
     * 処理フロー:
     * 1. bindingState.getFilteredValue でフィルタ適用後の値を取得
     * 2. 値が boolean でない場合はエラー(BIND-201)
     * 3. parentNode(マウント先)が null の場合はエラー(BIND-201)
     * 4. 値が true の場合:
     *    a. #bindContent.activate() でバインディングをアクティブ化
     *    b. #bindContent.mountAfter() でコメントノード直後に内容を挿入
     *    c. #bindContent.applyChange() で内部のバインディングを更新
     *    d. #bindContents を #trueBindContents に切り替え
     * 5. 値が false の場合:
     *    a. #bindContent.unmount() で DOM から内容を削除
     *    b. #bindContent.inactivate() でバインディングを非アクティブ化
     *    c. #bindContents を #falseBindContents に切り替え
     *
     * 動作例:
     * - isVisible: false → true: unmount 状態から mount して表示
     * - isVisible: true → false: mount 状態から unmount して非表示
     * - isVisible: true → true: 既に mount 済みなので applyChange のみ実行
     *
     * エラー条件:
     * - 値が boolean 以外の型(string, number, object, null, undefined 等)
     * - parentNode が null(コメントノードが DOM から削除された等)
     *
     * 設計意図:
     * - true/false の切り替えごとに activate/inactivate でライフサイクルを管理
     * - mount/unmount で DOM への挿入/削除を制御し、パフォーマンスを最適化
     * - applyChange を再帰的に呼び出し、内部のバインディングも更新
     * - #bindContents を切り替えることで、外部から現在の状態を参照可能
     *
     * Evaluates value and mount+applyChange if true, unmount if false.
     * Method to control conditional rendering on state change.
     *
     * Processing flow:
     * 1. Get filtered value with bindingState.getFilteredValue
     * 2. Error (BIND-201) if value is not boolean
     * 3. Error (BIND-201) if parentNode (mount target) is null
     * 4. If value is true:
     *    a. Activate binding with #bindContent.activate()
     *    b. Insert content immediately after comment node with #bindContent.mountAfter()
     *    c. Update internal bindings with #bindContent.applyChange()
     *    d. Switch #bindContents to #trueBindContents
     * 5. If value is false:
     *    a. Remove content from DOM with #bindContent.unmount()
     *    b. Deactivate binding with #bindContent.inactivate()
     *    c. Switch #bindContents to #falseBindContents
     *
     * Behavior examples:
     * - isVisible: false → true: Mount and display from unmount state
     * - isVisible: true → false: Unmount and hide from mount state
     * - isVisible: true → true: Already mounted, only execute applyChange
     *
     * Error conditions:
     * - Value is non-boolean type (string, number, object, null, undefined, etc.)
     * - parentNode is null (comment node removed from DOM, etc.)
     *
     * Design intent:
     * - Manage lifecycle with activate/inactivate on every true/false switch
     * - Control DOM insertion/removal with mount/unmount to optimize performance
     * - Recursively call applyChange to update internal bindings
     * - Switching #bindContents makes current state accessible from outside
     *
     * @param renderer - レンダラー(状態とハンドラを含む) / Renderer (contains state and handler)
     * @throws BIND-201 Value is not boolean
     * @throws BIND-201 ParentNode is null
     */
    applyChange(renderer) {
        // フィルタ適用後の値を取得
        // Get filtered value
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        // boolean 型チェック
        // Boolean type check
        if (typeof filteredValue !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeIf.applyChange', valueType: typeof filteredValue },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // 親ノード存在チェック
        // Parent node existence check
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
        // true の場合: activate + mount + applyChange
        // If true: activate + mount + applyChange
        if (filteredValue) {
            this.#bindContent.activate();
            this.#bindContent.mountAfter(parentNode, this.node);
            this.#bindContent.applyChange(renderer);
            this.#bindContents = this.#trueBindContents;
        }
        // false の場合: unmount + inactivate
        // If false: unmount + inactivate
        else {
            this.#bindContent.unmount();
            this.#bindContent.inactivate();
            this.#bindContents = this.#falseBindContents;
        }
    }
    /**
     * バインディングを非アクティブ化し、内容を非表示状態にリセット。
     * コンポーネントが DOM から削除される際などに呼び出される。
     *
     * 処理:
     * 1. #bindContent.unmount() で DOM から内容を削除
     * 2. #bindContent.inactivate() でバインディングを非アクティブ化
     * 3. #bindContents を #falseBindContents に切り替え(非表示状態)
     *
     * 設計意図:
     * - DOM から削除される際のクリーンアップ処理
     * - メモリリークを防ぐため、バインディングを適切に解放
     * - 非表示状態にリセットすることで、次回の activate 時に正しく動作
     *
     * Deactivates binding and resets content to hidden state.
     * Called when component is removed from DOM, etc.
     *
     * Processing:
     * 1. Remove content from DOM with #bindContent.unmount()
     * 2. Deactivate binding with #bindContent.inactivate()
     * 3. Switch #bindContents to #falseBindContents (hidden state)
     *
     * Design intent:
     * - Cleanup processing when removed from DOM
     * - Properly release binding to prevent memory leaks
     * - Resetting to hidden state ensures correct operation on next activate
     */
    inactivate() {
        this.#bindContent.unmount();
        this.#bindContent.inactivate();
        this.#bindContents = this.#falseBindContents;
    }
}
/**
 * if バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "if")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(if では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeIf を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeIf インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate if binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "if")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for if)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeIf
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeIf instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeIf = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeIf(binding, node, name, filterFns, decorates);
};

const EMPTY_SET = new Set();
/**
 * フラグメントに追加し、一括でノードで追加するかのフラグ。
 * ベンチマークの結果で判断する。
 * グローバル変数 __STRUCTIVE_USE_ALL_APPEND__ で制御可能。
 *
 * Flag to add to fragment and append all nodes at once.
 * Determined by benchmark results.
 * Controllable via global variable __STRUCTIVE_USE_ALL_APPEND__.
 */
const USE_ALL_APPEND = globalThis.__STRUCTIVE_USE_ALL_APPEND__ === true;
/**
 * BindingNodeFor クラスは、for バインディング（配列やリストの繰り返し描画）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNodeBlock を継承し、ループ制御に特化した実装を提供
 * - リストの各要素に対して BindContent を生成・管理し、DOM に反映
 * - 差分検出アルゴリズムにより追加・削除・並び替え・上書きを最適化
 * - プール機構により BindContent のライフサイクルを管理し、GC 圧を軽減
 * - WeakMap による BindContent とリストインデックスのマッピング
 *
 * 主な役割:
 * 1. リストデータの各要素ごとに BindContent（バインディングコンテキスト）を生成・管理
 * 2. 配列の差分検出（追加・削除・並び替え・上書き）により、必要な BindContent の生成・再利用・削除・再描画を最適化
 * 3. DOM 上での要素の並び替えや再利用、アンマウント・マウント処理を効率的に行う
 * 4. プール機構により BindContent の再利用を促進し、パフォーマンスを向上
 * 5. リストインデックス情報を管理し、各要素の状態とバインディングを関連付け
 *
 * 使用例:
 * - <ul><li data-bind="for: items">{{name}}</li></ul> → items 配列の各要素を li として繰り返し描画
 * - <div data-bind="for: users"><span>{{user.name}}</span></div> → users 配列の各要素を div 内に描画
 * - <template data-bind="for: products">...</template> → products 配列の各要素をテンプレート展開
 *
 * 差分検出の種類:
 * 1. 追加（adds）: 新しい要素の追加 → BindContent を生成し mount + applyChange
 * 2. 削除（removes）: 既存要素の削除 → BindContent を unmount し プールに格納
 * 3. 並び替え（changeIndexes）: インデックスの変更のみ → DOM 位置調整のみ（再描画なし）
 * 4. 上書き（overwrites）: 同位置の内容変化 → applyChange で再描画
 * 5. 再利用（reuse）: 既存要素の位置調整 → DOM 移動のみ（必要に応じて applyChange）
 *
 * 最適化戦略:
 * 1. リオーダー最適化: 追加・削除がない場合、並び替えのみ DOM 移動で処理（再描画なし）
 * 2. 全削除最適化: 全要素削除時、親ノードの textContent をクリアして一括削除
 * 3. 全追加最適化: 全要素追加時、DocumentFragment でバッファリングして一括追加
 * 4. プール最適化: BindContent を再利用し、生成・破棄のコストを削減
 * 5. 差分最小化: Set.difference() により追加・削除要素を効率的に特定
 *
 * プール機構:
 * - #bindContentPool: 再利用可能な BindContent の配列
 * - #bindContentLastIndex: プール内の最後の有効インデックス
 * - createBindContent: プールから取得 or 新規生成
 * - deleteBindContent: unmount してプールに戻す
 * - poolLength setter: プールサイズを動的に調整
 *
 * 状態管理:
 * - #bindContents: 現在アクティブな BindContent の配列（表示順）
 * - #bindContentByListIndex: ListIndex → BindContent のマッピング（WeakMap）
 * - #oldList: 前回の配列データのコピー（差分検出用）
 * - #oldListIndexes: 前回の ListIndex 配列（差分検出用）
 * - #oldListIndexSet: 前回の ListIndex の Set（高速検索用）
 *
 * 設計ポイント:
 * 1. applyChange でリストの差分を検出し、BindContent の生成・削除・再利用を管理
 * 2. 追加・削除が無い場合はリオーダー（並び替え）のみを DOM 移動で処理し、再描画を抑制
 * 3. 上書き（overwrites）は同位置の内容変化のため、applyChange を再実行
 * 4. BindContent のプール・インデックス管理で GC や DOM 操作の最小化を図る
 * 5. バインディング状態やリストインデックス情報をエンジンに保存し、再描画や依存解決を容易にする
 * 6. WeakMap により BindContent とリストインデックスを関連付け、メモリリークを防止
 * 7. Set 演算（difference）により追加・削除要素を効率的に特定
 * 8. DocumentFragment による一括 DOM 追加で reflow/repaint を削減
 * 9. 全削除・全追加の特殊ケースを最適化し、大量データでもパフォーマンスを維持
 * 10. インデックス変更とデータ変更を区別し、必要な処理のみ実行
 *
 * エラー処理:
 * - BIND-201: applyChange 実行時の不整合（ParentNode is null / BindContent not found 等）
 * - BIND-202: プール長の不正設定（Length is negative）
 * - BIND-301: assignValue は未実装（update or applyChange を使用）
 *
 * パフォーマンス特性:
 * - 差分検出: O(n) - 新旧リストを1回ずつ走査
 * - 追加・削除: O(m) - 変更要素数に比例
 * - 並び替え: O(k) - 移動要素数に比例（再描画なし）
 * - メモリ: O(n) - リストサイズに比例（プールを除く）
 *
 * ---
 *
 * BindingNodeFor class implements binding processing for for binding (repeating rendering of arrays or lists).
 *
 * Architecture:
 * - Inherits BindingNodeBlock, provides implementation specialized for loop control
 * - Generates and manages BindContent for each list element and reflects to DOM
 * - Optimizes additions, deletions, reordering, and overwrites with diff detection algorithm
 * - Manages BindContent lifecycle with pool mechanism to reduce GC pressure
 * - Maps BindContent to list index with WeakMap
 *
 * Main responsibilities:
 * 1. Generate and manage BindContent (binding context) for each list data element
 * 2. Optimize necessary BindContent generation, reuse, deletion, and redrawing by array diff detection (add, remove, reorder, overwrite)
 * 3. Efficiently perform element reordering, reuse, unmount, and mount processing on DOM
 * 4. Promote BindContent reuse with pool mechanism to improve performance
 * 5. Manage list index information and associate each element's state with binding
 *
 * Usage examples:
 * - <ul><li data-bind="for: items">{{name}}</li></ul> → Render each item in items array as li repeatedly
 * - <div data-bind="for: users"><span>{{user.name}}</span></div> → Render each user in users array inside div
 * - <template data-bind="for: products">...</template> → Expand template for each product in products array
 *
 * Types of diff detection:
 * 1. Addition (adds): Adding new elements → Generate BindContent, mount + applyChange
 * 2. Deletion (removes): Deleting existing elements → Unmount BindContent and store in pool
 * 3. Reordering (changeIndexes): Only index changes → Only DOM position adjustment (no redraw)
 * 4. Overwriting (overwrites): Content change at same position → Redraw with applyChange
 * 5. Reuse (reuse): Position adjustment of existing elements → Only DOM move (applyChange if necessary)
 *
 * Optimization strategies:
 * 1. Reorder optimization: When no additions/deletions, process only reordering with DOM move (no redraw)
 * 2. All-remove optimization: When removing all elements, clear parent node's textContent for batch deletion
 * 3. All-append optimization: When adding all elements, buffer with DocumentFragment for batch addition
 * 4. Pool optimization: Reuse BindContent to reduce generation/destruction costs
 * 5. Diff minimization: Efficiently identify added/removed elements with Set.difference()
 *
 * Pool mechanism:
 * - #bindContentPool: Array of reusable BindContent
 * - #bindContentLastIndex: Last valid index in pool
 * - createBindContent: Get from pool or create new
 * - deleteBindContent: Unmount and return to pool
 * - poolLength setter: Dynamically adjust pool size
 *
 * State management:
 * - #bindContents: Array of currently active BindContent (display order)
 * - #bindContentByListIndex: Mapping of ListIndex → BindContent (WeakMap)
 * - #oldList: Copy of previous array data (for diff detection)
 * - #oldListIndexes: Previous ListIndex array (for diff detection)
 * - #oldListIndexSet: Set of previous ListIndex (for fast search)
 *
 * Design points:
 * 1. Detect list diff in applyChange and manage BindContent generation, deletion, and reuse
 * 2. Process only reordering with DOM move and suppress redraw when no additions/deletions
 * 3. Re-execute applyChange for overwrites as they are content changes at same position
 * 4. Minimize GC and DOM operations with BindContent pool and index management
 * 5. Store binding state and list index information in engine to facilitate redrawing and dependency resolution
 * 6. Associate BindContent with list index using WeakMap to prevent memory leaks
 * 7. Efficiently identify added/removed elements with Set operations (difference)
 * 8. Reduce reflow/repaint with batch DOM addition using DocumentFragment
 * 9. Optimize special cases of all-remove/all-append to maintain performance with large data
 * 10. Distinguish index changes from data changes and execute only necessary processing
 *
 * Error handling:
 * - BIND-201: Inconsistency during applyChange execution (ParentNode is null / BindContent not found, etc.)
 * - BIND-202: Invalid pool length setting (Length is negative)
 * - BIND-301: assignValue is not implemented (use update or applyChange)
 *
 * Performance characteristics:
 * - Diff detection: O(n) - Scan old and new lists once each
 * - Add/Remove: O(m) - Proportional to number of changed elements
 * - Reorder: O(k) - Proportional to number of moved elements (no redraw)
 * - Memory: O(n) - Proportional to list size (excluding pool)
 */
class BindingNodeFor extends BindingNodeBlock {
    /**
     * 現在アクティブな BindContent の配列（DOM の表示順）。
     * applyChange で更新され、リストの変更に応じて再構築される。
     *
     * Currently active BindContent array (DOM display order).
     * Updated in applyChange, rebuilt according to list changes.
     */
    #bindContents = [];
    /**
     * ListIndex → BindContent のマッピング（WeakMap）。
     * リストインデックスから対応する BindContent を高速検索するために使用。
     * WeakMap を使用することで、ListIndex が GC されると自動的にエントリも削除される。
     *
     * Mapping of ListIndex → BindContent (WeakMap).
     * Used for fast search of corresponding BindContent from list index.
     * Using WeakMap automatically removes entries when ListIndex is GC'd.
     */
    #bindContentByListIndex = new WeakMap();
    /**
     * 再利用可能な BindContent のプール配列。
     * 削除された BindContent が格納され、次回の生成時に再利用される。
     * プールを使用することで、生成・破棄のコストを削減し、GC 圧を軽減。
     *
     * Pool array of reusable BindContent.
     * Stores deleted BindContent, reused in next generation.
     * Using pool reduces generation/destruction cost and GC pressure.
     */
    #bindContentPool = [];
    /**
     * プール内の最後の有効インデックス。
     * プールから要素を取得する際に使用され、デクリメントされる。
     * -1 の場合はプールが空であることを示す。
     *
     * Last valid index in pool.
     * Used when getting elements from pool, decremented.
     * -1 indicates pool is empty.
     */
    #bindContentLastIndex = 0;
    /**
     * ループのパス情報（遅延初期化）。
     * "pattern.*" の形式で、ループ内の各要素へのパスを表す。
     * 初回アクセス時に loopInfo getter で生成される。
     *
     * Loop path information (lazy initialization).
     * Represents path to each element in loop in "pattern.*" format.
     * Generated in loopInfo getter on first access.
     */
    #loopInfo = undefined;
    /**
     * 前回の配列データのコピー（差分検出用）。
     * applyChange で新旧リストを比較し、変更を検出するために保持。
     * スプレッド演算子でコピーされ、参照の変更を防ぐ。
     *
     * Copy of previous array data (for diff detection).
     * Retained to compare old and new lists in applyChange and detect changes.
     * Copied with spread operator to prevent reference changes.
     */
    #oldList = undefined;
    /**
     * 前回の ListIndex 配列（差分検出用）。
     * リストの各要素に対応する ListIndex のスナップショット。
     * インデックスの変更を検出するために使用。
     *
     * Previous ListIndex array (for diff detection).
     * Snapshot of ListIndex corresponding to each list element.
     * Used to detect index changes.
     */
    #oldListIndexes = [];
    /**
     * 前回の ListIndex の Set（高速検索用）。
     * Set.difference() による差分検出で、追加・削除要素を効率的に特定。
     * O(1) の検索により、大量データでもパフォーマンスを維持。
     *
     * Set of previous ListIndex (for fast search).
     * Efficiently identify added/removed elements with diff detection by Set.difference().
     * O(1) search maintains performance even with large data.
     */
    #oldListIndexSet = new Set();
    /**
     * 現在アクティブな BindContent の配列を取得する getter。
     *
     * 返却される配列は、現在 DOM に表示されている要素の順序と一致します。
     * この配列は applyChange メソッドで更新され、リストの追加・削除・並び替え操作に応じて変化します。
     *
     * 用途:
     * - DOM の現在の状態を把握するため
     * - リオーダー処理やリスト操作の基準として使用
     * - デバッグやテスト時の状態確認
     *
     * 注意点:
     * - 返却される配列は内部状態への直接参照ではなく、読み取り専用として扱うべき
     * - プール内の非アクティブな BindContent は含まれない
     *
     * Getter to retrieve array of currently active BindContent.
     *
     * The returned array matches the order of elements currently displayed in DOM.
     * This array is updated by applyChange method and changes according to list add/remove/reorder operations.
     *
     * Usage:
     * - To understand current DOM state
     * - Used as reference for reorder processing and list operations
     * - State verification during debugging or testing
     *
     * Notes:
     * - Returned array should be treated as read-only, not a direct reference to internal state
     * - Does not include inactive BindContent in pool
     *
     * @returns {IBindContent[]} 現在アクティブな BindContent の配列 / Array of currently active BindContent
     */
    get bindContents() {
        return this.#bindContents;
    }
    init() {
    }
    /**
     * BindContent を生成または再利用するメソッド。
     *
     * プール機構により、可能な限り既存の BindContent を再利用し、
     * 新規生成のコストを削減します。プールに利用可能な要素がある場合は
     * プールから取得し、ない場合は新規に生成します。
     *
     * 処理フロー:
     * 1. プールに利用可能な要素があるかチェック（#bindContentLastIndex >= 0）
     * 2a. プールから取得する場合:
     *     - プール内の最後の要素を取得
     *     - プールインデックスをデクリメント（実際のサイズ縮減は後で一括実行）
     *     - リストインデックスを再割り当て
     * 2b. 新規生成する場合:
     *     - loopInfo からループ用の StatePropertyRef を生成
     *     - createBindContent で新しい BindContent を生成
     * 3. BindContent を ListIndex に関連付けて WeakMap に登録
     * 4. BindContent をアクティブ化
     * 5. BindContent を返却
     *
     * プール最適化:
     * - プールからの取得時、毎回配列サイズを縮減せず、インデックスのみ操作
     * - 実際のサイズ縮減は applyChange 完了後に一括実行（poolLength setter）
     * - これにより配列の再割り当てコストを削減
     *
     * 再利用の仕組み:
     * - プールから取得した BindContent は assignListIndex で新しいインデックスに紐付け
     * - activate() により、再度アクティブな状態として使用可能に
     * - DOM ノードや内部状態は保持されたまま、異なるリストアイテムとして機能
     *
     * 新規生成の仕組み:
     * - loopInfo（ループパス情報）と listIndex から StatePropertyRef を生成
     * - この Ref により、リストの各要素に対する状態管理が可能に
     * - binding.engine に登録され、バインディングシステムと連携
     *
     * Method to generate or reuse BindContent.
     *
     * Pool mechanism reuses existing BindContent as much as possible to reduce
     * new generation cost. If available elements exist in pool, gets from pool,
     * otherwise generates new.
     *
     * Processing flow:
     * 1. Check if available elements exist in pool (#bindContentLastIndex >= 0)
     * 2a. When getting from pool:
     *     - Get last element in pool
     *     - Decrement pool index (actual size reduction executed in batch later)
     *     - Reassign list index
     * 2b. When generating new:
     *     - Generate StatePropertyRef for loop from loopInfo
     *     - Generate new BindContent with createBindContent
     * 3. Associate BindContent with ListIndex and register in WeakMap
     * 4. Activate BindContent
     * 5. Return BindContent
     *
     * Pool optimization:
     * - When getting from pool, only manipulate index without reducing array size each time
     * - Actual size reduction executed in batch after applyChange completion (poolLength setter)
     * - This reduces array reallocation cost
     *
     * Reuse mechanism:
     * - BindContent retrieved from pool is bound to new index with assignListIndex
     * - activate() makes it available as active state again
     * - DOM nodes and internal state are retained, functioning as different list item
     *
     * New generation mechanism:
     * - Generate StatePropertyRef from loopInfo (loop path info) and listIndex
     * - This Ref enables state management for each list element
     * - Registered in binding.engine and cooperates with binding system
     *
     * @param renderer - レンダラーオブジェクト（状態管理・更新制御用） / Renderer object (for state management and update control)
     * @param listIndex - リストインデックス（配列内の位置情報） / List index (position info in array)
     * @returns {IBindContent} 生成または再利用された BindContent / Generated or reused BindContent
     */
    createBindContent(renderer, listIndex) {
        let bindContent;
        // プールに利用可能な要素があるかチェック
        // Check if available elements exist in pool
        if (this.#bindContentLastIndex >= 0) {
            // プールから再利用: プールの最後の要素を取得
            // Reuse from pool: Get last element in pool
            bindContent = this.#bindContentPool[this.#bindContentLastIndex];
            // プールインデックスをデクリメント（実際のサイズ縮減は後で一括実行）
            // Decrement pool index (actual size reduction executed in batch later)
            this.#bindContentLastIndex--;
            // 新しいリストインデックスを再割り当て
            // Reassign new list index
            bindContent.assignListIndex(listIndex);
        }
        else {
            // プールが空の場合は新規生成: ループ用の StatePropertyRef を生成
            // Generate new when pool is empty: Generate StatePropertyRef for loop
            const loopRef = getStatePropertyRef(this.loopInfo, listIndex);
            // 新しい BindContent を生成
            // Generate new BindContent
            bindContent = createBindContent(this.binding, this.id, this.binding.engine, loopRef);
        }
        // BindContent を ListIndex に関連付けて WeakMap に登録
        // Associate BindContent with ListIndex and register in WeakMap
        this.#bindContentByListIndex.set(listIndex, bindContent);
        // BindContent をアクティブ化（使用可能状態に）
        // Activate BindContent (make it available)
        bindContent.activate();
        return bindContent;
    }
    /**
     * BindContent を削除（アンマウント）し、非アクティブ化するメソッド。
     *
     * リストから要素が削除された際に呼び出され、BindContent を DOM から削除し、
     * 非アクティブ状態にします。削除された BindContent はプールに戻され、
     * 後で再利用されます。
     *
     * 処理フロー:
     * 1. unmount(): DOM からノードを削除し、親ノードとの関連を解除
     * 2. inactivate(): BindContent を非アクティブ状態にし、再利用可能にする
     *
     * unmount の役割:
     * - DOM ツリーから BindContent に関連する全ノードを削除
     * - イベントリスナーやバインディングは保持（再利用時に復元）
     * - 親ノードへの参照をクリア
     *
     * inactivate の役割:
     * - BindContent を非アクティブ状態にマーク
     * - 内部の状態やバインディング情報は保持（プールでの再利用のため）
     * - 新しい ListIndex が割り当てられるまで、処理は停止状態
     *
     * プールへの戻し方:
     * - このメソッド呼び出し後、呼び出し元で #bindContentPool.push() により格納
     * - プール内では非アクティブ状態で保持され、次回の createBindContent で再利用
     *
     * 設計意図:
     * - unmount と inactivate を分離することで、段階的なクリーンアップを実現
     * - DOM からの削除とバインディングの非アクティブ化を明確に分離
     * - プールでの再利用を前提とした設計（完全な破棄はしない）
     * - WeakMap からの削除は不要（ListIndex が GC されれば自動的にクリア）
     *
     * Method to delete (unmount) and inactivate BindContent.
     *
     * Called when element is deleted from list, removes BindContent from DOM
     * and makes it inactive. Deleted BindContent is returned to pool and
     * reused later.
     *
     * Processing flow:
     * 1. unmount(): Remove nodes from DOM and release association with parent node
     * 2. inactivate(): Make BindContent inactive and ready for reuse
     *
     * Role of unmount:
     * - Remove all nodes related to BindContent from DOM tree
     * - Retain event listeners and bindings (restored when reused)
     * - Clear reference to parent node
     *
     * Role of inactivate:
     * - Mark BindContent as inactive state
     * - Retain internal state and binding info (for reuse in pool)
     * - Processing is suspended until new ListIndex is assigned
     *
     * How to return to pool:
     * - After calling this method, stored by #bindContentPool.push() in caller
     * - Retained in inactive state in pool, reused in next createBindContent
     *
     * Design intent:
     * - Achieve staged cleanup by separating unmount and inactivate
     * - Clearly separate removal from DOM and inactivation of binding
     * - Design premised on reuse in pool (no complete destruction)
     * - No need to delete from WeakMap (automatically cleared when ListIndex is GC'd)
     *
     * @param bindContent - 削除する BindContent / BindContent to delete
     */
    deleteBindContent(bindContent) {
        // DOM から BindContent のノードを削除
        // Remove BindContent's nodes from DOM
        bindContent.unmount();
        // BindContent を非アクティブ状態にし、プールでの再利用に備える
        // Make BindContent inactive and prepare for reuse in pool
        bindContent.inactivate();
    }
    /**
     * プール内の最後の有効インデックスを取得する getter。
     *
     * このインデックスは、プールから BindContent を取得する際に使用されます。
     * -1 の場合はプールが空であることを示します。
     *
     * Getter to retrieve last valid index in pool.
     *
     * This index is used when getting BindContent from pool.
     * -1 indicates pool is empty.
     *
     * @returns {number} プール内の最後の有効インデックス / Last valid index in pool
     */
    get bindContentLastIndex() {
        return this.#bindContentLastIndex;
    }
    /**
     * プール内の最後の有効インデックスを設定する setter。
     *
     * applyChange の開始時に poolLength - 1 で初期化され、
     * プールから要素を取得するたびにデクリメントされます。
     *
     * 設定タイミング:
     * - applyChange 開始時: this.poolLength - 1 で初期化
     * - createBindContent 内: プールから取得後にデクリメント
     *
     * Setter to set last valid index in pool.
     *
     * Initialized with poolLength - 1 at start of applyChange,
     * decremented each time element is retrieved from pool.
     *
     * Setting timing:
     * - At start of applyChange: Initialize with this.poolLength - 1
     * - Inside createBindContent: Decrement after getting from pool
     *
     * @param value - 設定する有効インデックス / Valid index to set
     */
    set bindContentLastIndex(value) {
        this.#bindContentLastIndex = value;
    }
    /**
     * プールの現在の長さを取得する getter。
     *
     * プール配列の実際の長さを返します。
     * この値は applyChange 完了時に動的に調整されます。
     *
     * Getter to retrieve current length of pool.
     *
     * Returns actual length of pool array.
     * This value is dynamically adjusted at completion of applyChange.
     *
     * @returns {number} プールの現在の長さ / Current length of pool
     */
    get poolLength() {
        return this.#bindContentPool.length;
    }
    /**
     * プールの長さを設定する setter。
     *
     * プール配列の長さを動的に調整します。負の値が設定された場合はエラーをスローします。
     * applyChange 完了時に bindContentLastIndex + 1 で設定され、未使用の要素を削除します。
     *
     * プールサイズ調整の仕組み:
     * 1. applyChange 中、bindContentLastIndex はプールから取得するたびにデクリメント
     * 2. applyChange 完了時、bindContentLastIndex + 1 が実際に使用された要素数
     * 3. poolLength に設定することで、未使用の末尾要素を自動的に削除
     *
     * 例:
     * - プール初期状態: [A, B, C, D, E] (length=5)
     * - bindContentLastIndex 初期化: 4 (length - 1)
     * - A, B, C を使用後: bindContentLastIndex = 1
     * - poolLength = 2 に設定: [A, B] (D, E は削除)
     *
     * エラー処理:
     * - 負の値が設定された場合、BIND-202 エラーをスロー
     * - これはプールの不正な操作を防ぐための安全機構
     *
     * Setter to set length of pool.
     *
     * Dynamically adjusts length of pool array. Throws error if negative value is set.
     * Set with bindContentLastIndex + 1 at completion of applyChange to remove unused elements.
     *
     * Pool size adjustment mechanism:
     * 1. During applyChange, bindContentLastIndex is decremented each time getting from pool
     * 2. At completion of applyChange, bindContentLastIndex + 1 is number of actually used elements
     * 3. Setting to poolLength automatically removes unused trailing elements
     *
     * Example:
     * - Pool initial state: [A, B, C, D, E] (length=5)
     * - bindContentLastIndex initialization: 4 (length - 1)
     * - After using A, B, C: bindContentLastIndex = 1
     * - Set poolLength = 2: [A, B] (D, E are removed)
     *
     * Error handling:
     * - Throws BIND-202 error if negative value is set
     * - This is safety mechanism to prevent improper pool operations
     *
     * @param length - 設定するプールの長さ / Length of pool to set
     * @throws {Error} BIND-202 - 負の値が設定された場合 / When negative value is set
     */
    set poolLength(length) {
        // 負の値チェック: プールの不正な操作を防ぐ
        // Negative value check: Prevent improper pool operations
        if (length < 0) {
            raiseError({
                code: 'BIND-202',
                message: 'Length is negative',
                context: { where: 'BindingNodeFor.setPoolLength', length },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        // プール配列の長さを直接設定（未使用の末尾要素を自動削除）
        // Directly set pool array length (automatically remove unused trailing elements)
        this.#bindContentPool.length = length;
    }
    /**
     * ループのパス情報を取得する getter（遅延初期化）。
     *
     * ループ内の各要素へのパス情報を "pattern.*" 形式で返します。
     * 初回アクセス時のみ生成され、以降はキャッシュされた値を返します。
     *
     * 生成される loopPath の例:
     * - binding.bindingState.pattern が "items" の場合
     * - loopPath = "items.*"
     * - これにより、items 配列の各要素（items[0], items[1], ...）へのアクセスが可能
     *
     * 遅延初期化の利点:
     * - 使用されない場合、getStructuredPathInfo の呼び出しコストを回避
     * - 初回アクセス時のみ計算し、以降は O(1) で取得
     * - メモリ効率の向上（未使用の BindingNodeFor ではメモリ未割り当て）
     *
     * Getter to retrieve loop path information (lazy initialization).
     *
     * Returns path information to each element in loop in "pattern.*" format.
     * Generated only on first access, cached value returned thereafter.
     *
     * Example of generated loopPath:
     * - When binding.bindingState.pattern is "items"
     * - loopPath = "items.*"
     * - This enables access to each element of items array (items[0], items[1], ...)
     *
     * Advantages of lazy initialization:
     * - Avoid getStructuredPathInfo call cost when not used
     * - Calculate only on first access, get in O(1) thereafter
     * - Improve memory efficiency (memory not allocated for unused BindingNodeFor)
     *
     * @returns {IStructuredPathInfo} ループのパス情報 / Loop path information
     */
    get loopInfo() {
        // 初回アクセス時のみ生成（遅延初期化）
        // Generate only on first access (lazy initialization)
        if (typeof this.#loopInfo === "undefined") {
            // ループパスを構築（"pattern.*" 形式）
            // Build loop path ("pattern.*" format)
            const loopPath = this.binding.bindingState.pattern + ".*";
            // 構造化パス情報を生成してキャッシュ
            // Generate structured path information and cache
            this.#loopInfo = getStructuredPathInfo(loopPath);
        }
        // キャッシュされた値を返却
        // Return cached value
        return this.#loopInfo;
    }
    /**
     * 値を直接割り当てるメソッド（未実装）。
     *
     * BindingNodeFor では、リストの差分検出と複雑な DOM 操作が必要なため、
     * 単純な値の割り当てではなく applyChange メソッドを使用する必要があります。
     * このメソッドが呼ばれた場合、BIND-301 エラーをスローします。
     *
     * 未実装の理由:
     * - for バインディングはリスト全体の管理が必要
     * - 差分検出アルゴリズムによる最適化が前提
     * - 単一の値割り当てではリストの追加・削除・並び替えを表現できない
     * - BindContent のプール管理や再利用機構と統合する必要がある
     *
     * 代替手段:
     * - update() メソッド: バインディングシステムを通じた更新
     * - applyChange() メソッド: 差分検出を伴う DOM 更新
     * - 状態オブジェクトのプロパティを直接変更: 自動的に applyChange がトリガー
     *
     * 設計意図:
     * - for バインディングの複雑性を明示的にエラーで示す
     * - 誤った使用法を防ぎ、正しい API の使用を促す
     * - 他の BindingNode との一貫性を保つため、メソッド自体は存在
     *
     * Method to directly assign value (not implemented).
     *
     * BindingNodeFor requires list diff detection and complex DOM operations,
     * so applyChange method must be used instead of simple value assignment.
     * Throws BIND-301 error when this method is called.
     *
     * Reasons for not implementing:
     * - for binding requires management of entire list
     * - Optimization by diff detection algorithm is prerequisite
     * - Single value assignment cannot express list addition/deletion/reordering
     * - Need to integrate with BindContent pool management and reuse mechanism
     *
     * Alternatives:
     * - update() method: Update through binding system
     * - applyChange() method: DOM update with diff detection
     * - Directly change state object property: Automatically triggers applyChange
     *
     * Design intent:
     * - Explicitly show complexity of for binding with error
     * - Prevent incorrect usage and encourage correct API usage
     * - Method itself exists for consistency with other BindingNode
     *
     * @param value - 割り当てようとした値（使用されない） / Value attempted to assign (not used)
     * @throws {Error} BIND-301 - 常にスローされる / Always thrown
     */
    assignValue(value) {
        // BIND-301 エラーをスロー: assignValue は for バインディングでは未実装
        // Throw BIND-301 error: assignValue is not implemented for for binding
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented. Use update or applyChange',
            context: { where: 'BindingNodeFor.assignValue' },
            docsUrl: './docs/error-codes.md#bind',
        });
    }
    /**
     * リストの差分を適用して DOM とバインディングを更新する中核メソッド。
     *
     * このメソッドは、新旧のリストを比較し、追加・削除・並び替え・上書きの
     * 差分を検出して、最適な方法で DOM を更新します。
     *
     * 処理フロー（全体）:
     * 1. 新旧リストの差分検出（追加・削除・並び替え・上書き）
     * 2. 削除処理（全削除最適化 or 個別削除）
     * 3. 追加・再利用処理（全追加最適化 or 個別処理 or リオーダー最適化）
     * 4. 状態の更新（プール長、BindContents、oldList 等）
     *
     * 差分の種類と処理:
     * - 追加（adds）: BindContent を生成 → mount → applyChange
     * - 削除（removes）: BindContent を unmount → プールに格納
     * - 並び替え（changeIndexes）: DOM 位置調整のみ（再描画なし）
     * - 上書き（overwrites）: 同位置の内容変化 → applyChange で再描画
     * - 再利用（reuse）: 既存要素の位置調整 → DOM 移動のみ
     *
     * 最適化の種類:
     * 1. リオーダー最適化: 追加・削除なし → DOM 移動のみ（再描画なし）
     * 2. 全削除最適化: 全要素削除 → parentNode.textContent = "" で一括削除
     * 3. 全追加最適化: 全要素追加 → DocumentFragment でバッファリング → 一括追加
     *
     * パフォーマンス特性:
     * - 差分検出: O(n) - 新旧リストを1回ずつ走査
     * - 追加・削除: O(m) - 変更要素数に比例
     * - 並び替え: O(k) - 移動要素数に比例（再描画なし）
     *
     * Method to apply list diff and update DOM and bindings - core method.
     *
     * This method compares old and new lists, detects differences (add, remove,
     * reorder, overwrite), and updates DOM in optimal way.
     *
     * Processing flow (overall):
     * 1. Detect diff between old and new lists (add, remove, reorder, overwrite)
     * 2. Remove processing (all-remove optimization or individual removal)
     * 3. Add/reuse processing (all-append optimization or individual processing or reorder optimization)
     * 4. Update state (pool length, BindContents, oldList, etc.)
     *
     * Types of diff and processing:
     * - Addition (adds): Generate BindContent → mount → applyChange
     * - Deletion (removes): Unmount BindContent → Store in pool
     * - Reordering (changeIndexes): Only DOM position adjustment (no redraw)
     * - Overwriting (overwrites): Content change at same position → Redraw with applyChange
     * - Reuse (reuse): Position adjustment of existing elements → Only DOM move
     *
     * Types of optimization:
     * 1. Reorder optimization: No add/remove → Only DOM move (no redraw)
     * 2. All-remove optimization: Remove all elements → Batch remove with parentNode.textContent = ""
     * 3. All-append optimization: Add all elements → Buffer with DocumentFragment → Batch append
     *
     * Performance characteristics:
     * - Diff detection: O(n) - Scan old and new lists once each
     * - Add/Remove: O(m) - Proportional to number of changed elements
     * - Reorder: O(k) - Proportional to number of moved elements (no redraw)
     *
     * @param renderer - レンダラーオブジェクト（状態管理・更新制御用） / Renderer object (for state management and update control)
     */
    applyChange(renderer) {
        // 新しい BindContents 配列を構築（最終的に #bindContents に設定）
        // Build new BindContents array (finally set to #bindContents)
        let newBindContents = [];
        // ステップ1: 新しいリストとリストインデックスを取得
        // Step 1: Get new list and list indexes
        const newList = renderer.readonlyState[GetByRefSymbol](this.binding.bindingState.ref);
        const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
        const newListIndexesSet = new Set(newListIndexes);
        // ステップ2: 旧リスト情報を取得し、差分セットを計算
        // Step 2: Get old list info and calculate diff sets
        new Set(this.#oldList ?? EMPTY_SET);
        const oldListLength = this.#oldList?.length ?? 0;
        // 削除セット: 旧リストにあって新リストにない要素（Set.difference 使用）
        // Remove set: Elements in old list but not in new list (using Set.difference)
        const removesSet = newListIndexesSet.size === 0 ? this.#oldListIndexSet : this.#oldListIndexSet.difference(newListIndexesSet);
        // 追加セット: 新リストにあって旧リストにない要素（Set.difference 使用）
        // Add set: Elements in new list but not in old list (using Set.difference)
        const addsSet = this.#oldListIndexSet.size === 0 ? newListIndexesSet : newListIndexesSet.difference(this.#oldListIndexSet);
        const newListLength = newList?.length ?? 0;
        // 並び替えセット: インデックスが変更された既存要素
        // Reorder set: Existing elements with changed index
        const changeIndexesSet = new Set();
        // 上書きセット: 同位置で内容が変更された要素
        // Overwrite set: Elements with changed content at same position
        const overwritesSet = new Set();
        // ステップ3: updatingRefs から並び替え・上書き要素を特定
        // Step 3: Identify reorder/overwrite elements from updatingRefs
        const elementsPath = this.binding.bindingState.info.pattern + ".*";
        for (let i = 0; i < renderer.updatingRefs.length; i++) {
            const updatingRef = renderer.updatingRefs[i];
            // このループに関係ない参照はスキップ
            // Skip refs not related to this loop
            if (updatingRef.info.pattern !== elementsPath)
                continue;
            // 既に処理済みの参照はスキップ
            // Skip already processed refs
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
            // 旧リストに存在する ListIndex → 並び替え（インデックス変更）
            // ListIndex exists in old list → Reorder (index change)
            if (this.#oldListIndexSet.has(listIndex)) {
                changeIndexesSet.add(listIndex);
            }
            else {
                // 旧リストに存在しない ListIndex → 上書き（同位置で内容変更）
                // ListIndex not in old list → Overwrite (content change at same position)
                overwritesSet.add(listIndex);
            }
            // 処理済みとしてマーク
            // Mark as processed
            renderer.processedRefs.add(updatingRef);
        }
        // ステップ4: 親ノードを取得（必須）
        // Step 4: Get parent node (required)
        const parentNode = this.node.parentNode ?? raiseError({
            code: 'BIND-201',
            message: 'ParentNode is null',
            context: { where: 'BindingNodeFor.applyChange' },
            docsUrl: './docs/error-codes.md#bind',
        });
        // ステップ5: 削除処理（追加より先に実行）
        // Step 5: Removal processing (execute before addition)
        const removeBindContentsSet = new Set();
        // 全削除最適化の条件チェック: 全要素が削除対象か
        // All-remove optimization condition check: Are all elements removal targets
        const isAllRemove = (oldListLength === removesSet.size && oldListLength > 0);
        // 親ノードがこのノードだけ持つかチェック（全削除最適化の追加条件）
        // Check if parent node has only this node (additional condition for all-remove optimization)
        let isParentNodeHasOnlyThisNode = false;
        if (isAllRemove) {
            // 親ノードの子ノード一覧を取得
            // Get list of parent node's child nodes
            const parentChildNodes = Array.from(parentNode.childNodes);
            const lastContent = this.#bindContents.at(-1) ?? raiseError({
                code: 'BIND-201',
                message: 'Last content is null',
                context: { where: 'BindingNodeFor.applyChange' },
                docsUrl: '/docs/error-codes.md#bind',
            });
            // 最初の有効ノードを取得（空白テキストノードをスキップ）
            // Get first valid node (skip blank text nodes)
            let firstNode = parentChildNodes[0];
            while (firstNode && firstNode.nodeType === Node.TEXT_NODE && firstNode.textContent?.trim() === "") {
                firstNode = firstNode.nextSibling;
            }
            // 最後の有効ノードを取得（空白テキストノードをスキップ）
            // Get last valid node (skip blank text nodes)
            let lastNode = parentChildNodes.at(-1) ?? null;
            while (lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent?.trim() === "") {
                lastNode = lastNode.previousSibling;
            }
            // 最初のノードがこのノードで、最後のノードが最後の BindContent なら、親ノードはこのノードだけを持つ
            // If first node is this node and last node is last BindContent, parent node has only this node
            if (firstNode === this.node && lastNode === lastContent.getLastNode(parentNode)) {
                isParentNodeHasOnlyThisNode = true;
            }
        }
        if (isAllRemove && isParentNodeHasOnlyThisNode) {
            // 全削除最適化パス: textContent = "" で全ノードを一括削除
            // All-remove optimization path: Batch delete all nodes with textContent = ""
            parentNode.textContent = "";
            // このノード（コメントノード）だけは残す
            // Keep only this node (comment node)
            parentNode.append(this.node);
            // 全 BindContent を非アクティブ化（unmount は textContent = "" で済んでいる）
            // Inactivate all BindContent (unmount is already done with textContent = "")
            for (let i = 0; i < this.#bindContents.length; i++) {
                this.#bindContents[i].inactivate();
            }
            // 全 BindContent をプールに格納
            // Store all BindContent in pool
            this.#bindContentPool.push(...this.#bindContents);
        }
        else {
            // 個別削除パス: 削除対象を1つずつ処理
            // Individual removal path: Process removal targets one by one
            if (removesSet.size > 0) {
                for (const listIndex of removesSet) {
                    // BindContent を取得
                    // Get BindContent
                    const bindContent = this.#bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'removes' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    // BindContent を削除（unmount + inactivate）
                    // Delete BindContent (unmount + inactivate)
                    this.deleteBindContent(bindContent);
                    removeBindContentsSet.add(bindContent);
                }
                // 削除した BindContent をプールに格納
                // Store deleted BindContent in pool
                this.#bindContentPool.push(...removeBindContentsSet);
            }
        }
        // ステップ6: 追加・再利用・リオーダー処理
        // Step 6: Addition, reuse, and reorder processing
        let lastBindContent = null;
        const firstNode = this.node;
        // プールインデックスを初期化（プールの最後から取得していく）
        // Initialize pool index (get from end of pool)
        this.bindContentLastIndex = this.poolLength - 1;
        // 全追加最適化の条件チェック: 全要素が新規追加か
        // All-append optimization condition check: Are all elements new additions
        const isAllAppend = USE_ALL_APPEND && (newListLength === addsSet.size && newListLength > 0);
        // リオーダー判定: 追加・削除がなく、並び替え（changeIndexes）または上書き（overwrites）のみの場合
        // Reorder determination: No additions/deletions, only reordering (changeIndexes) or overwrites
        const isReorder = addsSet.size === 0 && removesSet.size === 0 &&
            (changeIndexesSet.size > 0 || overwritesSet.size > 0);
        if (!isReorder) {
            // 通常処理パス: 追加・削除がある場合
            // Normal processing path: When additions/deletions exist
            // 旧リストのインデックスマップを作成（インデックス変更検出用）
            // Create old list index map (for index change detection)
            const oldIndexByListIndex = new Map();
            for (let i = 0; i < this.#oldListIndexes.length; i++) {
                oldIndexByListIndex.set(this.#oldListIndexes[i], i);
            }
            // 全追加の場合、DocumentFragment でバッファリングしてから一括追加
            // For all-append, buffer with DocumentFragment then batch append
            const fragmentParentNode = isAllAppend ? document.createDocumentFragment() : parentNode;
            const fragmentFirstNode = isAllAppend ? null : firstNode;
            // インデックスが変更された ListIndex のリスト（後で applyChange を呼ぶ）
            // List of ListIndex with changed index (call applyChange later)
            const changeListIndexes = [];
            // 新リストの各要素を処理（追加 or 再利用）
            // Process each element in new list (add or reuse)
            for (let i = 0; i < newListIndexes.length; i++) {
                const listIndex = newListIndexes[i];
                // 挿入位置を決定（前の BindContent の最後のノードの次）
                // Determine insertion position (after last node of previous BindContent)
                const lastNode = lastBindContent?.getLastNode(fragmentParentNode) ?? fragmentFirstNode;
                let bindContent;
                if (addsSet.has(listIndex)) {
                    // 追加パス: 新しい BindContent を生成
                    // Addition path: Generate new BindContent
                    bindContent = this.createBindContent(renderer, listIndex);
                    // DOM にマウント
                    // Mount to DOM
                    bindContent.mountAfter(fragmentParentNode, lastNode);
                    // 初回描画
                    // Initial rendering
                    bindContent.applyChange(renderer);
                }
                else {
                    // 再利用パス: 既存の BindContent を取得
                    // Reuse path: Get existing BindContent
                    bindContent = this.#bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'reuse' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    // DOM 位置が正しくない場合は移動
                    // Move if DOM position is incorrect
                    if (lastNode?.nextSibling !== bindContent.firstChildNode) {
                        bindContent.mountAfter(fragmentParentNode, lastNode);
                    }
                    // インデックスが変更された場合は記録（後で applyChange）
                    // Record if index changed (applyChange later)
                    const oldIndex = oldIndexByListIndex.get(listIndex);
                    if (typeof oldIndex !== "undefined" && oldIndex !== i) {
                        changeListIndexes.push(listIndex);
                    }
                }
                // 新しい配列に追加
                // Add to new array
                newBindContents.push(bindContent);
                lastBindContent = bindContent;
            }
            // 全追加最適化: DocumentFragment を親ノードに一括挿入
            // All-append optimization: Batch insert DocumentFragment to parent node
            if (isAllAppend) {
                const beforeNode = firstNode.nextSibling;
                parentNode.insertBefore(fragmentParentNode, beforeNode);
            }
            // インデックスが変更された要素の applyChange を呼ぶ
            // Call applyChange for elements with changed index
            for (const listIndex of changeListIndexes) {
                const bindings = this.binding.bindingsByListIndex.get(listIndex) ?? [];
                for (const binding of bindings) {
                    // 既に更新済みならスキップ
                    // Skip if already updated
                    if (renderer.updatedBindings.has(binding))
                        continue;
                    binding.applyChange(renderer);
                }
            }
        }
        else {
            // リオーダー最適化パス: 要素の追加・削除がない場合の最適化処理
            // Reorder optimization path: Optimization processing when no element additions/deletions
            // 並び替え処理: インデックスの変更のみなので、要素の再描画は不要
            // Reorder processing: Only index changes, so element redraw is unnecessary
            // DOM 位置の調整のみ行い、BindContent の内容は再利用する
            // Only adjust DOM position and reuse BindContent content
            if (changeIndexesSet.size > 0) {
                // 既存の BindContents をコピー
                // Copy existing BindContents
                const bindContents = Array.from(this.#bindContents);
                // 変更されたインデックスをソート（順番に処理するため）
                // Sort changed indexes (to process in order)
                const changeIndexes = Array.from(changeIndexesSet);
                changeIndexes.sort((a, b) => a.index - b.index);
                for (const listIndex of changeIndexes) {
                    // BindContent を取得
                    // Get BindContent
                    const bindContent = this.#bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'reorder' },
                            docsUrl: '/docs/error-codes.md#bind',
                        });
                    }
                    // 新しいインデックス位置に配置
                    // Place at new index position
                    bindContents[listIndex.index] = bindContent;
                    // DOM 位置を調整（前の要素の最後のノードの次に移動）
                    // Adjust DOM position (move after last node of previous element)
                    const lastNode = bindContents[listIndex.index - 1]?.getLastNode(parentNode) ?? firstNode;
                    bindContent.mountAfter(parentNode, lastNode);
                }
                newBindContents = bindContents;
            }
            // 上書き処理: 同じ位置の要素が異なる値に変更された場合の再描画
            // Overwrite processing: Redraw when element at same position changed to different value
            if (overwritesSet.size > 0) {
                for (const listIndex of overwritesSet) {
                    // BindContent を取得
                    // Get BindContent
                    const bindContent = this.#bindContentByListIndex.get(listIndex);
                    if (typeof bindContent === "undefined") {
                        raiseError({
                            code: 'BIND-201',
                            message: 'BindContent not found',
                            context: { where: 'BindingNodeFor.applyChange', when: 'overwrites' },
                            docsUrl: './docs/error-codes.md#bind',
                        });
                    }
                    // 内容が変更されたので再描画
                    // Redraw as content changed
                    bindContent.applyChange(renderer);
                }
            }
        }
        // ステップ7: 状態を更新（次回の差分検出のため）
        // Step 7: Update state (for next diff detection)
        // プールの長さを更新（使用されなかった要素を削除）
        // Update pool length (remove unused elements)
        // プールの長さは、プールの最後の要素のインデックス+1
        // Pool length is last element index in pool + 1
        this.poolLength = this.bindContentLastIndex + 1;
        // 新しい BindContents を保存
        // Save new BindContents
        this.#bindContents = newBindContents;
        // 新しいリストをコピーして保存（次回の差分検出用）
        // Copy and save new list (for next diff detection)
        this.#oldList = [...newList];
        this.#oldListIndexes = [...newListIndexes];
        this.#oldListIndexSet = newListIndexesSet;
    }
    /**
     * BindingNodeFor を非アクティブ化し、すべてのリソースをクリーンアップするメソッド。
     *
     * このメソッドは、バインディングが無効化されたり、コンポーネントが破棄されたりする際に呼び出されます。
     * すべての BindContent を DOM からアンマウントし、非アクティブ化した後、
     * 内部状態を初期状態にリセットします。
     *
     * 処理フロー:
     * 1. すべての BindContent を unmount（DOM から削除）
     * 2. すべての BindContent を inactivate（非アクティブ化）
     * 3. BindContent をプールに格納（再利用可能にする）
     * 4. 内部状態を初期化（配列、WeakMap、インデックス等をクリア）
     *
     * クリーンアップされるリソース:
     * - DOM ノード: すべての BindContent に関連するノードを DOM から削除
     * - イベントリスナー: inactivate により停止（メモリリーク防止）
     * - バインディング状態: すべてのバインディングを非アクティブ化
     * - 差分検出用データ: oldList、oldListIndexes、oldListIndexSet をクリア
     * - マッピング情報: bindContentByListIndex を新しい WeakMap で置き換え
     *
     * 状態の初期化:
     * - #bindContents: 空配列にリセット
     * - #bindContentByListIndex: 新しい WeakMap を作成
     * - #bindContentLastIndex: 0 にリセット
     * - #oldList: undefined にリセット
     * - #oldListIndexes: 空配列にリセット
     * - #oldListIndexSet: 新しい空 Set を作成
     *
     * プールへの格納:
     * - すべての BindContent をプールに push（再利用可能状態）
     * - プール自体はクリアせず、次回の初期化やマウント時に再利用される可能性
     * - これにより、同じコンポーネントの再マウント時のパフォーマンスが向上
     *
     * 設計意図:
     * - メモリリークを防ぐため、すべての参照を適切にクリア
     * - DOM からのクリーンアップと内部状態のリセットを確実に実行
     * - プールへの格納により、再マウント時の最適化を維持
     * - WeakMap の再作成により、古い ListIndex への参照を確実に削除
     *
     * 呼び出しタイミング:
     * - バインディングシステムから非アクティブ化が要求されたとき
     * - コンポーネントが破棄されるとき
     * - 親の BindContent が非アクティブ化されるとき
     *
     * Inactivates BindingNodeFor and cleans up all resources.
     *
     * This method is called when binding is invalidated or component is destroyed.
     * Unmounts all BindContent from DOM, inactivates them, then resets internal state
     * to initial state.
     *
     * Processing flow:
     * 1. Unmount all BindContent (remove from DOM)
     * 2. Inactivate all BindContent (make inactive)
     * 3. Store BindContent in pool (make reusable)
     * 4. Initialize internal state (clear arrays, WeakMap, indexes, etc.)
     *
     * Cleaned up resources:
     * - DOM nodes: Remove all nodes related to BindContent from DOM
     * - Event listeners: Stopped by inactivate (prevent memory leaks)
     * - Binding state: Inactivate all bindings
     * - Diff detection data: Clear oldList, oldListIndexes, oldListIndexSet
     * - Mapping info: Replace bindContentByListIndex with new WeakMap
     *
     * State initialization:
     * - #bindContents: Reset to empty array
     * - #bindContentByListIndex: Create new WeakMap
     * - #bindContentLastIndex: Reset to 0
     * - #oldList: Reset to undefined
     * - #oldListIndexes: Reset to empty array
     * - #oldListIndexSet: Create new empty Set
     *
     * Storing to pool:
     * - Push all BindContent to pool (reusable state)
     * - Pool itself not cleared, may be reused on next initialization or mount
     * - This improves performance when remounting same component
     *
     * Design intent:
     * - Properly clear all references to prevent memory leaks
     * - Reliably execute cleanup from DOM and internal state reset
     * - Maintain optimization for remounting by storing to pool
     * - Ensure removal of references to old ListIndex by recreating WeakMap
     *
     * Call timing:
     * - When inactivation is requested from binding system
     * - When component is destroyed
     * - When parent BindContent is inactivated
     */
    inactivate() {
        // すべての BindContent を DOM からアンマウントし、非アクティブ化
        // Unmount all BindContent from DOM and inactivate
        for (let i = 0; i < this.#bindContents.length; i++) {
            const bindContent = this.#bindContents[i];
            // DOM からノードを削除
            // Remove nodes from DOM
            bindContent.unmount();
            // BindContent を非アクティブ化（イベントリスナー停止、バインディング無効化）
            // Inactivate BindContent (stop event listeners, invalidate bindings)
            bindContent.inactivate();
        }
        // すべての BindContent をプールに格納（再利用可能状態）
        // Store all BindContent in pool (reusable state)
        this.#bindContentPool.push(...this.#bindContents);
        // 内部状態を初期化
        // Initialize internal state
        this.#bindContents = [];
        this.#bindContentByListIndex = new WeakMap();
        this.#bindContentLastIndex = 0;
        // 差分検出用データをクリア
        // Clear diff detection data
        this.#oldList = undefined;
        this.#oldListIndexes = [];
        this.#oldListIndexSet = new Set();
    }
}
/**
 * BindingNodeFor インスタンスを生成するファクトリー関数。
 *
 * この関数は、データバインディングシステムにおいて for バインディングのパーサー/ビルダーとして機能します。
 * 2段階のカリー化により、バインディング定義の解析とインスタンス生成を分離しています。
 *
 * 関数シグネチャ:
 * - 第1段階: (name, filterTexts, decorates) => カリー化された関数
 * - 第2段階: (binding, node, filters) => BindingNodeFor インスタンス
 *
 * 処理フロー:
 * 1. 第1段階の呼び出し:
 *    - name: バインディング名（"for"）
 *    - filterTexts: フィルター定義のテキスト配列（例: ["| filter1:arg", "| filter2"]）
 *    - decorates: デコレータ配列（例: ["once", "prevent"]）
 *    → カリー化された関数を返却
 *
 * 2. 第2段階の呼び出し:
 *    - binding: バインディングオブジェクト（状態管理やエンジンへの参照を含む）
 *    - node: 関連付ける DOM ノード（通常はコメントノード）
 *    - filters: 利用可能なフィルター定義のマップ
 *    → フィルター関数配列を生成
 *    → BindingNodeFor インスタンスを生成して返却
 *
 * カリー化の利点:
 * - 第1段階で静的な定義（name、filterTexts、decorates）を解析
 * - 第2段階で動的なコンテキスト（binding、node、filters）を注入
 * - バインディング定義の再利用が容易（同じ定義を複数のノードに適用）
 * - パフォーマンス向上（定義解析は1回のみ）
 *
 * フィルター処理:
 * - createFilters により filterTexts を実行可能な関数配列に変換
 * - フィルターは値の変換やフォーマットに使用（例: 大文字変換、日付フォーマット）
 * - BindingNodeFor では配列全体やリスト要素にフィルターを適用可能
 *
 * 使用例:
 * ```typescript
 * // 第1段階: バインディング定義の解析
 * const factory = createBindingNodeFor("for", ["| uppercase"], ["once"]);
 *
 * // 第2段階: インスタンス生成
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 *
 * デコレータの役割:
 * - "once": 初回のみ実行（更新を無視）
 * - "prevent": デフォルト動作を抑制
 * - その他カスタムデコレータによる動作制御
 *
 * 設計パターン:
 * - Factory パターン: インスタンス生成ロジックをカプセル化
 * - Currying: 引数を段階的に適用し、部分適用を可能に
 * - Dependency Injection: filters を外部から注入し、テスタビリティ向上
 *
 * Factory function to generate BindingNodeFor instance.
 *
 * This function acts as parser/builder for for binding in data binding system.
 * Separates binding definition parsing and instance generation through two-stage currying.
 *
 * Function signature:
 * - Stage 1: (name, filterTexts, decorates) => curried function
 * - Stage 2: (binding, node, filters) => BindingNodeFor instance
 *
 * Processing flow:
 * 1. Stage 1 call:
 *    - name: Binding name ("for")
 *    - filterTexts: Array of filter definition text (e.g., ["| filter1:arg", "| filter2"])
 *    - decorates: Decorator array (e.g., ["once", "prevent"])
 *    → Return curried function
 *
 * 2. Stage 2 call:
 *    - binding: Binding object (includes state management and engine reference)
 *    - node: DOM node to associate (usually comment node)
 *    - filters: Map of available filter definitions
 *    → Generate filter function array
 *    → Generate and return BindingNodeFor instance
 *
 * Advantages of currying:
 * - Parse static definition (name, filterTexts, decorates) in stage 1
 * - Inject dynamic context (binding, node, filters) in stage 2
 * - Easy to reuse binding definition (apply same definition to multiple nodes)
 * - Performance improvement (definition parsing only once)
 *
 * Filter processing:
 * - Convert filterTexts to executable function array with createFilters
 * - Filters used for value conversion and formatting (e.g., uppercase, date format)
 * - BindingNodeFor can apply filters to entire array or list elements
 *
 * Usage example:
 * ```typescript
 * // Stage 1: Parse binding definition
 * const factory = createBindingNodeFor("for", ["| uppercase"], ["once"]);
 *
 * // Stage 2: Generate instance
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 *
 * Role of decorators:
 * - "once": Execute only once (ignore updates)
 * - "prevent": Suppress default behavior
 * - Other custom decorators for behavior control
 *
 * Design patterns:
 * - Factory pattern: Encapsulate instance generation logic
 * - Currying: Apply arguments in stages, enable partial application
 * - Dependency Injection: Inject filters from outside, improve testability
 *
 * @param name - バインディング名（通常は "for"） / Binding name (usually "for")
 * @param filterTexts - フィルター定義のテキスト配列 / Array of filter definition text
 * @param decorates - デコレータ配列（動作制御用） / Decorator array (for behavior control)
 * @returns カリー化された関数（第2段階の引数を受け取る） / Curried function (receives stage 2 arguments)
 */
const createBindingNodeFor = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルターテキストを実行可能な関数配列に変換
    // Convert filter texts to executable function array
    const filterFns = createFilters(filters, filterTexts);
    // BindingNodeFor インスタンスを生成して返却
    // Generate and return BindingNodeFor instance
    return new BindingNodeFor(binding, node, name, filterFns, decorates);
};

/**
 * 双方向バインディングが可能な HTML 要素かどうかを判定するヘルパー関数。
 * HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement のいずれかである場合に true を返す。
 *
 * 双方向バインディング可能な要素:
 * - <input> 要素 (HTMLInputElement)
 * - <textarea> 要素 (HTMLTextAreaElement)
 * - <select> 要素 (HTMLSelectElement)
 *
 * Helper function to determine if element supports bidirectional binding.
 * Returns true if element is HTMLInputElement, HTMLTextAreaElement, or HTMLSelectElement.
 *
 * Elements supporting bidirectional binding:
 * - <input> element (HTMLInputElement)
 * - <textarea> element (HTMLTextAreaElement)
 * - <select> element (HTMLSelectElement)
 *
 * @param element - チェック対象の HTML 要素 / HTML element to check
 * @returns 双方向バインディング可能な場合 true / true if supports bidirectional binding
 */
function isTwoWayBindable(element) {
    return element instanceof HTMLInputElement
        || element instanceof HTMLTextAreaElement
        || element instanceof HTMLSelectElement;
}
/**
 * プロパティ名ごとのデフォルトイベント名を定義するマッピング。
 * 双方向バインディング時に、デコレータが指定されていない場合に使用される。
 *
 * プロパティとイベントの対応:
 * - value, valueAsNumber, valueAsDate → "input" イベント
 * - checked, selected → "change" イベント
 *
 * Mapping defining default event name for each property name.
 * Used in bidirectional binding when decorator is not specified.
 *
 * Property and event correspondence:
 * - value, valueAsNumber, valueAsDate → "input" event
 * - checked, selected → "change" event
 */
const defaultEventByName = {
    value: "input",
    valueAsNumber: "input",
    valueAsDate: "input",
    checked: "change",
    selected: "change",
};
/**
 * input 要素のタイプ(type 属性)ごとの双方向バインディング可能なプロパティを定義。
 * radio と checkbox は checked プロパティのみが双方向バインディング可能。
 * 他のタイプ(text, number 等)は定義されていないため、デフォルトで値系プロパティ(value 等)が使用される。
 *
 * Defines bidirectional bindable properties for each input element type (type attribute).
 * Only checked property is bidirectionally bindable for radio and checkbox.
 * Other types (text, number, etc.) are not defined, so value-related properties are used by default.
 */
const twoWayPropertyByElementType = {
    radio: new Set(["checked"]),
    checkbox: new Set(["checked"]),
};
/**
 * 値系プロパティ(value, valueAsNumber, valueAsDate)のセット。
 * テキスト入力系要素のデフォルト双方向バインディングプロパティとして使用される。
 *
 * Set of value-related properties (value, valueAsNumber, valueAsDate).
 * Used as default bidirectional binding properties for text input elements.
 */
const VALUES_SET = new Set(["value", "valueAsNumber", "valueAsDate"]);
/**
 * 空のプロパティセット。
 * 双方向バインディング不可能な要素に対して使用される。
 *
 * Empty property set.
 * Used for elements that don't support bidirectional binding.
 */
const BLANK_SET = new Set();
/**
 * HTML 要素の双方向バインディング可能なプロパティセットを取得するヘルパー関数。
 * 要素のタイプに応じて適切なプロパティセットを返す。
 *
 * 要素タイプごとの戻り値:
 * - HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement → VALUES_SET (value 系)
 * - HTMLInputElement:
 *   - type="radio" → new Set(["checked"])
 *   - type="checkbox" → new Set(["checked"])
 *   - その他の type → VALUES_SET (value 系)
 * - その他の要素 → BLANK_SET (空)
 *
 * Helper function to get bidirectional bindable property set for HTML element.
 * Returns appropriate property set according to element type.
 *
 * Return value by element type:
 * - HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement → VALUES_SET (value-related)
 * - HTMLInputElement:
 *   - type="radio" → new Set(["checked"])
 *   - type="checkbox" → new Set(["checked"])
 *   - other types → VALUES_SET (value-related)
 * - Other elements → BLANK_SET (empty)
 *
 * @param node - チェック対象のノード / Node to check
 * @returns 双方向バインディング可能なプロパティ名のセット / Set of bidirectional bindable property names
 */
const getTwoWayPropertiesHTMLElement = (node) => node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement
    ? VALUES_SET
    : node instanceof HTMLInputElement
        ? (twoWayPropertyByElementType[node.type] ?? VALUES_SET)
        : BLANK_SET;
/**
 * BindingNodeProperty クラスは、ノードのプロパティ(value, checked, selected など)への
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、プロパティバインディング固有の処理を実装
 * - HTML 要素のプロパティ(value, checked 等)に値を割り当て
 * - 双方向バインディング(input, change イベント等)に対応
 * - デコレータでイベント名をカスタマイズ可能
 *
 * 主な役割:
 * 1. ノードプロパティへの値の割り当て・取得
 * 2. 双方向バインディング対応要素の判定とイベントリスナー登録
 * 3. デコレータによるイベント名のカスタマイズ(onInput, onChange 等)
 * 4. イベント発火時の状態更新(Updater 経由)
 * 5. null/undefined/NaN の空文字列変換
 *
 * 使用例:
 * - <input data-bind="value: userName"> → userName を input.value にバインド(双方向)
 * - <input type="checkbox" data-bind="checked: isActive"> → isActive を input.checked にバインド(双方向)
 * - <select data-bind="value: selectedOption"> → selectedOption を select.value にバインド(双方向)
 * - <input data-bind="value.onchange: text"> → change イベントで双方向バインディング
 * - <div data-bind="textContent: message"> → message を div.textContent にバインド(単方向)
 *
 * 設計ポイント:
 * - デフォルトプロパティ名と一致し、かつ双方向バインディング可能な要素の場合のみイベントリスナーを登録
 * - デコレータでイベント名を指定可能("onInput", "onChange" 等、"on" プレフィックスは自動除去)
 * - デコレータが複数指定された場合はエラー(BIND-201)
 * - readonly または ro デコレータが指定された場合はイベントリスナーを登録しない(単方向バインディング)
 * - イベント発火時は Updater 経由で状態を非同期的に更新
 * - assignValue で null/undefined/NaN は空文字列に変換してセット
 * - value getter/filteredValue getter でフィルタ適用後の値を取得
 *
 * ---
 *
 * BindingNodeProperty class implements binding processing to node properties (value, checked, selected, etc.).
 *
 * Architecture:
 * - Inherits BindingNode, implements property binding specific processing
 * - Assigns values to HTML element properties (value, checked, etc.)
 * - Supports bidirectional binding (input, change events, etc.)
 * - Event name customizable with decorators
 *
 * Main responsibilities:
 * 1. Assign and get values to/from node properties
 * 2. Determine bidirectional binding compatible elements and register event listeners
 * 3. Customize event names with decorators (onInput, onChange, etc.)
 * 4. Update state on event firing (via Updater)
 * 5. Convert null/undefined/NaN to empty string
 *
 * Usage examples:
 * - <input data-bind="value: userName"> → Bind userName to input.value (bidirectional)
 * - <input type="checkbox" data-bind="checked: isActive"> → Bind isActive to input.checked (bidirectional)
 * - <select data-bind="value: selectedOption"> → Bind selectedOption to select.value (bidirectional)
 * - <input data-bind="value.onchange: text"> → Bidirectional binding with change event
 * - <div data-bind="textContent: message"> → Bind message to div.textContent (one-way)
 *
 * Design points:
 * - Register event listener only if property name matches default and element supports bidirectional binding
 * - Event name specifiable with decorator ("onInput", "onChange", etc., "on" prefix automatically removed)
 * - Error (BIND-201) if multiple decorators specified
 * - Don't register event listener if readonly or ro decorator specified (one-way binding)
 * - Update state asynchronously via Updater on event firing
 * - assignValue converts null/undefined/NaN to empty string
 * - Get filtered value with value getter/filteredValue getter
 *
 * @throws BIND-201 Has multiple decorators: デコレータが複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeProperty extends BindingNode {
    /**
     * ノードのプロパティ値を取得する getter。
     * 双方向バインディング時に現在のプロパティ値を取得するために使用される。
     *
     * 例:
     * - input.value の場合、現在の input 要素の value プロパティを返す
     * - input.checked の場合、現在の input 要素の checked プロパティを返す
     *
     * Getter to get node property value.
     * Used to get current property value in bidirectional binding.
     *
     * Examples:
     * - For input.value, returns current value property of input element
     * - For input.checked, returns current checked property of input element
     */
    get value() {
        // @ts-ignore
        return this.node[this.name];
    }
    /**
     * フィルタ適用後のノードプロパティ値を取得する getter。
     * 双方向バインディング時に状態更新する値を取得するために使用される。
     *
     * 処理:
     * - value getter でプロパティ値を取得
     * - 登録されている全フィルタを順次適用
     * - フィルタ適用後の値を返す
     *
     * Getter to get filtered node property value.
     * Used to get value for state update in bidirectional binding.
     *
     * Processing:
     * - Get property value with value getter
     * - Apply all registered filters sequentially
     * - Return filtered value
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNode)を初期化
     * - 双方向バインディング可能な要素の場合、イベントリスナーを登録
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. ノードが HTMLElement でない場合は早期リターン(イベントリスナー登録なし)
     * 3. isTwoWayBindable() で双方向バインディング可能な要素かチェック(不可の場合は早期リターン)
     * 4. getTwoWayPropertiesHTMLElement() で要素の双方向バインディング可能プロパティセットを取得
     * 5. this.name がデフォルトプロパティに含まれない場合は早期リターン
     * 6. decorates が複数(2つ以上)指定されている場合はエラー(BIND-201)
     * 7. decorates からイベント名を抽出("on" プレフィックスを除去)
     * 8. イベント名が指定されていない場合、defaultEventByName からデフォルトイベント名を取得
     * 9. イベント名が "readonly" または "ro" の場合は早期リターン(単方向バインディング)
     * 10. addEventListener でイベントリスナーを登録し、双方向バインディングを実現
     *
     * イベント名の決定ロジック:
     * - デコレータあり:
     *   - "onInput" → "input"
     *   - "onChange" → "change"
     *   - "input" → "input"
     * - デコレータなし:
     *   - value プロパティ → "input"(defaultEventByName から)
     *   - checked プロパティ → "change"(defaultEventByName から)
     *   - 定義なし → "readonly"(イベントリスナー登録なし)
     *
     * 双方向バインディングの仕組み:
     * 1. ユーザーが要素を操作(入力、選択等)
     * 2. イベントが発火
     * 3. filteredValue でフィルタ適用後の現在値を取得
     * 4. createUpdater で状態更新トランザクションを開始
     * 5. binding.updateStateValue で状態を更新
     * 6. 状態変更が他のバインディングに伝播
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Registers event listener if element supports bidirectional binding
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Early return if node is not HTMLElement (no event listener registration)
     * 3. Check if element supports bidirectional binding with isTwoWayBindable() (early return if not)
     * 4. Get bidirectional bindable property set for element with getTwoWayPropertiesHTMLElement()
     * 5. Early return if this.name is not in default properties
     * 6. Error (BIND-201) if multiple (2 or more) decorators specified
     * 7. Extract event name from decorates (remove "on" prefix)
     * 8. If event name not specified, get default event name from defaultEventByName
     * 9. Early return if event name is "readonly" or "ro" (one-way binding)
     * 10. Register event listener with addEventListener to achieve bidirectional binding
     *
     * Event name determination logic:
     * - With decorator:
     *   - "onInput" → "input"
     *   - "onChange" → "change"
     *   - "input" → "input"
     * - Without decorator:
     *   - value property → "input" (from defaultEventByName)
     *   - checked property → "change" (from defaultEventByName)
     *   - undefined → "readonly" (no event listener registration)
     *
     * Bidirectional binding mechanism:
     * 1. User manipulates element (input, selection, etc.)
     * 2. Event fires
     * 3. Get current value after filter with filteredValue
     * 4. Start state update transaction with createUpdater
     * 5. Update state with binding.updateStateValue
     * 6. State change propagates to other bindings
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // ステップ2: HTMLElement でない場合は早期リターン
        // Step 2: Early return if not HTMLElement
        const isElement = this.node instanceof HTMLElement;
        if (!isElement)
            return;
        // ステップ3: 双方向バインディング可能な要素かチェック
        // Step 3: Check if element supports bidirectional binding
        if (!isTwoWayBindable(this.node))
            return;
        // ステップ4-5: デフォルトプロパティに含まれるかチェック
        // Step 4-5: Check if included in default properties
        const defaultNames = getTwoWayPropertiesHTMLElement(this.node);
        if (!defaultNames.has(this.name))
            return;
        // ステップ6: デコレータが複数指定されている場合はエラー
        // Step 6: Error if multiple decorators specified
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeProperty.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        // ステップ7-8: イベント名を決定
        // Step 7-8: Determine event name
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? defaultEventByName[this.name] ?? "readonly";
        // ステップ9: readonly の場合は早期リターン
        // Step 9: Early return if readonly
        if (eventName === "readonly" || eventName === "ro")
            return;
        // ステップ10: イベントリスナーを登録(双方向バインディング)
        // Step 10: Register event listener (bidirectional binding)
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async () => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            // 同期処理で状態を更新
            // Update state synchronously
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * 初期化処理(空実装)。
     * サブクラスで必要に応じてオーバーライドして初期化処理を実装可能。
     *
     * 設計意図:
     * - 基底クラスでは特別な初期化処理が不要なため空実装
     * - サブクラスで追加の初期化ロジックが必要な場合にオーバーライド
     *
     * Initialization processing (empty implementation).
     * Subclasses can override to implement initialization processing as needed.
     *
     * Design intent:
     * - Empty implementation as no special initialization needed in base class
     * - Override in subclass if additional initialization logic needed
     */
    init() {
        // サブクラスで初期化処理を実装可能
        // Subclasses can implement initialization processing
    }
    /**
     * ノードのプロパティに値を割り当てるメソッド。
     * null/undefined/NaN は空文字列に変換してから割り当てる。
     *
     * 処理:
     * 1. 値が null, undefined, NaN のいずれかの場合、空文字列 "" に変換
     * 2. this.node[this.name] に値を割り当て
     *
     * 変換例:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → 0 (変換なし)
     * - false → false (変換なし)
     * - "text" → "text" (変換なし)
     *
     * 設計意図:
     * - null/undefined/NaN を空文字列に変換することで、プロパティに安全に割り当て
     * - HTML 要素のプロパティに null や NaN を設定すると "null" "NaN" という文字列になるため、空文字列に変換
     * - 空文字列に変換することで、ユーザーに対して適切な表示を実現
     *
     * Method to assign value to node property.
     * Converts null/undefined/NaN to empty string before assignment.
     *
     * Processing:
     * 1. Convert value to empty string "" if null, undefined, or NaN
     * 2. Assign value to this.node[this.name]
     *
     * Conversion examples:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → 0 (no conversion)
     * - false → false (no conversion)
     * - "text" → "text" (no conversion)
     *
     * Design intent:
     * - Safely assign to property by converting null/undefined/NaN to empty string
     * - Setting null or NaN to HTML element property results in "null" "NaN" string, so convert to empty string
     * - Achieve appropriate display to user by converting to empty string
     *
     * @param value - 割り当てる値 / Value to assign
     */
    assignValue(value) {
        // null/undefined/NaN を空文字列に変換
        // Convert null/undefined/NaN to empty string
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        // プロパティに値を割り当て
        // Assign value to property
        // @ts-ignore
        this.node[this.name] = value;
    }
}
/**
 * プロパティバインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "value", "checked")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列("onInput", "onChange", "readonly" 等)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeProperty を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeProperty インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate property binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "value", "checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings ("onInput", "onChange", "readonly", etc.)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeProperty
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeProperty instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeProperty = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeProperty(binding, node, name, filterFns, decorates);
};

/**
 * BindingNodeRadio クラスは、ラジオボタン(input[type="radio"])の
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、ラジオボタン固有の処理を実装
 * - バインディング値と input 要素の value を比較して checked 状態を制御
 * - 双方向バインディング対応(ユーザー選択時に状態を自動更新)
 * - null/undefined は空文字列に変換して比較
 *
 * 主な役割:
 * 1. バインディング値と input.value が一致していれば checked=true にする
 * 2. ラジオボタン選択時に filteredValue を状態に反映(双方向バインディング)
 * 3. null/undefined の場合は空文字列に変換して比較
 * 4. デコレータによるイベント名のカスタマイズ(onInput, onChange 等)
 * 5. フィルタ適用後の値を使用して状態比較・更新を実行
 *
 * 使用例:
 * - <input type="radio" value="apple" data-bind="checked: selectedFruit"> → selectedFruit が "apple" の時チェック
 * - <input type="radio" value="banana" data-bind="checked: selectedFruit"> → selectedFruit が "banana" の時チェック
 * - <input type="radio" value="orange" data-bind="checked.onchange: selectedFruit"> → change イベントで双方向バインディング
 *
 * 設計ポイント:
 * - assignValue で値を文字列化し、input 要素の value と比較して checked を制御
 * - constructor でイベントリスナーを登録し、双方向バインディングを実現
 * - decorates の数は1つまで(複数指定はエラー)
 * - readonly/ro 指定時はイベントリスナーを登録しない(単方向バインディング)
 * - フィルタ適用後の値を使用して状態比較・更新を実行
 * - null/undefined を空文字列に変換することで、安全な比較を実現
 *
 * ---
 *
 * BindingNodeRadio class implements binding processing for radio buttons (input[type="radio"]).
 *
 * Architecture:
 * - Inherits BindingNode, implements radio button specific processing
 * - Controls checked state by comparing binding value with input element value
 * - Supports bidirectional binding (auto-updates state on user selection)
 * - Converts null/undefined to empty string for comparison
 *
 * Main responsibilities:
 * 1. Set checked=true if binding value matches input.value
 * 2. Reflect filteredValue to state on radio button selection (bidirectional binding)
 * 3. Convert null/undefined to empty string for comparison
 * 4. Customize event name with decorator (onInput, onChange, etc.)
 * 5. Execute state comparison and update using filtered value
 *
 * Usage examples:
 * - <input type="radio" value="apple" data-bind="checked: selectedFruit"> → Checked when selectedFruit is "apple"
 * - <input type="radio" value="banana" data-bind="checked: selectedFruit"> → Checked when selectedFruit is "banana"
 * - <input type="radio" value="orange" data-bind="checked.onchange: selectedFruit"> → Bidirectional binding with change event
 *
 * Design points:
 * - assignValue stringifies value, compares with input element value to control checked
 * - Register event listener in constructor to achieve bidirectional binding
 * - decorates limited to 1 (multiple decorators cause error)
 * - No event listener when readonly/ro is specified (one-way binding)
 * - Execute state comparison and update using filtered value
 * - Convert null/undefined to empty string for safe comparison
 *
 * @throws BIND-201 Has multiple decorators: decorates が複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeRadio extends BindingNode {
    /**
     * ラジオボタンの value 属性を返す getter。
     * 双方向バインディング時に現在のラジオボタンの値を取得するために使用される。
     *
     * Getter to return radio button value attribute.
     * Used to get current radio button value in bidirectional binding.
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * フィルタ適用後のラジオボタン value を返す getter。
     * 双方向バインディング時に状態更新する値を取得するために使用される。
     *
     * Getter to return filtered radio button value.
     * Used to get value for state update in bidirectional binding.
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNode)を初期化
     * - ラジオボタンの双方向バインディングを設定(イベントリスナー登録)
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. ノードが HTMLInputElement かつ type="radio" であることを確認
     * 3. decorates の数が1つ以下であることを確認(複数はエラー)
     * 4. decorates からイベント名を抽出(デフォルトは "input")
     * 5. readonly/ro の場合は早期リターン(イベントリスナー登録なし)
     * 6. イベントリスナーを登録し、双方向バインディングを実現
     *
     * イベント名の処理:
     * - decorates[0] が "onchange" の場合 → "change"
     * - decorates[0] が "change" の場合 → "change"
     * - decorates[0] が未指定の場合 → "input"(デフォルト)
     * - "readonly" または "ro" の場合 → イベントリスナー登録なし
     *
     * 双方向バインディングの仕組み:
     * 1. ユーザーがラジオボタンを選択
     * 2. イベントが発火
     * 3. filteredValue(フィルタ適用後の value)を取得
     * 4. createUpdater で状態更新トランザクションを開始
     * 5. binding.updateStateValue で状態を更新
     * 6. 状態変更が他のバインディングに伝播
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Sets up radio button bidirectional binding (registers event listener)
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Verify node is HTMLInputElement and type="radio"
     * 3. Verify decorates count is 1 or less (multiple causes error)
     * 4. Extract event name from decorates (default is "input")
     * 5. Early return if readonly/ro (no event listener registration)
     * 6. Register event listener to achieve bidirectional binding
     *
     * Event name processing:
     * - If decorates[0] is "onchange" → "change"
     * - If decorates[0] is "change" → "change"
     * - If decorates[0] is unspecified → "input" (default)
     * - If "readonly" or "ro" → No event listener registration
     *
     * Bidirectional binding mechanism:
     * 1. User selects radio button
     * 2. Event fires
     * 3. Get filteredValue (filtered value)
     * 4. Start state update transaction with createUpdater
     * 5. Update state with binding.updateStateValue
     * 6. State change propagates to other bindings
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // ステップ1-2: ノードタイプとラジオボタンタイプの確認
        // Step 1-2: Verify node type and radio button type
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement)
            return;
        const inputElement = this.node;
        if (inputElement.type !== "radio")
            return;
        // ステップ3: decorates の数を確認(複数はエラー)
        // Step 3: Verify decorates count (multiple causes error)
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeRadio.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        // ステップ4: イベント名を抽出("on" プレフィックスを削除)
        // Step 4: Extract event name (remove "on" prefix)
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        // ステップ5: readonly/ro の場合は早期リターン
        // Step 5: Early return if readonly/ro
        if (eventName === "readonly" || eventName === "ro")
            return;
        // ステップ6: イベントリスナーを登録(双方向バインディング)
        // Step 6: Register event listener (bidirectional binding)
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async (e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            // 同期処理で状態を更新
            // Update state synchronously
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * バインディング値に基づいて checked 状態を設定するメソッド。
     * バインディング値と filteredValue が一致する場合のみ checked=true にする。
     *
     * 処理フロー:
     * 1. 値が null または undefined の場合、空文字列 "" に変換
     * 2. ノードを HTMLInputElement にキャスト
     * 3. バインディング値と filteredValue を厳密等価比較(===)
     * 4. 比較結果を element.checked に設定
     *
     * ラジオボタンの動作:
     * - value="apple", バインディング値="apple" → checked=true
     * - value="apple", バインディング値="banana" → checked=false
     * - value="orange", バインディング値=null → checked=false ("" !== "orange")
     * - value="", バインディング値=null → checked=true ("" === "")
     *
     * null/undefined の扱い:
     * - バインディング値が null → "" に変換
     * - バインディング値が undefined → "" に変換
     * - これにより value="" のラジオボタンと一致可能
     *
     * 設計意図:
     * - 厳密等価比較(===)により、型も含めた完全一致を要求
     * - null/undefined を空文字列に変換し、空の value 属性との比較を可能に
     * - filteredValue を使用することで、フィルタ適用後の値で比較
     * - 複数のラジオボタンのうち、値が一致するものだけが checked=true になる
     *
     * Method to set checked state based on binding value.
     * Only sets checked=true if binding value matches filteredValue.
     *
     * Processing flow:
     * 1. Convert value to empty string "" if null or undefined
     * 2. Cast node to HTMLInputElement
     * 3. Strictly compare (===) binding value with filteredValue
     * 4. Set comparison result to element.checked
     *
     * Radio button behavior:
     * - value="apple", binding value="apple" → checked=true
     * - value="apple", binding value="banana" → checked=false
     * - value="orange", binding value=null → checked=false ("" !== "orange")
     * - value="", binding value=null → checked=true ("" === "")
     *
     * Handling null/undefined:
     * - Binding value is null → Convert to ""
     * - Binding value is undefined → Convert to ""
     * - This enables matching with radio button with value=""
     *
     * Design intent:
     * - Strict equality comparison (===) requires complete match including type
     * - Convert null/undefined to empty string to enable comparison with empty value attribute
     * - Use filteredValue to compare with filtered value
     * - Among multiple radio buttons, only the one with matching value becomes checked=true
     *
     * @param value - バインディング値(ラジオボタンの value と比較) / Binding value (compared with radio button value)
     */
    assignValue(value) {
        // ステップ1: null/undefined を空文字列に変換
        // Step 1: Convert null/undefined to empty string
        if (value === null || value === undefined) {
            value = "";
        }
        // ステップ2-4: バインディング値と filteredValue を比較して checked を設定
        // Step 2-4: Compare binding value with filteredValue and set checked
        const element = this.node;
        element.checked = value === this.filteredValue;
    }
}
/**
 * ラジオボタン用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "checked")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(イベント名または "readonly"/"ro")
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeRadio を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeRadio インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate radio button binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (event name or "readonly"/"ro")
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeRadio
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeRadio instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeRadio = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeRadio(binding, node, name, filterFns, decorates);
};

/**
 * BindingNodeStyle クラスは、style 属性(インラインスタイル)のバインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、スタイル固有の処理を実装
 * - name から CSS プロパティ名(subName)を抽出し、style.setProperty で値を設定
 * - 単方向バインディング(状態 → DOM のみ)
 * - null/undefined/NaN は空文字列に変換
 *
 * 主な役割:
 * 1. name から CSS プロパティ名を抽出(例: "style.color" → "color")
 * 2. バインディング値を指定の CSS プロパティ(subName)として HTMLElement にセット
 * 3. null/undefined/NaN の場合は空文字列に変換してセット
 * 4. 値を文字列化して style.setProperty で反映
 *
 * 使用例:
 * - <div data-bind="style.color: textColor"> → textColor を div の color スタイルにバインド
 * - <div data-bind="style.backgroundColor: bgColor"> → bgColor を div の backgroundColor スタイルにバインド
 * - <div data-bind="style.fontSize: fontSize"> → fontSize を div の fontSize スタイルにバインド
 * - <div data-bind="style.display: isVisible"> → isVisible を div の display スタイルにバインド
 *
 * 設計ポイント:
 * - constructor で name を分割して CSS プロパティ名(subName)を抽出
 * - assignValue で null/undefined/NaN を空文字列に変換し、toString() で文字列化
 * - style.setProperty を使用することで、あらゆる CSS プロパティに対応
 * - 単方向バインディングのみ(DOM → 状態への更新はなし)
 * - CSS プロパティ名は kebab-case(例: "background-color")と camelCase(例: "backgroundColor")の両方に対応
 *
 * ---
 *
 * BindingNodeStyle class implements binding processing for style attribute (inline style).
 *
 * Architecture:
 * - Inherits BindingNode, implements style-specific processing
 * - Extracts CSS property name (subName) from name and sets value with style.setProperty
 * - One-way binding (state → DOM only)
 * - Converts null/undefined/NaN to empty string
 *
 * Main responsibilities:
 * 1. Extract CSS property name from name (e.g., "style.color" → "color")
 * 2. Set binding value as specified CSS property (subName) to HTMLElement
 * 3. Convert to empty string if null/undefined/NaN
 * 4. Stringify value and reflect with style.setProperty
 *
 * Usage examples:
 * - <div data-bind="style.color: textColor"> → Bind textColor to div's color style
 * - <div data-bind="style.backgroundColor: bgColor"> → Bind bgColor to div's backgroundColor style
 * - <div data-bind="style.fontSize: fontSize"> → Bind fontSize to div's fontSize style
 * - <div data-bind="style.display: isVisible"> → Bind isVisible to div's display style
 *
 * Design points:
 * - Split name in constructor to extract CSS property name (subName)
 * - Convert null/undefined/NaN to empty string in assignValue, stringify with toString()
 * - Using style.setProperty supports any CSS property
 * - One-way binding only (no DOM → state update)
 * - CSS property names support both kebab-case (e.g., "background-color") and camelCase (e.g., "backgroundColor")
 */
class BindingNodeStyle extends BindingNode {
    #subName;
    /**
     * CSS プロパティ名を返す getter。
     * name から抽出した CSS プロパティ名("style.color" の "color" 部分)。
     *
     * Getter to return CSS property name.
     * CSS property name extracted from name ("color" part of "style.color").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNode)を初期化
     * - name から CSS プロパティ名(subName)を抽出
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割(例: "style.color" → ["style", "color"])
     * 3. 分割結果の2番目の要素(インデックス1)を subName として保存
     *
     * 抽出例:
     * - "style.color" → subName = "color"
     * - "style.backgroundColor" → subName = "backgroundColor"
     * - "style.font-size" → subName = "font-size"
     *
     * 注意点:
     * - name は必ず "style.<propertyName>" の形式を想定
     * - "." が含まれない場合、subName は undefined になる可能性がある
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts CSS property name (subName) from name
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by "." (e.g., "style.color" → ["style", "color"])
     * 3. Save second element (index 1) of split result as subName
     *
     * Extraction examples:
     * - "style.color" → subName = "color"
     * - "style.backgroundColor" → subName = "backgroundColor"
     * - "style.font-size" → subName = "font-size"
     *
     * Notes:
     * - name is expected to be in "style.<propertyName>" format
     * - If "." is not included, subName may be undefined
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // name を分割して CSS プロパティ名を抽出("style.color" → "color")
        // Split name to extract CSS property name ("style.color" → "color")
        const [, subName] = this.name.split(".");
        this.#subName = subName;
    }
    /**
     * CSS プロパティに値を設定するメソッド。
     * null/undefined/NaN は空文字列に変換してから設定する。
     *
     * 処理フロー:
     * 1. 値が null, undefined, NaN のいずれかの場合、空文字列 "" に変換
     * 2. ノードを HTMLElement にキャスト
     * 3. 値を文字列化(toString())
     * 4. element.style.setProperty(subName, 文字列化した値)で CSS プロパティを設定
     *
     * 設定例:
     * - subName="color", value="red" → style.setProperty("color", "red") → style="color: red;"
     * - subName="backgroundColor", value="#fff" → style.setProperty("backgroundColor", "#fff") → style="background-color: #fff;"
     * - subName="font-size", value="16px" → style.setProperty("font-size", "16px") → style="font-size: 16px;"
     * - subName="display", value=null → style.setProperty("display", "") → style="display: ;"
     *
     * null/undefined/NaN の変換:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → "0" (変換なし)
     * - false → "false" (変換なし)
     *
     * 設計意図:
     * - null/undefined/NaN を空文字列に変換することで、スタイルをリセット
     * - toString() で値を文字列化し、あらゆる型の値に対応
     * - style.setProperty を使用することで、CSS プロパティ名の形式(kebab-case/camelCase)を問わず設定可能
     * - 空文字列を設定すると、該当の CSS プロパティが実質的に削除される(継承値やデフォルト値に戻る)
     *
     * Method to set value to CSS property.
     * Converts null/undefined/NaN to empty string before setting.
     *
     * Processing flow:
     * 1. Convert value to empty string "" if null, undefined, or NaN
     * 2. Cast node to HTMLElement
     * 3. Stringify value (toString())
     * 4. Set CSS property with element.style.setProperty(subName, stringified value)
     *
     * Setting examples:
     * - subName="color", value="red" → style.setProperty("color", "red") → style="color: red;"
     * - subName="backgroundColor", value="#fff" → style.setProperty("backgroundColor", "#fff") → style="background-color: #fff;"
     * - subName="font-size", value="16px" → style.setProperty("font-size", "16px") → style="font-size: 16px;"
     * - subName="display", value=null → style.setProperty("display", "") → style="display: ;"
     *
     * Converting null/undefined/NaN:
     * - null → ""
     * - undefined → ""
     * - NaN → ""
     * - 0 → "0" (no conversion)
     * - false → "false" (no conversion)
     *
     * Design intent:
     * - Convert null/undefined/NaN to empty string to reset style
     * - Stringify value with toString() to support any type of value
     * - Using style.setProperty enables setting regardless of CSS property name format (kebab-case/camelCase)
     * - Setting empty string effectively removes the CSS property (returns to inherited or default value)
     *
     * @param value - 設定する値 / Value to set
     */
    assignValue(value) {
        // ステップ1: null/undefined/NaN を空文字列に変換
        // Step 1: Convert null/undefined/NaN to empty string
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        // ステップ2-4: 値を文字列化して CSS プロパティに設定
        // Step 2-4: Stringify value and set to CSS property
        const element = this.node;
        element.style.setProperty(this.subName, value.toString());
    }
}
/**
 * style 属性バインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "style.color")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(style では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeStyle を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeStyle インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate style attribute binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "style.color")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for style)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeStyle
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeStyle instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeStyle = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeStyle(binding, node, name, filterFns, decorates);
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
 * BindingNodeComponent クラスは、StructiveComponent(カスタムコンポーネント)への
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、コンポーネント固有のバインディング処理を実装
 * - 親コンポーネントの状態を子コンポーネントの state プロパティにバインド
 * - カスタムエレメントの定義完了を待機して初期化を実行
 * - bindingsByComponent でコンポーネント単位のバインディング情報を管理
 *
 * 主な役割:
 * 1. name から state プロパティ名(subName)を抽出(例: "state.count" → "count")
 * 2. 親コンポーネントの状態変更を子コンポーネントに伝播(NotifyRedrawSymbol 経由)
 * 3. カスタムエレメントの tagName を判定(ハイフン付きタグ名または is 属性)
 * 4. 親子コンポーネント間の関係を登録・管理
 * 5. バインディングのライフサイクル管理(activate/inactivate)
 *
 * 使用例:
 * - <my-child data-bind="state.message: parentMessage"> → 親の parentMessage を子の message にバインド
 * - <div is="custom-comp" data-bind="state.count: totalCount"> → is 属性形式のコンポーネント
 * - <my-component data-bind="state.user: currentUser"> → オブジェクトのバインディング
 *
 * 設計ポイント:
 * - customElements.whenDefined() で定義完了を待機してから初期化
 * - notifyRedraw で変更通知の伝播範囲を絞り込み(パス・ループインデックスで判定)
 * - applyChange は即座に _notifyRedraw を呼び出し(単一バインディングの変更)
 * - activate で親子関係を登録し、inactivate で解除
 * - tagName の判定は2パターン(ハイフン付きタグ名または is 属性)
 * - bindingsByComponent でコンポーネントごとのバインディングを追跡
 *
 * ---
 *
 * BindingNodeComponent class implements binding processing to StructiveComponent (custom component).
 *
 * Architecture:
 * - Inherits BindingNode, implements component-specific binding processing
 * - Binds parent component state to child component state property
 * - Waits for custom element definition completion before initialization
 * - Manages per-component binding information with bindingsByComponent
 *
 * Main responsibilities:
 * 1. Extract state property name (subName) from name (e.g., "state.count" → "count")
 * 2. Propagate parent component state changes to child component (via NotifyRedrawSymbol)
 * 3. Determine custom element tagName (hyphenated tag name or is attribute)
 * 4. Register and manage parent-child component relationships
 * 5. Manage binding lifecycle (activate/inactivate)
 *
 * Usage examples:
 * - <my-child data-bind="state.message: parentMessage"> → Bind parent's parentMessage to child's message
 * - <div is="custom-comp" data-bind="state.count: totalCount"> → Component with is attribute
 * - <my-component data-bind="state.user: currentUser"> → Object binding
 *
 * Design points:
 * - Wait for definition completion with customElements.whenDefined() before initialization
 * - notifyRedraw narrows change notification scope (determined by path and loop index)
 * - applyChange immediately calls _notifyRedraw (single binding change)
 * - activate registers parent-child relationship, inactivate unregisters
 * - tagName determination has 2 patterns (hyphenated tag name or is attribute)
 * - bindingsByComponent tracks bindings per component
 *
 * @throws COMP-401 Cannot determine custom element tag name: タグ名を判定できない場合 / When tag name cannot be determined
 */
class BindingNodeComponent extends BindingNode {
    #subName;
    /**
     * カスタムエレメントのタグ名(小文字)。
     * ハイフン付きタグ名または is 属性から取得。
     *
     * Custom element tag name (lowercase).
     * Obtained from hyphenated tag name or is attribute.
     */
    tagName;
    /**
     * 子コンポーネントの state プロパティ名を返す getter。
     * name から抽出された state プロパティ名("state.count" の "count" 部分)。
     *
     * Getter to return child component's state property name.
     * State property name extracted from name ("count" part of "state.count").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * コンストラクタ。
     * - 親クラス(BindingNode)を初期化
     * - name から state プロパティ名(subName)を抽出
     * - カスタムエレメントのタグ名を判定
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name を "." で分割し、2番目の要素を subName として保存("state.count" → "count")
     * 3. ノードを HTMLElement にキャスト
     * 4. タグ名にハイフンが含まれる場合、そのタグ名を小文字で保存(<my-component>)
     * 5. is 属性にハイフンが含まれる場合、その属性値を小文字で保存(<div is="custom-comp">)
     * 6. どちらにも該当しない場合はエラー(COMP-401)
     *
     * タグ名判定の2パターン:
     * - パターン1: <my-component> → tagName = "my-component"
     * - パターン2: <div is="custom-comp"> → tagName = "custom-comp"
     *
     * エラー条件:
     * - タグ名にもハイフンがなく、is 属性も存在しない、または is 属性にハイフンがない
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts state property name (subName) from name
     * - Determines custom element tag name
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Split name by "." and save second element as subName ("state.count" → "count")
     * 3. Cast node to HTMLElement
     * 4. If tag name includes hyphen, save that tag name in lowercase (<my-component>)
     * 5. If is attribute includes hyphen, save that attribute value in lowercase (<div is="custom-comp">)
     * 6. Error (COMP-401) if neither applies
     *
     * Two patterns for tag name determination:
     * - Pattern 1: <my-component> → tagName = "my-component"
     * - Pattern 2: <div is="custom-comp"> → tagName = "custom-comp"
     *
     * Error conditions:
     * - No hyphen in tag name and is attribute doesn't exist, or is attribute has no hyphen
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // name を分割して state プロパティ名を抽出("state.count" → "count")
        // Split name to extract state property name ("state.count" → "count")
        const [, subName] = this.name.split(".");
        this.#subName = subName;
        const element = this.node;
        // パターン1: タグ名にハイフンが含まれる場合(<my-component>)
        // Pattern 1: Tag name includes hyphen (<my-component>)
        if (element.tagName.includes("-")) {
            this.tagName = element.tagName.toLowerCase();
        }
        // パターン2: is 属性にハイフンが含まれる場合(<div is="custom-comp">)
        // Pattern 2: is attribute includes hyphen (<div is="custom-comp">)
        else if (element.getAttribute("is")?.includes("-")) {
            this.tagName = element.getAttribute("is").toLowerCase();
        }
        // どちらにも該当しない場合はエラー
        // Error if neither applies
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
     * 子コンポーネントに再描画通知を送信する内部メソッド。
     * カスタムエレメントの定義完了を待ってから NotifyRedrawSymbol を呼び出す。
     *
     * 処理フロー:
     * 1. ノードを StructiveComponent にキャスト
     * 2. getCustomTagName でタグ名を取得
     * 3. customElements.whenDefined() で定義完了を待機
     * 4. 定義完了後、component.state[NotifyRedrawSymbol](refs) を呼び出し
     *
     * 設計意図:
     * - カスタムエレメントが未定義の場合でもエラーにならないよう、whenDefined で待機
     * - NotifyRedrawSymbol 経由で子コンポーネントに変更通知を送信
     * - 子コンポーネントは受け取った refs を基に関連する state を再評価
     *
     * Internal method to send redraw notification to child component.
     * Waits for custom element definition completion before calling NotifyRedrawSymbol.
     *
     * Processing flow:
     * 1. Cast node to StructiveComponent
     * 2. Get tag name with getCustomTagName
     * 3. Wait for definition completion with customElements.whenDefined()
     * 4. After definition, call component.state[NotifyRedrawSymbol](refs)
     *
     * Design intent:
     * - Wait with whenDefined to avoid errors when custom element is undefined
     * - Send change notification to child component via NotifyRedrawSymbol
     * - Child component re-evaluates related state based on received refs
     *
     * @param refs - 変更された state 参照の配列 / Array of changed state references
     */
    _notifyRedraw(refs) {
        const component = this.node;
        // コンポーネントが定義されるのを待ち、初期化完了後に notifyRedraw を呼び出す
        // Wait for component definition, call notifyRedraw after initialization
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            component.state[NotifyRedrawSymbol](refs);
        });
    }
    /**
     * 変更通知を受け取り、このバインディングに関連する参照のみを子コンポーネントに伝播。
     * パスとループインデックスで通知範囲を絞り込む。
     *
     * 処理フロー:
     * 1. 空の通知用配列(notifyRefs)を作成
     * 2. このバインディングの状態参照(compRef)とループインデックス情報を取得
     * 3. 渡された refs を1つずつチェック:
     *    a. compRef と同じパターンの場合はスキップ(applyChange で処理済み)
     *    b. compRef の累積パスセットに含まれない場合はスキップ
     *    c. ループインデックスが一致しない場合はスキップ
     * 4. フィルタを通過した refs を notifyRefs に追加
     * 5. notifyRefs が空でなければ _notifyRedraw を呼び出し
     *
     * フィルタリングの3条件:
     * 1. パターン一致チェック: applyChange で既に処理済みの ref を除外
     * 2. パス包含チェック: 累積パスセットに含まれない無関係な ref を除外
     * 3. ループインデックスチェック: 異なるループ反復の ref を除外
     *
     * 設計意図:
     * - 不要な再描画通知を削減し、パフォーマンスを向上
     * - ループ内のコンポーネントで正しいインデックスの変更のみを通知
     * - 親の状態変更が子の関連プロパティにのみ伝播するよう制御
     *
     * Receives change notification and propagates only related references to child component.
     * Narrows notification scope by path and loop index.
     *
     * Processing flow:
     * 1. Create empty notification array (notifyRefs)
     * 2. Get state reference (compRef) and loop index info for this binding
     * 3. Check each ref in passed refs:
     *    a. Skip if same pattern as compRef (already processed by applyChange)
     *    b. Skip if not included in compRef's cumulative path set
     *    c. Skip if loop index doesn't match
     * 4. Add refs that passed filter to notifyRefs
     * 5. Call _notifyRedraw if notifyRefs is not empty
     *
     * Three filtering conditions:
     * 1. Pattern match check: Exclude refs already processed by applyChange
     * 2. Path inclusion check: Exclude unrelated refs not in cumulative path set
     * 3. Loop index check: Exclude refs from different loop iterations
     *
     * Design intent:
     * - Reduce unnecessary redraw notifications to improve performance
     * - Notify only changes for correct index in components within loops
     * - Control so parent state changes propagate only to child's related properties
     *
     * @param refs - 変更された state 参照の配列 / Array of changed state references
     */
    notifyRedraw(refs) {
        const notifyRefs = [];
        const compRef = this.binding.bindingState.ref;
        const listIndex = compRef.listIndex;
        const atIndex = (listIndex?.length ?? 0) - 1;
        for (const ref of refs) {
            // 条件1: applyChange で処理済みなのでスキップ
            // Condition 1: Skip as already processed by applyChange
            if (ref.info.pattern === compRef.info.pattern) {
                continue;
            }
            // 条件2: 累積パスセットに含まれない場合はスキップ
            // Condition 2: Skip if not included in cumulative path set
            if (!ref.info.cumulativePathSet.has(compRef.info.pattern)) {
                continue;
            }
            // 条件3: ループインデックスが一致しない場合はスキップ
            // Condition 3: Skip if loop index doesn't match
            if (atIndex >= 0) {
                if (ref.listIndex?.at(atIndex) !== listIndex) {
                    continue;
                }
            }
            notifyRefs.push(ref);
        }
        // 通知対象が存在する場合のみ _notifyRedraw を呼び出し
        // Call _notifyRedraw only if there are notification targets
        if (notifyRefs.length === 0) {
            return;
        }
        this._notifyRedraw(notifyRefs);
    }
    /**
     * 単一バインディングの変更を子コンポーネントに即座に反映。
     * このバインディングの状態参照のみを通知。
     *
     * 処理:
     * - _notifyRedraw を呼び出し、このバインディングの bindingState.ref のみを渡す
     *
     * 設計意図:
     * - notifyRedraw は複数の変更をフィルタリングするが、applyChange は単一変更を直接通知
     * - renderer パラメータは未使用(他の BindingNode との互換性のため)
     *
     * Immediately reflects single binding change to child component.
     * Notifies only this binding's state reference.
     *
     * Processing:
     * - Call _notifyRedraw, passing only this binding's bindingState.ref
     *
     * Design intent:
     * - notifyRedraw filters multiple changes, but applyChange directly notifies single change
     * - renderer parameter unused (for compatibility with other BindingNode)
     *
     * @param renderer - レンダラー(未使用) / Renderer (unused)
     */
    applyChange(renderer) {
        this._notifyRedraw([this.binding.bindingState.ref]);
    }
    /**
     * バインディングをアクティブ化し、親子コンポーネント間の関係を登録。
     * カスタムエレメントの定義完了を待ってから初期化を実行。
     *
     * 処理フロー:
     * 1. エンジンと親コンポーネントを取得
     * 2. ノードを StructiveComponent にキャスト
     * 3. タグ名を取得し、customElements.whenDefined() で定義完了を待機
     * 4. 定義完了後:
     *    a. 親コンポーネントに子コンポーネントを登録(registerChildComponent)
     *    b. 子コンポーネントの stateBinding にこのバインディングを追加
     * 5. registerStructiveComponent で親子関係をグローバルに登録
     * 6. bindingsByComponent にこのバインディングを追加
     *
     * 登録される情報:
     * - 親コンポーネント → 子コンポーネントの参照
     * - 子コンポーネント → バインディング情報
     * - エンジン → コンポーネントごとのバインディングセット
     *
     * 設計意図:
     * - カスタムエレメント定義前にアクセスするとエラーになるため、whenDefined で待機
     * - 親子関係を双方向に登録し、状態変更の伝播を可能にする
     * - bindingsByComponent でコンポーネント単位の管理を実現
     *
     * Activates binding and registers parent-child component relationship.
     * Waits for custom element definition completion before executing initialization.
     *
     * Processing flow:
     * 1. Get engine and parent component
     * 2. Cast node to StructiveComponent
     * 3. Get tag name and wait for definition completion with customElements.whenDefined()
     * 4. After definition:
     *    a. Register child component to parent component (registerChildComponent)
     *    b. Add this binding to child component's stateBinding
     * 5. Register parent-child relationship globally with registerStructiveComponent
     * 6. Add this binding to bindingsByComponent
     *
     * Registered information:
     * - Parent component → Child component reference
     * - Child component → Binding information
     * - Engine → Binding set per component
     *
     * Design intent:
     * - Wait with whenDefined as accessing before custom element definition causes error
     * - Register parent-child relationship bidirectionally to enable state change propagation
     * - Achieve per-component management with bindingsByComponent
     */
    activate() {
        const engine = this.binding.engine;
        const parentComponent = engine.owner;
        const component = this.node;
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            // 親コンポーネントに子コンポーネントを登録
            // Register child component to parent component
            parentComponent.registerChildComponent(component);
            // 子コンポーネントの stateBinding にバインディングを追加
            // Add binding to child component's stateBinding
            component.stateBinding.addBinding(this.binding);
        });
        // グローバルな親子関係を登録
        // Register global parent-child relationship
        registerStructiveComponent(parentComponent, component);
        // bindingsByComponent にこのバインディングを追加
        // Add this binding to bindingsByComponent
        let bindings = engine.bindingsByComponent.get(component);
        if (typeof bindings === "undefined") {
            engine.bindingsByComponent.set(component, bindings = new Set());
        }
        bindings.add(this.binding);
    }
    /**
     * バインディングを非アクティブ化し、登録された関係を解除。
     *
     * 処理フロー:
     * 1. エンジンを取得
     * 2. removeStructiveComponent でグローバルな親子関係を解除
     * 3. bindingsByComponent からこのバインディングを削除
     *
     * 設計意図:
     * - activate で登録した情報をクリーンアップ
     * - メモリリークを防ぐため、不要になったバインディングを削除
     * - コンポーネントが DOM から削除される際に呼び出される
     *
     * Deactivates binding and unregisters registered relationships.
     *
     * Processing flow:
     * 1. Get engine
     * 2. Unregister global parent-child relationship with removeStructiveComponent
     * 3. Delete this binding from bindingsByComponent
     *
     * Design intent:
     * - Clean up information registered in activate
     * - Delete unnecessary bindings to prevent memory leaks
     * - Called when component is removed from DOM
     */
    inactivate() {
        const engine = this.binding.engine;
        // グローバルな親子関係を解除
        // Unregister global parent-child relationship
        removeStructiveComponent(this.node);
        // bindingsByComponent からこのバインディングを削除
        // Delete this binding from bindingsByComponent
        let bindings = engine.bindingsByComponent.get(this.node);
        if (typeof bindings !== "undefined") {
            bindings.delete(this.binding);
        }
    }
}
/**
 * コンポーネント用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "state.count")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(component では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeComponent を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeComponent インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate component binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "state.count")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for component)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeComponent
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeComponent instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
const createBindingNodeComponent = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeComponent(binding, node, name, filterFns, decorates);
};

/**
 * ノード種別（Element/Comment）とプロパティ名の組み合わせで
 * 特定のバインディングノード生成関数を定義するマップ
 *
 * インデックス 0 (Element): 要素ノード専用のバインディング
 *   - "class": classList操作（class属性のトークンリスト操作）
 *   - "checkbox": チェックボックスのchecked状態バインディング
 *   - "radio": ラジオボタンのchecked状態バインディング
 *
 * インデックス 1 (Comment): コメントノード専用のバインディング
 *   - "if": 条件分岐バインディング（要素の表示/非表示）
 *
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
 * プロパティ名の先頭部分（ドット区切りの最初の要素）で判定する
 * バインディングノード生成関数のマップ
 *
 * 対応パターン:
 *   - "class.xxx": className バインディング（class属性全体の設定）
 *   - "attr.xxx": attribute バインディング（任意の属性の設定）
 *   - "style.xxx": style バインディング（インラインスタイルの設定）
 *   - "state.xxx": component state バインディング（コンポーネント状態の受け渡し）
 *
 * 例:
 *   - "class.active" → BindingNodeClassName (class属性を"active"に設定)
 *   - "attr.src" → BindingNodeAttribute (src属性を設定)
 *   - "style.color" → BindingNodeStyle (colorスタイルを設定)
 *   - "state.user" → BindingNodeComponent (子コンポーネントのuserステートに値を渡す)
 *
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
    //  "popover": PopoverTarget,      // 将来の拡張用 / For future extension
    //  "commandfor": CommandForTarget, // 将来の拡張用 / For future extension
};
/**
 * バインディング対象ノードの種別（Element/Comment）とプロパティ名に応じて、
 * 適切なバインディングノード生成関数（CreateBindingNodeFn）を返す内部関数。
 *
 * 判定ロジック（優先順位順）:
 * 1. ノード種別とプロパティ名の完全一致で判定（nodePropertyConstructorByNameByIsComment）
 *    - Element: "class", "checkbox", "radio"
 *    - Comment: "if"
 *
 * 2. コメントノードで"for"の場合 → createBindingNodeFor
 *
 * 3. コメントノードで未知のプロパティ → エラー
 *
 * 4. プロパティ名の先頭部分で判定（nodePropertyConstructorByFirstName）
 *    - "class.xxx", "attr.xxx", "style.xxx", "state.xxx"
 *
 * 5. 要素ノードで"on"から始まる場合 → createBindingNodeEvent
 *    - 例: "onclick", "onchange", "onkeydown"
 *
 * 6. その他 → createBindingNodeProperty（汎用プロパティバインディング）
 *    - 例: "value", "textContent", "disabled", "innerHTML"
 *
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
 * @param isComment - コメントノードかどうか / Whether it's a comment node
 * @param isElement - 要素ノードかどうか / Whether it's an element node
 * @param propertyName - バインディングプロパティ名 / Binding property name
 * @returns バインディングノード生成関数 / Binding node creator function
 * @throws プロパティ名が不正な場合 / When property name is invalid
 */
function _getBindingNodeCreator(isComment, isElement, propertyName) {
    // ステップ1: ノード種別とプロパティ名の完全一致で専用生成関数を取得
    // Step 1: Get dedicated creator function by exact match of node type and property name
    const bindingNodeCreatorByName = nodePropertyConstructorByNameByIsComment[isComment ? 1 : 0][propertyName];
    if (typeof bindingNodeCreatorByName !== "undefined") {
        return bindingNodeCreatorByName;
    }
    // ステップ2: コメントノードで"for"の場合は専用の繰り返しバインディング
    // Step 2: For comment node with "for", use dedicated loop binding
    if (isComment && propertyName === "for") {
        return createBindingNodeFor;
    }
    // ステップ3: コメントノードで未対応のプロパティはエラー
    // （コメントノードで使えるのは "if" と "for" のみ）
    // Step 3: Error for unsupported properties on comment node
    // (Only "if" and "for" are allowed on comment nodes)
    if (isComment) {
        raiseError(`getBindingNodeCreator: unknown node property ${propertyName}`);
    }
    // ステップ4: プロパティ名の先頭部分（ドット区切りの最初）で判定
    // 例: "attr.src" → nameElements[0] = "attr"
    // Step 4: Determine by property name prefix (first part before dot)
    // Example: "attr.src" → nameElements[0] = "attr"
    const nameElements = propertyName.split(".");
    const bindingNodeCreatorByFirstName = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof bindingNodeCreatorByFirstName !== "undefined") {
        return bindingNodeCreatorByFirstName;
    }
    // ステップ5: 要素ノードで"on"から始まる場合はイベントバインディング
    // 例: "onclick", "onchange", "onsubmit"
    // Step 5: For element node starting with "on", use event binding
    // Examples: "onclick", "onchange", "onsubmit"
    if (isElement) {
        if (propertyName.startsWith("on")) {
            return createBindingNodeEvent;
        }
        else {
            // ステップ6a: その他の要素プロパティは汎用プロパティバインディング
            // 例: "value", "textContent", "disabled"
            // Step 6a: Other element properties use generic property binding
            // Examples: "value", "textContent", "disabled"
            return createBindingNodeProperty;
        }
    }
    else {
        // ステップ6b: 要素でもコメントでもない場合（Textノード等）も汎用バインディング
        // Step 6b: For nodes that are neither element nor comment (Text nodes, etc.), use generic binding
        return createBindingNodeProperty;
    }
}
/**
 * バインディングノード生成関数のキャッシュ
 * キー形式: "{isComment}\t{isElement}\t{propertyName}"
 *
 * 同じノード種別とプロパティ名の組み合わせが複数回使われる場合、
 * 判定ロジックを再実行せずキャッシュから取得してパフォーマンスを向上
 *
 * Cache for binding node creator functions
 * Key format: "{isComment}\t{isElement}\t{propertyName}"
 *
 * When the same combination of node type and property name is used multiple times,
 * retrieve from cache instead of re-executing decision logic to improve performance
 */
const _cache = {};
/**
 * ノード、プロパティ名、フィルタ、デコレータ情報から
 * 適切なバインディングノード生成関数を取得するファクトリ関数。
 *
 * 処理フロー:
 * 1. ノード種別を判定（Comment/Element）
 * 2. キャッシュキーを生成（"{isComment}\t{isElement}\t{propertyName}"）
 * 3. キャッシュを確認、存在しない場合は_getBindingNodeCreatorで取得してキャッシュ
 * 4. 取得した生成関数にプロパティ名、フィルタ、デコレータを渡して実行
 * 5. 実際のバインディングノード生成関数（CreateBindingNodeByNodeFn）を返す
 *
 * 使用例:
 * ```typescript
 * const node = document.querySelector('input');
 * const creator = getBindingNodeCreator(
 *   node,
 *   'value',
 *   [{ name: 'trim', options: [] }],
 *   ['required']
 * );
 * // creatorは (binding, node, filters) => BindingNodeProperty のような関数
 * ```
 *
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
 * @param node - バインディング対象のDOMノード / Target DOM node for binding
 * @param propertyName - バインディングプロパティ名（例: "value", "onclick", "attr.src"） / Binding property name (e.g., "value", "onclick", "attr.src")
 * @param filterTexts - 入力フィルタのメタデータ配列 / Array of input filter metadata
 * @param decorates - デコレータ配列（例: ["required", "trim"]） / Array of decorators (e.g., ["required", "trim"])
 * @returns 実際のバインディングノードインスタンスを生成する関数 / Function that creates actual binding node instance
 */
function getBindingNodeCreator(node, propertyName, filterTexts, decorates) {
    // ノード種別を判定
    // Determine node type
    const isComment = node instanceof Comment;
    const isElement = node instanceof Element;
    // キャッシュキーを生成（タブ区切りで連結）
    // Generate cache key (concatenate with tab separator)
    const key = isComment + "\t" + isElement + "\t" + propertyName;
    // キャッシュから取得、なければ新規に判定してキャッシュに保存
    // Get from cache, if not exists, determine and save to cache
    const fn = _cache[key] ?? (_cache[key] = _getBindingNodeCreator(isComment, isElement, propertyName));
    // 取得した生成関数にプロパティ名、フィルタ、デコレータを渡して実行
    // Execute obtained creator function with property name, filters, and decorates
    return fn(propertyName, filterTexts, decorates);
}

/**
 * BindingState クラスは、バインディング対象の状態（State）プロパティへのアクセス・更新・フィルタ適用を担当する実装です。
 *
 * アーキテクチャ:
 * - pattern, info: バインディング対象の状態プロパティパスとその構造情報
 * - filters: 値取得時に適用するフィルタ関数群
 * - ref: 状態プロパティ参照（ループやワイルドカードに応じて動的に解決）
 * - listIndex: ループバインディング時のインデックス情報
 *
 * 主な役割:
 * 1. バインディング対象の状態プロパティ（pattern, info）やリストインデックス（listIndex）を管理
 * 2. getValue で現在の値を取得、getFilteredValue でフィルタ適用後の値を取得
 * 3. assignValue で状態プロキシに値を書き込む（双方向バインディング対応）
 * 4. activate/inactivate でバインディング情報の登録・解除（依存解決や再描画の最適化）
 *
 * 設計ポイント:
 * - ワイルドカードパス（配列バインディング等）にも対応し、ループごとのインデックス管理が可能
 * - フィルタ適用は配列で柔軟に対応
 * - createBindingState ファクトリでフィルタ適用済みインスタンスを生成
 *
 * BindingState class is responsible for accessing, updating, and applying filters to the state (State) property targeted by the binding.
 *
 * Architecture:
 * - pattern, info: State property path targeted by binding and its structural info
 * - filters: Array of filter functions applied when retrieving value
 * - ref: State property reference (dynamically resolved for loops/wildcards)
 * - listIndex: Index info for loop bindings
 *
 * Main responsibilities:
 * 1. Manage state property targeted by binding (pattern, info) and list index (listIndex)
 * 2. getValue retrieves current value, getFilteredValue retrieves value after filter application
 * 3. assignValue writes value to state proxy (supports bidirectional binding)
 * 4. activate/inactivate registers/unregisters binding info (optimizes dependency resolution and redraw)
 *
 * Design points:
 * - Supports wildcard paths (array bindings), enables per-loop index management
 * - Flexible filter application via array
 * - createBindingState factory generates filter-applied instances
 */
class BindingState {
    binding;
    pattern;
    info;
    filters;
    isLoopIndex = false;
    #nullRef = null;
    #ref = null;
    #loopContext = null;
    /**
     * 現在のリストインデックス（ループバインディング時のみ有効）を返すgetter。
     * Getter to return current list index (valid only for loop bindings).
     */
    get listIndex() {
        return this.ref.listIndex;
    }
    /**
     * 状態プロパティ参照（IStatePropertyRef）を返すgetter。
     * - 通常: #nullRef（ワイルドカードなし）を返す
     * - ワイルドカードあり: #loopContext からインデックスを取得し、#refを動的に生成
     * - ループコンテキスト未初期化時はエラー
     *
     * Getter to return state property reference (IStatePropertyRef).
     * - Normal: returns #nullRef (no wildcard)
     * - With wildcard: gets index from #loopContext, dynamically generates #ref
     * - Throws error if loop context is uninitialized
     */
    get ref() {
        if (this.#nullRef === null) {
            // ワイルドカードバインディング時: ループコンテキストが必要
            if (this.#loopContext === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            }
            // #refが未生成なら生成
            if (this.#ref === null) {
                this.#ref = getStatePropertyRef(this.info, this.#loopContext.listIndex);
            }
            return this.#ref;
        }
        else {
            // 通常バインディング: #nullRefを返す
            return this.#nullRef ?? raiseError({
                code: 'BIND-201',
                message: 'ref is null',
                context: { pattern: this.pattern },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
    }
    /**
     * コンストラクタ。
     * - バインディング、パスパターン、フィルタ配列を受け取り初期化
     * - パターンから構造情報（info）を生成
     * - ワイルドカードなしの場合は #nullRef を即時生成
     *
     * Constructor.
     * - Initializes with binding, path pattern, and filter array
     * - Generates structural info (info) from pattern
     * - If no wildcard, immediately generates #nullRef
     */
    constructor(binding, pattern, filters) {
        this.binding = binding;
        this.pattern = pattern;
        this.info = getStructuredPathInfo(pattern);
        this.filters = filters;
        this.#nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
    }
    /**
     * 現在の値を取得するメソッド。
     * - engine.state, ref, state, handlerを使って値を取得
     *
     * Method to get current value.
     * - Uses engine.state, ref, state, handler to retrieve value
     */
    getValue(state, handler) {
        return getByRef(this.binding.engine.state, this.ref, state, handler);
    }
    /**
     * フィルタ適用後の値を取得するメソッド。
     * - getValueで取得した値にfilters配列を順次適用
     *
     * Method to get value after filter application.
     * - Sequentially applies filters array to value obtained by getValue
     */
    getFilteredValue(state, handler) {
        let value = getByRef(this.binding.engine.state, this.ref, state, handler);
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * 状態プロキシに値を書き込むメソッド（双方向バインディング用）。
     * - setByRefでengine.state, ref, value, writeState, handlerを使って書き込み
     *
     * Method to write value to state proxy (for bidirectional binding).
     * - Uses setByRef with engine.state, ref, value, writeState, handler
     */
    assignValue(writeState, handler, value) {
        setByRef(this.binding.engine.state, this.ref, value, writeState, handler);
    }
    /**
     * バインディングを有効化するメソッド。
     * - ワイルドカードバインディング時はループコンテキストを解決
     * - バインディング情報をエンジンに登録（依存解決・再描画最適化）
     *
     * Method to activate binding.
     * - Resolves loop context for wildcard bindings
     * - Registers binding info to engine (optimizes dependency resolution/redraw)
     */
    activate() {
        if (this.info.wildcardCount > 0) {
            // ワイルドカードバインディング: ループコンテキストを解決
            const lastWildcardPath = this.info.lastWildcardPath ??
                raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard last parentPath is null',
                    context: { where: 'BindingState.init', pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#loopContext = this.binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ??
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { where: 'BindingState.init', lastWildcardPath },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#ref = null; // ループインデックスが変わる可能性があるため毎回再解決
        }
        // バインディング情報をエンジンに登録
        this.binding.engine.saveBinding(this.ref, this.binding);
    }
    /**
     * バインディングを無効化するメソッド。
     * - バインディング情報をエンジンから解除
     * - #ref, #loopContextをクリア
     *
     * Method to inactivate binding.
     * - Unregisters binding info from engine
     * - Clears #ref and #loopContext
     */
    inactivate() {
        this.binding.engine.removeBinding(this.ref, this.binding);
        this.#ref = null;
        this.#loopContext = null;
    }
}
/**
 * BindingStateインスタンスを生成するファクトリ関数。
 * - name: バインディング対象の状態プロパティパス
 * - filterTexts: フィルタテキスト配列
 * - filters: フィルタ関数群（FilterWithOptions）
 *
 * Factory function to generate BindingState instance.
 * - name: State property path targeted by binding
 * - filterTexts: Array of filter texts
 * - filters: Array of filter functions (FilterWithOptions)
 */
const createBindingState = (name, filterTexts) => (binding, filters) => {
    // フィルタ関数群を生成（必要ならメモ化可能）
    // Generates filter functions (can be memoized if needed)
    const filterFns = createFilters(filters, filterTexts); // ToDo:ここは、メモ化できる
    return new BindingState(binding, name, filterFns);
};

/**
 * BindingStateIndex クラスは、forバインディング等のループ内で利用される
 * インデックス値（$1, $2, ...）のバインディング状態を管理する実装です。
 *
 * アーキテクチャ:
 * - indexNumber: パターン（例: "$1"）から抽出したインデックス番号（1始まり）
 * - #loopContext: 対応するループコンテキスト（activate時に解決）
 * - filters: 値取得時に適用するフィルタ関数群
 *
 * 主な役割:
 * 1. ループコンテキストからインデックス値を取得し、getValue/getFilteredValueで参照可能にする
 * 2. activate時にbindingsByListIndexへ自身を登録し、依存解決や再描画を効率化
 * 3. フィルタ適用にも対応
 *
 * 設計ポイント:
 * - pattern（例: "$1"）からインデックス番号を抽出し、ループコンテキストから該当インデックスを取得
 * - activateでループコンテキストやlistIndexRefを初期化し、バインディング情報をエンジンに登録
 * - assignValueは未実装（インデックスは書き換え不可のため）
 * - createBindingStateIndexファクトリでフィルタ適用済みインスタンスを生成
 *
 * BindingStateIndex class manages binding state for index values ($1, $2, ...) used in loops (e.g., for bindings).
 *
 * Architecture:
 * - indexNumber: Index number (1-based) extracted from pattern (e.g., "$1")
 * - #loopContext: Corresponding loop context (resolved in activate)
 * - filters: Array of filter functions applied when retrieving value
 *
 * Main responsibilities:
 * 1. Retrieve index value from loop context, make accessible via getValue/getFilteredValue
 * 2. Register self to bindingsByListIndex in activate, optimize dependency resolution/redraw
 * 3. Support filter application
 *
 * Design points:
 * - Extract index number from pattern (e.g., "$1"), retrieve corresponding index from loop context
 * - Initialize loop context and listIndexRef in activate, register binding info to engine
 * - assignValue is unimplemented (index is read-only)
 * - createBindingStateIndex factory generates filter-applied instance
 */
class BindingStateIndex {
    binding;
    indexNumber;
    filters;
    #loopContext = null;
    /**
     * pattern, info: インデックスバインディングでは未実装（参照不可）
     * pattern, info: Not implemented for index binding (not accessible)
     */
    get pattern() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.pattern' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    get info() {
        return raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingStateIndex.info' },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * 現在のリストインデックス（ループコンテキストから取得）
     * Getter for current list index (retrieved from loop context)
     */
    get listIndex() {
        return this.#loopContext?.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: { where: 'BindingStateIndex.listIndex' },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * 現在のリストインデックスのref（ループコンテキストから取得）
     * Getter for ref of current list index (retrieved from loop context)
     */
    get ref() {
        return this.#loopContext?.ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'BindingStateIndex.ref' },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    /**
     * インデックスバインディングであることを示すフラグ
     * Flag indicating this is an index binding
     */
    get isLoopIndex() {
        return true;
    }
    /**
     * コンストラクタ。
     * - pattern（例: "$1"）からインデックス番号を抽出（1始まり）
     * - フィルタ配列を保存
     * - patternが不正な場合はエラー
     *
     * Constructor.
     * - Extracts index number (1-based) from pattern (e.g., "$1")
     * - Saves filter array
     * - Throws error if pattern is invalid
     */
    constructor(binding, pattern, filters) {
        this.binding = binding;
        const indexNumber = Number(pattern.slice(1));
        if (isNaN(indexNumber)) {
            raiseError({
                code: 'BIND-202',
                message: 'Pattern is not a number',
                context: { where: 'BindingStateIndex.constructor', pattern },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        this.indexNumber = indexNumber;
        this.filters = filters;
    }
    /**
     * 現在のインデックス値を取得するメソッド。
     * - ループコンテキストからlistIndex.indexを取得
     * - 未初期化時はエラー
     *
     * Method to get current index value.
     * - Retrieves listIndex.index from loop context
     * - Throws error if uninitialized
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
     * フィルタ適用後のインデックス値を取得するメソッド。
     * - getValueで取得した値にfilters配列を順次適用
     *
     * Method to get index value after filter application.
     * - Sequentially applies filters array to value obtained by getValue
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
     * assignValueは未実装（インデックスは書き換え不可のため）。
     * assignValue is not implemented (index is read-only).
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
     * バインディングを有効化するメソッド。
     * - ループコンテキストを解決し、indexNumberに対応するものを取得
     * - bindingsByListIndexに自身を登録（依存解決・再描画最適化）
     *
     * Method to activate binding.
     * - Resolves loop context, retrieves one corresponding to indexNumber
     * - Registers self to bindingsByListIndex (optimizes dependency resolution/redraw)
     */
    activate() {
        const loopContext = this.binding.parentBindContent.currentLoopContext ??
            raiseError({
                code: 'BIND-201',
                message: 'LoopContext is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const loopContexts = loopContext.serialize();
        this.#loopContext = loopContexts[this.indexNumber - 1] ??
            raiseError({
                code: 'BIND-201',
                message: 'Current loopContext is null',
                context: { where: 'BindingStateIndex.init', indexNumber: this.indexNumber },
                docsUrl: '/docs/error-codes.md#bind',
            });
        const bindingForList = this.#loopContext.bindContent.parentBinding;
        if (bindingForList == null) {
            raiseError({
                code: 'BIND-201',
                message: 'Binding for list is null',
                context: { where: 'BindingStateIndex.init' },
                docsUrl: '/docs/error-codes.md#bind',
            });
        }
        // bindingsByListIndexに自身を登録
        // Register self to bindingsByListIndex
        const bindings = bindingForList.bindingsByListIndex.get(this.listIndex);
        if (typeof bindings === "undefined") {
            bindingForList.bindingsByListIndex.set(this.listIndex, new Set([this.binding]));
        }
        else {
            bindings.add(this.binding);
        }
    }
    /**
     * バインディングを無効化するメソッド。
     * - #loopContextをクリア
     *
     * Method to inactivate binding.
     * - Clears #loopContext
     */
    inactivate() {
        this.#loopContext = null;
    }
}
/**
 * BindingStateIndexインスタンスを生成するファクトリ関数。
 * - name: インデックスバインディングのパターン（例: "$1"）
 * - filterTexts: フィルタテキスト配列
 * - filters: フィルタ関数群（FilterWithOptions）
 *
 * Factory function to generate BindingStateIndex instance.
 * - name: Pattern for index binding (e.g., "$1")
 * - filterTexts: Array of filter texts
 * - filters: Array of filter functions (FilterWithOptions)
 *
 * @returns 生成されたBindingStateIndexインスタンス / Generated BindingStateIndex instance
 */
const createBindingStateIndex = (name, filterTexts) => (binding, filters) => {
    // フィルタ関数群を生成（必要ならメモ化可能）
    // Generates filter functions (can be memoized if needed)
    const filterFns = createFilters(filters, filterTexts); // ToDo:ここは、メモ化できる
    return new BindingStateIndex(binding, name, filterFns);
};

/**
 * ループコンテキスト内のインデックス参照を判定するための正規表現
 * パターン: "$" + 数字（例: "$1", "$2", "$3"）
 *
 * 階層構造（1始まり、外側から内側へ）:
 * - "$1": 最も外側のループのインデックス
 * - "$2": 1つ内側のループのインデックス
 * - "$3": さらに内側のループのインデックス
 *
 * 使用例（ネストしたループ）:
 * ```
 * <ul data-bind="for:categories">              ← $1
 *   <li>
 *     <ul data-bind="for:categories.*.items">  ← $2 (親リストの要素が子リストを持つ)
 *       <li data-bind="text:$1">...            ← categoriesのインデックス
 *       <li data-bind="text:$2">...            ← itemsのインデックス
 *     </ul>
 *   </li>
 * </ul>
 * ```
 *
 * 注: ネストしたループでは、子リストは必ず親リストの要素のプロパティとして定義される
 * （例: categories.*.items は categories[i].items を意味する）
 *
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
 * バインディング対象の状態プロパティ名とフィルタ情報から、
 * 適切なバインディング状態生成関数（CreateBindingStateByStateFn）を返すファクトリ関数。
 *
 * 判定ロジック:
 * 1. プロパティ名が "$数字" 形式か正規表現でチェック
 *    - マッチした場合: createBindingStateIndex を使用
 *      ループインデックスバインディング（例: for文内の $1, $2）
 *    - マッチしない場合: createBindingState を使用
 *      通常の状態プロパティバインディング（例: user.name）
 *
 * 2. フィルタ情報を渡して生成関数を実行
 *
 * 3. 実際のバインディング状態インスタンスを生成する関数を返す
 *
 * 使用例:
 * ```typescript
 * // 通常のプロパティバインディング
 * const creator1 = getBindingStateCreator('user.name', []);
 * // creator1は通常のBindingStateを生成
 *
 * // 最も外側のループインデックスバインディング
 * const creator2 = getBindingStateCreator('$1', []);
 * // creator2はBindingStateIndexを生成（最も外側のループのインデックス値にアクセス）
 *
 * // ネストしたループの内側のインデックス
 * const creator3 = getBindingStateCreator('$2', []);
 * // creator3は1つ内側のループのインデックスにアクセス
 * ```
 *
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
 * @param name - バインディング対象の状態プロパティ名（例: "user.name", "$1", "$2"） / Target state property name (e.g., "user.name", "$1", "$2")
 * @param filterTexts - 出力フィルタのメタデータ配列（ノード→状態方向） / Array of output filter metadata (node→state direction)
 * @returns 実際のバインディング状態インスタンスを生成する関数 / Function that creates actual binding state instance
 */
function getBindingStateCreator(name, filterTexts) {
    // プロパティ名が "$数字" 形式かチェック
    // Check if property name matches "$digit" pattern
    if (ereg.test(name)) {
        // ループインデックスバインディング用の生成関数を返す
        // "$1" → 最も外側のループインデックス（1始まり）
        // "$2" → 1つ内側のループインデックス
        // "$3" → さらに内側のループインデックス
        // ...以降も同様に内側へ進む
        // Return creator function for loop index binding
        // "$1" → Outermost loop index (1-based)
        // "$2" → One level inner loop index
        // "$3" → Further inner loop index
        // ...and so on, proceeding inward
        return createBindingStateIndex(name, filterTexts);
    }
    else {
        // 通常のプロパティ名の場合は標準のバインディング状態生成関数を返す
        // 例: "user.name", "items", "isVisible"
        // Return standard binding state creator function for normal property names
        // Examples: "user.name", "items", "isVisible"
        return createBindingState(name, filterTexts);
    }
}

/**
 * コメントマークの長さをキャッシュ（パフォーマンス最適化）
 * Cache comment mark lengths (performance optimization)
 */
const COMMENT_EMBED_MARK_LEN = COMMENT_EMBED_MARK.length;
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;
/**
 * ノード種別ごとにdata-bindテキスト（バインディング定義文字列）を取得するユーティリティ関数。
 * テンプレート前処理でマスタッシュ構文やコメントバインディングがどのように変換されたかに応じて、
 * 適切な方法でバインディング式を抽出します。
 *
 * ノード種別ごとの処理:
 * 1. Text: コメントから復元されたテキストノード
 *    - COMMENT_EMBED_MARK（例: "@@:"）以降のテキストを取得
 *    - "textContent:"プレフィックスを付与してバインディング式化
 *    - 例: "@@:user.name" → "textContent:user.name"
 *
 * 2. HTMLElement: 通常のHTML要素
 *    - data-bind属性の値をそのまま取得
 *    - 例: <div data-bind="class:active"> → "class:active"
 *
 * 3. Template: テンプレート参照用コメント
 *    - COMMENT_TEMPLATE_MARK（例: "@@|"）以降のテンプレートIDを抽出
 *    - IDからテンプレートを取得し、そのdata-bind属性値を返す
 *    - 例: "@@|123 if:isVisible" → テンプレート123のdata-bind属性
 *
 * 4. SVGElement: SVG要素
 *    - data-bind属性の値をそのまま取得（HTML要素と同様）
 *
 * 使用例:
 * ```typescript
 * // テキストノード（マスタッシュ構文から変換）
 * const text = document.createTextNode("@@:user.name");
 * getDataBindText("Text", text); // → "textContent:user.name"
 *
 * // HTML要素
 * const div = document.createElement("div");
 * div.setAttribute("data-bind", "class:active");
 * getDataBindText("HTMLElement", div); // → "class:active"
 *
 * // テンプレート参照コメント
 * const comment = document.createComment("@@|123 if:isVisible");
 * getDataBindText("Template", comment); // → テンプレート123のdata-bind値
 * ```
 *
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
 * @param nodeType - ノード種別（"Text" | "HTMLElement" | "Template" | "SVGElement"） / Node type
 * @param node - 対象ノード / Target node
 * @returns バインディング定義文字列（空文字列の可能性あり） / Binding definition string (may be empty string)
 */
function getDataBindText(nodeType, node) {
    switch (nodeType) {
        case "Text": {
            // ケース1: Textノード（マスタッシュ構文から変換されたもの）
            // コメントマーク（例: "@@:"）以降のテキストを取得してtrim
            // "textContent:"プレフィックスを付与してバインディング式化
            // Case 1: Text node (converted from mustache syntax)
            // Get text after comment mark (e.g., "@@:") and trim
            // Add "textContent:" prefix to create binding expression
            const text = node.textContent?.slice(COMMENT_EMBED_MARK_LEN).trim() ?? "";
            return "textContent:" + text;
        }
        case "HTMLElement": {
            // ケース2: HTMLElement（通常のHTML要素）
            // data-bind属性の値をそのまま返す
            // 属性が存在しない場合は空文字列
            // Case 2: HTMLElement (regular HTML element)
            // Return data-bind attribute value as-is
            // Return empty string if attribute doesn't exist
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "Template": {
            // ケース3: Template（テンプレート参照用コメントノード）
            // コメントテキストの形式: "@@|123 if:isVisible" のような形式
            // ステップ1: コメントマーク以降のテキストを取得
            // Case 3: Template (template reference comment node)
            // Comment text format: "@@|123 if:isVisible" format
            // Step 1: Get text after comment mark
            const text = node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN).trim();
            // ステップ2: スペース区切りで分割し、最初の要素をテンプレートIDとして取得
            // 例: "123 if:isVisible" → idText = "123"
            // Step 2: Split by space and get first element as template ID
            // Example: "123 if:isVisible" → idText = "123"
            const [idText,] = text?.split(' ', 2) ?? [];
            const id = Number(idText);
            // ステップ3: IDからテンプレート要素を取得
            // Step 3: Get template element by ID
            const template = getTemplateById(id);
            // ステップ4: テンプレートのdata-bind属性値を返す
            // テンプレート自体が持つバインディング定義（例: "if:isVisible", "for:items"）
            // Step 4: Return data-bind attribute value of template
            // Binding definition that template itself has (e.g., "if:isVisible", "for:items")
            return template.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "SVGElement": {
            // ケース4: SVGElement（SVG要素）
            // HTML要素と同様にdata-bind属性の値をそのまま返す
            // Case 4: SVGElement (SVG element)
            // Return data-bind attribute value as-is, same as HTML element
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        default:
            // その他のノード種別（通常は到達しない）
            // 空文字列を返す
            // Other node types (normally unreachable)
            // Return empty string
            return "";
    }
}

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
const createNodeKey = (node) => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");
const nodeTypeByNodeKey = {};
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
const getNodeTypeByNode = (node) => (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" :
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
function getNodeType(node, nodeKey = createNodeKey(node)) {
    // キャッシュを確認し、なければ判定してキャッシュに保存
    // Check cache, if not exists, determine and save to cache
    return nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
}

/**
 * 文字列の前後の空白を除去するヘルパー関数
 * Helper function to trim whitespace from string
 */
const trim = (s) => s.trim();
/**
 * 文字列が空でないかチェックするヘルパー関数
 * Helper function to check if string is not empty
 */
const has = (s) => s.length > 0;
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
const decode = (s) => {
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
const parseFilter = (text) => {
    // カンマ区切りで分割し、最初がフィルター名、残りがオプション
    // Split by comma, first is filter name, rest are options
    const [name, ...options] = text.split(",").map(trim);
    return { name, options: options.map(decode) };
};
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
const parseProperty = (text) => {
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
const parseExpression = (expression) => {
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
const parseExpressions = (text) => {
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
const cache = {};
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
function parseBindText(text) {
    // 空文字列の場合は即座に空配列を返す（パフォーマンス最適化）
    // Return empty array immediately for empty string (performance optimization)
    if (text.trim() === "") {
        return [];
    }
    // キャッシュを確認し、なければパースしてキャッシュに保存
    // Check cache, if not exists, parse and save to cache
    return cache[text] ?? (cache[text] = parseExpressions(text));
}

/**
 * data-bind 属性名の定数
 * Constant for data-bind attribute name
 */
const DATASET_BIND_PROPERTY = 'data-bind';
/**
 * Element ノードから data-bind 属性を削除する内部関数。
 * HTMLElement と SVGElement の両方で共通して使用される。
 *
 * 処理フロー:
 * 1. ノードを Element 型にキャスト
 * 2. removeAttribute で data-bind 属性を削除
 *
 * Internal function to remove data-bind attribute from Element node.
 * Commonly used for both HTMLElement and SVGElement.
 *
 * Processing flow:
 * 1. Cast node to Element type
 * 2. Remove data-bind attribute with removeAttribute
 *
 * @param node - 対象ノード / Target node
 */
const removeAttributeFromElement = (node) => {
    const element = node;
    element.removeAttribute(DATASET_BIND_PROPERTY);
};
/**
 * ノードタイプごとの属性削除関数のマップ。
 *
 * 削除対象:
 * - HTMLElement: data-bind 属性を削除
 * - SVGElement: data-bind 属性を削除
 *
 * 削除非対象:
 * - Text: 属性を持たないため undefined
 * - Template: テンプレート自体は削除対象外のため undefined
 *
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
 * 指定ノードから data-bind 属性を削除するユーティリティ関数。
 *
 * ノードタイプに応じた適切な削除処理を実行する。
 * - HTMLElement, SVGElement: data-bind 属性を削除
 * - Text, Template: 何もしない（属性を持たない、または削除対象外）
 *
 * オプショナルチェーン（?.）を使用することで、
 * undefined の場合は何も実行されず安全に処理される。
 *
 * 処理フロー:
 * 1. nodeType に対応する削除関数を removeAttributeByNodeType から取得
 * 2. 関数が存在する場合のみ実行（HTMLElement, SVGElement）
 * 3. 関数が undefined の場合は何もしない（Text, Template）
 *
 * 使用例:
 * ```typescript
 * // HTMLElement の場合
 * const div = document.createElement('div');
 * div.setAttribute('data-bind', 'textContent:user.name');
 * removeDataBindAttribute(div, 'HTMLElement');
 * // → data-bind 属性が削除される
 *
 * // SVGElement の場合
 * const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 * svg.setAttribute('data-bind', 'class:active');
 * removeDataBindAttribute(svg, 'SVGElement');
 * // → data-bind 属性が削除される
 *
 * // Text ノードの場合
 * const text = document.createTextNode('Hello');
 * removeDataBindAttribute(text, 'Text');
 * // → 何もしない（属性を持たない）
 *
 * // Template の場合
 * const template = document.createElement('template');
 * removeDataBindAttribute(template, 'Template');
 * // → 何もしない（削除対象外）
 * ```
 *
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
 * @param node - 対象ノード / Target node
 * @param nodeType - ノードタイプ（"HTMLElement" | "SVGElement" | "Text" | "Template"） / Node type
 */
function removeDataBindAttribute(node, nodeType) {
    // ノードタイプに対応する削除関数を実行（存在しない場合は何もしない）
    // Execute removal function corresponding to node type (do nothing if not exists)
    return removeAttributeByNodeType[nodeType]?.(node);
}

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
const replaceTextNodeText = (node) => {
    // ステップ1: 空のテキストノードを作成
    // Step 1: Create empty text node
    const textNode = document.createTextNode("");
    // ステップ2: 親ノードでコメントノードを置換
    // Step 2: Replace comment node in parent node
    node.parentNode?.replaceChild(textNode, node);
    // ステップ3: 新しいテキストノードを返す
    // Step 3: Return new text node
    return textNode;
};
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
const replaceTextNodeFn = {
    Text: replaceTextNodeText,
    HTMLElement: undefined,
    Template: undefined,
    SVGElement: undefined
};
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
function replaceTextNodeFromComment(node, nodeType) {
    // ノードタイプに対応する置換関数を実行（存在しない場合は元のノードを返す）
    // Execute replacement function corresponding to node type (return original node if not exists)
    return replaceTextNodeFn[nodeType]?.(node) ?? node;
}

/**
 * DataBindAttributesクラスは、DOMノードからバインディング情報を抽出・解析し、
 * バインディング生成に必要な情報（ノード種別・パス・バインドテキスト・クリエイター）を管理します。
 *
 * 主な処理フロー:
 * 1. ノード種別の判定（HTMLElement/SVGElement/Text/Template）
 * 2. data-bind属性またはコメントからバインディング式を抽出
 * 3. コメントノードの場合、Textノードに置換（テンプレート前処理の復元）
 * 4. 処理済みdata-bind属性を削除（重複処理防止）
 * 5. ノードの絶対パスを計算（親からのインデックス配列）
 * 6. バインディング式をパースし構造化（プロパティ、フィルタ、デコレータ）
 * 7. 各バインドテキストに対応するファクトリ関数ペアを生成
 *    - createBindingNode: ランタイムBindingNodeインスタンス生成用
 *    - createBindingState: ランタイムBindingStateインスタンス生成用
 *
 * これにより、テンプレート内のバインディング定義を一元的に管理し、
 * 後続のバインディング構築処理を効率化します。
 *
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
    /** ノードの種別（HTMLElement/SVGElement/Text/Template） / Node type classification */
    nodeType;
    /** ノードの絶対パス（親からのインデックス配列） / Absolute path from template root (index array) */
    nodePath;
    /** パース済みバインディング式の配列 / Array of parsed binding expressions */
    bindTexts;
    /** バインドテキストから対応するファクトリ関数ペアへのマップ / Map from bind text to factory function pairs */
    creatorByText = new Map();
    constructor(node) {
        // ステップ1: ノード種別を判定
        // Step 1: Determine node type
        this.nodeType = getNodeType(node);
        // ステップ2: data-bind属性またはコメントからバインディング式を抽出
        // Step 2: Extract binding expression from data-bind attribute or comment
        const text = getDataBindText(this.nodeType, node);
        // ステップ3: コメントノードの場合はTextノードに置換
        // （テンプレート前処理でTextノード→コメントに変換されたものを復元）
        // 注意: template.contentが直接書き換わる
        // Step 3: Replace comment nodes with Text nodes
        // (Restores Text nodes that were converted to comments during template preprocessing)
        // Note: Directly modifies template.content
        node = replaceTextNodeFromComment(node, this.nodeType);
        // ステップ4: data-bind属性を削除（パース完了後は不要、重複処理を防止）
        // Step 4: Remove data-bind attribute (no longer needed after parsing, prevents duplicate processing)
        removeDataBindAttribute(node, this.nodeType);
        // ステップ5: ノードの絶対パスを計算（親ノードからのインデックス配列）
        // Step 5: Calculate absolute node path (index array from parent nodes)
        this.nodePath = getAbsoluteNodePath(node);
        // ステップ6: バインディング式をパースし、構造化されたメタデータに変換
        // （nodeProperty, stateProperty, filters, decorates を含む IBindText 配列）
        // Step 6: Parse binding expression into structured metadata
        // (Array of IBindText containing nodeProperty, stateProperty, filters, decorates)
        this.bindTexts = parseBindText(text);
        // ステップ7: 各バインドテキストごとにランタイムインスタンス生成用のファクトリ関数ペアを作成
        // Step 7: Create factory function pairs for runtime instance generation for each bind text
        for (let i = 0; i < this.bindTexts.length; i++) {
            const bindText = this.bindTexts[i];
            // ファクトリ関数ペアを生成:
            // - createBindingNode: BindingNodeサブクラス（Attribute/Event/For/If等）のファクトリ
            // - createBindingState: BindingStateサブクラス（通常/Index/Component等）のファクトリ
            // Generate factory function pair:
            // - createBindingNode: Factory for BindingNode subclass (Attribute/Event/For/If, etc.)
            // - createBindingState: Factory for BindingState subclass (normal/Index/Component, etc.)
            const creator = {
                createBindingNode: getBindingNodeCreator(node, bindText.nodeProperty, // 例: "value", "textContent", "for", "if"
                bindText.inputFilterTexts, // 入力フィルタ（状態→ノード方向）
                bindText.decorates // デコレータ（"required", "trim" 等）
                ),
                createBindingState: getBindingStateCreator(bindText.stateProperty, // 例: "user.name", "items", "isVisible"
                bindText.outputFilterTexts // 出力フィルタ（ノード→状態方向）
                ),
            };
            // バインドテキストとファクトリ関数ペアを関連付けて保存
            // Associate bind text with factory function pair
            this.creatorByText.set(bindText, creator);
        }
    }
}
/**
 * 指定ノードからDataBindAttributesインスタンスを生成するファクトリ関数。
 * テンプレートコンパイル時に各data-bind対象ノードに対して呼び出されます。
 *
 * Factory function that creates a DataBindAttributes instance from the specified node.
 * Called for each data-bind target node during template compilation.
 *
 * @param node - バインディング情報を抽出するDOMノード / DOM node to extract binding information from
 * @returns バインディングメタデータを含むIDataBindAttributesオブジェクト / IDataBindAttributes object containing binding metadata
 */
function createDataBindAttributes(node) {
    return new DataBindAttributes(node);
}

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
function isCommentNode(node) {
    return node instanceof Comment && ((node.textContent?.indexOf(COMMENT_EMBED_MARK) === 0) ||
        (node.textContent?.indexOf(COMMENT_TEMPLATE_MARK) === 0));
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
function getNodesHavingDataBind(root) {
    // 結果を格納する配列
    // Array to store results
    const nodes = [];
    // TreeWalkerを生成（要素ノードとコメントノードを走査対象にする）
    // Create TreeWalker (target element and comment nodes)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT, {
        // カスタムフィルタ: 各ノードに対してACCEPT/SKIPを判定
        // Custom filter: Determine ACCEPT/SKIP for each node
        acceptNode(node) {
            // Element（要素）の場合
            // Case: Element
            if (node instanceof Element) {
                // data-bind属性を持つ場合のみACCEPT、それ以外はSKIP
                // ACCEPT only if has data-bind attribute, otherwise SKIP
                return node.hasAttribute(DATA_BIND_ATTRIBUTE)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
            else {
                // Comment（コメント）の場合
                // isCommentNodeで "@@:" または "@@|" で始まるかチェック
                // Case: Comment
                // Check with isCommentNode if starts with "@@:" or "@@|"
                return isCommentNode(node)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
        }
    });
    // TreeWalkerで次のノードへ順次移動し、合致したノードを配列に追加
    // Move to next node with TreeWalker and add matching nodes to array
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }
    // バインディング対象ノードの配列を返す
    // Return array of binding target nodes
    return nodes;
}

/**
 * テンプレート ID ごとのバインディング属性リストのキャッシュ。
 * テンプレートが登録されると、そのテンプレート内の全バインディング情報を格納。
 *
 * Cache of binding attribute lists per template ID.
 * When a template is registered, stores all binding information within that template.
 */
const listDataBindAttributesById = {};
/**
 * テンプレート ID ごとの "for" バインディングの stateProperty 集合のキャッシュ。
 * ループ（リスト）に関連する状態パスを特定するために使用。
 *
 * 例: "for:items" → listPathsSetById[id] に "items" が追加される
 *
 * Cache of "for" binding stateProperty sets per template ID.
 * Used to identify state paths related to loops (lists).
 *
 * Example: "for:items" → "items" is added to listPathsSetById[id]
 */
const listPathsSetById = {};
/**
 * テンプレート ID ごとの全バインディングの stateProperty 集合のキャッシュ。
 * テンプレート内で参照される全ての状態パスを追跡。
 *
 * 例: "textContent:user.name", "value:email" → pathsSetById[id] に "user.name", "email" が追加
 *
 * Cache of all binding stateProperty sets per template ID.
 * Tracks all state paths referenced within the template.
 *
 * Example: "textContent:user.name", "value:email" → "user.name", "email" are added to pathsSetById[id]
 */
const pathsSetById = {};
/**
 * テンプレートの DocumentFragment から data-bind 対象ノードを抽出し、
 * IDataBindAttributes の配列へ変換する内部ユーティリティ関数。
 *
 * 処理フロー:
 * 1. getNodesHavingDataBind でバインディングを持つノードを抽出
 * 2. 各ノードを createDataBindAttributes で属性情報に変換
 * 3. IDataBindAttributes 配列として返す
 *
 * Internal utility function that extracts data-bind target nodes from template's DocumentFragment
 * and converts them to IDataBindAttributes array.
 *
 * Processing flow:
 * 1. Extract nodes with bindings using getNodesHavingDataBind
 * 2. Convert each node to attribute information using createDataBindAttributes
 * 3. Return as IDataBindAttributes array
 *
 * @param content - テンプレートの DocumentFragment / Template's DocumentFragment
 * @returns バインディング属性情報の配列 / Array of binding attribute information
 */
function getDataBindAttributesFromTemplate(content) {
    // ステップ1: バインディングを持つ全ノードを取得
    // Step 1: Get all nodes with bindings
    const nodes = getNodesHavingDataBind(content);
    // ステップ2: 各ノードを属性情報に変換
    // Step 2: Convert each node to attribute information
    return nodes.map(node => createDataBindAttributes(node));
}
/**
 * テンプレート内のバインディング情報（data-bind 属性やコメント）を解析・登録し、
 * テンプレート ID ごとに属性リストと状態パス集合を構築してキャッシュする。
 *
 * 主な機能:
 * 1. テンプレート内の全バインディングノードを検出・変換
 * 2. 全バインディングの stateProperty を pathsSetById に登録
 * 3. "for" バインディングの stateProperty を listPathsSetById にも登録
 * 4. 解析結果を listDataBindAttributesById にキャッシュ
 *
 * rootId パラメータ:
 * - テンプレートが入れ子の場合、ルートテンプレートの ID を指定
 * - 状態パス集合はルート ID でまとめて管理される
 * - 省略時は id が rootId として使用される
 *
 * 処理フロー:
 * 1. getDataBindAttributesFromTemplate でバインディング情報を抽出
 * 2. rootId に対応する paths と listPaths の Set を取得（初回は新規作成）
 * 3. 各バインディング属性を走査:
 *    a. 各 bindText の stateProperty を paths に追加
 *    b. nodeProperty が "for" の場合、listPaths にも追加
 * 4. 解析結果を listDataBindAttributesById[id] に保存して返す
 *
 * 使用例:
 * ```typescript
 * // テンプレート HTML:
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
 * // 結果:
 * // listDataBindAttributesById[1] = [
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "user.name", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "for", stateProperty: "items", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "name", ... }], ... }
 * // ]
 * // pathsSetById[1] = Set { "user.name", "items", "name" }
 * // listPathsSetById[1] = Set { "items" }
 * ```
 *
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
 * Usage example:
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
 * @param id - テンプレート ID / Template ID
 * @param content - テンプレートの DocumentFragment / Template's DocumentFragment
 * @param rootId - ルートテンプレート ID（省略時は id と同じ） / Root template ID (defaults to id if omitted)
 * @returns 解析済みバインディング属性リスト / Parsed binding attribute list
 */
function registerDataBindAttributes(id, content, rootId = id) {
    // ステップ1: テンプレートから全バインディング情報を抽出
    // Step 1: Extract all binding information from template
    const dataBindAttributes = getDataBindAttributesFromTemplate(content);
    // ステップ2: rootId に対応する状態パス集合を取得（初回は新規作成）
    // Step 2: Get state path sets corresponding to rootId (create new if first time)
    const paths = pathsSetById[rootId] ?? (pathsSetById[rootId] = new Set());
    const listPaths = listPathsSetById[rootId] ?? (listPathsSetById[rootId] = new Set());
    // ステップ3: 各バインディング属性を走査し、状態パスを登録
    // Step 3: Traverse each binding attribute and register state paths
    for (let i = 0; i < dataBindAttributes.length; i++) {
        const attribute = dataBindAttributes[i];
        // 各バインディングテキストの stateProperty を処理
        // Process stateProperty of each binding text
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            // 全バインディングの stateProperty を paths に追加
            // Add stateProperty of all bindings to paths
            paths.add(bindText.stateProperty);
            // "for" バインディング（ループ）の場合は listPaths にも追加
            // If "for" binding (loop), also add to listPaths
            if (bindText.nodeProperty === "for") {
                listPaths.add(bindText.stateProperty);
            }
        }
    }
    // ステップ4: 解析結果をキャッシュに保存して返す
    // Step 4: Save parse result to cache and return
    return listDataBindAttributesById[id] = dataBindAttributes;
}
/**
 * テンプレート ID から登録済みバインディング属性リストを取得する。
 *
 * registerDataBindAttributes で登録されたテンプレートの
 * バインディング情報を取得する際に使用。
 *
 * 使用例:
 * ```typescript
 * registerDataBindAttributes(1, template.content);
 * const attributes = getDataBindAttributesById(1);
 * // → [{ bindTexts: [...], nodeType: "Element", nodePath: [...], ... }]
 * ```
 *
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
 * @param id - テンプレート ID / Template ID
 * @returns バインディング属性リスト / Binding attribute list
 */
const getDataBindAttributesById = (id) => {
    return listDataBindAttributesById[id];
};
/**
 * テンプレート ID から "for" バインディング（ループ）の stateProperty 集合を取得する。
 *
 * ループに関連する状態パスを特定するために使用。
 * 登録されていない場合は空配列を返す。
 *
 * 使用例:
 * ```typescript
 * // テンプレート内に <!-- @@:for:items --> があるとする
 * registerDataBindAttributes(1, template.content);
 * const listPaths = getListPathsSetById(1);
 * // → Set { "items" }
 *
 * // ループ状態の変更を監視
 * if (listPaths.has("items")) {
 *   // items が配列であることを前提とした処理
 * }
 * ```
 *
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
 * @param id - テンプレート ID / Template ID
 * @returns "for" バインディングの状態パス集合（未登録時は空配列） / State path set of "for" bindings (empty array if not registered)
 */
const getListPathsSetById = (id) => {
    return listPathsSetById[id] ?? [];
};
/**
 * テンプレート ID から全バインディングの stateProperty 集合を取得する。
 *
 * テンプレート内で参照される全ての状態パスを追跡するために使用。
 * 登録されていない場合は空配列を返す。
 *
 * 使用例:
 * ```typescript
 * // テンプレート内に以下のバインディングがあるとする:
 * // - textContent:user.name
 * // - value:email
 * // - for:items
 * registerDataBindAttributes(1, template.content);
 * const allPaths = getPathsSetById(1);
 * // → Set { "user.name", "email", "items" }
 *
 * // 状態の変更監視
 * if (allPaths.has("user.name")) {
 *   // user.name の変更を処理
 * }
 * ```
 *
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
 * @param id - テンプレート ID / Template ID
 * @returns 全バインディングの状態パス集合（未登録時は空配列） / State path set of all bindings (empty array if not registered)
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
 * Binding クラスは、1つのバインディング（DOMノードと状態の対応関係）を管理する中核的な実装です。
 *
 * アーキテクチャ:
 * - BindingNode: DOM操作を担当（属性、プロパティ、イベント、構造制御など）
 * - BindingState: 状態参照の解決と値の取得・設定を担当
 * - 両者を協調させてリアクティブなバインディングを実現
 *
 * 主な役割:
 * 1. バインディング構造の初期化:
 *    - ファクトリ関数（createBindingNode, createBindingState）を使用してインスタンス生成
 *    - 適切な BindingNode 型（属性、プロパティ、イベント等）を選択
 *    - BindingState を構築し、状態参照を解決
 * 2. 変更適用の制御:
 *    - applyChange で Renderer から呼び出され、変更を BindingNode に委譲
 *    - 二重更新防止（renderer.updatedBindings でチェック）
 *    - 動的依存関係の最適化処理
 * 3. 状態値の更新:
 *    - updateStateValue で双方向バインディングをサポート
 *    - BindingState を介して状態プロキシに値を反映
 * 4. ライフサイクル管理:
 *    - activate/inactivate でバインディングの有効化・無効化
 *    - 子 BindContent の管理（bindContents getter）
 * 5. 再描画通知:
 *    - notifyRedraw で BindingNode に再描画を通知
 *
 * パフォーマンス最適化:
 * - 二重更新防止: updatedBindings セットで重複チェック
 * - 単一バインディング最適化: 動的依存でない単一 ref は processedRefs に追加
 * - ループインデックス管理: bindingsByListIndex で WeakMap キャッシュ
 *
 * 設計パターン:
 * - Factory Pattern: createBindingNode/State でインスタンス生成を委譲
 * - Strategy Pattern: 異なる BindingNode 型を統一インターフェースで扱う
 * - Observer Pattern: 状態変更を BindingNode に通知
 *
 * Binding class is the core implementation managing one binding (correspondence between DOM node and state).
 *
 * Architecture:
 * - BindingNode: Handles DOM operations (attributes, properties, events, structural control, etc.)
 * - BindingState: Handles state reference resolution and value get/set
 * - Coordinates both to achieve reactive binding
 *
 * Main responsibilities:
 * 1. Binding structure initialization:
 *    - Generate instances using factory functions (createBindingNode, createBindingState)
 *    - Select appropriate BindingNode type (attribute, property, event, etc.)
 *    - Construct BindingState and resolve state references
 * 2. Change application control:
 *    - Called from Renderer via applyChange, delegates changes to BindingNode
 *    - Duplicate update prevention (check via renderer.updatedBindings)
 *    - Dynamic dependency optimization processing
 * 3. State value update:
 *    - Support bidirectional binding via updateStateValue
 *    - Reflect values to state proxy through BindingState
 * 4. Lifecycle management:
 *    - Enable/disable bindings via activate/inactivate
 *    - Manage child BindContent (bindContents getter)
 * 5. Redraw notification:
 *    - Notify BindingNode of redraw via notifyRedraw
 *
 * Performance optimization:
 * - Duplicate update prevention: Check duplicates with updatedBindings set
 * - Single binding optimization: Add non-dynamic single ref to processedRefs
 * - Loop index management: WeakMap cache with bindingsByListIndex
 *
 * Design patterns:
 * - Factory Pattern: Delegate instance generation to createBindingNode/State
 * - Strategy Pattern: Handle different BindingNode types with unified interface
 * - Observer Pattern: Notify BindingNode of state changes
 */
class Binding {
    /** 親 BindContent への参照（このバインディングが属する BindContent） / Reference to parent BindContent (BindContent this binding belongs to) */
    parentBindContent;
    /** バインディング対象の DOM ノード / Target DOM node for binding */
    node;
    /** コンポーネントエンジンへの参照（フィルター、パス管理等にアクセス） / Reference to component engine (access to filters, path management, etc.) */
    engine;
    /** DOM 操作を担当するバインディングノード / Binding node responsible for DOM operations */
    bindingNode;
    /** 状態参照の解決と値の取得・設定を担当 / Responsible for state reference resolution and value get/set */
    bindingState;
    /** バージョン番号（現在未使用、将来の最適化用） / Version number (currently unused, for future optimization) */
    version;
    /** リストインデックスごとのバインディングセット（WeakMapでメモリリーク防止） / Binding set per list index (WeakMap prevents memory leaks) */
    bindingsByListIndex = new WeakMap();
    /** バインディングが有効化されているかどうか / Whether binding is activated */
    isActive = false;
    /**
     * Binding のコンストラクタ。
     *
     * 初期化処理フロー:
     * 1. 親 BindContent、ノード、エンジンへの参照を保存
     * 2. createBindingNode ファクトリを呼び出して BindingNode を生成
     *    - ノードタイプ（属性、プロパティ、イベント等）に応じた適切な実装を返す
     *    - 入力フィルター（inputFilters）を渡して値の変換を可能にする
     * 3. createBindingState ファクトリを呼び出して BindingState を生成
     *    - 状態参照を解決し、値の取得・設定インターフェースを提供
     *    - 出力フィルター（outputFilters）を渡して値の変換を可能にする
     *
     * ファクトリパターンの利点:
     * - バインディングタイプ（属性、プロパティ、イベント等）の選択を外部に委譲
     * - 柔軟な拡張性（新しいバインディングタイプの追加が容易）
     * - テスタビリティ向上（モックファクトリの注入が可能）
     *
     * 注意事項:
     * - コンストラクタ実行後、activate() を呼び出して有効化する必要がある
     * - bindingNode と bindingState は相互に参照する場合がある
     *
     * Binding constructor.
     *
     * Initialization processing flow:
     * 1. Save references to parent BindContent, node, and engine
     * 2. Call createBindingNode factory to generate BindingNode
     *    - Returns appropriate implementation based on node type (attribute, property, event, etc.)
     *    - Pass inputFilters to enable value conversion
     * 3. Call createBindingState factory to generate BindingState
     *    - Resolve state references and provide value get/set interface
     *    - Pass outputFilters to enable value conversion
     *
     * Factory pattern advantages:
     * - Delegate binding type selection (attribute, property, event, etc.) to external
     * - Flexible extensibility (easy to add new binding types)
     * - Improved testability (can inject mock factories)
     *
     * Notes:
     * - After constructor execution, need to call activate() to enable
     * - bindingNode and bindingState may reference each other
     */
    constructor(parentBindContent, node, engine, createBindingNode, createBindingState) {
        // ステップ1: 参照を保存
        // Step 1: Save references
        this.parentBindContent = parentBindContent;
        this.node = node;
        this.engine = engine;
        // ステップ2: BindingNode を生成（DOM操作層）
        // Step 2: Generate BindingNode (DOM operation layer)
        this.bindingNode = createBindingNode(this, node, engine.inputFilters);
        // ステップ3: BindingState を生成（状態管理層）
        // Step 3: Generate BindingState (state management layer)
        this.bindingState = createBindingState(this, engine.outputFilters);
    }
    /**
     * このバインディングが管理する子 BindContent 配列を取得する getter。
     *
     * 用途:
     * - BindingNodeFor: ループアイテムごとの BindContent を管理
     * - BindingNodeIf: 条件分岐ごとの BindContent を管理
     * - その他の構造制御バインディング
     *
     * 委譲先:
     * - 実装は BindingNode に委譲される
     * - 構造制御を行わないバインディングは空配列を返す
     *
     * Getter to retrieve array of child BindContent managed by this binding.
     *
     * Usage:
     * - BindingNodeFor: Manage BindContent per loop item
     * - BindingNodeIf: Manage BindContent per conditional branch
     * - Other structural control bindings
     *
     * Delegation:
     * - Implementation delegated to BindingNode
     * - Bindings without structural control return empty array
     */
    get bindContents() {
        return this.bindingNode.bindContents;
    }
    /**
     * 状態値を更新するメソッド（双方向バインディング用）。
     *
     * 処理フロー:
     * 1. BindingState.assignValue() を呼び出し
     * 2. writeState（書き込み可能な状態プロキシ）に値を設定
     * 3. handler（状態更新ハンドラー）を介して更新を通知
     *
     * 使用場面:
     * - input 要素での入力イベント処理（BindingNodePropertyValue）
     * - checkbox の変更イベント処理（BindingNodePropertyChecked）
     * - カスタム要素の双方向バインディング
     *
     * 委譲先:
     * - 実装は BindingState に委譲される
     * - BindingState が状態参照を解決し、適切なプロパティに値を設定
     *
     * Method to update state value (for bidirectional binding).
     *
     * Processing flow:
     * 1. Call BindingState.assignValue()
     * 2. Set value to writeState (writable state proxy)
     * 3. Notify update through handler (state update handler)
     *
     * Usage scenarios:
     * - Input event handling in input elements (BindingNodePropertyValue)
     * - Change event handling in checkboxes (BindingNodePropertyChecked)
     * - Bidirectional binding in custom elements
     *
     * Delegation:
     * - Implementation delegated to BindingState
     * - BindingState resolves state reference and sets value to appropriate property
     *
     * @param writeState - 書き込み可能な状態プロキシ / Writable state proxy
     * @param handler - 状態更新ハンドラー / State update handler
     * @param value - 設定する値 / Value to set
     */
    updateStateValue(writeState, handler, value) {
        return this.bindingState.assignValue(writeState, handler, value);
    }
    /**
     * 再描画が必要な状態参照を BindingNode に通知するメソッド。
     *
     * 処理:
     * - BindingNode.notifyRedraw() に委譲
     * - BindingNode が refs 配列を確認し、必要に応じて再描画を実行
     *
     * 使用場面:
     * - 状態変更時に特定のバインディングのみを再描画
     * - 動的依存関係の解決後に関連バインディングを更新
     *
     * 委譲先:
     * - 実装は BindingNode に委譲される
     * - BindingNode が自身の ref と refs を比較し、一致する場合に再描画
     *
     * Method to notify BindingNode of state references requiring redraw.
     *
     * Processing:
     * - Delegates to BindingNode.notifyRedraw()
     * - BindingNode checks refs array and executes redraw if necessary
     *
     * Usage scenarios:
     * - Redraw only specific bindings on state change
     * - Update related bindings after resolving dynamic dependencies
     *
     * Delegation:
     * - Implementation delegated to BindingNode
     * - BindingNode compares its ref with refs and redraws if match
     *
     * @param refs - 再描画対象の状態参照配列 / Array of state references for redraw
     */
    notifyRedraw(refs) {
        this.bindingNode.notifyRedraw(refs);
    }
    /**
     * 状態変更を DOM に適用するメインメソッド。
     *
     * 処理アルゴリズム:
     * 1. 二重更新チェック:
     *    - renderer.updatedBindings に既に含まれている場合は早期リターン
     *    - 同一レンダリングサイクル内での重複更新を防止
     * 2. 更新済みマーク:
     *    - renderer.updatedBindings にこのバインディングを追加
     * 3. DOM更新:
     *    - bindingNode.applyChange(renderer) を呼び出し
     *    - BindingNode が実際の DOM 操作を実行
     * 4. 最適化処理:
     *    - ループインデックスでない、かつ動的依存でない場合
     *    - このバインディングが唯一の参照者なら processedRefs に追加
     *    - 同じ ref への重複処理を防止
     *
     * 最適化の詳細:
     * - 動的依存（dynamicDependencies）: ワイルドカードパスなど、実行時に解決される依存関係
     * - 単一バインディング最適化: 1つの ref に対して1つのバインディングしかない場合、
     *   processedRefs に追加することで他の処理をスキップ
     *
     * 呼び出し元:
     * - Renderer.render(): 状態変更時のメインレンダリングループ
     * - BindContent.applyChange(): 親から子への変更伝播
     *
     * Main method to apply state changes to DOM.
     *
     * Processing algorithm:
     * 1. Duplicate update check:
     *    - Early return if already included in renderer.updatedBindings
     *    - Prevents duplicate updates within same rendering cycle
     * 2. Mark as updated:
     *    - Add this binding to renderer.updatedBindings
     * 3. DOM update:
     *    - Call bindingNode.applyChange(renderer)
     *    - BindingNode executes actual DOM operations
     * 4. Optimization processing:
     *    - If not loop index and not dynamic dependency
     *    - Add to processedRefs if this binding is sole reference holder
     *    - Prevents duplicate processing of same ref
     *
     * Optimization details:
     * - Dynamic dependencies (dynamicDependencies): Dependencies resolved at runtime like wildcard paths
     * - Single binding optimization: If only one binding for a ref,
     *   add to processedRefs to skip other processing
     *
     * Caller:
     * - Renderer.render(): Main rendering loop on state change
     * - BindContent.applyChange(): Change propagation from parent to child
     *
     * @param renderer - レンダラーインスタンス（更新管理情報を保持） / Renderer instance (holds update management info)
     */
    applyChange(renderer) {
        // ステップ1: 二重更新チェック
        // Step 1: Duplicate update check
        if (renderer.updatedBindings.has(this))
            return;
        // ステップ2: 更新済みマーク
        // Step 2: Mark as updated
        renderer.updatedBindings.add(this);
        // ステップ3: DOM更新を BindingNode に委譲
        // Step 3: Delegate DOM update to BindingNode
        this.bindingNode.applyChange(renderer);
        // ステップ4: 単一バインディング最適化
        // Step 4: Single binding optimization
        const ref = this.bindingState.ref;
        // ループインデックスでなく、動的依存でもない場合
        // If not loop index and not dynamic dependency
        if (!this.bindingState.isLoopIndex && !this.engine.pathManager.dynamicDependencies.has(ref.info.pattern)) {
            const bindings = this.engine.getBindings(ref);
            // この ref に対するバインディングが1つだけの場合、処理済みとしてマーク
            // If only one binding for this ref, mark as processed
            if (bindings.length === 1) {
                renderer.processedRefs.add(ref);
            }
        }
    }
    /**
     * バインディングを有効化するメソッド。
     *
     * 処理フロー:
     * 1. isActive フラグを true に設定
     * 2. bindingState.activate() を呼び出し
     *    - 状態参照の購読を開始
     *    - 初期値の解決
     * 3. bindingNode.activate() を呼び出し
     *    - DOM への初期レンダリング
     *
     * 呼び出しタイミング:
     * - BindContent 生成直後（createBindContent 後）
     * - 条件分岐で非表示から表示に切り替わる時（BindingNodeIf）
     * - コンポーネントのマウント時
     *
     * 注意事項:
     * - activate は冪等ではない（複数回呼び出すと問題が発生する可能性）
     * - inactivate() との対応を必ず取る必要がある
     *
     * Method to activate binding.
     *
     * Processing flow:
     * 1. Set isActive flag to true
     * 2. Call bindingState.activate()
     *    - Start subscribing to state references
     *    - Resolve initial values
     * 3. Call bindingNode.activate()
     *    - Initial rendering to DOM
     *    - Register event listeners (if necessary)
     *
     * Call timing:
     * - Immediately after BindContent generation (after createBindContent)
     * - When switching from hidden to visible in conditional branch (BindingNodeIf)
     * - On component mount
     *
     * Notes:
     * - activate is not idempotent (calling multiple times may cause issues)
     * - Must correspond with inactivate()
     */
    activate() {
        this.isActive = true;
        this.bindingState.activate();
        this.bindingNode.activate();
    }
    /**
     * バインディングを無効化するメソッド。
     *
     * 処理フロー:
     * 1. isActive チェック（既に無効化されている場合は何もしない）
     * 2. bindingNode.inactivate() を呼び出し
     *    - DOM からの削除処理（必要な場合）
     * 3. bindingState.inactivate() を呼び出し
     *    - 状態参照の購読解除
     *    - リソースのクリーンアップ
     * 4. isActive フラグを false に設定
     *
     * 呼び出しタイミング:
     * - BindContent のアンマウント時
     * - 条件分岐で表示から非表示に切り替わる時（BindingNodeIf）
     * - コンポーネントの破棄時
     *
     * 冪等性:
     * - isActive チェックにより、複数回呼び出しても安全
     * - 既に無効化されている場合は何も実行しない
     *
     * メモリリーク防止:
     * - 状態購読の解除
     * - WeakMap の活用（bindingsByListIndex）
     *
     * Method to inactivate binding.
     *
     * Processing flow:
     * 1. isActive check (do nothing if already inactivated)
     * 2. Call bindingNode.inactivate()
     *    - Remove event listeners
     *    - Remove from DOM (if necessary)
     * 3. Call bindingState.inactivate()
     *    - Unsubscribe from state references
     *    - Resource cleanup
     * 4. Set isActive flag to false
     *
     * Call timing:
     * - On BindContent unmount
     * - When switching from visible to hidden in conditional branch (BindingNodeIf)
     * - On component destruction
     *
     * Idempotency:
     * - Safe to call multiple times due to isActive check
     * - Does nothing if already inactivated
     *
     * Memory leak prevention:
     * - Proper removal of event listeners
     * - Unsubscribe from state subscriptions
     * - Utilize WeakMap (bindingsByListIndex)
     */
    inactivate() {
        if (this.isActive) {
            this.bindingNode.inactivate();
            this.bindingState.inactivate();
            this.isActive = false;
        }
    }
}
/**
 * Binding インスタンスを生成するファクトリ関数。
 *
 * 役割:
 * - Binding コンストラクタをラップし、一貫したインスタンス生成を提供
 * - Factory Pattern の実装により、生成ロジックをカプセル化
 *
 * 生成プロセス:
 * 1. Binding コンストラクタに全パラメータを渡す
 * 2. コンストラクタ内で:
 *    a. createBindingNode() を呼び出し、適切な BindingNode を生成
 *    b. createBindingState() を呼び出し、BindingState を生成
 * 3. 初期化済みの Binding インスタンスを返す
 *
 * 使用場所:
 * - BindContent.createBindings(): テンプレートから複数の Binding を生成
 * - data-bind 属性の各エントリに対して呼び出される
 *
 * ファクトリ関数の利点:
 * - コンストラクタの詳細を隠蔽
 * - 将来的な拡張（プール、キャッシュ等）が容易
 * - テスタビリティ向上
 *
 * 注意事項:
 * - 生成後、activate() を呼び出してバインディングを有効化する必要がある
 * - ファクトリ関数（createBindingNode, createBindingState）は呼び出し側で準備
 *
 * Factory function to generate Binding instance.
 *
 * Role:
 * - Wraps Binding constructor and provides consistent instance generation
 * - Encapsulates generation logic through Factory Pattern implementation
 *
 * Generation process:
 * 1. Pass all parameters to Binding constructor
 * 2. Within constructor:
 *    a. Call createBindingNode() to generate appropriate BindingNode
 *    b. Call createBindingState() to generate BindingState
 * 3. Return initialized Binding instance
 *
 * Usage locations:
 * - BindContent.createBindings(): Generate multiple Bindings from template
 * - Called for each entry in data-bind attributes
 *
 * Factory function advantages:
 * - Hide constructor details
 * - Easy future extensions (pooling, caching, etc.)
 * - Improved testability
 *
 * Notes:
 * - After generation, need to call activate() to enable binding
 * - Factory functions (createBindingNode, createBindingState) prepared by caller
 *
 * @param parentBindContent - 親 BindContent / Parent BindContent
 * @param node - バインディング対象の DOM ノード / Target DOM node for binding
 * @param engine - コンポーネントエンジン / Component engine
 * @param createBindingNode - BindingNode 生成ファクトリ / BindingNode generation factory
 * @param createBindingState - BindingState 生成ファクトリ / BindingState generation factory
 * @returns 生成された Binding インスタンス / Generated Binding instance
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
 * 指定テンプレートIDから DocumentFragment を生成する内部ヘルパー関数。
 *
 * 処理フロー:
 * 1. テンプレートIDから登録済みテンプレートを取得
 * 2. テンプレート内容をディープコピーして DocumentFragment を生成
 * 3. 遅延読み込みコンポーネントが存在する場合、自動的にロード
 * 4. 生成された DocumentFragment を返す
 *
 * 遅延読み込み対応:
 * - `:not(:defined)` セレクタで未定義カスタム要素を検出
 * - 各要素のタグ名を取得し、対応するコンポーネントをロード
 * - Web Components の段階的読み込みをサポート
 *
 * Internal helper function to generate DocumentFragment from specified template ID.
 *
 * Processing flow:
 * 1. Retrieve registered template from template ID
 * 2. Deep copy template content to generate DocumentFragment
 * 3. Automatically load lazy-load components if present
 * 4. Return generated DocumentFragment
 *
 * Lazy loading support:
 * - Detects undefined custom elements with `:not(:defined)` selector
 * - Retrieves tag name of each element and loads corresponding component
 * - Supports progressive loading of Web Components
 *
 * @param id - 登録済みテンプレートID / Registered template ID
 * @returns テンプレート内容を複製した DocumentFragment / DocumentFragment with copied template content
 * @throws BIND-101 Template not found: 未登録IDが指定された場合 / When unregistered ID is specified
 */
function createContent(id) {
    // ステップ1: テンプレートIDから登録済みテンプレートを取得（存在しない場合はエラー）
    // Step 1: Retrieve registered template from template ID (error if not exists)
    const template = getTemplateById(id) ??
        raiseError({
            code: "BIND-101",
            message: `Template not found: ${id}`,
            context: { where: 'BindContent.createContent', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    // ステップ2: テンプレート内容をディープコピー（true = 子孫ノードも含む）
    // Step 2: Deep copy template content (true = includes descendant nodes)
    const fragment = document.importNode(template.content, true);
    // ステップ3: 遅延読み込みコンポーネントの自動ロード
    // Step 3: Automatic loading of lazy-load components
    if (hasLazyLoadComponents()) {
        // 未定義のカスタム要素を検出
        // Detect undefined custom elements
        const lazyLoadElements = fragment.querySelectorAll(":not(:defined)");
        for (let i = 0; i < lazyLoadElements.length; i++) {
            // タグ名を取得してコンポーネントをロード
            // Retrieve tag name and load component
            const tagName = lazyLoadElements[i].tagName.toLowerCase();
            loadLazyLoadComponent(tagName);
        }
    }
    // ステップ4: 生成された DocumentFragment を返す
    // Step 4: Return generated DocumentFragment
    return fragment;
}
/**
 * テンプレート内の data-bind 情報から IBinding 配列を構築する内部関数。
 *
 * 処理フロー:
 * 1. テンプレートIDから data-bind 属性情報を取得
 * 2. 各属性について以下を実行:
 *    a. ノードパスからDOMノードを解決
 *    b. 各バインディングテキストについて:
 *       - 対応する BindingCreator を取得
 *       - Binding インスタンスを生成
 *       - 配列に追加
 * 3. 生成された IBinding 配列を返す
 *
 * バインディング生成の詳細:
 * - createBinding は BindingNode と BindingState を生成
 * - ファクトリ関数（creator）を使用して適切な型のバインディングを生成
 * - 各バインディングは親 BindContent への参照を保持
 *
 * Internal function to construct IBinding array from data-bind information within template.
 *
 * Processing flow:
 * 1. Retrieve data-bind attribute information from template ID
 * 2. For each attribute, execute the following:
 *    a. Resolve DOM node from node path
 *    b. For each binding text:
 *       - Get corresponding BindingCreator
 *       - Generate Binding instance
 *       - Add to array
 * 3. Return generated IBinding array
 *
 * Binding generation details:
 * - createBinding generates BindingNode and BindingState
 * - Uses factory function (creator) to generate appropriate binding type
 * - Each binding maintains reference to parent BindContent
 *
 * @param bindContent - 親 BindContent / Parent BindContent
 * @param id - テンプレートID / Template ID
 * @param engine - コンポーネントエンジン / Component engine
 * @param content - テンプレートから複製したフラグメント / Fragment copied from template
 * @returns 生成された IBinding の配列 / Array of generated IBinding
 * @throws BIND-101 Data-bind is not set: テンプレートに data-bind 情報が未登録 / data-bind info not registered in template
 * @throws BIND-102 Node not found: パスで指すノードが見つからない / Node pointed to by path not found
 * @throws BIND-103 Creator not found: 対応する BindingCreator が未登録 / Corresponding BindingCreator not registered
 */
function createBindings(bindContent, id, engine, content) {
    // ステップ1: テンプレートIDから data-bind 属性情報を取得（存在しない場合はエラー）
    // Step 1: Retrieve data-bind attribute information from template ID (error if not exists)
    const attributes = getDataBindAttributesById(id) ??
        raiseError({
            code: "BIND-101",
            message: "Data-bind is not set",
            context: { where: 'BindContent.createBindings', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    // ステップ2: バインディング配列を初期化
    // Step 2: Initialize binding array
    const bindings = [];
    // ステップ3: 各属性について処理
    // Step 3: Process each attribute
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        // ステップ3a: ノードパスからDOMノードを解決（見つからない場合はエラー）
        // Step 3a: Resolve DOM node from node path (error if not found)
        const node = resolveNodeFromPath(content, attribute.nodePath) ??
            raiseError({
                code: "BIND-102",
                message: `Node not found: ${attribute.nodePath}`,
                context: { where: 'BindContent.createBindings', templateId: id, nodePath: attribute.nodePath },
                docsUrl: "./docs/error-codes.md#bind",
            });
        // ステップ3b: 各バインディングテキストについて処理
        // Step 3b: Process each binding text
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            // 対応する BindingCreator を取得（存在しない場合はエラー）
            // Get corresponding BindingCreator (error if not exists)
            const creator = attribute.creatorByText.get(bindText) ??
                raiseError({
                    code: "BIND-103",
                    message: `Creator not found: ${bindText}`,
                    context: { where: 'BindContent.createBindings', templateId: id, bindText },
                    docsUrl: "./docs/error-codes.md#bind",
                });
            // Binding インスタンスを生成（BindingNode と BindingState を含む）
            // Generate Binding instance (includes BindingNode and BindingState)
            const binding = createBinding(bindContent, node, engine, creator.createBindingNode, creator.createBindingState);
            // 配列に追加
            // Add to array
            bindings.push(binding);
        }
    }
    // ステップ4: 生成された IBinding 配列を返す
    // Step 4: Return generated IBinding array
    return bindings;
}
/**
 * BindContent クラスは、テンプレートから生成された DOM 断片（DocumentFragment）と
 * そのバインディング情報（IBinding[]）を管理する中核実装です。
 *
 * アーキテクチャ:
 * - テンプレートベースの DOM 生成とバインディング管理を統合
 * - ループや条件分岐などの動的コンテンツをサポート
 * - 親子関係を持つ階層構造（親 Binding ← BindContent ← 子 Binding[]）
 * - マウント状態の追跡とライフサイクル管理
 *
 * 主な役割:
 * 1. DOM 断片生成: テンプレートIDから DocumentFragment を生成
 * 2. バインディング構築: data-bind 属性から IBinding 配列を構築
 * 3. DOM 操作: mount/mountBefore/mountAfter/unmount で挿入・削除を制御
 * 4. 変更適用: applyChange で各 IBinding に更新を委譲
 * 5. ループ対応: LoopContext やリストインデックスを管理
 * 6. ノード探索: getLastNode で再帰的に最後のノードを取得
 * 7. インデックス再割り当て: assignListIndex でループ更新に対応
 *
 * 状態管理:
 * - isMounted: DOM マウント状態の判定
 * - isActive: バインディングの有効/無効状態
 * - currentLoopContext: 親方向へ遡ってループコンテキストを解決（キャッシュ付き）
 *
 * パフォーマンス最適化:
 * - currentLoopContext のキャッシング（初回解決後は再利用）
 * - 二重更新防止（renderer.updatedBindings でチェック）
 * - 親ノード存在チェックによる無効操作の回避
 *
 * BindContent class is the core implementation managing DOM fragments (DocumentFragment)
 * generated from templates and their binding information (IBinding[]).
 *
 * Architecture:
 * - Integrates template-based DOM generation and binding management
 * - Supports dynamic content such as loops and conditional branches
 * - Hierarchical structure with parent-child relationships (parent Binding ← BindContent ← child Binding[])
 * - Mount state tracking and lifecycle management
 *
 * Main responsibilities:
 * 1. DOM fragment generation: Generate DocumentFragment from template ID
 * 2. Binding construction: Build IBinding array from data-bind attributes
 * 3. DOM operations: Control insertion/removal with mount/mountBefore/mountAfter/unmount
 * 4. Change application: Delegate updates to each IBinding via applyChange
 * 5. Loop support: Manage LoopContext and list indices
 * 6. Node traversal: Recursively retrieve last node via getLastNode
 * 7. Index reassignment: Handle loop updates via assignListIndex
 *
 * State management:
 * - isMounted: Determine DOM mount state
 * - isActive: Active/inactive state of bindings
 * - currentLoopContext: Resolve loop context by traversing parent direction (with caching)
 *
 * Performance optimization:
 * - Caching of currentLoopContext (reuse after initial resolution)
 * - Duplicate update prevention (check via renderer.updatedBindings)
 * - Invalid operation avoidance via parent node existence check
 *
 * @throws BIND-101 Template not found: 未登録テンプレートID（createContent内） / Unregistered template ID (in createContent)
 * @throws BIND-101/102/103: data-bind 情報不足/不整合（createBindings内） / Insufficient/inconsistent data-bind info (in createBindings)
 * @throws BIND-104 Child bindContent not found: 子探索で不整合（getLastNode） / Child search inconsistency (getLastNode)
 * @throws BIND-201 LoopContext is null: LoopContext 未初期化（assignListIndex） / LoopContext not initialized (assignListIndex)
 */
class BindContent {
    loopContext;
    parentBinding;
    childNodes;
    fragment;
    engine;
    bindings = [];
    isActive = false;
    id;
    firstChildNode;
    lastChildNode;
    /**
     * この BindContent が既に DOM にマウントされているかどうか。
     * 判定は childNodes[0] の親が fragment 以外かで行う。
     */
    get isMounted() {
        return this.childNodes.length > 0 && this.childNodes[0].parentNode !== this.fragment;
    }
    /**
     * 再帰的に最終ノード（末尾のバインディング配下も含む）を取得するメソッド。
     *
     * 処理アルゴリズム:
     * 1. 末尾のバインディング（lastBinding）を取得
     * 2. lastBinding が lastChildNode と一致する場合:
     *    a. lastBinding が子 BindContent を持つ場合
     *       - 最後の子 BindContent から再帰的に getLastNode を呼び出す
     *       - 有効なノードが返された場合、それを返す
     * 3. lastChildNode の親が parentNode と一致しない場合:
     *    - null を返す（親子関係が崩れている）
     * 4. lastChildNode を返す
     *
     * 使用例:
     * - BindingNodeFor での DOM 挿入位置の決定
     * - ネストした BindContent の最後のノード探索
     *
     * Method to recursively retrieve the last node (including those under trailing bindings).
     *
     * Processing algorithm:
     * 1. Get trailing binding (lastBinding)
     * 2. If lastBinding matches lastChildNode:
     *    a. If lastBinding has child BindContent
     *       - Recursively call getLastNode from last child BindContent
     *       - Return it if valid node is returned
     * 3. If lastChildNode's parent doesn't match parentNode:
     *    - Return null (parent-child relationship broken)
     * 4. Return lastChildNode
     *
     * Usage examples:
     * - Determining DOM insertion position in BindingNodeFor
     * - Searching last node of nested BindContent
     *
     * @param parentNode - 検証対象の親ノード（このノード配下にあることを期待） / Parent node for validation (expected to be under this node)
     * @returns 最終ノード（Node）または null（親子関係が崩れている場合） / Last node (Node) or null (if parent-child relationship broken)
     * @throws BIND-104 Child bindContent not found: 子 BindContent が見つからない（不整合） / Child BindContent not found (inconsistency)
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
    #currentLoopContext;
    /**
     * 現在のループコンテキスト（LoopContext）を取得する getter。
     *
     * 処理ロジック:
     * 1. キャッシュ（#currentLoopContext）が未定義（undefined）の場合:
     *    a. 自身の loopContext をチェック
     *    b. null の場合、親 BindContent へ遡って探索
     *    c. 見つかった LoopContext をキャッシュに保存
     * 2. キャッシュされた値を返す
     *
     * キャッシュ戦略:
     * - undefined: 未解決（初回アクセス時）
     * - null: 解決済みだがループコンテキストなし
     * - ILoopContext: 解決済みでループコンテキストあり
     *
     * パフォーマンス最適化:
     * - 親方向への探索は初回のみ
     * - 2回目以降はキャッシュから即座に返す
     * - unmount() でキャッシュをクリア（undefined に戻す）
     *
     * Getter to retrieve current loop context (LoopContext).
     *
     * Processing logic:
     * 1. If cache (#currentLoopContext) is undefined:
     *    a. Check own loopContext
     *    b. If null, traverse to parent BindContent
     *    c. Save found LoopContext to cache
     * 2. Return cached value
     *
     * Cache strategy:
     * - undefined: Unresolved (on first access)
     * - null: Resolved but no loop context
     * - ILoopContext: Resolved with loop context
     *
     * Performance optimization:
     * - Parent traversal only on first access
     * - Returns immediately from cache on subsequent accesses
     * - Cache cleared (back to undefined) on unmount()
     */
    get currentLoopContext() {
        if (typeof this.#currentLoopContext === "undefined") {
            let bindContent = this;
            while (bindContent !== null) {
                if (bindContent.loopContext !== null)
                    break;
                bindContent = bindContent.parentBinding?.parentBindContent ?? null;
            }
            this.#currentLoopContext = bindContent?.loopContext ?? null;
        }
        return this.#currentLoopContext;
    }
    /**
     * BindContent のコンストラクタ。
     *
     * 初期化処理フロー:
     * 1. 親バインディングとテンプレートIDを保存
     * 2. createContent() で DocumentFragment を生成
     * 3. childNodes 配列を構築（fragment.childNodes から）
     * 4. firstChildNode と lastChildNode を設定
     * 5. コンポーネントエンジンを保存
     * 6. loopRef に listIndex がある場合、LoopContext を生成
     * 7. createBindings() で IBinding 配列を生成
     *
     * LoopContext 生成条件:
     * - loopRef.listIndex が null でない場合
     * - ループバインディング（for）で使用される
     *
     * 注意事項:
     * - コンストラクタ実行後、activate() を呼び出してバインディングを有効化する必要がある
     * - childNodes は DocumentFragment 内に留まっている（マウント前）
     *
     * BindContent constructor.
     *
     * Initialization processing flow:
     * 1. Save parent binding and template ID
     * 2. Generate DocumentFragment via createContent()
     * 3. Build childNodes array (from fragment.childNodes)
     * 4. Set firstChildNode and lastChildNode
     * 5. Save component engine
     * 6. Generate LoopContext if loopRef has listIndex
     * 7. Generate IBinding array via createBindings()
     *
     * LoopContext generation conditions:
     * - When loopRef.listIndex is not null
     * - Used in loop bindings (for)
     *
     * Notes:
     * - After constructor execution, need to call activate() to enable bindings
     * - childNodes remain in DocumentFragment (before mount)
     */
    constructor(parentBinding, id, engine, loopRef) {
        this.parentBinding = parentBinding;
        this.id = id;
        this.fragment = createContent(id);
        this.childNodes = Array.from(this.fragment.childNodes);
        this.firstChildNode = this.childNodes[0] ?? null;
        this.lastChildNode = this.childNodes[this.childNodes.length - 1] ?? null;
        this.engine = engine;
        this.loopContext = (loopRef.listIndex !== null) ? createLoopContext(loopRef, this) : null;
        const bindings = createBindings(this, id, engine, this.fragment);
        this.bindings = bindings;
    }
    /**
     * 親ノードの末尾に childNodes をマウント（appendChild）するメソッド。
     *
     * 処理:
     * - 各 childNode を順番に parentNode.appendChild() で追加
     * - マウント後、isMounted は true になる
     *
     * 注意事項:
     * - 冪等性（idempotent）ではない
     * - 重複マウントは呼び出し側で避ける必要がある
     * - マウント前に isMounted でチェック推奨
     *
     * Method to mount childNodes to the end of parent node (appendChild).
     *
     * Processing:
     * - Add each childNode sequentially via parentNode.appendChild()
     * - After mount, isMounted becomes true
     *
     * Notes:
     * - Not idempotent
     * - Duplicate mounts must be avoided by caller
     * - Recommend checking with isMounted before mount
     *
     * @param parentNode - マウント先の親ノード / Parent node for mount destination
     */
    mount(parentNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.appendChild(this.childNodes[i]);
        }
    }
    /**
     * 指定ノードの直前に childNodes をマウント（insertBefore）するメソッド。
     *
     * 処理:
     * - 各 childNode を順番に parentNode.insertBefore(child, beforeNode) で挿入
     * - beforeNode が null の場合、末尾に追加される（appendChild と同等）
     *
     * 使用例:
     * - BindingNodeFor での配列要素挿入
     * - BindingNodeIf での条件分岐コンテンツ挿入
     *
     * Method to mount childNodes immediately before specified node (insertBefore).
     *
     * Processing:
     * - Insert each childNode sequentially via parentNode.insertBefore(child, beforeNode)
     * - If beforeNode is null, appended to end (equivalent to appendChild)
     *
     * Usage examples:
     * - Array element insertion in BindingNodeFor
     * - Conditional branch content insertion in BindingNodeIf
     *
     * @param parentNode - マウント先の親ノード / Parent node for mount destination
     * @param beforeNode - 挿入位置の基準ノード（この直前に挿入） / Reference node for insertion position (insert immediately before this)
     */
    mountBefore(parentNode, beforeNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * 指定ノードの直後に childNodes をマウントするメソッド。
     *
     * 処理ロジック:
     * 1. afterNode.nextSibling を beforeNode として取得
     * 2. 各 childNode を parentNode.insertBefore(child, beforeNode) で挿入
     *
     * 動作:
     * - afterNode が null の場合、beforeNode は null となり末尾に追加
     * - afterNode が最後のノードの場合、beforeNode は null となり末尾に追加
     * - それ以外の場合、afterNode の次のノードの直前に挿入
     *
     * 使用例:
     * - BindingNodeIf での条件分岐コンテンツ挿入（コメントノードの直後）
     *
     * Method to mount childNodes immediately after specified node.
     *
     * Processing logic:
     * 1. Get afterNode.nextSibling as beforeNode
     * 2. Insert each childNode via parentNode.insertBefore(child, beforeNode)
     *
     * Behavior:
     * - If afterNode is null, beforeNode becomes null and appends to end
     * - If afterNode is last node, beforeNode becomes null and appends to end
     * - Otherwise, inserts immediately before afterNode's next node
     *
     * Usage examples:
     * - Conditional branch content insertion in BindingNodeIf (immediately after comment node)
     *
     * @param parentNode - マウント先の親ノード / Parent node for mount destination
     * @param afterNode - 挿入位置の基準ノード（この直後に挿入） / Reference node for insertion position (insert immediately after this)
     */
    mountAfter(parentNode, afterNode) {
        const beforeNode = afterNode?.nextSibling ?? null;
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * DOM から childNodes をアンマウント（取り外し）するメソッド。
     *
     * 処理フロー:
     * 1. currentLoopContext キャッシュをクリア（undefined に設定）
     * 2. 最初の childNode の parentNode を取得
     * 3. parentNode が null の場合、早期リターン（既にアンマウント済み）
     * 4. 各 childNode を parentNode.removeChild() で削除
     *
     * 設計上の注意:
     * - コメントノードやテキストノードでも親を取得できるよう parentNode プロパティを使用
     * - Element.remove() は使用しない（全ノードタイプに対応するため）
     *
     * アンマウント後の状態:
     * - isMounted は false になる
     * - childNodes 配列は保持される（再マウント可能）
     * - currentLoopContext は再解決が必要
     *
     * Method to unmount (detach) childNodes from DOM.
     *
     * Processing flow:
     * 1. Clear currentLoopContext cache (set to undefined)
     * 2. Get parentNode of first childNode
     * 3. If parentNode is null, early return (already unmounted)
     * 4. Remove each childNode via parentNode.removeChild()
     *
     * Design considerations:
     * - Uses parentNode property to get parent even for comment/text nodes
     * - Does not use Element.remove() (to support all node types)
     *
     * State after unmount:
     * - isMounted becomes false
     * - childNodes array is retained (remount possible)
     * - currentLoopContext requires re-resolution
     */
    unmount() {
        // 
        this.#currentLoopContext = undefined;
        // コメント/テキストノードでも確実に取得できるよう parentNode を使用する
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return; // すでにDOMから削除されている場合は何もしない
        }
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.removeChild(this.childNodes[i]);
        }
    }
    /**
     * ループ内の ListIndex を再割り当てするメソッド。
     *
     * 処理:
     * 1. loopContext が null でないことを確認（null の場合はエラー）
     * 2. loopContext.assignListIndex(listIndex) を呼び出し
     *
     * 使用タイミング:
     * - BindingNodeFor での配列要素の並び替え時
     * - ループアイテムの再利用時（プールから取得したBindContent）
     * - リストインデックスの変更が必要な場合
     *
     * 影響範囲:
     * - LoopContext 内の listIndex が更新される
     * - BindingState の ref が再解決される
     * - 関連する全バインディングが新しいインデックスを参照
     *
     * Method to reassign ListIndex within loop.
     *
     * Processing:
     * 1. Verify loopContext is not null (error if null)
     * 2. Call loopContext.assignListIndex(listIndex)
     *
     * Usage timing:
     * - When reordering array elements in BindingNodeFor
     * - When reusing loop items (BindContent retrieved from pool)
     * - When list index change is needed
     *
     * Impact scope:
     * - listIndex in LoopContext is updated
     * - ref in BindingState is re-resolved
     * - All related bindings reference new index
     *
     * @param listIndex - 新しいリストインデックス / New list index
     * @throws BIND-201 LoopContext is null: LoopContext が未初期化 / LoopContext not initialized
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
     * 変更を適用するメインエントリポイント。
     *
     * 処理フロー:
     * 1. 最初の childNode の parentNode を取得
     * 2. parentNode が null の場合、早期リターン（アンマウント済み）
     * 3. 各バインディングについて:
     *    a. renderer.updatedBindings に既に含まれている場合はスキップ
     *    b. binding.applyChange(renderer) を呼び出し
     *
     * 呼び出し元:
     * - Renderer.render() から呼ばれる
     * - 状態変更時に自動的に実行される
     *
     * 二重更新防止:
     * - renderer.updatedBindings セットで重複チェック
     * - 同じバインディングが複数回更新されるのを防ぐ
     * - パフォーマンス最適化に寄与
     *
     * Main entry point to apply changes.
     *
     * Processing flow:
     * 1. Get parentNode of first childNode
     * 2. If parentNode is null, early return (already unmounted)
     * 3. For each binding:
     *    a. Skip if already included in renderer.updatedBindings
     *    b. Call binding.applyChange(renderer)
     *
     * Caller:
     * - Called from Renderer.render()
     * - Automatically executed on state changes
     *
     * Duplicate update prevention:
     * - Duplicate check with renderer.updatedBindings set
     * - Prevents same binding from being updated multiple times
     * - Contributes to performance optimization
     *
     * @param renderer - レンダラーインスタンス（更新管理情報を保持） / Renderer instance (holds update management information)
     */
    applyChange(renderer) {
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return; // すでにDOMから削除されている場合は何もしない
        }
        for (let i = 0; i < this.bindings.length; i++) {
            const binding = this.bindings[i];
            if (renderer.updatedBindings.has(binding))
                continue;
            binding.applyChange(renderer);
        }
    }
    activate() {
        this.isActive = true;
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].activate();
        }
    }
    inactivate() {
        this.isActive = false;
        this.loopContext?.clearListIndex();
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].inactivate();
        }
    }
}
/**
 * BindContent インスタンスを生成するファクトリ関数。
 *
 * 生成プロセス:
 * 1. BindContent コンストラクタを呼び出し
 * 2. 内部で以下が実行される:
 *    - DocumentFragment 生成
 *    - childNodes 配列構築
 *    - LoopContext 生成（必要な場合）
 *    - IBinding 配列生成
 * 3. 生成された BindContent インスタンスを返す
 *
 * 注意事項:
 * - この関数はインスタンス生成のみを行う
 * - activate() は呼び出し側で実行する必要がある
 * - バインディングを有効化するには activate() が必須
 *
 * 使用場所:
 * - BindingNodeFor: ループアイテムごとに BindContent を生成
 * - BindingNodeIf: 条件分岐コンテンツの BindContent を生成
 * - ComponentEngine: ルート BindContent の生成
 *
 * Factory function to generate BindContent instance.
 *
 * Generation process:
 * 1. Call BindContent constructor
 * 2. Internally executes:
 *    - DocumentFragment generation
 *    - childNodes array construction
 *    - LoopContext generation (if needed)
 *    - IBinding array generation
 * 3. Return generated BindContent instance
 *
 * Notes:
 * - This function only performs instance generation
 * - activate() must be executed by caller
 * - activate() is required to enable bindings
 *
 * Usage locations:
 * - BindingNodeFor: Generate BindContent for each loop item
 * - BindingNodeIf: Generate BindContent for conditional branch content
 * - ComponentEngine: Generate root BindContent
 *
 * @param parentBinding - 親の IBinding（なければ null） / Parent IBinding (null if none)
 * @param id - テンプレートID / Template ID
 * @param engine - コンポーネントエンジン / Component engine
 * @param loopRef - ループ用の StatePropertyRef（listIndex を含む場合に LoopContext を構築） / StatePropertyRef for loop (constructs LoopContext if includes listIndex)
 * @returns 生成された IBindContent インスタンス / Generated IBindContent instance
 */
function createBindContent(parentBinding, id, engine, loopRef) {
    const bindContent = new BindContent(parentBinding, id, engine, loopRef);
    return bindContent;
}

/**
 * 指定したタグ名の要素がShadowRootを持てるかどうかを判定するユーティリティ関数。
 *
 * - 指定タグ名で要素を生成し、attachShadowメソッドが存在するかどうかで判定
 * - 無効なタグ名やattachShadow未対応の場合はfalseを返す
 *
 * @param tagName 判定したい要素のタグ名（例: "div", "span", "input" など）
 * @returns       ShadowRootを持てる場合はtrue、持てない場合はfalse
 */
function canHaveShadowRoot(tagName) {
    try {
        // 一時的に要素を作成
        const element = document.createElement(tagName);
        // `attachShadow` メソッドが存在し、実行可能かを確認
        if (typeof element.attachShadow !== "function") {
            return false;
        }
        // 一時的にShadowRootをアタッチしてみる
        const shadowRoot = element.attachShadow({ mode: 'open' });
        return true;
    }
    catch {
        // 無効なタグ名などが渡された場合は false を返す
        return false;
    }
}

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
 * 指定したHTMLElementにShadow DOMをアタッチし、スタイルシートを適用するユーティリティ関数。
 *
 * - config.enableShadowDomがtrueの場合は、ShadowRootを生成し、adoptedStyleSheetsでスタイルを適用
 * - extends指定がある場合はcanHaveShadowRootで拡張可能かチェック
 * - Shadow DOMを使わない場合は、親のShadowRootまたはdocumentにスタイルシートを追加
 * - すでに同じスタイルシートが含まれていれば重複追加しない
 *
 * @param element    対象のHTMLElement
 * @param config     コンポーネント設定
 * @param styleSheet 適用するCSSStyleSheet
 * @throws           Shadow DOM非対応の組み込み要素を拡張しようとした場合はエラー
 */
function attachShadow(element, config, styleSheet) {
    if (config.enableShadowDom) {
        if (config.extends === null || canHaveShadowRoot(config.extends)) {
            if (!element.shadowRoot) {
                const shadowRoot = element.attachShadow({ mode: 'open' });
                shadowRoot.adoptedStyleSheets = [styleSheet];
            }
        }
        else {
            raiseError(`ComponentEngine: Shadow DOM not supported for builtin components that extend ${config.extends}`);
        }
    }
    else {
        const shadowRootOrDocument = getParentShadowRoot(element.parentNode) || document;
        const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
        if (!styleSheets.includes(styleSheet)) {
            shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, styleSheet];
        }
    }
}

/**
 * ComponentStateBinding
 *
 * 目的:
 * - 親コンポーネントの状態パスと子コンポーネント側のサブパスを一対一で関連付け、
 *   双方向にパス変換・参照できるようにする（親->子/子->親）。
 *
 * 制約:
 * - 親パス/子パスは 1:1 のみ（重複登録は STATE-303）
 * - 最長一致でのパス変換を行い、下位セグメントはそのまま連結
 */
class ComponentStateBinding {
    parentPaths = new Set();
    childPaths = new Set();
    childPathByParentPath = new Map();
    parentPathByChildPath = new Map();
    bindingByParentPath = new Map();
    bindingByChildPath = new Map();
    bindings = new WeakSet();
    addBinding(binding) {
        if (this.bindings.has(binding)) {
            return; // 既にバインディングが追加されている場合は何もしない
        }
        const parentPath = binding.bindingState.pattern;
        const childPath = binding.bindingNode.subName;
        if (this.childPathByParentPath.has(parentPath)) {
            raiseError({
                code: "STATE-303",
                message: `Parent path "${parentPath}" already has a child path`,
                context: { parentPath, existingChildPath: this.childPathByParentPath.get(parentPath) },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        if (this.parentPathByChildPath.has(childPath)) {
            raiseError({
                code: "STATE-303",
                message: `Child path "${childPath}" already has a parent path`,
                context: { childPath, existingParentPath: this.parentPathByChildPath.get(childPath) },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        this.childPathByParentPath.set(parentPath, childPath);
        this.parentPathByChildPath.set(childPath, parentPath);
        this.parentPaths.add(parentPath);
        this.childPaths.add(childPath);
        this.bindingByParentPath.set(parentPath, binding);
        this.bindingByChildPath.set(childPath, binding);
        this.bindings.add(binding);
    }
    getChildPath(parentPath) {
        return this.childPathByParentPath.get(parentPath);
    }
    getParentPath(childPath) {
        return this.parentPathByChildPath.get(childPath);
    }
    toParentPathFromChildPath(childPath) {
        // 子から親へ: 最長一致する childPaths のエントリを探し、残差のセグメントを親に連結
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
        const matchParentPath = this.parentPathByChildPath.get(longestMatchPath);
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
    toChildPathFromParentPath(parentPath) {
        // 親から子へ: 最長一致する parentPaths のエントリを探し、残差のセグメントを子に連結
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
        const matchChildPath = this.childPathByParentPath.get(longestMatchPath);
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
    bind(parentComponent, childComponent) {
        // bindParentComponent
        const bindings = parentComponent.getBindingsFromChild(childComponent);
        for (const binding of bindings ?? []) {
            this.addBinding(binding);
        }
    }
}
function createComponentStateBinding() {
    return new ComponentStateBinding();
}

class ComponentStateInputHandler {
    componentStateBinding;
    engine;
    constructor(engine, componentStateBinding) {
        this.componentStateBinding = componentStateBinding;
        this.engine = engine;
    }
    assignState(object) {
        // 同期処理
        createUpdater(this.engine, (updater) => {
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
     * listindexに一致するかどうかは事前にスクリーニングしておく
     * @param refs
     */
    notifyRedraw(refs) {
        createUpdater(this.engine, (updater) => {
            for (const parentPathRef of refs) {
                let childPath;
                try {
                    childPath = this.componentStateBinding.toChildPathFromParentPath(parentPathRef.info.pattern);
                }
                catch (e) {
                    // 対象でないものは何もしない
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
                this.engine.getPropertyValue(childRef);
                // Ref情報をもとに状態更新キューに追加
                updater.enqueueRef(childRef);
            }
        });
    }
    get(target, prop, receiver) {
        if (prop === AssignStateSymbol) {
            return this.assignState.bind(this);
        }
        else if (prop === NotifyRedrawSymbol) {
            return this.notifyRedraw.bind(this);
        }
        else if (typeof prop === "string") {
            const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
            return this.engine.getPropertyValue(ref);
        }
        raiseError(`Property "${String(prop)}" is not supported in ComponentStateInput.`);
    }
    set(target, prop, value, receiver) {
        if (typeof prop === "string") {
            const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
            this.engine.setPropertyValue(ref, value);
            return true;
        }
        raiseError(`Property "${String(prop)}" is not supported in ComponentStateInput.`);
    }
}
function createComponentStateInput(engine, componentStateBinding) {
    const handler = new ComponentStateInputHandler(engine, componentStateBinding);
    return new Proxy({}, handler);
}

class ComponentStateOutput {
    binding;
    childEngine;
    #parentPaths = new Set();
    constructor(binding, childEngine) {
        this.binding = binding;
        this.childEngine = childEngine;
    }
    get(ref) {
        const childPath = this.binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError(`No child path found for path "${ref.info.toString()}".`);
        }
        const parentBinding = this.binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError(`No binding found for child path "${childPath}".`);
        }
        const parentPath = this.binding.toParentPathFromChildPath(ref.info.pattern);
        const parentInfo = getStructuredPathInfo(parentPath);
        const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
        if (!this.#parentPaths.has(parentRef.info.pattern)) {
            const isList = this.childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this.#parentPaths.add(parentRef.info.pattern);
        }
        return parentBinding.engine.getPropertyValue(parentRef);
    }
    set(ref, value) {
        const childPath = this.binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError(`No child path found for path "${ref.info.toString()}".`);
        }
        const parentBinding = this.binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError(`No binding found for child path "${childPath}".`);
        }
        const parentPath = this.binding.toParentPathFromChildPath(ref.info.pattern);
        const parentInfo = getStructuredPathInfo(parentPath);
        const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
        if (!this.#parentPaths.has(parentRef.info.pattern)) {
            const isList = this.childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this.#parentPaths.add(parentRef.info.pattern);
        }
        parentBinding.engine.setPropertyValue(parentRef, value);
        return true;
    }
    startsWith(pathInfo) {
        return this.binding.startsWithByChildPath(pathInfo) !== null;
    }
    getListIndexes(ref) {
        const childPath = this.binding.startsWithByChildPath(ref.info);
        if (childPath === null) {
            raiseError(`No child path found for path "${ref.info.toString()}".`);
        }
        const parentBinding = this.binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError(`No binding found for child path "${childPath}".`);
        }
        const parentPathInfo = getStructuredPathInfo(this.binding.toParentPathFromChildPath(ref.info.pattern));
        const parentRef = getStatePropertyRef(parentPathInfo, ref.listIndex);
        if (!this.#parentPaths.has(parentRef.info.pattern)) {
            const isList = this.childEngine.pathManager.lists.has(ref.info.pattern);
            parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
            this.#parentPaths.add(parentRef.info.pattern);
        }
        return parentBinding.engine.getListIndexes(parentRef);
    }
}
function createComponentStateOutput(binding, childEngine) {
    return new ComponentStateOutput(binding, childEngine);
}

/**
 * ComponentEngine は、Structive コンポーネントの状態・依存関係・
 * バインディング・ライフサイクル・レンダリングを統合する中核エンジンです。
 *
 * 主な役割:
 * - 状態インスタンスやプロキシの生成・管理
 * - テンプレート/スタイルシート/フィルター/バインディングの管理
 * - 依存関係グラフ（PathTree）の構築と管理
 * - バインディング情報やリスト情報の保存・取得
 * - ライフサイクル（connected/disconnected）処理
 * - Shadow DOM の適用、またはブロックモードのプレースホルダー運用
 * - 状態プロパティの取得・設定
 * - バインディングの追加・存在判定・リスト管理
 *
 * Throws（代表例）:
 * - BIND-201 bindContent not initialized yet / Block parent node is not set
 * - STATE-202 Failed to parse state from dataset
 *
 * 備考:
 * - 非同期初期化（readyResolvers）を提供
 * - Updater と連携したバッチ更新で効率的なレンダリングを実現
 */
class ComponentEngine {
    type = 'autonomous';
    config;
    template;
    styleSheet;
    stateClass;
    state;
    inputFilters;
    outputFilters;
    #bindContent = null;
    get bindContent() {
        if (this.#bindContent === null) {
            raiseError({
                code: 'BIND-201',
                message: 'bindContent not initialized yet',
                context: { where: 'ComponentEngine.bindContent.get', componentId: this.owner.constructor.id },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        return this.#bindContent;
    }
    baseClass = HTMLElement;
    owner;
    bindingsByComponent = new WeakMap();
    structiveChildComponents = new Set();
    pathManager;
    #readyResolvers = Promise.withResolvers();
    stateBinding;
    stateInput;
    stateOutput;
    #blockPlaceholder = null; // ブロックプレースホルダー
    #blockParentNode = null; // ブロックプレースホルダーの親ノード
    #ignoreDissconnectedCallback = false; // disconnectedCallbackを無視するフラグ
    #currentVersion = 0;
    get currentVersion() {
        return this.#currentVersion;
    }
    versionUp() {
        return ++this.#currentVersion;
    }
    versionRevisionByPath = new Map();
    constructor(config, owner) {
        this.config = config;
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
    setup() {
        // 実体化された state オブジェクトのプロパティをすべて PathManager に登録する
        // ToDo:prototypeを遡ったほうが良い
        for (const path in this.state) {
            if (RESERVED_WORD_SET.has(path) || this.pathManager.alls.has(path)) {
                continue;
            }
            this.pathManager.alls.add(path);
            addPathNode(this.pathManager.rootNode, path);
        }
        const componentClass = this.owner.constructor;
        const rootRef = getStatePropertyRef(getStructuredPathInfo(''), null);
        this.#bindContent = createBindContent(null, componentClass.id, this, rootRef); // this.stateArrayPropertyNamePatternsが変更になる可能性がある
    }
    get readyResolvers() {
        return this.#readyResolvers;
    }
    async connectedCallback() {
        if (this.config.enableWebComponents) {
            attachShadow(this.owner, this.config, this.styleSheet);
        }
        else {
            this.#blockParentNode = this.owner.parentNode;
            this.#blockPlaceholder = document.createComment("Structive block placeholder");
            try {
                this.#ignoreDissconnectedCallback = true; // disconnectedCallbackを無視するフラグを立てる
                this.owner.replaceWith(this.#blockPlaceholder); // disconnectCallbackが呼ばれてしまう
            }
            finally {
                this.#ignoreDissconnectedCallback = false;
            }
        }
        if (this.config.enableWebComponents) {
            // Shadow DOMにバインドコンテンツをマウントする
            this.bindContent.mount(this.owner.shadowRoot ?? this.owner);
        }
        else {
            // ブロックプレースホルダーの親ノードにバインドコンテンツをマウントする
            const parentNode = this.#blockParentNode ?? raiseError({
                code: 'BIND-201',
                message: 'Block parent node is not set',
                context: { where: 'ComponentEngine.connectedCallback', mode: 'block' },
                docsUrl: './docs/error-codes.md#bind',
            });
            this.bindContent.mountAfter(parentNode, this.#blockPlaceholder);
        }
        /**
         * setup()で状態の初期化と初期レンダリングを行わない理由
         * - setup()はコンポーネントのインスタンス化時に呼ばれるが、connectedCallback()はDOMに接続されたときに呼ばれる
         * - disconnectでinactivateされた後に再度connectされた場合、状態の初期化とレンダリングを再度行う必要がある
         */
        // コンポーネントの状態を初期化する
        if (this.owner.dataset.state) {
            // data-state属性から状態を取得する
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
        // 状態の初期レンダリングを行う
        createUpdater(this, (updater) => {
            updater.initialRender((renderer) => {
                this.bindContent.activate();
                renderer.createReadonlyState((readonlyState, readonlyHandler) => {
                    this.bindContent.applyChange(renderer);
                });
            });
        });
        // connectedCallbackが実装されていれば呼び出す
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
        this.#readyResolvers.resolve();
    }
    async disconnectedCallback() {
        if (this.#ignoreDissconnectedCallback)
            return; // disconnectedCallbackを無視するフラグが立っている場合は何もしない
        try {
            // 同期処理
            if (this.pathManager.hasDisconnectedCallback) {
                createUpdater(this, (updater) => {
                    updater.update(null, (stateProxy, handler) => {
                        stateProxy[DisconnectedCallbackSymbol]();
                    });
                });
            }
        }
        finally {
            // 親コンポーネントから登録を解除する
            this.owner.parentStructiveComponent?.unregisterChildComponent(this.owner);
            if (!this.config.enableWebComponents) {
                this.#blockPlaceholder?.remove();
                this.#blockPlaceholder = null;
                this.#blockParentNode = null;
            }
            // 状態の不活化とunmountを行う
            // inactivateの中でbindContent.unmountも呼ばれる
            createUpdater(this, (updater) => {
                updater.initialRender((renderer) => {
                    this.bindContent.inactivate();
                });
            });
        }
    }
    getListIndexes(ref) {
        if (this.stateOutput.startsWith(ref.info)) {
            return this.stateOutput.getListIndexes(ref);
        }
        let value = null;
        // 同期処理
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetListIndexesByRefSymbol](ref);
            });
        });
        return value;
    }
    getPropertyValue(ref) {
        // プロパティの値を取得する
        let value;
        // 同期処理
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetByRefSymbol](ref);
            });
        });
        return value;
    }
    setPropertyValue(ref, value) {
        // プロパティの値を設定する
        // 同期処理
        createUpdater(this, (updater) => {
            updater.update(null, (stateProxy, handler) => {
                stateProxy[SetByRefSymbol](ref, value);
            });
        });
    }
    // Structive子コンポーネントを登録する
    registerChildComponent(component) {
        this.structiveChildComponents.add(component);
    }
    unregisterChildComponent(component) {
        this.structiveChildComponents.delete(component);
    }
    #propertyRefInfoByRef = new WeakMap();
    getCacheEntry(ref) {
        return this.#propertyRefInfoByRef.get(ref)?.cacheEntry ?? null;
    }
    setCacheEntry(ref, entry) {
        let info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info === "undefined") {
            this.#propertyRefInfoByRef.set(ref, { bindings: [], cacheEntry: entry });
        }
        else {
            info.cacheEntry = entry;
        }
    }
    getBindings(ref) {
        return this.#propertyRefInfoByRef.get(ref)?.bindings ?? [];
    }
    saveBinding(ref, binding) {
        const info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info === "undefined") {
            this.#propertyRefInfoByRef.set(ref, { bindings: [binding], cacheEntry: null });
        }
        else {
            info.bindings.push(binding);
        }
    }
    removeBinding(ref, binding) {
        const info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info !== "undefined") {
            const index = info.bindings.indexOf(binding);
            if (index >= 0) {
                info.bindings.splice(index, 1);
            }
        }
    }
}
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
    const bindText = config$2.debug ? template.getAttribute(DATA_BIND_ATTRIBUTE) : "";
    template.parentNode?.replaceChild(document.createComment(`${COMMENT_TEMPLATE_MARK}${id} ${bindText ?? ""}`), template);
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
 * - enableShadowDomやextendsなどの設定値を一元的に返却
 *
 * 設計ポイント:
 * - ユーザーごとの個別設定と全体のデフォルト設定を柔軟に統合
 * - 設定値のデフォルト化や拡張性を考慮した設計
 */
function getComponentConfig(userConfig) {
    const globalConfig = getGlobalConfig();
    return {
        enableWebComponents: typeof userConfig.enableWebComponents === "undefined" ? true : userConfig.enableWebComponents,
        enableShadowDom: userConfig.enableShadowDom ?? globalConfig.enableShadowDom,
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
        for (const path of alls) {
            const info = getStructuredPathInfo(path);
            this.alls = this.alls.union(info.cumulativePathSet);
        }
        const lists = getListPathsSetById(this.#id);
        this.lists = this.lists.union(lists);
        for (const listPath of lists) {
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
        for (const path of info.cumulativePathSet) {
            if (this.alls.has(path))
                continue;
            this.alls.add(path);
            addPathNode(this.rootNode, path);
            const pathInfo = getStructuredPathInfo(path);
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
 * - getter/setter/バインディング最適化やアクセサ自動生成（optimizeAccessor）に対応
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
 * - config.enableShadowDom でShadow DOMの有効/無効を切り替え
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
        if (config$2.enableShadowDom) {
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
