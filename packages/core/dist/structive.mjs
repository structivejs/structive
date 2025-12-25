/**
 * Global configuration object with default values for all Structive components.
 * This object can be modified directly to change application-wide behavior.
 */
const globalConfig = {
    /** Enable debug mode for verbose logging */
    "debug": false,
    /** Locale for internationalization (e.g., "en-US", "ja-JP") */
    "locale": "en-US",
    /** Shadow DOM mode: "auto" (default) uses Shadow DOM when supported, "none" disables it, "force" requires it */
    "shadowDomMode": "auto",
    /** Enable the main wrapper component */
    "enableMainWrapper": true,
    /** Enable the router component */
    "enableRouter": true,
    /** Automatically insert the main wrapper into the document */
    "autoInsertMainWrapper": false,
    /** Automatically initialize components on page load */
    "autoInit": true,
    /** Custom tag name for the main wrapper element */
    "mainTagName": "app-main",
    /** Custom tag name for the router element */
    "routerTagName": "view-router",
    /** Path to the layout template file */
    "layoutPath": "",
    /** Automatically load components referenced in import maps */
    "autoLoadFromImportMap": false,
};
/**
 * Retrieves the global configuration object.
 * Returns a reference to the live configuration object, so modifications
 * will affect all components.
 *
 * @returns {IConfig} The global configuration object
 *
 * @example
 * const config = getGlobalConfig();
 * config.debug = true; // Enable debug mode
 * config.shadowDomMode = 'none'; // Disable Shadow DOM
 */
function getGlobalConfig() {
    return globalConfig;
}
/**
 * Pre-initialized global configuration for convenient access.
 * This is a direct reference to the result of getGlobalConfig().
 *
 * @example
 * import { config } from './getGlobalConfig';
 * console.log(config.locale); // 'en-US'
 */
const config$2 = getGlobalConfig();

/**
 * Error generation utility
 *
 * Purpose:
 * - Throws exceptions with structured metadata (code, context, hint, documentation URL, severity, cause)
 * - Follows existing Error conventions while adding additional properties to improve debuggability
 *
 * Example:
 * raiseError({
 *   code: 'UPD-001',
 *   message: 'Engine not initialized',
 *   context: { where: 'Renderer.render' },
 *   docsUrl: './docs/error-codes.md#upd'
 * });
 */
/**
 * Raises an error with optional structured metadata.
 *
 * This function provides two calling patterns:
 * 1. Simple string message for basic errors
 * 2. Structured payload with metadata for enhanced debugging
 *
 * The structured payload attaches additional properties to the Error object,
 * making it easier to debug issues in production by providing context, hints,
 * and links to documentation.
 *
 * @param {string | StructiveErrorPayload} messageOrPayload - Error message or structured payload
 * @returns {never} This function never returns (always throws)
 *
 * @example
 * // Simple error
 * raiseError('Something went wrong');
 *
 * @example
 * // Structured error with metadata
 * raiseError({
 *   code: 'STATE-101',
 *   message: 'Invalid state property',
 *   context: { property: 'user.name', value: undefined },
 *   hint: 'Ensure the property is initialized before access',
 *   docsUrl: './docs/error-codes.md#state-101',
 *   severity: 'error'
 * });
 */
function raiseError(messageOrPayload) {
    // Handle simple string message
    if (typeof messageOrPayload === "string") {
        throw new Error(messageOrPayload);
    }
    // Handle structured payload
    const { message, code, context, hint, docsUrl, severity, cause } = messageOrPayload;
    if (config$2.debug) {
        // eslint-disable-next-line no-console
        console.group(`[Structive Error] ${code}: ${message}`);
        // eslint-disable-next-line no-console
        if (context) {
            console.log('Context:', context);
        }
        // eslint-disable-next-line no-console
        if (hint) {
            console.log('Hint:', hint);
        }
        // eslint-disable-next-line no-console
        if (docsUrl) {
            console.log('Docs:', docsUrl);
        }
        if (cause) {
            console.error('Cause:', cause);
        }
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
    // Create base Error with the message
    const err = new Error(message);
    // Attach additional metadata as properties (keeping message for existing compatibility)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    err.code = code;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (context) {
        err.context = context;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (hint) {
        err.hint = hint;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (docsUrl) {
        err.docsUrl = docsUrl;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (severity) {
        err.severity = severity;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (cause) {
        err.cause = cause;
    }
    throw err;
}

/**
 * errorMessages.ts
 *
 * Error message generation utilities used by filter functions.
 *
 * Main responsibilities:
 * - Throws clear error messages when filter options or value type checks fail
 * - Takes function name as argument to specify which filter caused the error
 *
 * Design points:
 * - optionsRequired: Error when required option is not specified
 * - optionMustBeNumber: Error when option value is not a number
 * - valueMustBeNumber: Error when value is not a number
 * - valueMustBeBoolean: Error when value is not boolean
 * - valueMustBeDate: Error when value is not a Date
 */
const createContext = (where, fnName) => ({ where, fnName });
/**
 * Throws error when filter requires at least one option but none provided.
 *
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires at least one option
 */
function optionsRequired(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires at least one option`,
        context: createContext("Filter.optionsRequired", fnName),
        docsUrl: "./docs/error-codes.md#flt",
    });
}
/**
 * Throws error when filter option must be a number but invalid value provided.
 *
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires a number as option
 */
function optionMustBeNumber(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a number as option`,
        context: createContext("Filter.optionMustBeNumber", fnName),
        docsUrl: "./docs/error-codes.md#flt",
    });
}
/**
 * Throws error when filter requires numeric value but non-number provided.
 *
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires a number value
 */
function valueMustBeNumber(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a number value`,
        context: createContext("Filter.valueMustBeNumber", fnName),
        docsUrl: "./docs/error-codes.md#flt",
    });
}
/**
 * Throws error when filter requires boolean value but non-boolean provided.
 *
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires a boolean value
 */
function valueMustBeBoolean(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a boolean value`,
        context: createContext("Filter.valueMustBeBoolean", fnName),
        docsUrl: "./docs/error-codes.md#flt",
    });
}
/**
 * Throws error when filter requires Date value but non-Date provided.
 *
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires a date value
 */
function valueMustBeDate(fnName) {
    raiseError({
        code: "FLT-202",
        message: `${fnName} requires a date value`,
        context: createContext("Filter.valueMustBeDate", fnName),
        docsUrl: "./docs/error-codes.md#flt",
    });
}

/**
 * builtinFilters.ts
 *
 * Implementation file for built-in filter functions available in Structive.
 *
 * Main responsibilities:
 * - Provides filters for conversion, comparison, formatting, and validation of numbers, strings, dates, booleans, etc.
 * - Defines functions with options for each filter name, enabling flexible use during binding
 * - Designed for common use as both input and output filters
 *
 * Design points:
 * - Comprehensive coverage of diverse filters: eq, ne, lt, gt, inc, fix, locale, uc, lc, cap, trim, slice, pad, int, float, round, date, time, ymd, falsy, truthy, defaults, boolean, number, string, null, etc.
 * - Rich type checking and error handling for option values
 * - Centralized management of filter functions with FilterWithOptions type, easy to extend
 * - Dynamic retrieval of filter functions from filter names and options via builtinFilterFn
 */
const config$1 = getGlobalConfig();
function validateNumberString(value) {
    if (!value || isNaN(Number(value))) {
        return false;
    }
    return true;
}
/**
 * Equality filter - compares value with option.
 *
 * @param options - Array with comparison value as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number (when value is number)
 */
const eq = (options) => {
    const opt = options?.[0] ?? optionsRequired('eq');
    return (value) => {
        // Align types for comparison
        if (typeof value === 'number') {
            if (!validateNumberString(opt)) {
                optionMustBeNumber('eq');
            }
            return value === Number(opt);
        }
        if (typeof value === 'string') {
            return value === opt;
        }
        // Strict equality for others
        return value === opt;
    };
};
/**
 * Inequality filter - compares value with option.
 *
 * @param options - Array with comparison value as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number (when value is number)
 */
const ne = (options) => {
    const opt = options?.[0] ?? optionsRequired('ne');
    return (value) => {
        // Align types for comparison
        if (typeof value === 'number') {
            if (!validateNumberString(opt)) {
                optionMustBeNumber('ne');
            }
            return value !== Number(opt);
        }
        if (typeof value === 'string') {
            return value !== opt;
        }
        // Strict equality for others
        return value !== opt;
    };
};
/**
 * Boolean NOT filter - inverts boolean value.
 *
 * @param options - Unused
 * @returns Filter function that returns inverted boolean
 * @throws FLT-103 Value must be boolean
 */
const not = (_options) => {
    return (value) => {
        if (typeof value !== 'boolean') {
            valueMustBeBoolean('not');
        }
        return !value;
    };
};
/**
 * Less than filter - checks if value is less than option.
 *
 * @param options - Array with comparison number as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const lt = (options) => {
    const opt = options?.[0] ?? optionsRequired('lt');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('lt');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('lt');
        }
        return value < Number(opt);
    };
};
/**
 * Less than or equal filter - checks if value is less than or equal to option.
 *
 * @param options - Array with comparison number as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const le = (options) => {
    const opt = options?.[0] ?? optionsRequired('le');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('le');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('le');
        }
        return value <= Number(opt);
    };
};
/**
 * Greater than filter - checks if value is greater than option.
 *
 * @param options - Array with comparison number as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const gt = (options) => {
    const opt = options?.[0] ?? optionsRequired('gt');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('gt');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('gt');
        }
        return value > Number(opt);
    };
};
/**
 * Greater than or equal filter - checks if value is greater than or equal to option.
 *
 * @param options - Array with comparison number as first element
 * @returns Filter function that returns boolean
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const ge = (options) => {
    const opt = options?.[0] ?? optionsRequired('ge');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('ge');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('ge');
        }
        return value >= Number(opt);
    };
};
/**
 * Increment filter - adds option value to input value.
 *
 * @param options - Array with increment number as first element
 * @returns Filter function that returns incremented number
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const inc = (options) => {
    const opt = options?.[0] ?? optionsRequired('inc');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('inc');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('inc');
        }
        return value + Number(opt);
    };
};
/**
 * Decrement filter - subtracts option value from input value.
 *
 * @param options - Array with decrement number as first element
 * @returns Filter function that returns decremented number
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const dec = (options) => {
    const opt = options?.[0] ?? optionsRequired('dec');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('dec');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('dec');
        }
        return value - Number(opt);
    };
};
/**
 * Multiply filter - multiplies value by option.
 *
 * @param options - Array with multiplier number as first element
 * @returns Filter function that returns multiplied number
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const mul = (options) => {
    const opt = options?.[0] ?? optionsRequired('mul');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('mul');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('mul');
        }
        return value * Number(opt);
    };
};
/**
 * Divide filter - divides value by option.
 *
 * @param options - Array with divisor number as first element
 * @returns Filter function that returns divided number
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const div = (options) => {
    const opt = options?.[0] ?? optionsRequired('div');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('div');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('div');
        }
        return value / Number(opt);
    };
};
/**
 * Modulo filter - returns remainder of division.
 *
 * @param options - Array with divisor number as first element
 * @returns Filter function that returns remainder
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const mod = (options) => {
    const opt = options?.[0] ?? optionsRequired('mod');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('mod');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('mod');
        }
        return value % Number(opt);
    };
};
/**
 * Fixed decimal filter - formats number to fixed decimal places.
 *
 * @param options - Array with decimal places as first element (default: 0)
 * @returns Filter function that returns formatted string
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const fix = (options) => {
    const opt = options?.[0] ?? "0";
    if (!validateNumberString(opt)) {
        optionMustBeNumber('fix');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('fix');
        }
        return value.toFixed(Number(opt));
    };
};
/**
 * Locale number filter - formats number according to locale.
 *
 * @param options - Array with locale string as first element (default: config.locale)
 * @returns Filter function that returns localized number string
 * @throws FLT-104 Value must be number
 */
const locale = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('locale');
        }
        return value.toLocaleString(opt);
    };
};
/**
 * Uppercase filter - converts string to uppercase.
 *
 * @param options - Unused
 * @returns Filter function that returns uppercase string
 */
const uc = (_options) => {
    return (value) => {
        return String(value).toUpperCase();
    };
};
/**
 * Lowercase filter - converts string to lowercase.
 *
 * @param options - Unused
 * @returns Filter function that returns lowercase string
 */
const lc = (_options) => {
    return (value) => {
        return String(value).toLowerCase();
    };
};
/**
 * Capitalize filter - capitalizes first character of string.
 *
 * @param options - Unused
 * @returns Filter function that returns capitalized string
 */
const cap = (_options) => {
    return (value) => {
        const v = String(value);
        if (v.length === 0) {
            return v;
        }
        if (v.length === 1) {
            return v.toUpperCase();
        }
        return v.charAt(0).toUpperCase() + v.slice(1);
    };
};
/**
 * Trim filter - removes whitespace from both ends of string.
 *
 * @param options - Unused
 * @returns Filter function that returns trimmed string
 */
const trim$1 = (_options) => {
    return (value) => {
        return String(value).trim();
    };
};
/**
 * Slice filter - extracts portion of string from specified index.
 *
 * @param options - Array with start index as first element
 * @returns Filter function that returns sliced string
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 */
const slice = (options) => {
    const opt = options?.[0] ?? optionsRequired('slice');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('slice');
    }
    return (value) => {
        return String(value).slice(Number(opt));
    };
};
/**
 * Substring filter - extracts substring from specified position and length.
 *
 * @param options - Array with start index and length
 * @returns Filter function that returns substring
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 */
const substr = (options) => {
    const opt1 = options?.[0] ?? optionsRequired('substr');
    if (!validateNumberString(opt1)) {
        optionMustBeNumber('substr');
    }
    const opt2 = options?.[1] ?? optionsRequired('substr');
    if (!validateNumberString(opt2)) {
        optionMustBeNumber('substr');
    }
    return (value) => {
        return String(value).substr(Number(opt1), Number(opt2));
    };
};
/**
 * Pad filter - pads string to specified length from start.
 *
 * @param options - Array with target length and pad string (default: '0')
 * @returns Filter function that returns padded string
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 */
const pad = (options) => {
    const opt1 = options?.[0] ?? optionsRequired('pad');
    if (!validateNumberString(opt1)) {
        optionMustBeNumber('pad');
    }
    const opt2 = options?.[1] ?? '0';
    return (value) => {
        return String(value).padStart(Number(opt1), opt2);
    };
};
/**
 * Repeat filter - repeats string specified number of times.
 *
 * @param options - Array with repeat count as first element
 * @returns Filter function that returns repeated string
 * @throws FLT-101 Options required
 * @throws FLT-102 Option must be number
 */
const rep = (options) => {
    const opt = options?.[0] ?? optionsRequired('rep');
    if (!validateNumberString(opt)) {
        optionMustBeNumber('rep');
    }
    return (value) => {
        return String(value).repeat(Number(opt));
    };
};
/**
 * Reverse filter - reverses character order in string.
 *
 * @param options - Unused
 * @returns Filter function that returns reversed string
 */
const rev = (_options) => {
    return (value) => {
        return String(value).split('').reverse().join('');
    };
};
/**
 * Integer filter - parses value to integer.
 *
 * @param options - Unused
 * @returns Filter function that returns integer
 */
const int = (_options) => {
    return (value) => {
        return parseInt(String(value), 10);
    };
};
/**
 * Float filter - parses value to floating point number.
 *
 * @param options - Unused
 * @returns Filter function that returns float
 */
const float = (_options) => {
    return (value) => {
        return parseFloat(String(value));
    };
};
/**
 * Round filter - rounds number to specified decimal places.
 *
 * @param options - Array with decimal places as first element (default: 0)
 * @returns Filter function that returns rounded number
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const round = (options) => {
    const opt = options?.[0] ?? '0';
    if (!validateNumberString(opt)) {
        optionMustBeNumber('round');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('round');
        }
        const optValue = Math.pow(10, Number(opt));
        return Math.round(value * optValue) / optValue;
    };
};
/**
 * Floor filter - rounds number down to specified decimal places.
 *
 * @param options - Array with decimal places as first element (default: 0)
 * @returns Filter function that returns floored number
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const floor = (options) => {
    const opt = options?.[0] ?? '0';
    if (!validateNumberString(opt)) {
        optionMustBeNumber('floor');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('floor');
        }
        const optValue = Math.pow(10, Number(opt));
        return Math.floor(value * optValue) / optValue;
    };
};
/**
 * Ceiling filter - rounds number up to specified decimal places.
 *
 * @param options - Array with decimal places as first element (default: 0)
 * @returns Filter function that returns ceiled number
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const ceil = (options) => {
    const opt = options?.[0] ?? '0';
    if (!validateNumberString(opt)) {
        optionMustBeNumber('ceil');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('ceil');
        }
        const optValue = Math.pow(10, Number(opt));
        return Math.ceil(value * optValue) / optValue;
    };
};
/**
 * Percent filter - formats number as percentage string.
 *
 * @param options - Array with decimal places as first element (default: 0)
 * @returns Filter function that returns percentage string with '%'
 * @throws FLT-102 Option must be number
 * @throws FLT-104 Value must be number
 */
const percent = (options) => {
    const opt = options?.[0] ?? '0';
    if (!validateNumberString(opt)) {
        optionMustBeNumber('percent');
    }
    return (value) => {
        if (typeof value !== 'number') {
            valueMustBeNumber('percent');
        }
        return `${(value * 100).toFixed(Number(opt))}%`;
    };
};
/**
 * Date filter - formats Date object as localized date string.
 *
 * @param options - Array with locale string as first element (default: config.locale)
 * @returns Filter function that returns date string
 * @throws FLT-105 Value must be Date
 */
const date = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date)) {
            valueMustBeDate('date');
        }
        return value.toLocaleDateString(opt);
    };
};
/**
 * Time filter - formats Date object as localized time string.
 *
 * @param options - Array with locale string as first element (default: config.locale)
 * @returns Filter function that returns time string
 * @throws FLT-105 Value must be Date
 */
const time = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date)) {
            valueMustBeDate('time');
        }
        return value.toLocaleTimeString(opt);
    };
};
/**
 * DateTime filter - formats Date object as localized date and time string.
 *
 * @param options - Array with locale string as first element (default: config.locale)
 * @returns Filter function that returns datetime string
 * @throws FLT-105 Value must be Date
 */
const datetime = (options) => {
    const opt = options?.[0] ?? config$1.locale;
    return (value) => {
        if (!(value instanceof Date)) {
            valueMustBeDate('datetime');
        }
        return value.toLocaleString(opt);
    };
};
/**
 * Year-Month-Day filter - formats Date object as YYYY-MM-DD string.
 *
 * @param options - Array with separator string as first element (default: '-')
 * @returns Filter function that returns formatted date string
 * @throws FLT-105 Value must be Date
 */
const ymd = (options) => {
    const opt = options?.[0] ?? '-';
    return (value) => {
        if (!(value instanceof Date)) {
            valueMustBeDate('ymd');
        }
        const year = value.getFullYear().toString();
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const day = value.getDate().toString().padStart(2, '0');
        return `${year}${opt}${month}${opt}${day}`;
    };
};
/**
 * Falsy filter - checks if value is falsy.
 *
 * @param options - Unused
 * @returns Filter function that returns true for false/null/undefined/0/''/NaN
 */
const falsy = (_options) => {
    return (value) => value === false || value === null || value === undefined || value === 0 || value === '' || Number.isNaN(value);
};
/**
 * Truthy filter - checks if value is truthy.
 *
 * @param options - Unused
 * @returns Filter function that returns true for non-falsy values
 */
const truthy = (_options) => {
    return (value) => value !== false && value !== null && value !== undefined && value !== 0 && value !== '' && !Number.isNaN(value);
};
/**
 * Default filter - returns default value if input is falsy.
 *
 * @param options - Array with default value as first element
 * @returns Filter function that returns value or default
 * @throws FLT-101 Options required
 */
const defaults = (options) => {
    const opt = options?.[0] ?? optionsRequired('defaults');
    return (value) => {
        if (value === false || value === null || value === undefined || value === 0 || value === '' || Number.isNaN(value)) {
            return opt;
        }
        return value;
    };
};
/**
 * Boolean filter - converts value to boolean.
 *
 * @param options - Unused
 * @returns Filter function that returns boolean
 */
const boolean = (_options) => {
    return (value) => {
        return Boolean(value);
    };
};
/**
 * Number filter - converts value to number.
 *
 * @param options - Unused
 * @returns Filter function that returns number
 */
const number = (_options) => {
    return (value) => {
        return Number(value);
    };
};
/**
 * String filter - converts value to string.
 *
 * @param options - Unused
 * @returns Filter function that returns string
 */
const string = (_options) => {
    return (value) => {
        return String(value);
    };
};
/**
 * Null filter - converts empty string to null.
 *
 * @param options - Unused
 * @returns Filter function that returns null for empty string, otherwise original value
 */
const _null = (_options) => {
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
 * Management module for registering and retrieving StateClass instances by ID.
 *
 * Main responsibilities:
 * - stateClassById: Record managing StateClass instances keyed by ID
 * - registerStateClass: Registers a StateClass instance with the specified ID
 * - getStateClassById: Retrieves a StateClass instance by ID (throws error if not registered)
 *
 * Design points:
 * - Centrally manages StateClass instances globally for fast access via ID
 * - Raises clear exceptions via raiseError when accessing non-existent IDs
 */
// Global registry mapping StateClass IDs to their instances
const stateClassById = {};
/**
 * Registers a StateClass instance with a unique ID.
 *
 * This function stores the StateClass instance in a global registry,
 * making it accessible for retrieval via getStateClassById.
 *
 * @param id - Unique identifier for the StateClass instance
 * @param stateClass - StateClass instance to register
 */
function registerStateClass(id, stateClass) {
    stateClassById[id] = stateClass;
}
/**
 * Retrieves a registered StateClass instance by its ID.
 *
 * This function looks up a StateClass instance from the global registry.
 * If the ID is not found, it throws a descriptive error.
 *
 * @param id - Unique identifier of the StateClass instance to retrieve
 * @returns The registered StateClass instance
 * @throws {Error} STATE-101 - When no StateClass is registered with the given ID
 */
function getStateClassById(id) {
    return stateClassById[id] ?? raiseError({
        code: "STATE-101",
        message: `StateClass not found: ${id}`,
        context: { where: 'StateClass.getStateClassById', stateClassId: id },
        docsUrl: "./docs/error-codes.md#state",
    });
}

/**
 * registerStyleSheet.ts
 *
 * Management module for registering and retrieving CSSStyleSheet instances by ID.
 *
 * Main responsibilities:
 * - styleSheetById: Record that manages CSSStyleSheet instances keyed by ID
 * - registerStyleSheet: Registers a CSSStyleSheet instance with a specified ID
 * - getStyleSheetById: Retrieves a CSSStyleSheet instance by ID (throws error if not registered)
 *
 * Design points:
 * - Centrally manages CSSStyleSheet instances globally, enabling fast access via ID
 * - Throws clear exceptions via raiseError when accessing non-existent IDs
 */
/**
 * Global registry for CSSStyleSheet instances keyed by numeric ID.
 * Enables fast lookup and sharing of stylesheets across components.
 */
const styleSheetById = {};
/**
 * Registers a CSSStyleSheet instance with a unique numeric ID.
 * Allows the stylesheet to be retrieved later via getStyleSheetById.
 * Overwrites any existing stylesheet with the same ID.
 *
 * @param {number} id - Unique numeric identifier for the stylesheet
 * @param {CSSStyleSheet} css - The CSSStyleSheet instance to register
 * @returns {void}
 *
 * @example
 * const sheet = new CSSStyleSheet();
 * registerStyleSheet(1, sheet);
 */
function registerStyleSheet(id, css) {
    styleSheetById[id] = css;
}
/**
 * Retrieves a registered CSSStyleSheet instance by its numeric ID.
 * Throws an error if no stylesheet is found with the given ID.
 *
 * @param {number} id - The numeric identifier of the stylesheet to retrieve
 * @returns {CSSStyleSheet} The registered CSSStyleSheet instance
 * @throws {Error} Throws CSS-001 error if the stylesheet ID is not registered
 *
 * @example
 * const sheet = getStyleSheetById(1);
 * document.adoptedStyleSheets = [sheet];
 */
function getStyleSheetById(id) {
    // Return the stylesheet if found, otherwise throw a descriptive error
    return styleSheetById[id] ?? raiseError({
        code: "CSS-001",
        message: `Stylesheet not found: ${id}`,
        context: { where: 'StyleSheet.getStyleSheetById', styleSheetId: id },
        docsUrl: "./docs/error-codes.md#css",
    });
}

/**
 * regsiterCss.ts
 *
 * Utility function for creating CSSStyleSheet from CSS strings and registering them by ID.
 *
 * Main responsibilities:
 * - Creates CSSStyleSheet instances from CSS strings
 * - Registers the CSSStyleSheet with a specified ID using registerStyleSheet
 *
 * Design points:
 * - Uses styleSheet.replaceSync to apply CSS synchronously
 * - Enables global style management and dynamic style application
 */
/**
 * Creates a CSSStyleSheet from a CSS string and registers it with a unique ID.
 * The CSS is applied synchronously using replaceSync for immediate availability.
 *
 * @param {number} id - Unique numeric identifier for the stylesheet
 * @param {string} css - CSS rules as a string to be applied to the stylesheet
 * @returns {void}
 *
 * @example
 * registerCss(1, `
 *   .container { display: flex; }
 *   .item { padding: 10px; }
 * `);
 */
function registerCss(id, css) {
    // Create a new CSSStyleSheet instance
    const styleSheet = new CSSStyleSheet();
    // Apply CSS rules synchronously to the stylesheet
    styleSheet.replaceSync(css);
    // Register the stylesheet in the global registry
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
    if (path.length === 0) {
        return node;
    }
    // Step 3: Traverse each index in path sequentially
    // Using for loop instead of path.reduce() to explicitly check and break when null
    for (let i = 0; i < path.length; i++) {
        // Get childNodes[index] of current node (null if doesn't exist)
        node = node?.childNodes[path[i]] ?? null;
        // Break loop if node doesn't exist
        if (node === null) {
            break;
        }
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
    let currentNode = node;
    // Loop while parent node exists (until reaching root)
    while (currentNode.parentNode !== null) {
        // Convert parent node's childNodes to array
        const childNodes = Array.from(currentNode.parentNode.childNodes);
        // Get index of current node within parent's childNodes and prepend to array
        // Prepending maintains root→leaf order
        routeIndexes = [childNodes.indexOf(currentNode), ...routeIndexes];
        // Move to parent node for next iteration
        currentNode = currentNode.parentNode;
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
 * Creates and caches filter functions for data binding.
 *
 * This module provides a caching mechanism for filter creation to avoid
 * recreating filter chains for the same filter definitions and text patterns.
 */
// Cache storage: Map<FilterDefinitions, Map<FilterTextPatterns, CreatedFilters>>
const filtersByFilterTextsByFilters = new Map();
/**
 * Creates a list of filter functions based on the provided definitions and text patterns.
 * Results are cached to improve performance when the same filters are requested multiple times.
 *
 * @param filters - The available filter definitions (map of filter names to functions/options).
 * @param filterTexts - The parsed filter text patterns from the binding string.
 * @returns An array of executable filter functions.
 */
function createBindingFilters(filters, filterTexts) {
    let filtersByFilterTexts = filtersByFilterTextsByFilters.get(filters);
    if (!filtersByFilterTexts) {
        filtersByFilterTexts = new Map();
        filtersByFilterTextsByFilters.set(filters, filtersByFilterTexts);
    }
    let filterFns = filtersByFilterTexts.get(filterTexts);
    if (!filterFns) {
        filterFns = createFilters(filters, filterTexts);
        filtersByFilterTexts.set(filterTexts, filterFns);
    }
    return filterFns;
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
    get buildable() {
        return false;
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
    assignValue(_value) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding assignValue not implemented',
            context: { where: 'BindingNode.assignValue', name: this.name },
            docsUrl: './docs/error-codes.md#bind',
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
    updateElements(_listIndexes, _values) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding updateElements not implemented',
            context: { where: 'BindingNode.updateElements', name: this.name },
            docsUrl: './docs/error-codes.md#bind',
        });
    }
    /**
     * Redraw notification method (empty implementation in base class, can override in subclasses).
     * - Used to update related bindings after dynamic dependency resolution
     * - Used in structural control bindings to notify child BindContent
     *
     * @param refs - Array of state references for redraw
     */
    notifyRedraw(_refs) {
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
        const element = this.node;
        const stringValue = value === null ||
            value === undefined ||
            (typeof value === "number" && Number.isNaN(value))
            ? ""
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            : String(value);
        element.setAttribute(this.subName, stringValue);
    }
}
const subNameByName$4 = {};
/**
 * Factory function to generate attribute binding node.
 *
 * @param name - Binding name (e.g., "attr.src", "attr.alt")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeAttribute with binding, node, and filters
 */
const createBindingNodeAttribute = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName$4[name] ?? (subNameByName$4[name] = name.split(".")[1]);
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
 * Utility for generating and caching detailed structured path information (IStructuredPathInfo)
 * from State property path strings.
 *
 * Main responsibilities:
 * - Splits path strings and analyzes segments, wildcard (*) positions, and parent-child relationships
 * - Structures information about path hierarchy and wildcard hierarchy (cumulativePaths/wildcardPaths/parentPath, etc.)
 * - Caches analysis results as IStructuredPathInfo for reusability and performance
 * - Ensures safety with reserved word checks
 *
 * Design points:
 * - Caches by path for fast retrieval on multiple accesses to the same path
 * - Strictly analyzes wildcards, parent-child relationships, and hierarchical structure, optimized for bindings and nested loops
 * - Raises exceptions via raiseError for reserved words or dangerous paths
 */
/**
 * Cache for structured path information.
 * Uses plain object instead of Map since reserved words and object property names
 * are not expected to be used as path patterns in practice.
 */
const _cache$2 = {};
/**
 * Class representing comprehensive structured information about a State property path.
 * Analyzes path hierarchy, wildcard positions, parent-child relationships, and provides
 * various access patterns for binding and dependency tracking.
 *
 * @class StructuredPathInfo
 * @implements {IStructuredPathInfo}
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
    /**
     * Constructs a StructuredPathInfo instance with comprehensive path analysis.
     * Parses the pattern into segments, identifies wildcards, builds cumulative and wildcard paths,
     * and establishes parent-child relationships for hierarchical navigation.
     *
     * @param {string} pattern - The property path pattern (e.g., "items.*.name" or "user.profile")
     */
    constructor(pattern) {
        // Helper to get or create StructuredPathInfo instances, avoiding redundant creation for self-reference
        const getPattern = (_pattern) => {
            return (pattern === _pattern) ? this : getStructuredPathInfo(_pattern);
        };
        // Split the pattern into individual path segments (e.g., "items.*.name" → ["items", "*", "name"])
        const pathSegments = pattern.split(".");
        // Arrays to track all cumulative paths from root to each segment
        const cumulativePaths = [];
        const cumulativeInfos = [];
        // Arrays to track wildcard-specific information
        const wildcardPaths = [];
        const indexByWildcardPath = {}; // Maps wildcard path to its index position
        const wildcardInfos = [];
        const wildcardParentPaths = []; // Paths of parent segments for each wildcard
        const wildcardParentInfos = [];
        let currentPatternPath = "", prevPatternPath = "";
        let wildcardCount = 0;
        // Iterate through each segment to build cumulative paths and identify wildcards
        for (let i = 0; i < pathSegments.length; i++) {
            currentPatternPath += pathSegments[i];
            // If this segment is a wildcard, track it with all wildcard-specific metadata
            if (pathSegments[i] === "*") {
                wildcardPaths.push(currentPatternPath);
                indexByWildcardPath[currentPatternPath] = wildcardCount; // Store wildcard's ordinal position
                wildcardInfos.push(getPattern(currentPatternPath));
                wildcardParentPaths.push(prevPatternPath); // Parent path is the previous cumulative path
                wildcardParentInfos.push(getPattern(prevPatternPath));
                wildcardCount++;
            }
            // Track all cumulative paths for hierarchical navigation (e.g., "items", "items.*", "items.*.name")
            cumulativePaths.push(currentPatternPath);
            cumulativeInfos.push(getPattern(currentPatternPath));
            // Save current path as previous for next iteration, then add separator
            prevPatternPath = currentPatternPath;
            currentPatternPath += ".";
        }
        // Determine the deepest (last) wildcard path and the parent path of the entire pattern
        const lastWildcardPath = wildcardPaths.length > 0 ? wildcardPaths[wildcardPaths.length - 1] : null;
        const parentPath = cumulativePaths.length > 1 ? cumulativePaths[cumulativePaths.length - 2] : null;
        // Assign all analyzed data to readonly properties
        this.pattern = pattern;
        this.pathSegments = pathSegments;
        this.lastSegment = pathSegments[pathSegments.length - 1];
        this.cumulativePaths = cumulativePaths;
        this.cumulativePathSet = new Set(cumulativePaths); // Set for fast lookup
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
    }
}
/**
 * Retrieves or creates a StructuredPathInfo instance for the given path pattern.
 * Uses caching to avoid redundant parsing of the same path patterns.
 * Validates that the path is not a reserved word before processing.
 *
 * @param {string} structuredPath - The property path pattern to analyze (e.g., "items.*.name")
 * @returns {IStructuredPathInfo} Comprehensive structured information about the path
 * @throws {Error} Throws STATE-202 error if the path is a reserved word
 *
 * @example
 * const info = getStructuredPathInfo("items.*.name");
 * console.log(info.wildcardCount); // 1
 * console.log(info.cumulativePaths); // ["items", "items.*", "items.*.name"]
 */
function getStructuredPathInfo(structuredPath) {
    // Validate that the path is not a reserved word to prevent conflicts
    if (RESERVED_WORD_SET.has(structuredPath)) {
        raiseError({
            code: 'STATE-202',
            message: `Pattern is reserved word: ${structuredPath}`,
            context: { where: 'StateProperty.getStructuredPathInfo', structuredPath },
            docsUrl: './docs/error-codes.md#state',
        });
    }
    // Return cached result if available
    const info = _cache$2[structuredPath];
    if (typeof info !== "undefined") {
        return info;
    }
    // Create new StructuredPathInfo and cache it for future use
    return (_cache$2[structuredPath] = new StructuredPathInfo(structuredPath));
}

/**
 * NodePath class represents a node in the property path tree.
 * Manages hierarchical path structure with parent-child relationships.
 */
class NodePath {
    parentPath;
    currentPath;
    name;
    childNodeByName;
    level;
    /**
     * Creates a new NodePath instance.
     * @param parentPath - Path of the parent node
     * @param name - Name of this node
     * @param level - Depth level in the tree (0 for root)
     */
    constructor(parentPath, name, level) {
        this.parentPath = parentPath;
        this.currentPath = parentPath ? `${parentPath}.${name}` : name;
        this.name = name;
        this.level = level;
        this.childNodeByName = new Map();
    }
    /**
     * Finds a node by traversing path segments.
     * @param segments - Array of path segments to traverse
     * @param segIndex - Current segment index (default: 0)
     * @returns Found node or null if not found
     */
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
    /**
     * Appends a child node with the given name.
     * Creates new child if it doesn't exist, otherwise returns existing child.
     * @param childName - Name of the child node to append
     * @returns Child node (existing or newly created)
     */
    appendChild(childName) {
        let childNode = this.childNodeByName.get(childName);
        if (!childNode) {
            const currentPath = this.parentPath ? `${this.parentPath}.${this.name}` : this.name;
            childNode = new NodePath(currentPath, childName, this.level + 1);
            this.childNodeByName.set(childName, childNode);
        }
        return childNode;
    }
}
/**
 * Factory function to create the root node of the path tree.
 * @returns Root node with empty path and name at level 0
 */
function createRootNode() {
    return new NodePath("", "", 0);
}
const cache$1 = new Map();
/**
 * Finds a path node by path string with caching.
 * @param rootNode - Root node to search from
 * @param path - Path string to find
 * @returns Found node or null if not found
 */
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
/**
 * Adds a path node to the tree, creating parent nodes if necessary.
 * @param rootNode - Root node of the tree
 * @param path - Path string to add
 * @returns Created or existing node at the path
 */
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
 * Cache for resolved path information.
 * Uses Map to safely handle property names including reserved words like "constructor" and "toString".
 */
const _cache$1 = new Map();
/**
 * Class that parses and stores resolved path information.
 *
 * Analyzes property path strings to extract:
 * - Path segments and their hierarchy
 * - Wildcard locations and types
 * - Numeric indexes vs unresolved wildcards
 * - Wildcard type classification (none/context/all/partial)
 */
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
    /**
     * Constructs resolved path information from a property path string.
     *
     * Parses the path to identify wildcards (*) and numeric indexes,
     * classifies the wildcard type, and generates structured path information.
     *
     * @param name - Property path string (e.g., "items.*.name" or "data.0.value")
     */
    constructor(name) {
        // Split path into individual segments
        const elements = name.split(".");
        const tmpPatternElements = elements.slice();
        const paths = [];
        let incompleteCount = 0; // Count of unresolved wildcards (*)
        let completeCount = 0; // Count of resolved wildcards (numeric indexes)
        let lastPath = "";
        let wildcardCount = 0;
        let wildcardType = "none";
        const wildcardIndexes = [];
        // Process each segment to identify wildcards and indexes
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element === "*") {
                // Unresolved wildcard
                tmpPatternElements[i] = "*";
                wildcardIndexes.push(null);
                incompleteCount++;
                wildcardCount++;
            }
            else {
                const number = Number(element);
                if (!Number.isNaN(number)) {
                    // Numeric index - treat as resolved wildcard
                    tmpPatternElements[i] = "*";
                    wildcardIndexes.push(number);
                    completeCount++;
                    wildcardCount++;
                }
            }
            // Build cumulative path array
            lastPath += element;
            paths.push(lastPath);
            lastPath += (i < elements.length - 1 ? "." : "");
        }
        // Generate pattern string with wildcards normalized
        const pattern = tmpPatternElements.join(".");
        const info = getStructuredPathInfo(pattern);
        // Classify wildcard type based on resolved vs unresolved counts
        if (incompleteCount > 0 || completeCount > 0) {
            if (incompleteCount === wildcardCount) {
                // All wildcards are unresolved - need context to resolve
                wildcardType = "context";
            }
            else if (completeCount === wildcardCount) {
                // All wildcards are resolved with numeric indexes
                wildcardType = "all";
            }
            else {
                // Mix of resolved and unresolved wildcards
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
/**
 * Retrieves or creates resolved path information for a property path.
 *
 * This function caches resolved path information for performance.
 * On first access, it parses the path and creates a ResolvedPathInfo instance.
 * Subsequent accesses return the cached result.
 *
 * @param name - Property path string (e.g., "items.*.name", "data.0.value")
 * @returns Resolved path information containing segments, wildcards, and type classification
 */
function getResolvedPathInfo(name) {
    let nameInfo;
    // Return cached value or create, cache, and return new instance
    return _cache$1.get(name) ?? (_cache$1.set(name, nameInfo = new ResolvedPathInfo(name)), nameInfo);
}

/**
 * Class representing a unique reference to a State property.
 * Combines structured path information with list index context for precise property identification.
 * Uses WeakRef for memory-efficient list index storage and supports parent reference traversal.
 *
 * @class StatePropertyRef
 * @implements {IStatePropertyRef}
 */
class StatePropertyRef {
    /** Structured information about the property path pattern */
    info;
    /** Private WeakRef to the list index, allowing garbage collection when no longer referenced */
    _listIndexRef;
    /**
     * Gets the list index for this property reference.
     * Throws an error if the list index has been garbage collected.
     *
     * @returns {IListIndex | null} The list index, or null if this reference has no list context
     * @throws {Error} Throws LIST-201 error if the listIndex was GC'd
     */
    get listIndex() {
        if (this._listIndexRef === null) {
            return null;
        }
        // Attempt to dereference WeakRef; if GC'd, throw error
        return this._listIndexRef.deref() ?? raiseError({
            code: "LIST-201",
            message: "listIndex is null",
            context: {
                where: 'StatePropertyRef.get listIndex',
                sid: this.info.sid,
                key: this.key,
            },
            docsUrl: "./docs/error-codes.md#list",
        });
    }
    /**
     * Unique string key composed from info.sid and listIndex.sid.
     * Used for caching and fast lookups.
     */
    key;
    /**
     * Constructs a StatePropertyRef instance.
     * Creates a WeakRef for the listIndex to allow garbage collection.
     * Generates a composite key for caching purposes.
     *
     * @param {IStructuredPathInfo} info - Structured path information
     * @param {IListIndex | null} listIndex - Optional list index context
     */
    constructor(info, listIndex) {
        this.info = info;
        // Store listIndex as WeakRef to allow GC when no longer needed elsewhere
        this._listIndexRef = listIndex !== null ? new WeakRef(listIndex) : null;
        // Compose key from info.sid and optionally listIndex.sid
        this.key = (listIndex === null) ? info.sid : (`${info.sid}#${listIndex.sid}`);
    }
    /**
     * Gets the parent property reference (one level up in the path hierarchy).
     * Handles list index adjustment when the parent has fewer wildcards.
     *
     * @returns {IStatePropertyRef | null} Parent reference, or null if this is a root property
     */
    get parentRef() {
        const parentInfo = this.info.parentInfo;
        if (!parentInfo) {
            return null;
        }
        // If current path has more wildcards than parent, use parent's list index (drop last level)
        // Otherwise, use the same list index
        const parentListIndex = (this.info.wildcardCount > parentInfo.wildcardCount
            ? this.listIndex?.at(-2)
            : this.listIndex)
            ?? null;
        return getStatePropertyRef(parentInfo, parentListIndex);
    }
}
/**
 * Cache for StatePropertyRef instances with non-null list indexes.
 * Uses WeakMap keyed by IListIndex to allow garbage collection when list indexes are no longer referenced.
 * Each entry maps pattern strings to their corresponding StatePropertyRef instances.
 */
const refByInfoByListIndex = new WeakMap();
/**
 * Cache for StatePropertyRef instances with null list indexes.
 * Uses a plain object keyed by pattern string since there's no WeakMap key available.
 */
const refByInfoByNull = {};
/**
 * Retrieves or creates a StatePropertyRef instance for the given path info and list index.
 * Implements caching to ensure identical (info, listIndex) pairs return the same instance,
 * enabling reference equality checks and stable Map keys.
 *
 * @param {IStructuredPathInfo} info - Structured path information
 * @param {IListIndex | null} listIndex - Optional list index context
 * @returns {IStatePropertyRef} Cached or newly created StatePropertyRef instance
 *
 * @example
 * const ref1 = getStatePropertyRef(pathInfo, listIndex);
 * const ref2 = getStatePropertyRef(pathInfo, listIndex);
 * console.log(ref1 === ref2); // true - same instance returned
 */
function getStatePropertyRef(info, listIndex) {
    let ref = null;
    if (listIndex !== null) {
        // Non-null listIndex: use WeakMap-based cache
        let refByInfo;
        if (typeof (refByInfo = refByInfoByListIndex.get(listIndex)) === "undefined") {
            // First reference for this listIndex: create new ref and initialize cache entry
            ref = new StatePropertyRef(info, listIndex);
            refByInfoByListIndex.set(listIndex, { [info.pattern]: ref });
        }
        else {
            // Cache entry exists for this listIndex: check for matching pattern
            if (typeof (ref = refByInfo[info.pattern]) === "undefined") {
                // Pattern not found: create and cache new ref
                return refByInfo[info.pattern] = new StatePropertyRef(info, listIndex);
            }
        }
    }
    else {
        // Null listIndex: use plain object cache
        if (typeof (ref = refByInfoByNull[info.pattern]) === "undefined") {
            // Pattern not found: create and cache new ref
            return refByInfoByNull[info.pattern] = new StatePropertyRef(info, null);
        }
    }
    return ref;
}

/**
 * Retrieves the list index for the specified structured path from the current property reference scope.
 *
 * This function accesses the most recently accessed StatePropertyRef in the handler and extracts
 * the list index corresponding to the given wildcard path. It supports nested loops and hierarchical
 * wildcard structures.
 *
 * @param handler - State handler containing the reference stack
 * @param structuredPath - Wildcard property path (e.g., "items.*", "data.*.children.*")
 * @returns List index for the specified path, or null if not found or reference is invalid
 */
function getContextListIndex(handler, structuredPath) {
    // Get the most recently accessed property reference from the stack
    const ref = handler.lastRefStack;
    if (ref === null) {
        return null;
    }
    // Ensure the reference has list index information
    if (ref.listIndex === null) {
        return null;
    }
    // Look up the wildcard level index for the specified path
    const index = ref.info.indexByWildcardPath[structuredPath];
    if (typeof index !== "undefined") {
        // Return the list index at the corresponding wildcard level
        return ref.listIndex.at(index);
    }
    // Path not found in the current reference
    return null;
}

/**
 * Retrieves the list index for the given resolved path based on its wildcard type.
 *
 * This function handles different wildcard types:
 * - "none": Returns null (no wildcards)
 * - "context": Retrieves from current loop context
 * - "all": Traverses wildcard hierarchy to build complete list index
 * - "partial": Not yet supported, throws error
 *
 * @param resolvedPath - Resolved path information containing wildcard type and hierarchy
 * @param receiver - State proxy object
 * @param handler - State handler containing context and engine references
 * @returns List index for the path, or null if no wildcards exist
 * @throws {Error} STATE-202 - When required path components are missing
 * @throws {Error} LIST-201 - When list index cannot be found for a wildcard level
 */
function getListIndex(resolvedPath, receiver, handler) {
    switch (resolvedPath.wildcardType) {
        case "none":
            // No wildcards in path, no list index needed
            return null;
        case "context": {
            // Get the last wildcard path from resolved path info
            const lastWildcardPath = resolvedPath.info.lastWildcardPath ??
                raiseError({
                    code: 'STATE-202',
                    message: 'lastWildcardPath is null',
                    context: { where: 'StateClass.getListIndex', pattern: resolvedPath.info.pattern },
                    docsUrl: './docs/error-codes.md#state',
                });
            // Retrieve list index from current loop context
            return getContextListIndex(handler, lastWildcardPath) ??
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${resolvedPath.info.pattern}`,
                    context: { where: 'StateClass.getListIndex', pattern: resolvedPath.info.pattern },
                    docsUrl: './docs/error-codes.md#list',
                });
        }
        case "all": {
            // Traverse all wildcard levels to build complete list index hierarchy
            let parentListIndex = null;
            for (let i = 0; i < resolvedPath.info.wildcardCount; i++) {
                // Get the parent info for this wildcard level
                const wildcardParentPattern = resolvedPath.info.wildcardParentInfos[i] ??
                    raiseError({
                        code: 'STATE-202',
                        message: 'wildcardParentPattern is null',
                        context: { where: 'StateClass.getListIndex', pattern: resolvedPath.info.pattern, index: i },
                        docsUrl: './docs/error-codes.md#state',
                    });
                // Create a reference for the current wildcard level
                const wildcardRef = getStatePropertyRef(wildcardParentPattern, parentListIndex);
                // Get all list indexes at this wildcard level
                const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef) ??
                    raiseError({
                        code: 'LIST-201',
                        message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                        context: { where: 'StateClass.getListIndex', wildcardParent: wildcardParentPattern.pattern },
                        docsUrl: './docs/error-codes.md#list',
                    });
                // Get the specific index for this wildcard level
                const wildcardIndex = resolvedPath.wildcardIndexes[i] ??
                    raiseError({
                        code: 'STATE-202',
                        message: 'wildcardIndex is null',
                        context: { where: 'StateClass.getListIndex', pattern: resolvedPath.info.pattern, index: i },
                        docsUrl: './docs/error-codes.md#state',
                    });
                // Select the list index at the specified position for this level
                parentListIndex = listIndexes[wildcardIndex] ??
                    raiseError({
                        code: 'LIST-201',
                        message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                        context: { where: 'StateClass.getListIndex', wildcardParent: wildcardParentPattern.pattern, wildcardIndex },
                        docsUrl: './docs/error-codes.md#list',
                    });
            }
            // Return the final list index after traversing all levels
            return parentListIndex;
        }
        case "partial":
            // Partial wildcard support is not yet implemented
            raiseError({
                code: 'STATE-202',
                message: `Partial wildcard type is not supported yet: ${resolvedPath.info.pattern}`,
                context: { where: 'StateClass.getListIndex', pattern: resolvedPath.info.pattern },
                docsUrl: './docs/error-codes.md#state',
            });
    }
}

/**
 * trackDependency.ts
 *
 * Implementation of trackDependency function for StateClass API to dynamically register
 * dependencies between paths referenced during getter chains.
 *
 * Main responsibilities:
 * - Retrieves currently resolving StatePropertyRef (lastRefStack)
 * - Tracks dependencies only for getters registered in pathManager.getters
 * - Calls addDynamicDependency for references with different patterns than itself
 *
 * Design points:
 * - Raises STATE-202 error if lastRefStack doesn't exist
 * - Does not register recursive getter dependencies (self-reference)
 * - Dynamic dependencies are aggregated in pathManager and used for cache invalidation
 */
/**
 * Returns a function to register dynamic dependency from currently resolving getter to specified path.
 *
 * - Only tracks dependencies for getters registered in pathManager.getters
 * - Excludes self-references, only recording dependencies between different patterns
 * - Dynamic dependencies are centrally managed via pathManager.addDynamicDependency
 *
 * @param target   - Proxy target object
 * @param prop     - Accessed property key
 * @param receiver - Proxy receiver
 * @param handler  - StateClass handler
 * @returns        Anonymous function that registers dependency to pattern specified by path argument
 */
function trackDependency(_target, _prop, _receiver, handler) {
    return (path) => {
        // Get the currently resolving getter's info from the stack
        const lastInfo = handler.lastRefStack?.info ?? raiseError({
            code: 'STATE-202',
            message: 'Internal error: lastRefStack is null',
            context: { where: 'StateClass.trackDependency', path },
            docsUrl: './docs/error-codes.md#state',
        });
        // Only register dependency if source is a getter and target is different
        // This prevents self-references and only tracks getter -> property dependencies
        if (handler.engine.pathManager.getters.has(lastInfo.pattern) &&
            lastInfo.pattern !== path) {
            handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, path);
        }
    };
}

/**
 * indexByIndexName
 * Mapping from index name to stack index
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
/**
 * ListIndex class manages hierarchical index information for nested loops.
 * Tracks parent-child relationships and maintains version for change detection.
 */
class ListIndex {
    id = ++id$1;
    sid = id$1.toString();
    parentListIndex;
    position;
    length;
    _index;
    _version;
    _indexes;
    _listIndexes;
    /**
     * Creates a new ListIndex instance.
     *
     * @param parentListIndex - Parent list index for nested loops, or null for top-level
     * @param index - Current index value in the loop
     */
    constructor(parentListIndex, index) {
        this.parentListIndex = parentListIndex;
        this.position = parentListIndex ? parentListIndex.position + 1 : 0;
        this.length = this.position + 1;
        this._index = index;
        this._version = version;
    }
    /**
     * Gets current index value.
     *
     * @returns Current index number
     */
    get index() {
        return this._index;
    }
    /**
     * Sets index value and updates version.
     *
     * @param value - New index value
     */
    set index(value) {
        this._index = value;
        this._version = ++version;
        this.indexes[this.position] = value;
    }
    /**
     * Gets current version number for change detection.
     *
     * @returns Version number
     */
    get version() {
        return this._version;
    }
    /**
     * Checks if parent indexes have changed since last access.
     *
     * @returns true if parent has newer version, false otherwise
     */
    get dirty() {
        if (this.parentListIndex === null) {
            return false;
        }
        else {
            return this.parentListIndex.dirty || this.parentListIndex.version > this._version;
        }
    }
    /**
     * Gets array of all index values from root to current level.
     * Rebuilds array if parent indexes have changed (dirty).
     *
     * @returns Array of index values
     */
    get indexes() {
        if (this.parentListIndex === null) {
            if (typeof this._indexes === "undefined") {
                this._indexes = [this._index];
            }
        }
        else {
            if (typeof this._indexes === "undefined" || this.dirty) {
                this._indexes = [...this.parentListIndex.indexes, this._index];
                this._version = version;
            }
        }
        return this._indexes;
    }
    /**
     * Gets array of WeakRef to all ListIndex instances from root to current level.
     *
     * @returns Array of WeakRef<IListIndex>
     */
    get listIndexes() {
        if (this.parentListIndex === null) {
            if (typeof this._listIndexes === "undefined") {
                this._listIndexes = [new WeakRef(this)];
            }
        }
        else {
            if (typeof this._listIndexes === "undefined") {
                this._listIndexes = [...this.parentListIndex.listIndexes, new WeakRef(this)];
            }
        }
        return this._listIndexes;
    }
    /**
     * Gets variable name for this loop index ($1, $2, etc.).
     *
     * @returns Variable name string
     */
    get varName() {
        return `$${this.position + 1}`;
    }
    /**
     * Gets ListIndex at specified position in hierarchy.
     * Supports negative indexing from end.
     *
     * @param pos - Position index (0-based, negative for from end)
     * @returns ListIndex at position or null if not found/garbage collected
     */
    at(pos) {
        if (pos >= 0) {
            return this.listIndexes[pos]?.deref() || null;
        }
        else {
            return this.listIndexes[this.listIndexes.length + pos]?.deref() || null;
        }
    }
}
/**
 * Factory function to create ListIndex instance.
 *
 * @param parentListIndex - Parent list index for nested loops, or null for top-level
 * @param index - Current index value in the loop
 * @returns New IListIndex instance
 */
function createListIndex(parentListIndex, index) {
    return new ListIndex(parentListIndex, index);
}

/**
 * Checks and registers dynamic dependency between the currently resolving getter and the referenced property.
 * Only registers dependencies for getters that are not self-referencing.
 * @param handler - State handler containing reference stack and path manager
 * @param ref - State property reference being accessed
 */
function checkDependency(handler, ref) {
    // Register dynamic dependency only if we're inside a getter resolution (refIndex >= 0)
    if (handler.refIndex >= 0) {
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null) {
            // Only register if source is a getter and not accessing itself
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern) &&
                lastInfo.pattern !== ref.info.pattern) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, ref.info.pattern);
            }
        }
    }
}

/**
 * Checks if two lists are identical by comparing length and each element.
 * @param oldList - Previous list to compare
 * @param newList - New list to compare
 * @returns True if lists are identical, false otherwise
 */
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
/**
 * Creates or updates list indexes by comparing old and new lists.
 * Optimizes by reusing existing list indexes when values match.
 * @param parentListIndex - Parent list index for nested lists, or null for top-level
 * @param oldList - Previous list (will be normalized to array)
 * @param newList - New list (will be normalized to array)
 * @param oldIndexes - Array of existing list indexes to potentially reuse
 * @returns Array of list indexes for the new list
 */
function createListIndexes(parentListIndex, rawOldList, rawNewList, oldIndexes) {
    // Normalize inputs to arrays (handles null/undefined)
    const oldList = Array.isArray(rawOldList) ? rawOldList : [];
    const newList = Array.isArray(rawNewList) ? rawNewList : [];
    const newIndexes = [];
    // Early return for empty list
    if (newList.length === 0) {
        return [];
    }
    // If old list was empty, create all new indexes
    if (oldList.length === 0) {
        for (let i = 0; i < newList.length; i++) {
            const newListIndex = createListIndex(parentListIndex, i);
            newIndexes.push(newListIndex);
        }
        return newIndexes;
    }
    // If lists are identical, return existing indexes unchanged (optimization)
    if (isSameList(oldList, newList)) {
        return oldIndexes;
    }
    // Use index-based map for efficiency
    const indexByValue = new Map();
    for (let i = 0; i < oldList.length; i++) {
        // For duplicate values, the last index takes precedence (maintains existing behavior)
        indexByValue.set(oldList[i], i);
    }
    // Build new indexes array by matching values with old list
    for (let i = 0; i < newList.length; i++) {
        const newValue = newList[i];
        const oldIndex = indexByValue.get(newValue);
        if (typeof oldIndex === "undefined") {
            // New element
            const newListIndex = createListIndex(parentListIndex, i);
            newIndexes.push(newListIndex);
        }
        else {
            // Reuse existing element
            const existingListIndex = oldIndexes[oldIndex];
            // Update index if position changed
            if (existingListIndex.index !== i) {
                existingListIndex.index = i;
            }
            newIndexes.push(existingListIndex);
        }
    }
    return newIndexes;
}

/**
 * Retrieves value from state object (target) based on structured path info (info, listIndex).
 *
 * - Automatic dependency registration (wrapped with setTracking when trackedGetters enabled)
 * - Cache mechanism (caches by refKey when handler.cacheable)
 * - Supports nesting and wildcards (recursively retrieves values by traversing parent info and listIndex)
 * - Sets scope temporarily with SetStatePropertyRefSymbol when retrieving via getter
 *
 * @param target    - State object
 * @param ref       - State property reference
 * @param receiver  - Proxy
 * @param handler   - State handler
 * @returns         Value of the target property
 * @throws STC-001 If property does not exist in state when accessed directly
 * @throws STC-002 If handler.refStack is empty when accessing a getter
 */
function getByRef(target, ref, receiver, handler) {
    // Check and register dependency if called from within a getter
    checkDependency(handler, ref);
    let value;
    // Determine if this path needs list management or caching
    const listable = handler.engine.pathManager.lists.has(ref.info.pattern);
    const cacheable = ref.info.wildcardCount > 0 ||
        handler.engine.pathManager.getters.has(ref.info.pattern);
    let lastCacheEntry = null;
    if (cacheable || listable) {
        // Try to retrieve cached value and validate its freshness
        lastCacheEntry = handler.engine.getCacheEntry(ref);
        const versionRevision = handler.engine.versionRevisionByPath.get(ref.info.pattern);
        if (lastCacheEntry !== null) {
            if (typeof versionRevision === "undefined") {
                // No updates
                return lastCacheEntry.value;
            }
            else {
                // Check version to determine if cache is still valid
                if (lastCacheEntry.version > handler.updater.version) {
                    // This can occur when async updates happen
                    return lastCacheEntry.value;
                }
                // Compare versions and revisions to detect updates
                if (lastCacheEntry.version < versionRevision.version || lastCacheEntry.revision < versionRevision.revision) ;
                else {
                    return lastCacheEntry.value;
                }
            }
        }
    }
    // If getters with parent-child relationships exist, retrieve from external dependencies
    // ToDo: When getters exist in state (path prefix matches), retrieve via getter
    if (handler.engine.stateOutput.startsWith(ref.info) &&
        handler.engine.pathManager.getters.intersection(ref.info.cumulativePathSet).size === 0) {
        return handler.engine.stateOutput.get(ref);
    }
    // If pattern exists in target, retrieve via getter
    if (ref.info.pattern in target) {
        // Validate ref stack before pushing
        if (handler.refStack.length === 0) {
            raiseError({
                code: 'STC-002',
                message: 'handler.refStack is empty in getByRef',
                context: {
                    where: 'StateClass.getByRef',
                    pattern: ref.info.pattern,
                },
                docsUrl: './docs/error-codes.md#stc',
            });
        }
        // Push current ref onto stack for dependency tracking during getter execution
        handler.refIndex++;
        if (handler.refIndex >= handler.refStack.length) {
            handler.refStack.push(null);
        }
        handler.refStack[handler.refIndex] = handler.lastRefStack = ref;
        try {
            // Execute the getter
            return value = Reflect.get(target, ref.info.pattern, receiver);
        }
        finally {
            // Always restore ref stack state, even if getter throws
            handler.refStack[handler.refIndex] = null;
            handler.refIndex--;
            handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            // Store in cache
            if (cacheable || listable) {
                let newListIndexes = null;
                if (listable) {
                    // Need to calculate list indexes
                    if (handler.renderer !== null) {
                        // Track last list info for diff calculation in renderer
                        if (!handler.renderer.lastListInfoByRef.has(ref)) {
                            if (lastCacheEntry) {
                                const listIndexes = lastCacheEntry.listIndexes ?? [];
                                const value = lastCacheEntry.value;
                                if (!Array.isArray(value)) {
                                    raiseError({
                                        code: "STC-001",
                                        message: `Property "${ref.info.pattern}" is expected to be an array for list management.`,
                                        context: {
                                            where: 'StateClass.getByRef',
                                            pattern: ref.info.pattern,
                                        },
                                        docsUrl: "./docs/error-codes.md#stc",
                                    });
                                }
                                handler.renderer.lastListInfoByRef.set(ref, { listIndexes, value });
                            }
                            else {
                                handler.renderer.lastListInfoByRef.set(ref, { listIndexes: [], value: [] });
                            }
                        }
                    }
                    // Calculate new list indexes by comparing old and new values
                    newListIndexes = createListIndexes(ref.listIndex, lastCacheEntry?.value, value, lastCacheEntry?.listIndexes ?? []);
                }
                // Create or update cache entry with new value and metadata
                const cacheEntry = lastCacheEntry ?? {
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
        // Error if not exists
        raiseError({
            code: "STC-001",
            message: `Property "${ref.info.pattern}" does not exist in state.`,
            context: {
                where: 'StateClass.getByRef',
                pattern: ref.info.pattern,
            },
            docsUrl: "./docs/error-codes.md#stc",
        });
    }
}

/**
 * setByRef.ts
 *
 * Internal API function for StateClass that sets values to the state object (target)
 * by specifying structured path information (IStructuredPathInfo) and list index (IListIndex).
 *
 * Main responsibilities:
 * - Sets State values for specified path/index (supports multiple loops and wildcards)
 * - Temporarily sets scope with SetStatePropertyRefSymbol when setting via getter/setter
 * - Recursively sets values by traversing parent info and listIndex if not found
 * - Registers update information via engine.updater.addUpdatedStatePropertyRefValue after setting
 *
 * Design points:
 * - Flexibly supports wildcards and multiple loops, achieving recursive value setting
 * - Always registers update information in finally block for re-rendering and dependency resolution
 * - Design considers scope switching via getter/setter
 */
/**
 * Sets a value to the state object for the specified property reference.
 *
 * This function handles value setting with support for wildcards, multiple loops, and nested structures.
 * It manages scope switching for getter/setter execution and tracks swap operations for element updates.
 * Update information is always registered in the finally block for re-rendering and dependency resolution.
 *
 * @param target - State object
 * @param ref - State property reference indicating where to set the value
 * @param value - Value to set
 * @param receiver - State proxy object
 * @param handler - State handler containing engine and updater references
 * @returns Result of the set operation
 * @throws {Error} STATE-202 - When required parent info or list index is missing
 */
function setByRef(target, ref, value, receiver, handler) {
    // Check if this path represents an element in a list
    const isElements = handler.engine.pathManager.elements.has(ref.info.pattern);
    let parentRef = null;
    let swapInfo = null;
    // Prepare swapInfo for elements to track value swapping in lists
    if (isElements) {
        parentRef = ref.parentRef ?? raiseError({
            code: 'STATE-202',
            message: 'propRef.stateProp.parentInfo is undefined',
            context: { where: 'StateClass.setByRef', scope: 'element', refPath: ref.info.pattern },
            docsUrl: './docs/error-codes.md#state',
        });
        // Get or create swap info for tracking list element changes
        swapInfo = handler.updater.swapInfoByRef.get(parentRef) || null;
        if (swapInfo === null) {
            const parentValue = receiver[GetByRefSymbol](parentRef) ?? [];
            if (!Array.isArray(parentValue)) {
                raiseError({
                    code: 'STATE-202',
                    message: 'Expected array value for list elements',
                    context: { where: 'StateClass.setByRef', scope: 'element', refPath: parentRef.info.pattern },
                    docsUrl: './docs/error-codes.md#state',
                });
            }
            swapInfo = {
                value: [...parentValue],
                listIndexes: [...(receiver[GetListIndexesByRefSymbol](parentRef) ?? [])]
            };
            handler.updater.swapInfoByRef.set(parentRef, swapInfo);
        }
    }
    try {
        // If getters with parent-child relationships exist, set value through external dependencies
        // TODO: When getter exists in state (path prefix matches), retrieve via getter
        if (handler.engine.stateOutput.startsWith(ref.info) &&
            handler.engine.pathManager.setters.intersection(ref.info.cumulativePathSet).size === 0) {
            return handler.engine.stateOutput.set(ref, value);
        }
        // If property exists directly in target, set via setter
        if (ref.info.pattern in target) {
            // Push current ref onto stack for scope tracking during setter execution
            handler.refIndex++;
            if (handler.refIndex >= handler.refStack.length) {
                handler.refStack.push(null);
            }
            handler.refStack[handler.refIndex] = handler.lastRefStack = ref;
            try {
                // Execute the setter
                return Reflect.set(target, ref.info.pattern, value, receiver);
            }
            finally {
                // Always restore ref stack state
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            }
        }
        else {
            // Property doesn't exist directly, need to traverse parent hierarchy
            const parentInfo = ref.info.parentInfo ?? raiseError({
                code: 'STATE-202',
                message: 'propRef.stateProp.parentInfo is undefined',
                context: { where: 'StateClass.setByRef', refPath: ref.info.pattern },
                docsUrl: './docs/error-codes.md#state',
            });
            // Calculate parent list index based on wildcard hierarchy
            const parentListIndex = parentInfo.wildcardCount < ref.info.wildcardCount
                ? (ref.listIndex?.parentListIndex ?? null)
                : ref.listIndex;
            const parentRef = getStatePropertyRef(parentInfo, parentListIndex);
            // Get the parent value to set property on
            const parentValue = getByRef(target, parentRef, receiver, handler);
            if (parentValue === null || typeof parentValue !== "object") {
                raiseError({
                    code: 'STATE-202',
                    message: 'Parent value is not an object',
                    context: { where: 'StateClass.setByRef', refPath: parentRef.info.pattern },
                    docsUrl: './docs/error-codes.md#state',
                });
            }
            const lastSegment = ref.info.lastSegment;
            // Handle wildcard (array element) vs named property
            if (lastSegment === "*") {
                const index = ref.listIndex?.index ?? raiseError({
                    code: 'STATE-202',
                    message: 'propRef.listIndex?.index is undefined',
                    context: { where: 'StateClass.setByRef', refPath: ref.info.pattern },
                    docsUrl: './docs/error-codes.md#state',
                });
                return Reflect.set(parentValue, index, value);
            }
            else {
                return Reflect.set(parentValue, lastSegment, value);
            }
        }
    }
    finally {
        // Always register this ref for update processing
        handler.updater.enqueueRef(ref);
        if (isElements) {
            // Handle list element swap tracking
            const index = swapInfo.value.indexOf(value);
            const currentListIndexes = receiver[GetListIndexesByRefSymbol](parentRef) ?? [];
            const curIndex = ref.listIndex.index;
            // Assign list index from swap info or create new one
            const listIndex = (index !== -1) ? swapInfo.listIndexes[index] : createListIndex(parentRef.listIndex, -1);
            currentListIndexes[curIndex] = listIndex;
            // Check for duplicates to determine if swap is complete
            // If no duplicates, consider swap complete and update indexes
            const parentValue = receiver[GetByRefSymbol](parentRef) ?? [];
            if (parentValue === null || !Array.isArray(parentValue)) {
                raiseError({
                    code: 'STATE-202',
                    message: 'Parent value is not an array during swap check',
                    context: { where: 'StateClass.setByRef', scope: 'element swap', refPath: parentRef.info.pattern },
                    docsUrl: './docs/error-codes.md#state',
                });
            }
            const listValueSet = new Set(parentValue);
            if (listValueSet.size === swapInfo.value.length) {
                // Swap complete, renormalize indexes to match current positions
                for (let i = 0; i < currentListIndexes.length; i++) {
                    currentListIndexes[i].index = i;
                }
                // Delete swapInfo as swap is complete
                handler.updater.swapInfoByRef.delete(parentRef);
            }
        }
    }
}

/**
 * resolve.ts
 *
 * Implementation of resolve function for StateClass API to get/set State values
 * by specifying path and indexes.
 *
 * Main responsibilities:
 * - Gets or sets State values from string path and index array
 * - Supports paths with wildcards and nested loops
 * - Executes get (getByRef) when value not specified, set (setByRef) when specified
 *
 * Design points:
 * - Parses path with getStructuredPathInfo and resolves list indexes for each wildcard level
 * - Gets list index collection for each level via handler.engine.getListIndexesSet
 * - Centrally handles value get/set with getByRef/setByRef
 * - Enables flexible binding and API-based usage
 */
/**
 * Creates a resolve function to get/set State values by path and indexes.
 * @param target - Target object to access
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy for context
 * @param handler - State handler with engine and dependency tracking
 * @returns Function that accepts path, indexes, and optional value
 * @throws STATE-202 If indexes length insufficient or setting on readonly proxy
 * @throws LIST-201 If list index not found at any wildcard level
 */
function resolve(target, _prop, receiver, handler) {
    return (path, indexes, value) => {
        const info = getStructuredPathInfo(path);
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
            // Register dependency if included in getters
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
            }
        }
        // Validate that enough indexes are provided for all wildcard levels
        if (info.wildcardParentInfos.length > indexes.length) {
            raiseError({
                code: 'STATE-202',
                message: `indexes length is insufficient: ${path}`,
                context: {
                    where: 'StateClass.resolve',
                    path,
                    expected: info.wildcardParentInfos.length,
                    received: indexes.length,
                },
                docsUrl: './docs/error-codes.md#state',
            });
        }
        // Resolve ListIndex for each wildcard level by walking through the hierarchy
        let listIndex = null;
        for (let i = 0; i < info.wildcardParentInfos.length; i++) {
            const wildcardParentPattern = info.wildcardParentInfos[i];
            // Get reference for current wildcard level
            const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
            // Access the value to ensure list exists
            getByRef(target, wildcardRef, receiver, handler);
            // Get all list indexes at this level
            const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
            if (listIndexes === null) {
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndexes not found: ${wildcardParentPattern.pattern}`,
                    context: {
                        where: 'StateClass.resolve',
                        pattern: wildcardParentPattern.pattern,
                    },
                    docsUrl: './docs/error-codes.md#list',
                });
            }
            // Get the specific list index for this level using provided index
            const index = indexes[i];
            listIndex = listIndexes[index] ?? raiseError({
                code: 'LIST-201',
                message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                context: {
                    where: 'StateClass.resolve',
                    pattern: wildcardParentPattern.pattern,
                    index,
                },
                docsUrl: './docs/error-codes.md#list',
            });
        }
        // Create reference with resolved list index and perform get or set
        // Determine if Writable or Readonly and call appropriate method
        const ref = getStatePropertyRef(info, listIndex);
        const hasSetValue = typeof value !== "undefined";
        // Check if receiver supports setting (has SetByRefSymbol)
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
                // Cannot set on readonly proxy
                raiseError({
                    code: 'STATE-202',
                    message: `Cannot set value on a readonly proxy: ${path}`,
                    context: {
                        where: 'StateClass.resolve',
                        path,
                    },
                    docsUrl: './docs/error-codes.md#state',
                });
            }
        }
    };
}

/**
 * connectedCallback.ts
 *
 * Utility function to invoke the StateClass lifecycle hook "$connectedCallback".
 *
 * Main responsibilities:
 * - Invokes $connectedCallback method if defined on the object (target)
 * - Callback is invoked with target's this context, passing IReadonlyStateProxy (receiver) as argument
 * - Executable as async function (await compatible)
 *
 * Design points:
 * - Safely retrieves $connectedCallback property using Reflect.get
 * - Does nothing if the callback doesn't exist
 * - Used for lifecycle management and custom initialization logic
 */
/**
 * Invokes the $connectedCallback lifecycle hook if defined on the target.
 * @param target - Target object to check for callback
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy to pass as this context
 * @param handler - State handler (unused but part of signature)
 * @returns Promise or void depending on callback implementation
 */
function connectedCallback(target, _prop, receiver, _handler) {
    const callback = Reflect.get(target, CONNECTED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        return callback.call(receiver);
    }
}

/**
 * disconnectedCallback.ts
 *
 * Utility function to invoke the StateClass lifecycle hook "$disconnectedCallback".
 *
 * Main responsibilities:
 * - Invokes $disconnectedCallback method if defined on the object (target)
 * - Callback is invoked with target's this context, passing IReadonlyStateProxy (receiver) as argument
 * - Executable as async function (await compatible)
 *
 * Design points:
 * - Safely retrieves $disconnectedCallback property using Reflect.get
 * - Does nothing if the callback doesn't exist
 * - Used for lifecycle management and cleanup logic
 */
/**
 * Invokes the $disconnectedCallback lifecycle hook if defined on the target.
 * @param target - Target object to check for callback
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy to pass as this context
 * @param handler - State handler (unused but part of signature)
 */
function disconnectedCallback(target, _prop, receiver, _handler) {
    const callback = Reflect.get(target, DISCONNECTED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        return callback.call(receiver);
    }
}

/**
 * getAll
 *
 * Retrieves all elements as an array from a State path containing wildcards.
 * Throws: LIST-201 (unresolved index), BIND-201 (wildcard information inconsistency)
 */
/**
 * Creates a function to retrieve all elements from a wildcard path.
 * @param target - Target object to retrieve from
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy for context
 * @param handler - State handler with engine and dependency tracking
 * @returns Function that accepts path and optional indexes, returns array of values
 * @throws LIST-201 If list index not found
 * @throws BIND-201 If wildcard information is inconsistent
 */
function getAll(target, prop, receiver, handler) {
    const resolveFn = resolve(target, prop, receiver, handler);
    return (path, _indexes) => {
        let indexes = _indexes;
        const info = getStructuredPathInfo(path);
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
            // Register dependency if included in getters
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
            }
        }
        // If indexes not provided, try to extract from context
        if (typeof indexes === "undefined") {
            for (let i = 0; i < info.wildcardInfos.length; i++) {
                const wildcardPattern = info.wildcardInfos[i] ?? raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard info is missing',
                    context: {
                        where: 'StateClass.getAll',
                        wildcardIndex: i,
                        pattern: info.pattern,
                    },
                    docsUrl: './docs/error-codes.md#bind',
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
        /**
         * Recursively walks through wildcard patterns to collect all matching indexes.
         * @param wildcardParentInfos - Array of wildcard parent path infos
         * @param wildardIndexPos - Current position in wildcard hierarchy
         * @param listIndex - Current list index or null
         * @param indexes - Array of specified indexes (empty for all)
         * @param indexPos - Current position in indexes array
         * @param parentIndexes - Accumulated parent indexes
         * @param results - Output array to collect all matching index combinations
         */
        const walkWildcardPattern = (wildcardParentInfos, wildardIndexPos, listIndex, indexes, indexPos, parentIndexes, results) => {
            const wildcardParentPattern = wildcardParentInfos[wildardIndexPos] ?? null;
            // Base case: no more wildcards, add accumulated indexes to results
            if (wildcardParentPattern === null) {
                results.push(parentIndexes);
                return;
            }
            // Get the list at current wildcard level
            const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
            getByRef(target, wildcardRef, receiver, handler);
            const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
            if (listIndexes === null) {
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: {
                        where: 'StateClass.getAll',
                        pattern: wildcardParentPattern.pattern,
                    },
                    docsUrl: './docs/error-codes.md#list',
                });
            }
            const index = indexes[indexPos] ?? null;
            // If no specific index provided, iterate through all list items
            if (index === null) {
                for (let i = 0; i < listIndexes.length; i++) {
                    const listIndex = listIndexes[i];
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
            }
            else {
                // Specific index provided, use it
                const listIndex = listIndexes[index] ?? raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: {
                        where: 'StateClass.getAll',
                        pattern: wildcardParentPattern.pattern,
                        index,
                    },
                    docsUrl: './docs/error-codes.md#list',
                });
                // Continue to next wildcard level if exists
                if ((wildardIndexPos + 1) < wildcardParentInfos.length) {
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
                else {
                    // Reached the final wildcard layer, finalize the result
                    results.push(parentIndexes.concat(listIndex.index));
                }
            }
        };
        // Collect all matching index combinations
        const resultIndexes = [];
        walkWildcardPattern(info.wildcardParentInfos, 0, null, indexes, 0, [], resultIndexes);
        // Resolve values for each collected index combination
        const resultValues = [];
        for (let i = 0; i < resultIndexes.length; i++) {
            resultValues.push(resolveFn(info.pattern, resultIndexes[i]));
        }
        return resultValues;
    };
}

/**
 * Retrieves all list indexes for the specified property reference.
 *
 * This function ensures the reference points to a list path, then retrieves the list indexes
 * either from stateOutput (if available) or from the cache after updating it via getByRef.
 *
 * @param target - State object
 * @param ref - State property reference pointing to a list path
 * @param receiver - State proxy object
 * @param handler - State handler containing engine and cache references
 * @returns Array of list indexes for the specified list path
 * @throws {Error} LIST-201 - When the path is not registered as a list
 * @throws {Error} LIST-202 - When cache entry is not found after update
 * @throws {Error} LIST-203 - When list indexes are missing in the cache entry
 */
function getListIndexesByRef(target, ref, receiver, handler) {
    // Validate that the path is registered as a list
    if (!handler.engine.pathManager.lists.has(ref.info.pattern)) {
        raiseError({
            code: 'LIST-201',
            message: `path is not a list: ${ref.info.pattern}`,
            context: { where: 'StateClass.getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: './docs/error-codes.md#list',
        });
    }
    // Try to retrieve from stateOutput first (optimization for external dependencies)
    if (handler.engine.stateOutput.startsWith(ref.info) &&
        handler.engine.pathManager.getters.intersection(ref.info.cumulativePathSet).size === 0) {
        return handler.engine.stateOutput.getListIndexes(ref) ?? [];
    }
    // Update cache by calling getByRef, which also calculates list indexes
    getByRef(target, ref, receiver, handler); // Also updates cache
    const cacheEntry = handler.engine.getCacheEntry(ref);
    // Validate that cache entry exists
    if (cacheEntry === null) {
        raiseError({
            code: 'LIST-202',
            message: `List cache entry not found: ${ref.info.pattern}`,
            context: { where: 'StateClass.getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: './docs/error-codes.md#list',
        });
    }
    const listIndexes = cacheEntry.listIndexes;
    // Validate that list indexes exist in cache entry
    if (listIndexes === null) {
        raiseError({
            code: 'LIST-203',
            message: `List indexes not found in cache entry: ${ref.info.pattern}`,
            context: { where: 'StateClass.getListIndexesByRef', pattern: ref.info.pattern },
            docsUrl: './docs/error-codes.md#list',
        });
    }
    return listIndexes;
}

/**
 * updatedCallback.ts
 *
 * Utility function to invoke the StateClass lifecycle hook "$updatedCallback".
 *
 * Main responsibilities:
 * - Invokes $updatedCallback method if defined on the object (target)
 * - Callback is invoked with target's this context, passing IReadonlyStateProxy (receiver) as argument
 * - Executable as async function (await compatible)
 *
 * Design points:
 * - Safely retrieves $updatedCallback property using Reflect.get
 * - Does nothing if the callback doesn't exist
 * - Used for lifecycle management and update handling logic
 */
/**
 * Invokes the $updatedCallback lifecycle hook if defined on the target.
 * Aggregates updated paths and their indexes before passing to the callback.
 * @param target - Target object to check for callback
 * @param refs - Array of state property references that were updated
 * @param receiver - State proxy to pass as this context
 * @param handler - State handler (unused but part of signature)
 * @returns Promise or void depending on callback implementation
 */
function updatedCallback(target, refs, receiver, _handler) {
    const callback = Reflect.get(target, UPDATED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        const paths = new Set();
        const indexesByPath = {};
        for (const ref of refs) {
            const path = ref.info.pattern;
            paths.add(path);
            if (ref.info.wildcardCount > 0) {
                const index = ref.listIndex.index;
                const indexes = indexesByPath[path];
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

function invoke(_target, _prop, _receiver, handler) {
    return (callback) => {
        if (typeof callback !== "function") {
            raiseError({
                code: 'STATE-203',
                message: 'Callback is not a function',
                context: {
                    where: 'StateClass.invoke',
                    callback,
                },
                docsUrl: './docs/error-codes.md#state',
            });
        }
        const resultPromise = handler.updater.invoke(() => {
            return Reflect.apply(callback, _receiver, []);
        });
        if (resultPromise instanceof Promise) {
            resultPromise.catch((error) => {
                const cause = error instanceof Error ? error : new Error(String(error));
                raiseError({
                    code: 'STATE-204',
                    message: 'Invoke callback rejected',
                    context: { where: 'StateClass.invoke' },
                    docsUrl: './docs/error-codes.md#state',
                    severity: 'error',
                    cause,
                });
            });
        }
        return resultPromise;
    };
}

/**
 * get.ts
 *
 * Implementation of the get function as a Proxy trap for StateClass,
 * handling property access and value retrieval.
 *
 * Main responsibilities:
 * - For string properties, returns values or APIs based on special properties ($1-$9, $resolve, $getAll, $navigate)
 * - For regular properties, resolves path info via getResolvedPathInfo and retrieves list index via getListIndex
 * - Retrieves values corresponding to structured path and list index via getByRef
 * - For symbol properties, calls APIs via handler.callableApi
 * - For other cases, executes normal property access via Reflect.get
 *
 * Design points:
 * - $1-$9 are special properties that return list index values from the most recent StatePropertyRef
 * - $resolve, $getAll, $navigate return API functions or router instances
 * - Regular property access also supports bindings and nested loops
 * - Ensures extensibility and compatibility through symbol APIs and Reflect.get
 */
/**
 * Proxy trap handler for property access on State objects.
 *
 * This function intercepts property access and handles:
 * - Index name properties ($1-$9): Returns list index values from current context
 * - Special properties ($resolve, $getAll, $navigate, etc.): Returns API functions
 * - String properties: Resolves path and retrieves value via getByRef
 * - Symbol properties: Returns internal API functions for StateClass operations
 * - Other properties: Falls back to default Reflect.get behavior
 *
 * @param target - State object being accessed
 * @param prop - Property key being accessed (string, symbol, or other)
 * @param receiver - Proxy object that triggered this trap
 * @param handler - State handler containing context and configuration
 * @returns Value of the accessed property or an API function
 * @throws {Error} LIST-201 - When list index is not found for index name properties
 */
function get(target, prop, receiver, handler) {
    // Check if property is an index name ($1-$9)
    const index = indexByIndexName[prop];
    if (typeof index !== "undefined") {
        // Retrieve list index from the most recent property reference
        const listIndex = handler.lastRefStack?.listIndex;
        return listIndex?.indexes[index] ?? raiseError({
            code: 'LIST-201',
            message: `ListIndex not found: ${prop.toString()}`,
            context: { prop: String(prop), indexes: listIndex?.indexes ?? null, index },
            docsUrl: '/docs/error-codes.md#list',
            severity: 'error',
        });
    }
    // Handle string properties
    if (typeof prop === "string") {
        // Check for special properties starting with $
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
                case "$invoke":
                    return invoke(target, prop, receiver, handler);
                case "$wrap":
                    return (callback) => {
                        const fn = invoke(target, prop, receiver, handler);
                        return () => fn(callback);
                    };
                case "$updateComplete":
                    return handler.updater.updateComplete;
            }
        }
        // Regular property access: resolve path, get list index, and retrieve value
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        return getByRef(target, ref, receiver, handler);
    }
    else if (typeof prop === "symbol") {
        // Handle symbol properties for internal APIs
        if (handler.symbols.has(prop)) {
            // Return API functions based on symbol type
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
            // Unknown symbol, use default behavior
            return Reflect.get(target, prop, receiver);
        }
    }
}

// Initial depth of the reference stack for tracking property access hierarchy
const STACK_DEPTH$1 = 32;
/**
 * StateHandler class implementing read-only Proxy traps for State objects.
 *
 * This handler intercepts property access and prohibits property modifications,
 * ensuring the State object remains immutable from the perspective of the proxy user.
 */
let StateHandler$1 = class StateHandler {
    engine;
    updater;
    renderer;
    refStack = Array(STACK_DEPTH$1).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = undefined;
    symbols = new Set([GetByRefSymbol, GetListIndexesByRefSymbol]);
    apis = new Set([
        "$resolve", "$getAll", "$trackDependency", "$navigate", "$component"
    ]);
    /**
     * Constructs a new StateHandler for read-only state proxy.
     *
     * @param engine - Component engine containing state management infrastructure
     * @param updater - Updater for tracking state changes
     * @param renderer - Optional renderer for UI updates, null if not rendering
     */
    constructor(engine, updater, renderer) {
        this.engine = engine;
        this.updater = updater;
        this.renderer = renderer;
    }
    /**
     * Proxy get trap for property access.
     *
     * Delegates to the shared get trap handler that supports bindings, API calls,
     * and dependency tracking.
     *
     * @param target - State object being accessed
     * @param prop - Property key being accessed
     * @param receiver - Proxy object
     * @returns Value of the accessed property
     */
    get(target, prop, receiver) {
        return get(target, prop, receiver, this);
    }
    /**
     * Proxy set trap for property assignment.
     *
     * Always throws an error to prohibit modifications to the read-only state.
     *
     * @param target - State object being modified
     * @param prop - Property key being set
     * @param value - Value attempting to be assigned
     * @param receiver - Proxy object
     * @returns Never returns (always throws)
     * @throws {Error} STATE-202 - Always thrown to prevent writes to readonly state
     */
    set(_target, prop, _value, _receiver) {
        raiseError({
            code: 'STATE-202',
            message: `Cannot set property ${String(prop)} of readonly state`,
            context: { where: 'createReadonlyStateProxy.set', prop: String(prop) },
            docsUrl: './docs/error-codes.md#state',
        });
    }
    /**
     * Proxy has trap for property existence checking.
     *
     * Returns true if the property exists in the target, or is a known symbol/API.
     *
     * @param target - State object being checked
     * @param prop - Property key being checked for existence
     * @returns true if property exists in target or is a known symbol/API
     */
    has(target, prop) {
        return Reflect.has(target, prop) || this.symbols.has(prop) || this.apis.has(prop);
    }
};
/**
 * Creates a read-only state handler instance.
 *
 * @param engine - Component engine containing state management infrastructure
 * @param updater - Updater for tracking state changes
 * @param renderer - Optional renderer for UI updates, null if not rendering
 * @returns New readonly state handler instance
 */
function createReadonlyStateHandler(engine, updater, renderer) {
    return new StateHandler$1(engine, updater, renderer);
}
/**
 * Creates a read-only proxy for a State object.
 *
 * The returned proxy allows property reading but throws an error on unknown write attempt.
 * Supports special properties ($resolve, $getAll, etc.) and internal API symbols.
 *
 * @param state - State object to wrap in a read-only proxy
 * @param handler - Read-only state handler implementing proxy traps
 * @returns Read-only proxy wrapping the state object
 */
function createReadonlyStateProxy(state, handler) {
    return new Proxy(state, handler);
}

/**
 * set.ts
 *
 * Implementation of the set function as a Proxy trap for StateClass,
 * handling property setting and value assignment.
 *
 * Main responsibilities:
 * - For string properties, resolves path info via getResolvedPathInfo and retrieves list index via getListIndex
 * - Executes value setting corresponding to structured path and list index via setByRef
 * - For other cases (symbols, etc.), executes normal property setting via Reflect.set
 *
 * Design points:
 * - Flexibly supports bindings, nested loops, and paths with wildcards
 * - By utilizing setByRef, side effects like dependency resolution and re-rendering are centrally managed
 * - Ensures compatibility with standard property setting via Reflect.set
 */
/**
 * Proxy trap handler for property setting on State objects.
 *
 * This function intercepts property assignments and handles:
 * - String properties: Resolves path info, retrieves list index, and sets value via setByRef
 * - Other properties: Falls back to default Reflect.set behavior
 *
 * The setByRef call ensures proper handling of wildcards, nested loops, dependency tracking,
 * and triggers necessary re-rendering and update callbacks.
 *
 * @param target - State object being modified
 * @param prop - Property key being set (string, symbol, or other)
 * @param value - Value to assign to the property
 * @param receiver - Proxy object that triggered this trap
 * @param handler - State handler containing context and configuration
 * @returns true if the property was successfully set, false otherwise
 */
function set(target, prop, value, receiver, handler) {
    if (typeof prop === "string") {
        // Resolve path information and list index for structured property access
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        // Set value via setByRef to handle dependencies and updates
        setByRef(target, ref, value, receiver, handler);
        return true;
    }
    else {
        // For non-string properties (symbols, etc.), use default behavior
        return Reflect.set(target, prop, value, receiver);
    }
}

/**
 * Temporarily sets a loop context and executes a callback within that scope.
 *
 * This function manages loop context scope for loop bindings and nested loops, ensuring
 * proper context isolation. It handles both synchronous and asynchronous callbacks,
 * guaranteeing context cleanup even if exceptions occur.
 *
 * @param handler - Writable state handler containing loop context state
 * @param loopContext - Loop context to set, or null to execute without loop context
 * @param callback - Callback function to execute within the loop context scope
 * @returns Result of the callback execution
 * @throws {Error} STATE-301 - When loop context is already set (nested context not allowed)
 * @throws {Error} STC-002 - When ref stack is empty but loop context exists
 */
function setLoopContext(handler, loopContext, callback) {
    // Ensure no existing loop context (prevent nested contexts)
    // handler.loopContext can be:
    // - undefined: slot is empty (not occupied)
    // - null: slot is occupied but no loop context
    // - ILoopContext: slot is occupied with a loop context
    // Occupied check: only "undefined" means the slot is not occupied
    if (handler.loopContext !== undefined) {
        raiseError({
            code: 'STATE-301',
            message: 'already in loop context',
            context: { where: 'setLoopContext', handlerHasContext: true },
            docsUrl: '/docs/error-codes.md#state',
            hint: 'Ensure handler.loopContext is cleared before invoking setLoopContext again.',
            severity: 'error',
        });
    }
    // Set the new loop context
    let resultPromise;
    if (loopContext) {
        handler.loopContext = loopContext;
        // ref stack always has 32 elements or more
        // Push loop context ref onto stack for scope tracking
        handler.refIndex++;
        if (handler.refIndex >= handler.refStack.length) {
            handler.refStack.push(null);
        }
        handler.refStack[handler.refIndex] = handler.lastRefStack = loopContext.ref;
        try {
            // Execute callback within loop context scope
            resultPromise = callback();
        }
        catch (error) {
            // Cleanup on synchronous error
            handler.refStack[handler.refIndex] = null;
            handler.refIndex--;
            handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            handler.loopContext = undefined;
            throw error;
        }
        // Cleanup after async completion
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
                handler.loopContext = undefined;
            });
        }
        // Synchronous cleanup
        handler.refStack[handler.refIndex] = null;
        handler.refIndex--;
        handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
        handler.loopContext = undefined;
    }
    else {
        handler.loopContext = loopContext;
        // No loop context, execute callback directly
        try {
            resultPromise = callback();
        }
        catch (error) {
            // Cleanup on synchronous error
            handler.loopContext = undefined;
            throw error;
        }
        // Cleanup after async completion
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.loopContext = undefined;
            });
        }
        // Synchronous cleanup
        handler.loopContext = undefined;
    }
    return resultPromise;
}

// Initial depth of the reference stack for tracking property access hierarchy
const STACK_DEPTH = 32;
/**
 * StateHandler class implementing writable Proxy traps for State objects.
 *
 * This handler intercepts property access and modifications, supporting full
 * read-write operations with dependency tracking, re-rendering, and update propagation.
 */
class StateHandler {
    engine;
    updater;
    renderer = null;
    refStack = Array(STACK_DEPTH).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = undefined;
    symbols = new Set([
        GetByRefSymbol, SetByRefSymbol, GetListIndexesByRefSymbol,
        ConnectedCallbackSymbol, DisconnectedCallbackSymbol,
        UpdatedCallbackSymbol
    ]);
    apis = new Set([
        "$resolve", "$getAll", "$trackDependency", "$navigate", "$component", "$invoke", "$wrap", "$updateComplete"
    ]);
    /**
     * Constructs a new StateHandler for writable state proxy.
     *
     * @param engine - Component engine containing state management infrastructure
     * @param updater - Updater for tracking and propagating state changes
     */
    constructor(engine, updater) {
        this.engine = engine;
        this.updater = updater;
    }
    /**
     * Proxy get trap for property access.
     *
     * Delegates to the shared get trap handler that supports bindings, API calls,
     * and dependency tracking.
     *
     * @param target - State object being accessed
     * @param prop - Property key being accessed
     * @param receiver - Proxy object
     * @returns Value of the accessed property
     */
    get(target, prop, receiver) {
        return get(target, prop, receiver, this);
    }
    /**
     * Proxy set trap for property assignment.
     *
     * Delegates to the shared set trap handler that handles value updates,
     * dependency tracking, and triggers re-rendering.
     *
     * @param target - State object being modified
     * @param prop - Property key being set
     * @param value - Value to assign
     * @param receiver - Proxy object
     * @returns true if the property was successfully set
     */
    set(target, prop, value, receiver) {
        return set(target, prop, value, receiver, this);
    }
    /**
     * Proxy has trap for property existence checking.
     *
     * Returns true if the property exists in the target, or is a known symbol/API.
     *
     * @param target - State object being checked
     * @param prop - Property key being checked for existence
     * @returns true if property exists in target or is a known symbol/API
     */
    has(target, prop) {
        return Reflect.has(target, prop) || this.symbols.has(prop) || this.apis.has(prop);
    }
}
/**
 * Creates a writable state proxy and executes a callback within a loop context scope.
 *
 * This function creates a temporary writable proxy for the state object, sets up a loop context
 * (if provided), and executes the callback with the proxy and handler. The loop context is
 * automatically cleaned up after callback execution, even if an exception occurs.
 *
 * Supports both synchronous and asynchronous callbacks.
 *
 * @param engine - Component engine containing state management infrastructure
 * @param updater - Updater for tracking and propagating state changes
 * @param state - State object to wrap in a writable proxy
 * @param loopContext - Optional loop context for nested loop bindings, null if not in a loop
 * @param callback - Function to execute with the writable state proxy
 * @returns Result of the callback execution
 */
function useWritableStateProxy(engine, updater, state, loopContext, callback) {
    // Create handler and proxy for writable state access
    const handler = new StateHandler(engine, updater);
    const stateProxy = new Proxy(state, handler);
    // Execute callback within loop context scope (automatically cleaned up)
    return setLoopContext(handler, loopContext, () => {
        return callback(stateProxy, handler);
    });
}

/**
 * Renderer is a coordinator that responds to State changes (a set of IStatePropertyRef references)
 * by traversing the PathTree and delegating applyChange to each Binding (IBinding).
 *
 * Main responsibilities
 * - reorderList: Collects element-level reordering requests and converts them to parent list-level diffs (IListDiff) for application
 * - render: Entry point. Creates ReadonlyState and executes in order: reorder → rendering each ref (renderItem)
 * - renderItem: Updates bindings tied to specified ref and recursively traverses static dependencies (child PathNodes) and dynamic dependencies
 *
 * Contract
 * - Binding#applyChange(renderer): If there are changes, must add itself to renderer.updatedBindings
 * - readonlyState[GetByRefSymbol](ref): Returns the new value (read-only view) of ref
 *
 * Thread/Reentrancy
 * - Assumes synchronous execution.
 *
 * Common exceptions
 * - UPD-001/002: Engine/ReadonlyState not initialized
 * - UPD-003/004/005/006: ListIndex/ParentInfo/OldList* inconsistency or ListDiff not generated
 * - PATH-101: PathNode not found
 */
class Renderer {
    updatedBindings = new Set();
    processedRefs = new Set();
    lastListInfoByRef = new Map();
    _engine;
    _updater;
    _updatingRefs = [];
    _updatingRefSet = new Set();
    _readonlyState = null;
    _readonlyHandler = null;
    _renderPhase = 'build';
    _applyPhaseBinidings = [];
    _applySelectPhaseBinidings = [];
    /**
     * Constructs a new Renderer instance.
     *
     * @param {IComponentEngine} engine - The component engine to render
     * @param {IUpdater} updater - The updater managing this renderer
     */
    constructor(engine, updater) {
        this._engine = engine;
        this._updater = updater;
    }
    get updatingRefs() {
        return this._updatingRefs;
    }
    get updatingRefSet() {
        return this._updatingRefSet;
    }
    get applyPhaseBinidings() {
        return this._applyPhaseBinidings;
    }
    get applySelectPhaseBinidings() {
        return this._applySelectPhaseBinidings;
    }
    /**
     * Gets the read-only State view. Throws exception if not during render execution.
     * Throws: UPD-002
     */
    get readonlyState() {
        if (!this._readonlyState) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyState not initialized",
                context: { where: "Updater.Renderer.readonlyState" },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this._readonlyState;
    }
    get readonlyHandler() {
        if (!this._readonlyHandler) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyHandler not initialized",
                context: { where: "Updater.Renderer.readonlyHandler" },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this._readonlyHandler;
    }
    get renderPhase() {
        return this._renderPhase;
    }
    /**
     * Creates a read-only state and passes it to the callback
     * @param callback
     * @returns
     */
    createReadonlyState(callback) {
        const handler = createReadonlyStateHandler(this._engine, this._updater, this);
        const stateProxy = createReadonlyStateProxy(this._engine.state, handler);
        this._readonlyState = stateProxy;
        this._readonlyHandler = handler;
        try {
            return callback(stateProxy, handler);
        }
        finally {
            this._readonlyState = null;
            this._readonlyHandler = null;
        }
    }
    /**
     * Entry point for rendering. Creates ReadonlyState and
     * processes in order: reordering → rendering each reference.
     *
     * Notes
     * - readonlyState is only valid within this method's scope.
     * - SetCacheableSymbol enables caching of reference resolution in bulk.
     */
    render(items) {
        this.processedRefs.clear();
        this.updatedBindings.clear();
        this._updatingRefs = [...items];
        this._updatingRefSet = new Set(items);
        // Implement actual rendering logic
        this.createReadonlyState(() => {
            // First, process list reordering
            const remainItems = [];
            const remainPathSet = new Set();
            const itemsByListRef = new Map();
            const refSet = new Set();
            // Phase 1: Classify refs into list elements and other refs
            for (let i = 0; i < items.length; i++) {
                const ref = items[i];
                refSet.add(ref);
                // Check if this ref represents a list element
                if (!this._engine.pathManager.elements.has(ref.info.pattern)) {
                    // Not a list element - handle later
                    remainItems.push(ref);
                    remainPathSet.add(ref.info.pattern);
                    continue;
                }
                // This is a list element - group by parent list ref
                const listRef = ref.parentRef ?? raiseError({
                    code: "UPD-004",
                    message: `ParentInfo is null for ref: ${ref.key}`,
                    context: {
                        where: "Updater.Renderer.render",
                        refKey: ref.key,
                        pattern: ref.info.pattern,
                    },
                    docsUrl: "./docs/error-codes.md#upd",
                });
                // Group element refs by their parent list
                if (!itemsByListRef.has(listRef)) {
                    itemsByListRef.set(listRef, new Set());
                }
                itemsByListRef.get(listRef).add(ref);
            }
            // Phase 2: Apply changes to list bindings (for list reordering)
            for (const [listRef, refs] of itemsByListRef) {
                // If the parent list itself is in the update set, skip individual elements
                // (parent list update will handle all children)
                if (refSet.has(listRef)) {
                    for (const ref of refs) {
                        this.processedRefs.add(ref); // Completed
                    }
                    continue; // Skip if parent list exists
                }
                // Apply list bindings (e.g., for reordering)
                const bindings = this._engine.getBindings(listRef);
                for (let i = 0; i < bindings.length; i++) {
                    if (this.updatedBindings.has(bindings[i])) {
                        continue;
                    }
                    bindings[i].applyChange(this);
                }
                this.processedRefs.add(listRef);
            }
            // Phase 3: Process remaining refs (non-list-elements)
            if (remainPathSet.intersection(this._engine.pathManager.buildables).size === 0) {
                this._renderPhase = 'direct';
            }
            for (let i = 0; i < remainItems.length; i++) {
                const ref = remainItems[i];
                // Find the PathNode for this ref pattern
                const node = findPathNodeByPath(this._engine.pathManager.rootNode, ref.info.pattern);
                if (node === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${ref.info.pattern}`,
                        context: { where: "Updater.Renderer.render", pattern: ref.info.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (!this.processedRefs.has(ref)) {
                    this.renderItem(ref, node);
                }
            }
            // Phase 4: Notify child Structive components of changes
            // This allows nested components to update based on parent state changes
            if (this._engine.structiveChildComponents.size > 0) {
                for (const structiveComponent of this._engine.structiveChildComponents) {
                    const structiveComponentBindings = this._engine.bindingsByComponent.get(structiveComponent) ?? new Set();
                    for (const binding of structiveComponentBindings) {
                        // Notify each binding about refs that might affect it
                        binding.notifyRedraw(remainItems);
                    }
                }
            }
            if (this._renderPhase !== 'direct') {
                this._applyPhaseRender();
            }
            this._applySelectPhaseRender();
        });
    }
    _applyPhaseRender() {
        this._renderPhase = 'apply';
        try {
            for (let i = 0; i < this._applyPhaseBinidings.length; i++) {
                this._applyPhaseBinidings[i].applyChange(this);
            }
        }
        finally {
            this._applyPhaseBinidings = [];
        }
    }
    _applySelectPhaseRender() {
        this._renderPhase = 'applySelect';
        try {
            for (let i = 0; i < this._applySelectPhaseBinidings.length; i++) {
                this._applySelectPhaseBinidings[i].applyChange(this);
            }
        }
        finally {
            this._applySelectPhaseBinidings = [];
        }
    }
    /**
     * Renders a single reference ref and its corresponding PathNode.
     *
     * - First applies its own bindings
     * - Then static dependencies (including wildcards)
     * - Finally dynamic dependencies (wildcards are expanded hierarchically)
     *
     * Static dependencies (child nodes)
     * - Otherwise: Inherit parent's listIndex to generate child reference and render recursively
     *
     * Dynamic dependencies
     * - Based on paths registered in pathManager.dynamicDependencies, render recursively while expanding wildcards
     *
    * Throws
    * - PATH-101: PathNode not detected for dynamic dependency
     */
    renderItem(ref, node) {
        this.processedRefs.add(ref);
        // Apply changes to bindings
        // Bindings with changes must add themselves to updatedBindings (responsibility of applyChange implementation)
        const bindings = this._engine.getBindings(ref);
        for (let i = 0; i < bindings.length; i++) {
            if (this.updatedBindings.has(bindings[i])) {
                continue;
            }
            bindings[i].applyChange(this);
        }
        // Calculate which list indexes are new (added) since last render
        // This optimization ensures we only traverse new list elements
        let diffListIndexes = new Set();
        if (this._engine.pathManager.lists.has(ref.info.pattern)) {
            // Get current list indexes for this ref
            const currentListIndexes = new Set(this.readonlyState[GetListIndexesByRefSymbol](ref) ?? []);
            // Get previous list indexes from last render
            const { listIndexes } = this.lastListInfoByRef.get(ref) ?? {};
            const lastListIndexSet = new Set(listIndexes ?? []);
            // Compute difference: new indexes = current - previous
            diffListIndexes = currentListIndexes.difference(lastListIndexSet);
        }
        // Traverse static dependencies
        for (const [name, childNode] of node.childNodeByName) {
            const childInfo = getStructuredPathInfo(childNode.currentPath);
            if (name === WILDCARD) {
                // Wildcard child: traverse only new list indexes
                for (const listIndex of diffListIndexes) {
                    const childRef = getStatePropertyRef(childInfo, listIndex);
                    if (!this.processedRefs.has(childRef)) {
                        this.renderItem(childRef, childNode);
                    }
                }
            }
            else {
                // Regular property child: inherit parent's listIndex
                const childRef = getStatePropertyRef(childInfo, ref.listIndex);
                if (!this.processedRefs.has(childRef)) {
                    this.renderItem(childRef, childNode);
                }
            }
        }
        // Traverse dynamic dependencies
        const deps = this._engine.pathManager.dynamicDependencies.get(ref.info.pattern);
        if (deps) {
            for (const depPath of deps) {
                const depInfo = getStructuredPathInfo(depPath);
                const depNode = findPathNodeByPath(this._engine.pathManager.rootNode, depInfo.pattern);
                if (depNode === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${depInfo.pattern}`,
                        context: { where: "Updater.Renderer.renderItem", pattern: depInfo.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (depInfo.wildcardCount > 0) {
                    // Dynamic dependency has wildcards - need hierarchical expansion
                    const infos = depInfo.wildcardParentInfos;
                    // Recursive walker to expand wildcards level by level
                    const walk = (depRef, index, nextInfo) => {
                        // Get list indexes at current wildcard level
                        const listIndexes = this.readonlyState[GetListIndexesByRefSymbol](depRef) || [];
                        if ((index + 1) < infos.length) {
                            // More wildcard levels to traverse
                            for (let i = 0; i < listIndexes.length; i++) {
                                const nextRef = getStatePropertyRef(nextInfo, listIndexes[i]);
                                // Recurse to next wildcard level
                                walk(nextRef, index + 1, infos[index + 1]);
                            }
                        }
                        else {
                            // Reached final wildcard level - render all elements
                            for (let i = 0; i < listIndexes.length; i++) {
                                const subDepRef = getStatePropertyRef(depInfo, listIndexes[i]);
                                if (!this.processedRefs.has(subDepRef)) {
                                    this.renderItem(subDepRef, depNode);
                                }
                            }
                        }
                    };
                    // Start traversal from first wildcard parent
                    const startRef = getStatePropertyRef(depInfo.wildcardParentInfos[0], null);
                    walk(startRef, 0, depInfo.wildcardParentInfos[1] || null);
                }
                else {
                    // No wildcards - simple direct dependency
                    const depRef = getStatePropertyRef(depInfo, null);
                    if (!this.processedRefs.has(depRef)) {
                        this.renderItem(depRef, depNode);
                    }
                }
            }
        }
    }
    initialRender(root) {
        this.createReadonlyState(() => {
            root.applyChange(this);
            this._applyPhaseRender();
            this._applySelectPhaseRender();
        });
    }
}
/**
 * Convenience function. Creates a Renderer instance and calls render in one go.
 */
function render(refs, engine, updater, resolver) {
    const renderer = new Renderer(engine, updater);
    try {
        renderer.render(refs);
    }
    finally {
        resolver.resolve();
    }
}
/**
 * Creates a new Renderer instance.
 *
 * @param {IComponentEngine} engine - The component engine to render
 * @param {IUpdater} updater - The updater managing this renderer
 * @returns {IRenderer} A new renderer instance
 */
function createRenderer(engine, updater) {
    return new Renderer(engine, updater);
}

class RenderMain {
    _engine;
    _updater;
    _waitResolver = Promise.withResolvers();
    _completedResolvers;
    constructor(engine, updater, completedResolvers) {
        this._engine = engine;
        this._updater = updater;
        this._completedResolvers = completedResolvers;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._main();
    }
    async _main() {
        const renderPromises = [];
        let termResolver = null;
        let result = true;
        while (termResolver === null) {
            termResolver = await this._waitResolver.promise ?? null;
            // Retrieve current queue and reset for new items
            const queue = this._updater.retrieveAndClearQueue();
            if (queue.length === 0) {
                continue;
            }
            // Execute rendering for all refs in this batch
            const resolver = Promise.withResolvers();
            renderPromises.push(resolver.promise);
            try {
                // Render the queued refs
                render(queue, this._engine, this._updater, resolver);
            }
            catch (e) {
                console.error("Rendering error:", e);
                resolver.reject();
            }
        }
        try {
            await Promise.all(renderPromises);
        }
        catch (_e) {
            result = false;
        }
        finally {
            termResolver.resolve(result);
        }
    }
    wakeup() {
        this._waitResolver.resolve();
        this._waitResolver = Promise.withResolvers();
    }
    terminate() {
        this._waitResolver.resolve(this._completedResolvers);
    }
}
function createRenderMain(engine, updater, completedResolvers) {
    return new RenderMain(engine, updater, completedResolvers);
}

class UpdateActivityTracker {
    _version = 0;
    _processResolvers = [];
    _observedResolvers = [];
    _waitResolver = null;
    _mainResolver = null;
    _renderMain;
    constructor(renderMain) {
        this._renderMain = renderMain;
    }
    createProcessResolver() {
        const resolver = Promise.withResolvers();
        this._processResolvers.push(resolver);
        if (this._waitResolver === null) {
            if (this._mainResolver === null) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._main();
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._mainResolver.promise.then(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._main();
                });
            }
        }
        else {
            this._waitResolver.reject();
        }
        return resolver;
    }
    _getVersionUp() {
        this._version++;
        return this._version;
    }
    _nextWaitPromise() {
        const version = this._getVersionUp();
        this._waitResolver = Promise.withResolvers();
        this._observedResolvers = this._observedResolvers.concat(...this._processResolvers);
        this._processResolvers = [];
        const observedResolvers = [...this._observedResolvers];
        const observedPromises = this._observedResolvers.map(c => c.promise);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.allSettled(observedPromises).then(() => {
            if (this._version !== version) {
                this._observedResolvers = this._observedResolvers.filter(r => !observedResolvers.includes(r));
                return;
            }
            if (this._waitResolver === null) {
                raiseError({
                    code: 'UPD-007',
                    message: 'UpdateActivityTracker waitResolver is null.',
                    context: { where: 'UpdateActivityTracker.nextWaitPromise' },
                    docsUrl: "./docs/error-codes.md#upd",
                });
            }
            this._observedResolvers = [];
            this._waitResolver.resolve();
        });
        return this._waitResolver.promise;
    }
    async _main() {
        if (this._mainResolver !== null) {
            return;
        }
        this._mainResolver = Promise.withResolvers();
        try {
            while (true) {
                const waitPromise = this._nextWaitPromise();
                try {
                    await waitPromise;
                    this._waitResolver = null;
                    if (this._processResolvers.length === 0 && this._observedResolvers.length === 0) {
                        this._renderMain.terminate();
                        break;
                    }
                }
                catch (_e) {
                    continue;
                }
            }
        }
        finally {
            // 終了処理
            if (this._mainResolver !== null) {
                this._mainResolver.resolve();
            }
            this._mainResolver = null;
        }
    }
    get isProcessing() {
        return this._mainResolver !== null;
    }
}
function createUpdateActivityTracker(renderMain) {
    return new UpdateActivityTracker(renderMain);
}

/**
 * The Updater class plays a central role in state management and updates.
 * Instances are created on-demand when state updates are needed.
 *
 * Main features:
 * - Queues state property references that need updating
 * - Schedules and executes rendering cycles via microtasks
 * - Manages version/revision tracking for cache invalidation
 * - Collects dependent paths affected by state changes
 * - Provides read-only and writable state contexts
 *
 * @class Updater
 * @implements {IUpdater}
 */
class Updater {
    /** Map storing swap/reorder information for list elements */
    swapInfoByRef = new Map();
    /** Queue of state property references waiting to be rendered */
    _queue = [];
    /** Flag indicating if rendering is currently in progress */
    _rendering = false;
    /** Reference to the component engine being updated */
    _engine;
    /** Current version number for this update cycle */
    _version;
    /** Current revision number within the version */
    _revision = 0;
    /** Queue of refs saved for deferred updated callbacks */
    _saveQueue = [];
    /** Cache mapping paths to their dependent paths for optimization */
    _cacheUpdatedPathsByPath = new Map();
    _completedResolvers = Promise.withResolvers();
    _renderMain;
    _isAlive = true;
    _tracker;
    /**
     * Constructs a new Updater instance.
     * Automatically increments the engine's version number.
     *
     * @param {IComponentEngine} engine - The component engine to manage updates for
     */
    constructor(engine) {
        this._engine = engine;
        this._version = engine.versionUp();
        this._renderMain = createRenderMain(engine, this, this._completedResolvers);
        this._tracker = createUpdateActivityTracker(this._renderMain);
        engine.updateCompleteQueue.enqueue(this._completedResolvers.promise);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._completedResolvers.promise.finally(() => {
            this._isAlive = false;
        });
    }
    /**
     * Gets the current version number.
     * Version is incremented each time a new Updater is created.
     *
     * @returns {number} Current version number
     */
    get version() {
        return this._version;
    }
    /**
     * Gets the current revision number.
     * Revision is incremented with each enqueueRef call within the same version.
     *
     * @returns {number} Current revision number
     */
    get revision() {
        return this._revision;
    }
    /**
     * Gets a promise that resolves when all updates are complete.
     * The promise resolves to true if all updates succeeded, false if any failed.
     *
     * @returns {UpdateComplete} Promise resolving when updates are complete
     */
    get updateComplete() {
        return this._completedResolvers.promise;
    }
    _rebuild() {
        if (this._isAlive) {
            raiseError({
                code: 'UPD-006',
                message: 'Updater has already been used. Create a new Updater instance for rebuild.',
                context: { where: 'Updater._rebuild' },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        this._isAlive = true;
        this._completedResolvers = Promise.withResolvers();
        this._version = this._engine.versionUp();
        this._renderMain = createRenderMain(this._engine, this, this._completedResolvers);
        this._tracker = createUpdateActivityTracker(this._renderMain);
        this._engine.updateCompleteQueue.enqueue(this._completedResolvers.promise);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._completedResolvers.promise.finally(() => {
            this._isAlive = false;
        });
    }
    /**
     * Adds a state property reference to the update queue and schedules rendering.
     * Increments revision, collects dependent paths, and schedules async rendering via microtask.
     * If rendering is already in progress, the ref is queued but no new render is scheduled.
     *
     * @param {IStatePropertyRef} ref - The state property reference that changed
     * @returns {void}
     *
     * @example
     * updater.enqueueRef(getStatePropertyRef(pathInfo, listIndex));
     */
    enqueueRef(ref) {
        // Increment revision to track sub-updates within this version
        this._revision++;
        // Add to both queues: render queue and save queue for callbacks
        this._queue.push(ref);
        this._saveQueue.push(ref);
        // Collect all paths that might be affected by this change
        this.collectMaybeUpdates(this._engine, ref.info.pattern, this._engine.versionRevisionByPath, this._revision);
        this._renderMain.wakeup();
    }
    /**
     * Executes a state update operation within a writable state context.
     * Creates a writable proxy, executes the callback, and handles updated callbacks.
     * Supports both synchronous and asynchronous update operations.
     *
     * @template R - The return type of the callback
     * @param {ILoopContext | null} loopContext - Loop context for wildcard resolution, or null for root
     * @param {function} callback - Callback that performs state modifications
     * @returns {R} The result returned by the callback (may be a Promise)
     *
     * @example
     * updater.update(null, (state) => {
     *   state.count = 42;
     * });
     */
    update(loopContext, callback) {
        const resolvers = this._tracker.createProcessResolver();
        // Create writable state proxy and execute update callback
        const resultPromise = useWritableStateProxy(this._engine, this, this._engine.state, loopContext, (state, handler) => {
            // Execute user's state modification callback
            return callback(state, handler);
        });
        // Handler to process updated callbacks after state changes
        const updatedCallbackHandler = () => {
            // If there are updated callbacks registered and refs in save queue
            if (this._engine.pathManager.hasUpdatedCallback && this._saveQueue.length > 0) {
                const saveQueue = this._saveQueue;
                this._saveQueue = [];
                // Schedule updated callbacks in next microtask
                queueMicrotask(() => {
                    const updatedPromise = this.update(null, (state) => {
                        // Invoke updated callbacks with the saved refs
                        return state[UpdatedCallbackSymbol](saveQueue);
                    });
                    if (updatedPromise instanceof Promise) {
                        updatedPromise.catch(() => {
                            raiseError({
                                code: 'UPD-005',
                                message: 'An error occurred during asynchronous state update.',
                                context: { where: 'Updater.update.updatedCallback' },
                                docsUrl: "./docs/error-codes.md#upd",
                            });
                        });
                    }
                });
            }
            else {
                resolvers.resolve();
            }
        };
        // Handle both Promise and non-Promise results
        if (resultPromise instanceof Promise) {
            // For async updates, run handler after promise completes
            return resultPromise.finally(() => {
                updatedCallbackHandler();
            });
        }
        else {
            // For sync updates, run handler immediately
            updatedCallbackHandler();
        }
        return resultPromise;
    }
    /**
     * Retrieves and clears the queue of state property references pending update.
     *
     * @returns {IStatePropertyRef[]} Array of state property references to be updated
     */
    retrieveAndClearQueue() {
        const queue = this._queue;
        this._queue = [];
        return queue;
    }
    /**
     * Performs the initial rendering of the component.
     * Creates a renderer and passes it to the callback for setup.
     *
     * @param {IBindContent} root - The root BindContent for initial rendering
     * @returns {void}
     */
    initialRender(root) {
        const processResolvers = this._tracker.createProcessResolver();
        const renderer = createRenderer(this._engine, this);
        try {
            renderer.initialRender(root);
        }
        finally {
            // 2フェイズレンダリング対応時、この行は不要になる可能性あり
            processResolvers.resolve();
        }
    }
    /**
     *
     * @param callback
     * @returns
     */
    invoke(callback) {
        if (!this._isAlive) {
            this._rebuild();
        }
        const processResolvers = this._tracker.createProcessResolver();
        try {
            return callback();
        }
        finally {
            processResolvers.resolve();
        }
    }
    /**
     * Recursively collects all paths that may be affected by a change to the given path.
     * Traverses child nodes and dynamic dependencies to build a complete dependency graph.
     * Uses visitedInfo set to prevent infinite recursion on circular dependencies.
     *
     * @param {IComponentEngine} engine - The component engine
     * @param {string} path - The path that changed
     * @param {IPathNode} node - The PathNode corresponding to the path
     * @param {Set<string>} visitedInfo - Set tracking already visited paths
     * @param {boolean} isSource - True if this is the source path that changed
     * @returns {void}
     */
    recursiveCollectMaybeUpdates(engine, path, node, visitedInfo, isSource) {
        // Skip if already processed this path
        if (visitedInfo.has(path)) {
            return;
        }
        // Skip list elements when processing source to avoid redundant updates
        // (list container updates will handle elements)
        if (isSource && engine.pathManager.elements.has(path)) {
            return;
        }
        // Mark as visited
        visitedInfo.add(path);
        // Collect all static child dependencies
        for (const [, childNode] of node.childNodeByName.entries()) {
            const childPath = childNode.currentPath;
            this.recursiveCollectMaybeUpdates(engine, childPath, childNode, visitedInfo, false);
        }
        // Collect all dynamic dependencies (registered via data-bind)
        const deps = engine.pathManager.dynamicDependencies.get(path) ?? [];
        for (const depPath of deps) {
            const depNode = findPathNodeByPath(engine.pathManager.rootNode, depPath);
            if (depNode === null) {
                raiseError({
                    code: "UPD-004",
                    message: `Path node not found for pattern: ${depPath}`,
                    context: { where: 'Updater.recursiveCollectMaybeUpdates', depPath },
                    docsUrl: "./docs/error-codes.md#upd",
                });
            }
            this.recursiveCollectMaybeUpdates(engine, depPath, depNode, visitedInfo, false);
        }
    }
    /**
     * Collects all paths that might need updating based on a changed path.
     * Uses caching to avoid redundant dependency traversal for the same paths.
     * Updates the versionRevisionByPath map for cache invalidation.
     *
     * @param {IComponentEngine} engine - The component engine
     * @param {string} path - The path that changed
     * @param {Map<string, IVersionRevision>} versionRevisionByPath - Map to update with version info
     * @param {number} revision - Current revision number
     * @returns {void}
     * @throws {Error} Throws UPD-003 if path node not found
     */
    collectMaybeUpdates(engine, path, versionRevisionByPath, revision) {
        const node = findPathNodeByPath(engine.pathManager.rootNode, path);
        if (node === null) {
            raiseError({
                code: "UPD-003",
                message: `Path node not found for pattern: ${path}`,
                context: { where: 'Updater.collectMaybeUpdates', path },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        // Check cache for previously computed dependencies
        let updatedPaths = this._cacheUpdatedPathsByPath.get(path);
        if (typeof updatedPaths === "undefined") {
            // Cache miss: compute dependencies recursively
            updatedPaths = new Set();
            this.recursiveCollectMaybeUpdates(engine, path, node, updatedPaths, true);
        }
        // Create version/revision marker for cache invalidation
        const versionRevision = {
            version: this.version,
            revision: revision,
        };
        // Update version info for all affected paths
        for (const updatedPath of updatedPaths) {
            versionRevisionByPath.set(updatedPath, versionRevision);
        }
        // Cache the computed dependencies for future use
        this._cacheUpdatedPathsByPath.set(path, updatedPaths);
    }
    /**
     * Creates a read-only state context and executes a callback within it.
     * Provides safe read access to state without modification capabilities.
     *
     * @template R - The return type of the callback
     * @param {function} callback - Callback receiving read-only state and handler
     * @returns {R} The result returned by the callback
     *
     * @example
     * const value = updater.createReadonlyState((state) => {
     *   return state.someProperty;
     * });
     */
    createReadonlyState(callback) {
        // Create read-only handler and proxy
        const handler = createReadonlyStateHandler(this._engine, this, null);
        const stateProxy = createReadonlyStateProxy(this._engine.state, handler);
        // Execute callback with read-only state
        return callback(stateProxy, handler);
    }
}
/**
 * Creates a new Updater instance and passes it to a callback.
 * This pattern provides clear scope management for update operations.
 * The updater is created with an incremented version number.
 *
 * @template R - The return type of the callback
 * @param {IComponentEngine} engine - The component engine to create updater for
 * @param {function(IUpdater): R} callback - Callback receiving the updater instance
 * @returns {R} The result returned by the callback
 *
 * @example
 * createUpdater(engine, (updater) => {
 *   updater.update(null, (state) => {
 *     state.count++;
 *   });
 * });
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
 * @throws BIND-201 Decorator conflict: When multiple decorators are specified
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
    * @throws BIND-201 Decorator conflict
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement) {
            return;
        }
        const inputElement = this.node;
        if (inputElement.type !== "checkbox") {
            return;
        }
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Checkbox binding has multiple decorators",
                context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "./docs/error-codes.md#bind",
                severity: "error",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        if (eventName === "readonly" || eventName === "ro") {
            return;
        }
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, (_e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, this.filteredValue);
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
                message: 'Checkbox value is not array',
                context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.checked = value.includes(this.filteredValue);
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
                message: 'ClassList value is not array',
                context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
                docsUrl: './docs/error-codes.md#bind',
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
                message: 'ClassName value is not boolean',
                context: { where: 'BindingNodeClassName.update', receivedType: typeof value },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.classList.toggle(this.subName, value);
    }
}
const subNameByName$3 = {};
/**
 * Factory function to generate class name binding node.
 *
 * @param name - Binding name (e.g., "class.active")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeClassName with binding, node, and filters
 */
const createBindingNodeClassName = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName$3[name] ?? (subNameByName$3[name] = name.split(".")[1]);
    return new BindingNodeClassName(binding, node, name, subName, filterFns, decorates);
};

/**
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 * Extracts event name from binding name ("onClick" → "click") and registers as event listener.
 * Supports preventDefault/stopPropagation decorators and passes loop indexes to handlers.
 *
 * @throws BIND-201 Binding value is not a function: When handler is missing
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
    handler(e) {
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
                if (typeof func === "function") {
                    return Reflect.apply(func, state, [e, ...indexes]);
                }
                raiseError({
                    code: 'BIND-201',
                    message: 'Binding value is not a function',
                    context: {
                        where: 'BindingNodeEvent.handler',
                        bindName: this.name,
                        eventName: this.subName,
                        receivedType: typeof func,
                    },
                    docsUrl: './docs/error-codes.md#bind',
                    severity: 'error',
                });
            });
        });
        if (resultPromise instanceof Promise) {
            resultPromise.catch((error) => {
                const cause = error instanceof Error ? error : new Error(String(error));
                raiseError({
                    code: 'BIND-202',
                    message: 'Event handler rejected',
                    context: { where: 'BindingNodeEvent.handler', bindName: this.name, eventName: this.subName },
                    docsUrl: './docs/error-codes.md#bind',
                    severity: 'error',
                    cause,
                });
            });
        }
    }
    /**
     * Event binding does nothing on state change.
     *
     * @param renderer - Renderer instance (unused)
     */
    applyChange(_renderer) {
    }
}
const subNameByName$2 = {};
/**
 * Factory function to generate event binding node.
 *
 * @param name - Binding name (e.g., "onClick", "onInput")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators ("preventDefault", "stopPropagation")
 * @returns Function that creates BindingNodeEvent with binding, node, and filters
 */
const createBindingNodeEvent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName$2[name] ?? (subNameByName$2[name] = name.slice(2));
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
    _id;
    /**
     * Returns template ID extracted from comment node.
     *
     * @returns Template ID (non-negative integer)
     */
    get id() {
        return this._id;
    }
    get buildable() {
        return true;
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
            docsUrl: './docs/error-codes.md#bind',
            severity: 'error',
        });
        const [id,] = commentText.split(' ', 2);
        const numId = Number(id);
        if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
            raiseError({
                code: 'BIND-201',
                message: 'Invalid node',
                context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        this._id = numId;
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
    assignValue(_value) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding assignValue not implemented',
            context: { where: 'BindingNodeIf.assignValue', bindName: this.name },
            docsUrl: './docs/error-codes.md#bind',
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
        const baseContext = {
            where: 'BindingNodeIf.applyChange',
            bindName: this.name,
        };
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        if (typeof filteredValue !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'If binding value is not boolean',
                context: { ...baseContext, receivedType: typeof filteredValue },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        const parentNode = this.node.parentNode;
        if (parentNode === null) {
            raiseError({
                code: 'BIND-201',
                message: 'Parent node not found',
                context: { ...baseContext, nodeType: this.node.nodeType },
                docsUrl: './docs/error-codes.md#bind',
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
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeIf(binding, node, name, "", filterFns, decorates);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
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
                message: 'BindContent pool length is negative',
                context: { where: 'BindingNodeFor.setPoolLength', bindName: this.name, requestedLength: length },
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
            const loopPath = `${this.binding.bindingState.pattern}.*`;
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
    assignValue(_value) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding assignValue not implemented',
            context: { where: 'BindingNodeFor.assignValue' },
            hint: 'Call applyChange to update loop bindings',
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
        const baseContext = {
            where: 'BindingNodeFor.applyChange',
            bindName: this.name,
            statePath: this.binding.bindingState.pattern,
        };
        // Detect changes: adds, removes, changeIndexes, overwrites
        const newList = renderer.readonlyState[GetByRefSymbol](this.binding.bindingState.ref);
        if (!Array.isArray(newList)) {
            raiseError({
                code: 'BIND-201',
                message: 'Loop value is not array',
                context: { ...baseContext, receivedType: newList === null ? 'null' : typeof newList },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
        const newListIndexesSet = new Set(newListIndexes);
        const oldList = typeof this._oldList === "undefined" ? [] : this._oldList;
        if (!Array.isArray(oldList)) {
            raiseError({
                code: 'BIND-201',
                message: 'Previous loop value is not array',
                context: { ...baseContext, receivedType: oldList === null ? 'null' : typeof oldList },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        const oldListLength = oldList.length ?? 0;
        const removesSet = newListIndexesSet.size === 0
            ? this._oldListIndexSet
            : this._oldListIndexSet.difference(newListIndexesSet);
        const addsSet = this._oldListIndexSet.size === 0
            ? newListIndexesSet
            : newListIndexesSet.difference(this._oldListIndexSet);
        const newListLength = newList?.length ?? 0;
        const changeIndexesSet = new Set();
        const overwritesSet = new Set();
        // Classify updating refs into changeIndexes or overwrites
        const elementsPath = `${this.binding.bindingState.info.pattern}.*`;
        for (let i = 0; i < renderer.updatingRefs.length; i++) {
            const updatingRef = renderer.updatingRefs[i];
            if (updatingRef.info.pattern !== elementsPath) {
                continue;
            }
            if (renderer.processedRefs.has(updatingRef)) {
                continue;
            }
            const listIndex = updatingRef.listIndex;
            if (listIndex === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'ListIndex is null',
                    context: { ...baseContext, refPattern: updatingRef.info.pattern },
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
            message: 'Parent node not found',
            context: { ...baseContext, nodeType: this.node.nodeType },
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
                message: 'Last BindContent not found',
                context: { ...baseContext, bindContentCount: this._bindContents.length },
                docsUrl: './docs/error-codes.md#bind',
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
                            context: { ...baseContext, phase: 'removes', listIndex: listIndex.index },
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
                            context: { ...baseContext, phase: 'reuse', listIndex: listIndex.index },
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
                    if (renderer.updatedBindings.has(binding)) {
                        continue;
                    }
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
                            context: { ...baseContext, phase: 'reorder', listIndex: listIndex.index },
                            docsUrl: './docs/error-codes.md#bind',
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
                            context: { ...baseContext, phase: 'overwrites', listIndex: listIndex.index },
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
        if (!isElement) {
            return;
        }
        if (!isTwoWayBindable(this.node)) {
            return;
        }
        const defaultNames = getTwoWayPropertiesHTMLElement(this.node);
        if (!defaultNames.has(this.name)) {
            return;
        }
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Property binding has multiple decorators",
                context: {
                    where: "BindingNodeProperty.constructor",
                    bindName: this.name,
                    decoratesCount: decorates.length,
                },
                docsUrl: "./docs/error-codes.md#bind",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? defaultEventByName[this.name] ?? "readonly";
        if (eventName === "readonly" || eventName === "ro") {
            return;
        }
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, (_e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, this.filteredValue);
                });
            });
        });
    }
    /**
     * Returns raw property value from DOM node.
     *
     * @returns Property value
     */
    get value() {
        // @ts-expect-error TS doesn't recognize dynamic property names
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
     * Assigns value to property, converting null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to property
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignValue(value) {
        let anyValue;
        if (value === null || value === undefined || Number.isNaN(value)) {
            anyValue = "";
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            anyValue = value;
        }
        if (this.name in this.node) {
            // @ts-expect-error TS doesn't recognize dynamic property names
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.node[this.name] = anyValue;
        }
        else {
            raiseError({
                code: 'BIND-201',
                message: `Property not found on node: ${this.name}`,
                context: {
                    where: 'BindingNodeProperty.assignValue',
                    bindName: this.name,
                    nodeType: this.node.nodeType,
                },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
        if (!isInputElement) {
            return;
        }
        const inputElement = this.node;
        if (inputElement.type !== "radio") {
            return;
        }
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Radio binding has multiple decorators",
                context: {
                    where: "BindingNodeRadio.constructor",
                    bindName: this.name,
                    decoratesCount: decorates.length,
                },
                docsUrl: "./docs/error-codes.md#bind",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        if (eventName === "readonly" || eventName === "ro") {
            return;
        }
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, (_e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, this.filteredValue);
                });
            });
        });
    }
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
     * Sets checked state by comparing binding value with filteredValue.
     * Converts null/undefined to empty string for comparison.
     *
     * @param value - Value from state binding
     */
    assignValue(rawValue) {
        let value;
        if (rawValue === null || rawValue === undefined) {
            value = "";
        }
        else {
            value = rawValue;
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
        const element = this.node;
        const stringValue = value === null ||
            value === undefined ||
            (typeof value === "number" && Number.isNaN(value))
            ? ""
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            : String(value);
        element.style.setProperty(this.subName, stringValue.toString());
    }
}
const subNameByName$1 = {};
/**
 * Factory function to generate style attribute binding node.
 *
 * @param name - Binding name (e.g., "style.color")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeStyle with binding, node, and filters
 */
const createBindingNodeStyle = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName$1[name] ?? (subNameByName$1[name] = name.split(".")[1]);
    return new BindingNodeStyle(binding, node, name, subName, filterFns, decorates);
};

const symbolName = "component-state-input";
const AssignStateSymbol = Symbol.for(`${symbolName}.AssignState`);
const NotifyRedrawSymbol = Symbol.for(`${symbolName}.NotifyRedraw`);

/**
 * WeakMap storing parent-child relationships between Structive components.
 * Uses WeakMap to allow automatic garbage collection when components are destroyed.
 */
const parentStructiveComponentByStructiveComponent = new WeakMap();
/**
 * Finds the parent Structive component for a given component.
 * Returns the registered parent component or null if none exists.
 *
 * @param {StructiveComponent} el - The component to find the parent for
 * @returns {StructiveComponent | null} The parent component or null if not found
 *
 * @example
 * const parent = findStructiveParent(childComponent);
 * if (parent) {
 *   // Access parent component
 * }
 */
function findStructiveParent(el) {
    return parentStructiveComponentByStructiveComponent.get(el) ?? null;
}
/**
 * Registers a parent-child relationship between two Structive components.
 * This allows child components to access their parent via findStructiveParent.
 *
 * @param {StructiveComponent} parentComponent - The parent component
 * @param {StructiveComponent} component - The child component to register
 * @returns {void}
 *
 * @example
 * registerStructiveComponent(parentComponent, childComponent);
 */
function registerStructiveComponent(parentComponent, component) {
    parentStructiveComponentByStructiveComponent.set(component, parentComponent);
}
/**
 * Removes a component from the parent-child relationship registry.
 * Called during component cleanup/disconnection to prevent memory leaks.
 *
 * @param {StructiveComponent} component - The component to remove from registry
 * @returns {void}
 *
 * @example
 * removeStructiveComponent(component); // Called in disconnectedCallback
 */
function removeStructiveComponent(component) {
    parentStructiveComponentByStructiveComponent.delete(component);
}

/**
 * Retrieves the custom element tag name from an HTMLElement.
 *
 * Handles both autonomous custom elements (tag names with hyphens like <my-element>)
 * and customized built-in elements (standard elements with 'is' attribute like <button is="my-button">).
 *
 * @param {HTMLElement} component - The HTML element to extract the tag name from
 * @returns {string} The custom element tag name in lowercase
 * @throws {Error} COMP-401 - When neither the tag name nor 'is' attribute contains a hyphen
 *
 * @example
 * // Autonomous custom element
 * const tagName = getCustomTagName(document.querySelector('my-element'));
 * // Returns: 'my-element'
 *
 * @example
 * // Customized built-in element
 * const tagName = getCustomTagName(document.querySelector('[is="my-button"]'));
 * // Returns: 'my-button'
 */
function getCustomTagName(component) {
    // Check if it's an autonomous custom element (tag name contains hyphen)
    if (component.tagName.includes('-')) {
        return component.tagName.toLowerCase();
    }
    const isAttribute = component.getAttribute('is');
    // Check if it's a customized built-in element (has 'is' attribute with hyphen)
    if (isAttribute?.includes('-')) {
        return isAttribute.toLowerCase();
    }
    // Neither format found - not a valid custom element
    raiseError({
        code: 'COMP-401',
        message: 'Custom element tag name not found',
        context: {
            where: 'WebComponents.getCustomTagName',
            tagName: component.tagName,
            isAttribute: isAttribute ?? null,
        },
        docsUrl: './docs/error-codes.md#comp',
    });
}

/**
 * BindingNodeComponent class implements binding processing to StructiveComponent (custom component).
 *
 * Responsibilities:
 * - Binds parent component state to child component state property
 * - Propagates state changes via NotifyRedrawSymbol
 * - Manages parent-child component relationships and lifecycle
 *
 * @throws COMP-401 Custom element tag name not found: When tag name cannot be determined
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
    * @throws COMP-401 Custom element tag name not found
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
                message: 'Custom element tag name not found',
                context: { where: 'BindingNodeComponent.constructor' },
                docsUrl: './docs/error-codes.md#comp',
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
        }).catch((e) => {
            const cause = e instanceof Error ? e : new Error(String(e));
            raiseError({
                code: 'COMP-402',
                message: `Custom element definition failed: ${tagName}`,
                context: { where: 'BindingNodeComponent._notifyRedraw', tagName },
                docsUrl: './docs/error-codes.md#comp',
                cause,
            });
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
    applyChange(_renderer) {
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
        }).catch((e) => {
            const cause = e instanceof Error ? e : new Error(String(e));
            raiseError({
                code: 'COMP-402',
                message: `Custom element definition failed: ${tagName}`,
                context: { where: 'BindingNodeComponent.activate', tagName },
                docsUrl: './docs/error-codes.md#comp',
                cause,
            });
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
        const bindings = engine.bindingsByComponent.get(this.node);
        if (typeof bindings !== "undefined") {
            bindings.delete(this.binding);
        }
    }
}
const subNameByName = {};
/**
 * Factory function to generate component binding node.
 *
 * @param name - Binding name (e.g., "component.stateProp")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeComponent with binding, node, and filters
 */
const createBindingNodeComponent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName[name] ?? (subNameByName[name] = name.split(".")[1]);
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
        raiseError({
            code: "BIND-106",
            message: `Comment binding property not supported: ${propertyName}`,
            context: {
                where: "BindingBuilder.getBindingNodeCreator",
                propertyName,
                nodeType: "Comment",
            },
            docsUrl: "./docs/error-codes.md#bind",
        });
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
    const key = `${isComment}\t${isElement}\t${propertyName}`;
    // Get from cache, if not exists, determine and save to cache
    const fn = _cache[key] ?? (_cache[key] = _getBindingNodeCreator(isComment, isElement, propertyName));
    // Execute obtained creator function with property name, filters, and decorates
    return fn(propertyName, filterTexts, decorates);
}

class BindingStateInternal {
    pattern;
    info;
    nullRef;
    constructor(pattern) {
        this.pattern = pattern;
        this.info = getStructuredPathInfo(pattern);
        this.nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
    }
}
const bindingStateInternalByPattern = {};
/**
 * BindingState class manages state property access, filtering, and updates for bindings.
 * - Supports wildcard paths for array bindings with dynamic index resolution
 * - Handles bidirectional binding via assignValue
 */
class BindingState {
    filters;
    isLoopIndex = false;
    _internal;
    _binding;
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
        this._internal = bindingStateInternalByPattern[pattern] ??
            (bindingStateInternalByPattern[pattern] = new BindingStateInternal(pattern));
        this._binding = binding;
        this.filters = filters;
    }
    get pattern() {
        return this._internal.pattern;
    }
    get info() {
        return this._internal.info;
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
        if (this._internal.nullRef === null) {
            if (this._loopContext === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: {
                        where: 'BindingState.ref',
                        pattern: this.pattern,
                        wildcardCount: this.info.wildcardCount,
                    },
                    docsUrl: './docs/error-codes.md#bind',
                });
            }
            if (this._ref === null) {
                this._ref = getStatePropertyRef(this.info, this._loopContext.listIndex);
            }
            return this._ref;
        }
        else {
            return this._internal.nullRef;
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
            const baseContext = {
                where: 'BindingState.activate',
                pattern: this.pattern,
            };
            const lastWildcardPath = this.info.lastWildcardPath ??
                raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard last parentPath is null',
                    context: baseContext,
                    docsUrl: './docs/error-codes.md#bind',
                });
            this._loopContext = this._binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ??
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: {
                        ...baseContext,
                        lastWildcardPath,
                    },
                    docsUrl: './docs/error-codes.md#bind',
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
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingState(binding, name, filterFns);
};

class BindingStateIndexInternal {
    pattern;
    indexNumber;
    constructor(pattern) {
        this.pattern = pattern;
        const indexNumber = Number(pattern.slice(1));
        if (isNaN(indexNumber)) {
            raiseError({
                code: 'BIND-202',
                message: 'Pattern is not a number',
                context: { where: 'BindingStateIndex.constructor', pattern },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        this.indexNumber = indexNumber;
    }
}
const bindingStateIndexInternalByPattern = {};
/**
 * BindingStateIndex manages binding state for loop index values ($1, $2, ...).
 * - Extracts index from loop context, supports filtering
 * - Read-only (assignValue not implemented)
 */
class BindingStateIndex {
    filters;
    _internal;
    _binding;
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
        this._internal = bindingStateIndexInternalByPattern[pattern] ??
            (bindingStateIndexInternalByPattern[pattern] = new BindingStateIndexInternal(pattern));
        this.filters = filters;
    }
    createContext(where, extra = {}) {
        return {
            where,
            pattern: this._internal.pattern,
            indexNumber: this._internal.indexNumber,
            ...extra,
        };
    }
    /**
     * Not implemented for index binding.
     *
     * @throws BIND-301 Not implemented
     */
    get pattern() {
        return raiseError({
            code: 'BIND-301',
            message: 'Binding pattern not implemented',
            context: this.createContext('BindingStateIndex.pattern'),
            docsUrl: './docs/error-codes.md#bind',
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
            message: 'Binding info not implemented',
            context: this.createContext('BindingStateIndex.info'),
            docsUrl: './docs/error-codes.md#bind',
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
            context: this.createContext('BindingStateIndex.listIndex'),
            docsUrl: './docs/error-codes.md#list',
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
            context: this.createContext('BindingStateIndex.ref'),
            docsUrl: './docs/error-codes.md#state',
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
    getValue(_state, _handler) {
        return this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: this.createContext('BindingStateIndex.getValue'),
            docsUrl: './docs/error-codes.md#list',
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
    getFilteredValue(_tate, _handler) {
        let value = this.listIndex?.index ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is null',
            context: this.createContext('BindingStateIndex.getFilteredValue'),
            docsUrl: './docs/error-codes.md#list',
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
    assignValue(_writeState, _handler, _value) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding assignValue not implemented',
            context: this.createContext('BindingStateIndex.assignValue'),
            docsUrl: './docs/error-codes.md#bind',
        });
    }
    /**
     * Activates binding. Resolves loop context and registers to bindingsByListIndex.
     *
     * @throws BIND-201 LoopContext is null or binding for list is null
     */
    activate() {
        const baseContext = this.createContext('BindingStateIndex.activate');
        const loopContext = this._binding.parentBindContent.currentLoopContext ??
            raiseError({
                code: 'BIND-201',
                message: 'LoopContext is null',
                context: baseContext,
                docsUrl: './docs/error-codes.md#bind',
            });
        const loopContexts = loopContext.serialize();
        this._loopContext = loopContexts[this._internal.indexNumber - 1] ??
            raiseError({
                code: 'BIND-201',
                message: 'Current loopContext is null',
                context: this.createContext('BindingStateIndex.activate', {
                    serializedIndex: this._internal.indexNumber - 1,
                    serializedLength: loopContexts.length,
                }),
                docsUrl: './docs/error-codes.md#bind',
            });
        const bindingForList = this._loopContext.bindContent?.parentBinding ?? null;
        if (bindingForList === null) {
            raiseError({
                code: 'BIND-201',
                message: 'Binding for list is null',
                context: baseContext,
                docsUrl: './docs/error-codes.md#bind',
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
    const filterFns = createBindingFilters(filters, filterTexts);
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
            return `textContent:${text}`;
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
const createNodeKey = (node) => `${node.constructor.name}\t${(node instanceof Comment) ? (node.textContent?.[2] ?? "") : ""}`;
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
                    code: 'BIND-105',
                    message: `Node type not supported: ${node.nodeType}`,
                    context: {
                        where: 'BindingBuilder.getNodeType',
                        nodeType: node.nodeType,
                        nodeName: node.nodeName,
                        nodeConstructor: node.constructor.name
                    },
                    docsUrl: './docs/error-codes.md#bind'
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
        const textNode = replaceTextNodeFromComment(node, this.nodeType);
        // Step 4: Remove data-bind attribute (no longer needed after parsing, prevents duplicate processing)
        removeDataBindAttribute(textNode, this.nodeType);
        // Step 5: Calculate absolute node path (index array from parent nodes)
        this.nodePath = getAbsoluteNodePath(textNode);
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
                createBindingNode: getBindingNodeCreator(textNode, bindText.nodeProperty, bindText.inputFilterTexts, bindText.decorates),
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
 * Cache of "for" and "if" binding stateProperty sets per template ID.
 * Used to identify state paths related to loops (lists) and conditionals.
 *
 * Example: "for:items" or "if:isVisible" → "items" or "isVisible" is added to buildablePathsSetById[id]
 */
const buildablePathsSetById = {};
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
    const buildablePaths = buildablePathsSetById[rootId] ?? (buildablePathsSetById[rootId] = new Set());
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
            // If "for" or "if" binding (conditional), also add to buildablePaths
            if (bindText.nodeProperty === "if" || bindText.nodeProperty === "for") {
                buildablePaths.add(bindText.stateProperty);
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
 * @returns State path set of "for" bindings (empty Set if not registered)
 */
const getListPathsSetById = (id) => {
    return listPathsSetById[id] ?? new Set();
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
 * @returns State path set of all bindings (empty Set if not registered)
 */
const getPathsSetById = (id) => {
    return pathsSetById[id] ?? new Set();
};
/**
 * Gets "for" and "if" binding (loop and conditional) stateProperty set from template ID.
 *
 * Used to identify state paths related to loops and conditionals.
 * Returns empty array if not registered.
 *
 * Usage example:
 * ```typescript
 * // Assuming template contains:
 * // <!-- @@:for:items -->
 * // <!-- @@:if:isVisible -->
 * registerDataBindAttributes(1, template.content);
 * const buildablePaths = getBuildablePathsSetById(1);
 * // → Set { "items", "isVisible" }
 * // Monitor buildable state changes
 * if (buildablePaths.has("isVisible")) {
 *   // Process isVisible change
 * }
 * ```
 *
 * @param id - Template ID
 * @returns State path set of "for" and "if" bindings (empty Set if not registered)
 */
const getBuildablePathsSetById = (id) => {
    return buildablePathsSetById[id] ?? new Set();
};

/**
 * removeEmptyTextNodes.ts
 *
 * Utility function to remove empty text nodes from a DocumentFragment.
 *
 * Main responsibilities:
 * - Detects and removes whitespace-only text nodes directly under the content (DocumentFragment)
 *
 * Design points:
 * - Converts childNodes to an array using Array.from and traverses all nodes with forEach
 * - Removes nodes via removeChild when nodeType is TEXT_NODE and nodeValue contains only whitespace
 * - Used for template processing and clean DOM generation
 */
/**
 * Removes all whitespace-only text nodes from a DocumentFragment.
 * This cleans up the DOM structure by removing unnecessary text nodes that contain
 * only spaces, tabs, newlines, or other whitespace characters.
 *
 * @param {DocumentFragment} content - The DocumentFragment to clean up
 * @returns {void}
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = `
 *   <div>
 *     <span>Hello</span>
 *   </div>
 * `;
 * removeEmptyTextNodes(template.content); // Removes whitespace text nodes
 */
function removeEmptyTextNodes(content) {
    // Convert NodeList to array to safely iterate and remove nodes
    Array.from(content.childNodes).forEach(node => {
        // Check if node is a text node and contains only whitespace
        if (node.nodeType === Node.TEXT_NODE && !(node.nodeValue ?? "").trim()) {
            // Remove the empty text node from the fragment
            content.removeChild(node);
        }
    });
}

/**
 * Management module for registering and retrieving HTMLTemplateElement by ID.
 *
 * Responsibilities:
 * - registerTemplate: Registers a template with a specified ID (removes empty text nodes and parses data-bind)
 * - getTemplateById: Retrieves a template by ID (throws error if not registered)
 *
 * Throws (getTemplateById):
 * - TMP-001 Template not found: Requested template ID is not registered
 */
/**
 * Global registry for HTMLTemplateElement instances keyed by numeric ID.
 * Stores processed templates after empty text node removal and data-bind parsing.
 */
const templateById = {};
/**
 * Registers a template by ID and builds internal index and data-bind information.
 * Performs preprocessing to remove empty text nodes and parse data-bind attributes
 * for efficient template instantiation and data binding.
 *
 * @param {number} id - Unique template ID for registration and retrieval
 * @param {HTMLTemplateElement} template - The template element to register
 * @param {number} rootId - Root template ID used for nested template parsing and resolution
 * @returns {number} The registered template ID (same as input id)
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = '<div data-bind="text:name"></div>';
 * registerTemplate(1, template, 1);
 */
function registerTemplate(id, template, rootId) {
    // Remove whitespace-only text nodes to clean up the template structure
    removeEmptyTextNodes(template.content);
    // Parse and index all data-bind attributes for efficient binding setup
    registerDataBindAttributes(id, template.content, rootId);
    // Store the processed template in the global registry
    templateById[id] = template;
    return id;
}
/**
 * Retrieves a registered template by its ID.
 * Throws an error if the template has not been registered.
 *
 * @param {number} id - The template ID to retrieve
 * @returns {HTMLTemplateElement} The registered template element
 * @throws {Error} Throws TMP-001 error if the template ID is not found in the registry
 *
 * @example
 * const template = getTemplateById(1);
 * const clone = template.content.cloneNode(true);
 */
function getTemplateById(id) {
    // Return the template if found, otherwise throw a descriptive error
    return templateById[id] ?? raiseError({
        code: "TMP-001",
        message: `Template not found: ${id}`,
        context: { where: 'Template.getTemplateById', templateId: id },
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
     * @param void - Value to assign to state
     */
    updateStateValue(writeState, handler, value) {
        this.bindingState.assignValue(writeState, handler, value);
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
        if (renderer.updatedBindings.has(this)) {
            return;
        }
        if (renderer.renderPhase === 'build' && !this.bindingNode.buildable) {
            if (this.bindingNode.isSelectElement) {
                renderer.applySelectPhaseBinidings.push(this);
            }
            else {
                renderer.applyPhaseBinidings.push(this);
            }
            return;
        }
        else if (renderer.renderPhase === 'apply' && (this.bindingNode.buildable || this.bindingNode.isSelectElement)) {
            return;
        }
        else if (renderer.renderPhase === 'applySelect' && (this.bindingNode.buildable || !this.bindingNode.isSelectElement)) {
            return;
        }
        else if (renderer.renderPhase === 'direct') {
            if (this.bindingNode.isSelectElement) {
                renderer.applySelectPhaseBinidings.push(this);
                return;
            }
            if (this.bindingNode.buildable) {
                raiseError({
                    code: 'BIND-101',
                    message: 'Direct render phase cannot process buildable bindings',
                    context: { where: 'Binding.applyChange', name: this.bindingNode.name },
                    docsUrl: './docs/error-codes.md#bind',
                });
            }
        }
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

/**
 * LoopContext class manages loop binding context with parent-child relationships.
 * Provides efficient caching and traversal of loop hierarchy.
 */
class LoopContext {
    info;
    bindContent;
    _ref;
    _parentLoopContext;
    _cache = {};
    /**
     * Creates a new LoopContext instance.
     * @param ref - State property reference with path and index information
     * @param bindContent - Bind content to associate with this loop context
     */
    constructor(ref, bindContent) {
        this._ref = ref;
        this.info = ref.info;
        this.bindContent = bindContent;
    }
    /**
     * Gets the state property reference.
     * @returns State property reference
     * @throws STATE-202 If ref is null
     */
    get ref() {
        return this._ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'LoopContext.ref', path: this.info.pattern },
            docsUrl: './docs/error-codes.md#state',
        });
    }
    /**
     * Gets the path pattern from the reference.
     * @returns Path pattern string
     */
    get path() {
        return this.ref.info.pattern;
    }
    /**
     * Gets the list index from the reference.
     * @returns List index instance
     * @throws LIST-201 If listIndex is required but not present
     */
    get listIndex() {
        return this.ref.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is required',
            context: { where: 'LoopContext.listIndex', path: this.info.pattern },
            docsUrl: './docs/error-codes.md#list',
        });
    }
    /**
     * Assigns a new list index to this loop context.
     * @param listIndex - New list index to assign
     */
    assignListIndex(listIndex) {
        this._ref = getStatePropertyRef(this.info, listIndex);
        // Structure doesn't change, so no need to clear _parentLoopContext and _cache
    }
    /**
     * Clears the list index reference.
     */
    clearListIndex() {
        this._ref = null;
    }
    /**
     * Gets the parent loop context with lazy evaluation and caching.
     * @returns Parent loop context or null if none exists
     */
    get parentLoopContext() {
        if (typeof this._parentLoopContext === "undefined") {
            let currentBindContent = this.bindContent;
            while (currentBindContent !== null) {
                if (currentBindContent.loopContext !== null && currentBindContent.loopContext !== this) {
                    this._parentLoopContext = currentBindContent.loopContext;
                    break;
                }
                currentBindContent = currentBindContent.parentBinding?.parentBindContent ?? null;
            }
            if (typeof this._parentLoopContext === "undefined") {
                this._parentLoopContext = null;
            }
        }
        return this._parentLoopContext;
    }
    /**
     * Finds a loop context by path name in the hierarchy.
     * @param name - Path name to search for
     * @returns Loop context with matching path or null if not found
     */
    find(name) {
        let loopContext = this._cache[name];
        if (typeof loopContext === "undefined") {
            if (this.path === name) {
                loopContext = this._cache[name] = this;
            }
            else {
                let currentLoopContext = this.parentLoopContext;
                while (currentLoopContext !== null) {
                    if (currentLoopContext.path === name) {
                        break;
                    }
                    currentLoopContext = currentLoopContext.parentLoopContext;
                }
                loopContext = this._cache[name] = currentLoopContext;
            }
        }
        return loopContext;
    }
    /**
     * Walks through the loop context hierarchy from current to root.
     * @param callback - Function to call for each loop context
     */
    walk(callback) {
        callback(this);
        let currentLoopContext = this.parentLoopContext;
        while (currentLoopContext !== null) {
            callback(currentLoopContext);
            currentLoopContext = currentLoopContext.parentLoopContext;
        }
    }
    /**
     * Serializes the loop context hierarchy to an array from root to current.
     * @returns Array of loop contexts ordered from root to current
     */
    serialize() {
        const results = [];
        this.walk((loopContext) => {
            results.unshift(loopContext);
        });
        return results;
    }
}
/**
 * Factory function to create a new LoopContext instance.
 * Created instance is registered to IBindContent's loopContext and retained permanently.
 * @param ref - State property reference with path and index information
 * @param bindContent - Bind content to associate with this loop context
 * @returns New LoopContext instance
 */
function createLoopContext(ref, bindContent) {
    return new LoopContext(ref, bindContent);
}

/**
 * Internal helper function to generate DocumentFragment from template ID.
 * Automatically loads lazy-load components if present.
 *
 * @param id - Registered template ID
 * @returns DocumentFragment with copied template content
 * @throws TMP-001 Template not found
 */
function createContent(id) {
    const template = getTemplateById(id) ??
        raiseError({
            code: "TMP-001",
            message: `Template not found: ${id}`,
            context: { where: 'BindContent.createContent', templateId: id },
            docsUrl: "./docs/error-codes.md#tmp",
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
 * @throws BIND-101 Data-bind not registered
 * @throws BIND-102 Node not found
 * @throws BIND-103 Creator not found
 */
function createBindings(bindContent, id, engine, content) {
    const attributes = getDataBindAttributesById(id) ??
        raiseError({
            code: "BIND-101",
            message: "Data-bind not registered",
            context: { where: 'BindContent.createBindings', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    const bindings = [];
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        const node = resolveNodeFromPath(content, attribute.nodePath) ??
            raiseError({
                code: "BIND-102",
                message: `Node not found by nodePath: ${String(attribute.nodePath)}`,
                context: { where: 'BindContent.createBindings', templateId: id, nodePath: attribute.nodePath },
                docsUrl: "./docs/error-codes.md#bind",
            });
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            const creator = attribute.creatorByText.get(bindText) ??
                raiseError({
                    code: "BIND-103",
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    message: `Creator not found for bindText: ${String(bindText)}`,
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
 * @throws TMP-001 Template not found (in createContent)
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
            if (this.loopContext !== null) {
                this._currentLoopContext = this.loopContext;
                return this._currentLoopContext;
            }
            let bindContent = this.parentBinding?.parentBindContent ?? null;
            while (bindContent !== null) {
                if (bindContent.loopContext !== null) {
                    break;
                }
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
    * @throws TMP-001 Template not found or BIND-101 data-bind not set
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
        if (this.loopContext === null) {
            raiseError({
                code: "BIND-201",
                message: "LoopContext is null",
                context: { where: 'BindContent.assignListIndex', templateId: this.id },
                docsUrl: "./docs/error-codes.md#bind",
            });
        }
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
            if (renderer.updatedBindings.has(binding)) {
                continue;
            }
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
 * @throws TMP-001 Template not found or BIND-101 data-bind not set
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
        element.attachShadow({ mode: 'open' });
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
                context: {
                    where: 'ComponentStateBinding.addBinding',
                    parentPath,
                    existingChildPath: this._childPathByParentPath.get(parentPath),
                },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        if (this._parentPathByChildPath.has(childPath)) {
            raiseError({
                code: "STATE-303",
                message: `Child path "${childPath}" already has a parent path`,
                context: {
                    where: 'ComponentStateBinding.addBinding',
                    childPath,
                    existingParentPath: this._parentPathByChildPath.get(childPath),
                },
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
                context: { where: 'ComponentStateBinding.toParentPathFromChildPath', childPath },
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
                context: {
                    where: 'ComponentStateBinding.toParentPathFromChildPath',
                    childPath,
                    longestMatchPath,
                },
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
                context: { where: 'ComponentStateBinding.toChildPathFromParentPath', parentPath },
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
                context: {
                    where: 'ComponentStateBinding.toChildPathFromParentPath',
                    parentPath,
                    longestMatchPath,
                },
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
            updater.update(null, (stateProxy) => {
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
                catch (_e) {
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
                        docsUrl: './docs/error-codes.md#list',
                    });
                }
                const childRef = getStatePropertyRef(childPathInfo, childListIndex);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_target, prop, _receiver) {
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
        raiseError({
            code: 'STATE-204',
            message: `ComponentStateInput property not supported: ${String(prop)}`,
            context: { where: 'ComponentStateInput.get', prop: String(prop) },
            docsUrl: './docs/error-codes.md#state',
        });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(_target, prop, value, _receiver) {
        if (typeof prop === "string") {
            const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
            this._engine.setPropertyValue(ref, value);
            return true;
        }
        raiseError({
            code: 'STATE-204',
            message: `ComponentStateInput property not supported: ${String(prop)}`,
            context: { where: 'ComponentStateInput.set', prop: String(prop) },
            docsUrl: './docs/error-codes.md#state',
        });
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
                message: `Child path not found: ${ref.info.pattern}`,
                context: { where: 'ComponentStateOutput.get', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `Child binding not registered: ${childPath}`,
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
                message: `Child path not found: ${ref.info.pattern}`,
                context: { where: 'ComponentStateOutput.set', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `Child binding not registered: ${childPath}`,
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
                message: `Child path not found: ${ref.info.pattern}`,
                context: { where: 'ComponentStateOutput.getListIndexes', path: ref.info.pattern },
                docsUrl: './docs/error-codes.md#cso',
            });
        }
        const parentBinding = this._binding.bindingByChildPath.get(childPath);
        if (typeof parentBinding === "undefined") {
            raiseError({
                code: 'CSO-102',
                message: `Child binding not registered: ${childPath}`,
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

class UpdateCompleteQueue {
    _queue = [];
    _processing = false;
    get _currentItem() {
        return this._queue.length > 0 ? this._queue[0] : null;
    }
    get current() {
        return this._currentItem ? this._currentItem.notifyResolver.promise : null;
    }
    async _processNext(resolver) {
        const item = this._currentItem ?? raiseError({
            code: 'UPD-301',
            message: 'No item in update complete queue to process',
            context: { where: 'CompleteQueue.processNext' },
            docsUrl: './docs/error-codes.md#upd',
        });
        let retValue = false;
        try {
            retValue = await item.completePromise; // 先につかむとは限らない
        }
        finally {
            this._queue.shift();
            item.notifyResolver.resolve(retValue);
            resolver.resolve();
        }
    }
    async _processQueue() {
        if (this._processing) {
            return;
        }
        this._processing = true;
        try {
            while (this._queue.length > 0) {
                const resolver = Promise.withResolvers();
                queueMicrotask(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._processNext(resolver);
                });
                await resolver.promise;
            }
        }
        finally {
            this._processing = false;
        }
    }
    enqueue(updateComplete) {
        this._queue.push({
            completePromise: updateComplete,
            notifyResolver: Promise.withResolvers(),
        });
        if (!this._processing) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._processQueue();
        }
    }
}
function createCompleteQueue() {
    return new UpdateCompleteQueue();
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
 * - BIND-201: BindContent not initialized yet / Block parent node not set
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
    updateCompleteQueue = createCompleteQueue();
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
    * @throws BIND-201 BindContent not initialized yet
     */
    get bindContent() {
        if (this._bindContent === null) {
            raiseError({
                code: 'BIND-201',
                message: 'BindContent not initialized yet',
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
    * @throws BIND-201 Block parent node not set
     * @throws STATE-202 Failed to parse state from dataset
     * @throws COMP-301 Error in connectedCallback
     */
    connectedCallback() {
        if (this.config.enableWebComponents) {
            attachShadow(this.owner, this.config, this.styleSheet);
        }
        else {
            // Block mode: Replace component with placeholder
            this._blockParentNode = this.owner.parentNode;
            this._blockPlaceholder = document.createComment("Structive block placeholder");
            // Set flag to ignore disconnectedCallback triggered by replaceWith
            this._ignoreDissconnectedCallback = true;
            try {
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
                message: 'Block parent node not set',
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
        this.bindContent.activate();
        createUpdater(this, (updater) => {
            updater.initialRender(this.bindContent);
        });
        // Call state's connectedCallback if implemented
        if (this.pathManager.hasConnectedCallback) {
            const resultPromise = createUpdater(this, (updater) => {
                return updater.update(null, (stateProxy) => {
                    return stateProxy[ConnectedCallbackSymbol]();
                });
            });
            if (resultPromise instanceof Promise) {
                resultPromise.finally(() => {
                    this.readyResolvers.resolve();
                }).catch(() => {
                    raiseError({
                        code: 'COMP-301',
                        message: 'Connected callback failed',
                        context: { where: 'ComponentEngine.connectedCallback' },
                        docsUrl: './docs/error-codes.md#comp',
                    });
                });
            }
            else {
                this.readyResolvers.resolve();
            }
        }
        else {
            this.readyResolvers.resolve();
        }
    }
    /**
     * Handles component disconnection from DOM.
     * - Calls state's disconnectedCallback if defined
     * - Unregisters from parent component
     * - Removes block placeholder if in block mode
     * - Inactivates and unmounts bindContent
     * @throws COMP-302 Error in disconnectedCallback
     */
    disconnectedCallback() {
        // Ignore if flag is set (during replaceWith in connectedCallback)
        if (this._ignoreDissconnectedCallback) {
            return;
        }
        try {
            // Call state's disconnectedCallback if implemented (synchronous)
            if (this.pathManager.hasDisconnectedCallback) {
                createUpdater(this, (updater) => {
                    updater.update(null, (stateProxy) => {
                        stateProxy[DisconnectedCallbackSymbol]();
                    });
                });
            }
        }
        catch (e) {
            raiseError({
                code: 'COMP-302',
                message: 'Disconnected callback failed',
                context: { where: 'ComponentEngine.disconnectedCallback' },
                docsUrl: './docs/error-codes.md#comp',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cause: e,
            });
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
            this.bindContent.inactivate();
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
            return value = updater.createReadonlyState((stateProxy) => {
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
            value = updater.createReadonlyState((stateProxy) => {
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
            updater.update(null, (stateProxy) => {
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
        const metadata = this._propertyRefMetadataByRef.get(ref);
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
 * Utility function to convert Mustache syntax ({{if:condition}}, {{for:expr}}, {{endif}}, {{endfor}},
 * {{elseif:condition}}, {{else}}, etc.) into <template> tags or comment nodes.
 *
 * Main responsibilities:
 * - Detects Mustache syntax in HTML strings using regex and converts them to <template data-bind="..."> or comment nodes
 * - Converts control structures like if/for/endif/endfor/elseif/else into <template> tags with nesting support
 * - Converts regular embedded expressions ({{expr}}) into comment nodes (<!--embed:expr-->)
 *
 * Design points:
 * - Uses a stack to manage nested structures and strictly checks correspondence of endif/endfor/elseif/else
 * - Throws exceptions via raiseError for invalid nesting or unsupported syntax
 * - elseif/else automatically generate templates with negated conditions to express conditional branching
 * - Conversion to comment nodes enables safe DOM insertion of embedded expressions
 */
/** Regular expression to match Mustache syntax: {{ ... }} */
const MUSTACHE_REGEXP = /\{\{([^}]+)\}\}/g;
/**
 * Converts Mustache syntax in HTML strings to template tags or comment nodes.
 * Processes control structures (if/for/elseif/else) and embedded expressions,
 * maintaining proper nesting through a stack-based parser.
 *
 * @param {string} html - HTML string containing Mustache syntax ({{...}})
 * @returns {string} HTML string with Mustache syntax replaced by template tags and comments
 * @throws {Error} Throws TMP-102 error for invalid nesting (endif without if, endfor without for, etc.)
 *
 * @example
 * const html = '<div>{{if:active}}<span>{{name}}</span>{{endif}}</div>';
 * const result = replaceMustacheWithTemplateTag(html);
 * // Returns: '<div><template data-bind="if:active"><span><!--embed:name--></span></template></div>'
 */
function replaceMustacheWithTemplateTag(html) {
    // Stack to track nested control structures (if/for/elseif)
    const stack = [];
    return html.replaceAll(MUSTACHE_REGEXP, (_match, expression) => {
        const expr = expression.trim();
        // Extract the type (first part before ':')
        const [type] = expr.split(':');
        // If not a control structure, treat as embedded expression
        if (type !== 'if' && type !== 'for' && type !== 'endif' && type !== 'endfor' && type !== 'elseif' && type !== 'else') {
            // Convert to comment node for later processing
            return `<!--${COMMENT_EMBED_MARK}${expr}-->`;
        }
        // Extract the remaining expression after the type
        const remain = expr.slice(type.length + 1).trim();
        const currentInfo = { type, expr, remain };
        // Handle opening tags (if/for): push to stack and generate opening template tag
        if (type === 'if' || type === 'for') {
            stack.push(currentInfo);
            return `<template data-bind="${expr}">`;
        }
        else if (type === 'endif') {
            // Handle endif: pop stack until matching 'if' is found, closing all elseif branches
            const endTags = [];
            if (stack.length === 0) {
                raiseError({
                    code: 'TMP-102',
                    message: 'Endif without if',
                    context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
            while (stack.length > 0) {
                const info = stack.pop();
                // Found the matching 'if', close it and stop
                if (info.type === 'if') {
                    endTags.push('</template>');
                    break;
                }
                else if (info.type === 'elseif') {
                    // Close elseif branches (each elseif creates nested templates)
                    endTags.push('</template>');
                }
                else {
                    // Invalid nesting: encountered non-if/elseif tag
                    raiseError({
                        code: 'TMP-102',
                        message: 'Endif without if',
                        context: { where: 'Template.replaceMustacheWithTemplateTag', got: info.type, expr },
                        docsUrl: './docs/error-codes.md#tmp',
                    });
                }
            }
            return endTags.join('');
        }
        else if (type === 'endfor') {
            // Handle endfor: pop stack and verify matching 'for'
            const info = stack.pop() ?? raiseError({
                code: 'TMP-102',
                message: 'Endfor without for',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (info.type === 'for') {
                return '</template>';
            }
            // Invalid nesting: endfor without corresponding for
            raiseError({
                code: 'TMP-102',
                message: 'Endfor without for',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: info.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        else if (type === 'elseif') {
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Elseif without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if' || lastInfo.type === 'elseif') {
                stack.push(currentInfo);
                return `</template><template data-bind="if:${lastInfo.remain}|not"><template data-bind="if:${remain}">`;
            }
            raiseError({
                code: 'TMP-102',
                message: 'Elseif without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        else if (type === 'else') {
            // Handle else: verify it follows if, then create negated condition template
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Else without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if') {
                // Close previous if branch and open negated condition for else
                // Structure: </template><template data-bind="if:condition|not">
                return `</template><template data-bind="if:${lastInfo.remain}|not">`;
            }
            // Invalid: else must follow if
            return raiseError({
                code: 'TMP-102',
                message: 'Else without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        /* c8 ignore start */
        // Unreachable code: All possible Mustache types are handled above
        // This code path is theoretically impossible because:
        // 1. Non-control-structure types are converted to embed comments (line 66)
        // 2. All control structure types (if/for/endif/endfor/elseif/else) have explicit handlers above
        return raiseError({
            code: 'TMP-102',
            message: 'Unreachable: All Mustache types should be handled by preceding branches',
            context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
            docsUrl: './docs/error-codes.md#tmp',
        });
        /* c8 ignore stop */
    });
}

/**
 * replaceTemplateTagWithComment.ts
 *
 * Utility function to replace <template> tags with comment nodes and recursively register templates.
 *
 * Main responsibilities:
 * - Replaces the specified HTMLTemplateElement with a comment node (<!--template:id-->)
 * - Converts template tags within SVG to regular template elements, preserving attributes and child nodes
 * - Recursively replaces and registers nested templates within templates
 * - Manages templates with IDs using registerTemplate
 *
 * Design points:
 * - Maintains template hierarchical structure while marking them as comment nodes in the DOM
 * - Supports SVG and attribute inheritance for versatile template processing
 * - Assigns unique IDs via generateId for centralized template management
 */
/** SVG namespace URI for detecting SVG context */
const SVG_NS = "http://www.w3.org/2000/svg";
/**
 * Replaces a template element with a comment node in the DOM and recursively processes nested templates.
 * Handles special cases for SVG templates and preserves template hierarchies through registration.
 *
 * @param {number} id - Unique identifier for this template
 * @param {HTMLTemplateElement} template - The template element to replace and register
 * @param {number} [rootId=id] - Root template ID for tracking nested template hierarchies
 * @returns {number} The template ID (same as input id)
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = '<div>{{name}}</div>';
 * const templateId = replaceTemplateTagWithComment(1, template);
 */
function replaceTemplateTagWithComment(id, rawTemplate, rootId = id) {
    let template = rawTemplate;
    // Replace the template element with a comment node in the DOM
    // This preserves the template's position while removing it from the visible DOM
    // Extract data-bind attribute for optional debug information
    const bindText = template.getAttribute(DATA_BIND_ATTRIBUTE);
    // In debug mode, include binding expression in comment for easier debugging
    const bindTextForDebug = config$2.debug ? (bindText ?? "") : "";
    // Replace template with comment marker (<!--template:id bindText-->)
    template.parentNode?.replaceChild(document.createComment(`${COMMENT_TEMPLATE_MARK}${id} ${bindTextForDebug}`), template);
    // Special handling for templates within SVG context
    if (template.namespaceURI === SVG_NS) {
        // SVG doesn't support <template> natively, so convert to HTML template element
        const newTemplate = document.createElement("template");
        // Move all child nodes from SVG template to new HTML template
        const childNodes = Array.from(template.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            newTemplate.content.appendChild(childNode);
        }
        // Preserve data-bind attribute from original SVG template
        newTemplate.setAttribute(DATA_BIND_ATTRIBUTE, bindText ?? "");
        template = newTemplate;
    }
    // Recursively process all nested templates within this template
    // Each nested template gets its own unique ID and is registered separately
    template.content.querySelectorAll("template").forEach(template => {
        replaceTemplateTagWithComment(generateId(), template, rootId);
    });
    // Register the processed template for later instantiation
    registerTemplate(id, template, rootId);
    return id;
}

/**
 * registerHtml.ts
 *
 * Utility function for registering HTML strings as templates.
 *
 * Main responsibilities:
 * - Creates an HTML template with a specified ID and assigns a data-id attribute
 * - Converts Mustache syntax ({{ }}) to template tags (using replaceMustacheWithTemplateTag)
 * - Replaces template tags with comments (using replaceTemplateTagWithComment)
 *
 * Design points:
 * - Supports dynamic template generation/management and flexible template processing through syntax conversion
 * - Templates are created using document.createElement("template") and identified via data-id
 */
/**
 * Registers an HTML template by converting Mustache syntax to template tags and then to comments.
 * Creates a template element, assigns it an ID, and processes it for use in the template system.
 *
 * @param {number} id - Unique numeric identifier for the template
 * @param {string} html - HTML string that may contain Mustache syntax ({{ }})
 * @returns {void}
 *
 * @example
 * registerHtml(1, `
 *   <div>
 *     <h1>{{ title }}</h1>
 *     <p>{{ content }}</p>
 *   </div>
 * `);
 */
function registerHtml(id, html) {
    // Create a new template element
    const template = document.createElement("template");
    // Assign the template ID as a data attribute for later retrieval
    template.dataset.id = id.toString();
    // Convert Mustache syntax ({{ }}) to template tags, then set as innerHTML
    template.innerHTML = replaceMustacheWithTemplateTag(html);
    // Replace template tags with comment nodes for data binding
    replaceTemplateTagWithComment(id, template);
}

/**
 * Gets the base class constructor for a custom element.
 *
 * If extendTagName is provided, creates a temporary element to retrieve its constructor,
 * enabling customized built-in elements (e.g., extending <button>, <input>).
 * Otherwise, returns the standard HTMLElement constructor.
 *
 * @param {string | null} extendTagName - Tag name of the element to extend, or null for standard HTMLElement
 * @returns {Constructor<HTMLElement>} The constructor of the specified element or HTMLElement
 *
 * @example
 * // Get base class for extending a button
 * const ButtonClass = getBaseClass('button'); // Returns HTMLButtonElement constructor
 *
 * @example
 * // Get base class for standard custom element
 * const BaseClass = getBaseClass(null); // Returns HTMLElement
 */
function getBaseClass(extendTagName) {
    // If extending a built-in element, create a temporary instance to get its constructor
    // Otherwise, use the standard HTMLElement class
    return extendTagName ? document.createElement(extendTagName).constructor : HTMLElement;
}

/**
 * getComponentConfig.ts
 *
 * Utility function to merge user configuration (IUserConfig) with global configuration and generate component configuration (IComponentConfig).
 *
 * Main responsibilities:
 * - Retrieves global configuration via getGlobalConfig
 * - User configuration takes priority, with global configuration values used for unspecified settings
 * - Centrally returns configuration values such as shadowDomMode and extends
 *
 * Design points:
 * - Flexibly merges individual user settings with overall default settings
 * - Design that considers default configuration values and extensibility
 */
/**
 * Generates component configuration by merging user-specific settings with global defaults.
 *
 * User-provided values take precedence over global configuration. If a setting is not
 * specified in userConfig, the global default is used instead.
 *
 * @param {IUserConfig} userConfig - User-specific configuration for the component
 * @returns {IComponentConfig} Merged configuration with all required settings
 *
 * @example
 * const config = getComponentConfig({
 *   shadowDomMode: 'open',
 *   extends: 'button'
 * });
 * // Returns: { enableWebComponents: true, shadowDomMode: 'open', extends: 'button' }
 *
 * @example
 * // Using global defaults
 * const config = getComponentConfig({});
 * // Returns configuration with global shadowDomMode and null for extends
 */
function getComponentConfig(userConfig) {
    // Retrieve global configuration as fallback
    const globalConfig = getGlobalConfig();
    return {
        // Default to true if not explicitly set to false
        enableWebComponents: typeof userConfig.enableWebComponents === "undefined" ? true : userConfig.enableWebComponents,
        // Use user's shadowDomMode if specified, otherwise fall back to global setting
        shadowDomMode: userConfig.shadowDomMode ?? globalConfig.shadowDomMode,
        // Use user's extends value if specified, otherwise null (standard custom element)
        extends: userConfig.extends ?? null,
    };
}

/**
 * createAccessorFunctions.ts
 *
 * Utility for generating dynamic getter/setter functions from State property path information (IStructuredPathInfo).
 *
 * Main responsibilities:
 * - Dynamically generates optimal accessor functions (get/set) from path information and getter sets
 * - Supports wildcards (*) and nested property paths
 * - Validates paths and segments
 *
 * Design points:
 * - Searches for the longest matching getter path from matchPaths and constructs accessors from the relative path
 * - If no path matches, generates accessors directly from info.pathSegments
 * - Uses new Function to dynamically generate high-performance getter/setter
 * - Strictly validates path and segment names with regular expressions to ensure safety
 */
// Regular expression to validate segment names (must start with letter/underscore/$, followed by alphanumeric/underscore/$)
const checkSegmentRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
// Regular expression to validate full property paths (segments separated by dots, wildcards allowed)
const checkPathRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*(\.[a-zA-Z_$][0-9a-zA-Z_$]*|\.\*)*$/;
/**
 * Creates dynamic getter and setter functions for a property path.
 *
 * This function generates optimized accessor functions by:
 * 1. Finding the longest matching getter path from the cumulative paths
 * 2. Building accessors relative to that getter (or from root if no match)
 * 3. Handling wildcards by mapping them to $1, $2, etc.
 * 4. Validating all path segments for safety
 *
 * @param info - Structured path information containing segments and wildcards
 * @param getters - Set of getter paths available in the state
 * @returns Object containing dynamically generated get and set functions
 * @throws {Error} STATE-202 - When path or segment name is invalid
 */
function createAccessorFunctions(info, getters) {
    const baseContext = { where: 'StateProperty.createAccessorFunctions', pattern: info.pattern };
    // Find all cumulative paths that match available getters
    const matchPaths = new Set(info.cumulativePaths).intersection(getters);
    let len = -1;
    let matchPath = '';
    // Find the longest matching path to use as base for accessor generation
    for (const curPath of matchPaths) {
        const pathSegments = curPath.split('.');
        // Skip single-segment paths (not useful as base paths)
        if (pathSegments.length === 1) {
            continue;
        }
        if (pathSegments.length > len) {
            len = pathSegments.length;
            matchPath = curPath;
        }
    }
    // Case 1: Found a matching getter path - build accessor relative to it
    if (matchPath.length > 0) {
        // Validate the matched path format
        if (!checkPathRegexp.test(matchPath)) {
            raiseError({
                code: "STATE-202",
                message: `Invalid path: ${matchPath}`,
                context: { ...baseContext, matchPath },
                docsUrl: "./docs/error-codes.md#state",
            });
        }
        // Get structured info for the matched getter path
        const matchInfo = getStructuredPathInfo(matchPath);
        const segments = [];
        let count = matchInfo.wildcardCount;
        // Build accessor path from the remaining segments after the match
        for (let i = matchInfo.pathSegments.length; i < info.pathSegments.length; i++) {
            const segment = info.pathSegments[i];
            if (segment === '*') {
                // Wildcard: map to $1, $2, etc. based on wildcard position
                segments.push(`[this.$${count + 1}]`);
                count++;
            }
            else {
                // Regular segment: validate and add as property access
                if (!checkSegmentRegexp.test(segment)) {
                    raiseError({
                        code: "STATE-202",
                        message: `Invalid segment name: ${segment}`,
                        context: { ...baseContext, segment, matchPath },
                        docsUrl: "./docs/error-codes.md#state",
                    });
                }
                segments.push(`.${segment}`);
            }
        }
        // Build final path string and generate getter/setter functions
        const path = segments.join('');
        const getterFuncText = `return this["${matchPath}"]${path};`;
        const setterFuncText = `this["${matchPath}"]${path} = value;`;
        //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
        return {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            get: new Function('', getterFuncText),
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            set: new Function('value', setterFuncText),
        };
    }
    else {
        // Case 2: No matching getter path - build accessor from root
        const segments = [];
        let count = 0;
        for (let i = 0; i < info.pathSegments.length; i++) {
            const segment = info.pathSegments[i];
            if (segment === '*') {
                // Wildcard: map to $1, $2, etc.
                segments.push(`[this.$${count + 1}]`);
                count++;
            }
            else {
                // Regular segment: validate and add
                if (!checkSegmentRegexp.test(segment)) {
                    raiseError({
                        code: "STATE-202",
                        message: `Invalid segment name: ${segment}`,
                        context: { ...baseContext, segment },
                        docsUrl: "./docs/error-codes.md#state",
                    });
                }
                segments.push((segments.length > 0 ? "." : "") + segment);
            }
        }
        // Build final path and generate getter/setter functions from root
        const path = segments.join('');
        const getterFuncText = `return this.${path};`;
        const setterFuncText = `this.${path} = value;`;
        //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
        return {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            get: new Function('', getterFuncText),
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            set: new Function('value', setterFuncText),
        };
    }
}

/**
 * PathManager class manages property paths, dependencies, and accessor optimizations.
 * Analyzes component class to build path hierarchy and dependency graph.
 */
class PathManager {
    alls = new Set();
    lists = new Set();
    buildables = new Set();
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
    _id;
    _stateClass;
    _dynamicDependencyKeys = new Set();
    /**
     * Creates a new PathManager instance.
     * Analyzes component class to extract paths, getters, setters, and builds dependency graph.
     * @param componentClass - Component class to analyze
     */
    constructor(componentClass) {
        this._id = componentClass.id;
        this._stateClass = componentClass.stateClass;
        const alls = getPathsSetById(this._id);
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
        // Configure list paths
        const lists = getListPathsSetById(this._id);
        this.lists = this.lists.union(lists).union(listsFromAlls);
        for (const listPath of this.lists) {
            const elementPath = `${listPath}.*`;
            this.elements.add(elementPath);
        }
        // Configure buildable paths
        const buildables = getBuildablePathsSetById(this._id);
        this.buildables = this.buildables.union(buildables);
        let currentProto = this._stateClass.prototype;
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
        // Determine optimization target paths and optimize them
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
            Object.defineProperty(this._stateClass.prototype, path, {
                get: funcs.get,
                set: funcs.set,
                enumerable: true,
                configurable: true,
            });
            this.optimizes.add(path);
        }
        // Configure static dependencies
        for (const path of this.alls) {
            addPathNode(this.rootNode, path);
            const info = getStructuredPathInfo(path);
            if (info.parentPath) {
                const dependencies = this.staticDependencies.get(info.parentPath);
                if (typeof dependencies !== "undefined") {
                    dependencies.add(path);
                }
                else {
                    this.staticDependencies.set(info.parentPath, new Set([path]));
                }
            }
        }
    }
    /**
     * Adds a new path to the manager dynamically.
     * Updates path hierarchy, creates optimized accessors, and registers dependencies.
     * @param addPath - Path to add
     * @param isList - Whether the path represents a list (default: false)
     */
    addPath(addPath, isList = false) {
        const info = getStructuredPathInfo(addPath);
        if (isList && !this.lists.has(addPath)) {
            this.lists.add(addPath);
            const elementPath = `${addPath}.*`;
            this.elements.add(elementPath);
        }
        else if (info.lastSegment === "*") {
            this.elements.add(addPath);
            this.lists.add(info.parentPath);
        }
        for (const path of info.cumulativePathSet) {
            if (this.alls.has(path)) {
                continue;
            }
            this.alls.add(path);
            addPathNode(this.rootNode, path);
            const pathInfo = getStructuredPathInfo(path);
            if (pathInfo.lastSegment === "*") {
                this.elements.add(path);
                this.lists.add(pathInfo.parentPath);
            }
            if (pathInfo.pathSegments.length > 1) {
                const funcs = createAccessorFunctions(pathInfo, this.getters);
                Object.defineProperty(this._stateClass.prototype, path, {
                    get: funcs.get,
                    set: funcs.set,
                    enumerable: true,
                    configurable: true,
                });
                this.optimizes.add(path);
            }
            if (pathInfo.parentPath) {
                const dependencies = this.staticDependencies.get(pathInfo.parentPath);
                if (typeof dependencies !== "undefined") {
                    dependencies.add(path);
                }
                else {
                    this.staticDependencies.set(pathInfo.parentPath, new Set([path]));
                }
            }
        }
    }
    /**
     * Adds a dynamic dependency between source and target paths.
     * Ensures source path exists before registering dependency.
     * @param target - Target path that depends on source
     * @param source - Source path that target depends on
     */
    addDynamicDependency(target, source) {
        const key = `${source}=>${target}`;
        if (this._dynamicDependencyKeys.has(key)) {
            return;
        }
        if (!this.alls.has(source)) {
            this.addPath(source);
        }
        this._dynamicDependencyKeys.add(key);
        const dependencies = this.dynamicDependencies.get(source);
        if (typeof dependencies !== "undefined") {
            dependencies.add(target);
        }
        else {
            this.dynamicDependencies.set(source, new Set([target]));
        }
    }
}
/**
 * Factory function to create a new PathManager instance.
 * @param componentClass - Component class to analyze and manage
 * @returns New PathManager instance
 */
function createPathManager(componentClass) {
    return new PathManager(componentClass);
}

/**
 * createComponentClass.ts
 *
 * Utility for dynamically generating custom element classes for Structive Web Components.
 *
 * Main responsibilities:
 * - Generates Web Components classes from user-defined componentData (stateClass, html, css, etc.)
 * - Centrally manages and registers StateClass/template/CSS/binding information by ID
 * - Provides a feature-rich foundation including custom get/set traps, bindings, parent-child component discovery, and filter extensions
 * - Provides access to template, styles, StateClass, filters, and getter information via static properties
 * - Registers custom elements via the define method
 *
 * Design points:
 * - Uses findStructiveParent to discover parent Structive components, enabling hierarchical state management
 * - Supports getter/setter/binding optimization
 * - Centrally manages template/CSS/StateClass/binding information by ID, ensuring reusability and extensibility
 * - Filters and binding information can be flexibly extended via static properties
 */
/**
 * Creates a custom Web Component class from user-defined component data.
 *
 * This factory function generates a fully-configured custom element class that:
 * - Extends the appropriate base class (HTMLElement or specified custom element)
 * - Registers all templates, styles, and state management
 * - Provides static accessors for component resources (template, stylesheet, stateClass, filters)
 * - Implements the IComponent interface with lifecycle hooks and state management
 *
 * @param {IUserComponentData} componentData - Configuration object containing stateClass, html, and css
 * @returns {StructiveComponentClass} A custom element class ready to be registered via customElements.define()
 *
 * @example
 * const MyComponent = createComponentClass({
 *   stateClass: { count: 0 },
 *   html: '<div>{{count}}</div>',
 *   css: 'div { color: blue; }'
 * });
 * MyComponent.define('my-component');
 */
function createComponentClass(componentData) {
    // Extract and process component configuration
    const config = (componentData.stateClass.$config ?? {});
    const componentConfig = getComponentConfig(config);
    // Generate unique ID for this component class
    const id = generateId();
    const { html, css, stateClass } = componentData;
    // Initialize filter collections with built-in filters
    const inputFilters = Object.assign({}, inputBuiltinFilters);
    const outputFilters = Object.assign({}, outputBuiltinFilters);
    // Mark as Structive component and register all resources
    stateClass.$isStructive = true;
    registerHtml(id, html);
    registerCss(id, css);
    registerStateClass(id, stateClass);
    // Determine base class to extend (HTMLElement or custom element)
    const baseClass = getBaseClass(componentConfig.extends);
    const extendTagName = componentConfig.extends;
    return class extends baseClass {
        /**
         * Registers this component class as a custom element.
         *
         * @param {string} tagName - The custom element tag name (must contain a hyphen)
         * @returns {void}
         *
         * @example
         * MyComponent.define('my-component');
         */
        static define(tagName) {
            // Register as extended built-in element if extends is specified
            if (extendTagName) {
                customElements.define(tagName, this, { extends: extendTagName });
            }
            else {
                customElements.define(tagName, this);
            }
        }
        /** Gets the unique numeric ID for this component class */
        static get id() {
            return id;
        }
        /** HTML template string for this component */
        static _html = html;
        static get html() {
            return this._html;
        }
        /**
         * Updates the HTML template and invalidates cached template/pathManager.
         * This allows dynamic template modification after component class creation.
         */
        static set html(value) {
            this._html = value;
            registerHtml(this.id, value);
            this._template = null;
            this._pathManager = null; // Reset path information when template changes
        }
        /** CSS stylesheet string for this component */
        static _css = css;
        static get css() {
            return this._css;
        }
        /**
         * Updates the CSS stylesheet and invalidates cached stylesheet.
         * Allows dynamic style modification after component class creation.
         */
        static set css(value) {
            this._css = value;
            registerCss(this.id, value);
            this._styleSheet = null;
        }
        /** Cached HTMLTemplateElement instance */
        static _template = null;
        /**
         * Gets the compiled HTMLTemplateElement for this component.
         * Lazily loads and caches on first access.
         */
        static get template() {
            if (!this._template) {
                this._template = getTemplateById(this.id);
            }
            return this._template;
        }
        /** Cached CSSStyleSheet instance */
        static _styleSheet = null;
        /**
         * Gets the CSSStyleSheet for this component.
         * Lazily loads and caches on first access.
         */
        static get styleSheet() {
            if (!this._styleSheet) {
                this._styleSheet = getStyleSheetById(this.id);
            }
            return this._styleSheet;
        }
        /** Cached state class definition */
        static _stateClass = null;
        /**
         * Gets the state class definition for this component.
         * Lazily loads and caches on first access.
         */
        static get stateClass() {
            if (!this._stateClass) {
                this._stateClass = getStateClassById(this.id);
            }
            return this._stateClass;
        }
        /** Input filters for data binding transformations */
        static _inputFilters = inputFilters;
        static get inputFilters() {
            return this._inputFilters;
        }
        /** Output filters for data binding transformations */
        static _outputFilters = outputFilters;
        static get outputFilters() {
            return this._outputFilters;
        }
        /** Cached PathManager instance for managing state paths and bindings */
        static _pathManager = null;
        /**
         * Gets the PathManager for analyzing and managing state property paths.
         * Lazily creates and caches on first access.
         */
        static get pathManager() {
            if (!this._pathManager) {
                this._pathManager = createPathManager(this);
            }
            return this._pathManager;
        }
        /** Component engine that manages lifecycle, state, and rendering */
        _engine;
        /** Cached reference to parent Structive component (undefined = not yet searched) */
        _parentStructiveComponent;
        /**
         * Constructs a new component instance.
         * Creates the component engine and performs initial setup.
         */
        constructor() {
            super();
            // Create the component engine with configuration
            this._engine = createComponentEngine(componentConfig, this);
            // Initialize bindings, state, and prepare for rendering
            this._engine.setup();
        }
        /**
         * Called when the element is inserted into the DOM.
         * Triggers component initialization and rendering.
         */
        connectedCallback() {
            this._engine.connectedCallback();
        }
        /**
         * Called when the element is removed from the DOM.
         * Performs cleanup and resource disposal.
         */
        disconnectedCallback() {
            this._engine.disconnectedCallback();
        }
        /**
         * Gets the nearest parent Structive component in the DOM tree.
         * Result is cached after first lookup for performance.
         *
         * @returns {StructiveComponent | null} Parent component or null if none found
         */
        get parentStructiveComponent() {
            if (typeof this._parentStructiveComponent === "undefined") {
                // Search up the DOM tree for parent Structive component
                this._parentStructiveComponent = findStructiveParent(this);
            }
            return this._parentStructiveComponent;
        }
        /**
         * Gets the state input interface for accessing and modifying component state.
         *
         * @returns {IComponentStateInput} State input interface
         */
        get state() {
            return this._engine.stateInput;
        }
        /**
         * Gets the state binding interface for managing bindings between parent and child components.
         *
         * @returns {IComponentStateBinding} State binding interface
         */
        get stateBinding() {
            return this._engine.stateBinding;
        }
        /**
         * Checks if this is a Structive component.
         *
         * @returns {boolean} True if this is a Structive component
         */
        get isStructive() {
            return this._engine.stateClass.$isStructive ?? false;
        }
        /**
         * Gets the Promise resolvers for component ready state.
         * Allows external code to wait for component initialization to complete.
         *
         * @returns {PromiseWithResolvers<void>} Promise resolvers for ready state
         */
        get readyResolvers() {
            return this._engine.readyResolvers;
        }
        get updateComplete() {
            return this._engine.updateCompleteQueue.current;
        }
        /**
         * Retrieves the set of bindings associated with a specific child component.
         *
         * @param {IComponent} component - The child component to query
         * @returns {Set<IBinding> | null} Set of bindings or null if component not found
         */
        getBindingsFromChild(component) {
            return this._engine.bindingsByComponent.get(component) ?? null;
        }
        /**
         * Registers a child component, establishing parent-child relationship.
         * Called when a child Structive component is connected.
         *
         * @param {StructiveComponent} component - The child component to register
         * @returns {void}
         */
        registerChildComponent(component) {
            this._engine.registerChildComponent(component);
        }
        /**
         * Unregisters a child component, cleaning up the parent-child relationship.
         * Called when a child Structive component is disconnected.
         *
         * @param {StructiveComponent} component - The child component to unregister
         * @returns {void}
         */
        unregisterChildComponent(component) {
            this._engine.unregisterChildComponent(component);
        }
    };
}

/**
 * Loads and merges all importmaps from the document.
 *
 * Searches for all <script type="importmap"> elements in the document and combines
 * their imports into a single IImportMap object. If multiple importmap tags exist,
 * their imports are merged with later entries overwriting earlier ones.
 *
 * @returns {IImportMap} Merged importmap containing all imports from all script tags
 *
 * @example
 * // HTML:
 * // <script type="importmap">
 * //   { "imports": { "@components/button": "./button.sfc" } }
 * // </script>
 * // <script type="importmap">
 * //   { "imports": { "@routes/home": "./home.sfc" } }
 * // </script>
 *
 * const importmap = loadImportmap();
 * // Returns: { imports: { "@components/button": "./button.sfc", "@routes/home": "./home.sfc" } }
 */
function loadImportmap() {
    // Initialize empty importmap object
    const importmap = {};
    // Find all importmap script tags in the document
    document.querySelectorAll("script[type='importmap']").forEach(script => {
        // Parse the JSON content of each script tag
        const scriptImportmap = JSON.parse(script.innerHTML);
        // Merge imports if they exist in this script
        if (scriptImportmap.imports) {
            // Merge with existing imports (later entries override earlier ones)
            importmap.imports = Object.assign(importmap.imports || {}, scriptImportmap.imports);
        }
    });
    return importmap;
}

/**
 * Escapes Mustache template expressions by converting them to HTML comments.
 * This prevents the browser's HTML parser from interpreting {{}} as invalid syntax.
 *
 * @param {string} html - HTML string containing Mustache expressions
 * @returns {string} HTML with {{...}} converted to <!--{{...}}-->
 *
 * @example
 * escapeEmbed('{{name}}') // Returns '<!--{{name}}-->'
 */
function escapeEmbed(html) {
    return html.replaceAll(/\{\{([^}]+)\}\}/g, (match, expr) => {
        return `<!--{{${expr}}}-->`;
    });
}
/**
 * Restores escaped Mustache expressions from HTML comments back to original form.
 * This reverses the escapeEmbed operation after safe HTML parsing.
 *
 * @param {string} html - HTML string with escaped Mustache expressions
 * @returns {string} HTML with <!--{{...}}--> converted back to {{...}}
 *
 * @example
 * unescapeEmbed('<!--{{name}}-->') // Returns '{{name}}'
 */
function unescapeEmbed(html) {
    return html.replaceAll(/<!--\{\{([^}]+)}}-->/g, (match, expr) => {
        return `{{${expr}}}`;
    });
}
function warnMissingSection(section, filePath, detail) {
    if (!config$2.debug) {
        return;
    }
    const suffix = detail ? ` (${detail})` : "";
    console.warn(`[Structive][SFC] Missing <${section}> section in ${filePath}${suffix}`);
}
/** Counter for generating unique IDs for dynamically imported scripts */
let id = 0;
/**
 * Parses a Single File Component (SFC) and extracts its template, script, and style sections.
 *
 * The SFC format consists of:
 * - <template>: HTML template with Mustache syntax
 * - <script type="module">: JavaScript module exporting the state class
 * - <style>: CSS styles for the component
 *
 * @param {string} path - File path or identifier for source mapping in error messages
 * @param {string} text - Raw SFC text content to parse
 * @returns {Promise<IUserComponentData>} Parsed component data including html, css, and stateClass
 *
 * @example
 * const componentData = await createSingleFileComponent('MyComponent.sfc', `
 *   <template><div>{{message}}</div></template>
 *   <script type="module">
 *     export default class { message = 'Hello'; }
 *   </script>
 *   <style>div { color: blue; }</style>
 * `);
 */
async function createSingleFileComponent(path, text) {
    // Create a temporary template element for safe HTML parsing
    const template = document.createElement("template");
    // Escape Mustache expressions to prevent parsing issues
    template.innerHTML = escapeEmbed(text);
    // Extract and remove the <template> section
    const html = template.content.querySelector("template");
    if (!html) {
        warnMissingSection("template", path);
    }
    html?.remove();
    // Extract and remove the <script type="module"> section
    const script = template.content.querySelector("script[type=module]");
    let scriptModule = {};
    if (script) {
        // Add unique comment for debugging and source mapping
        const uniq_comment = `\n// uniq id: ${id++}\n//# sourceURL=${path}\n`;
        // Use blob URL (browser environment)
        // Fallback for test environment (jsdom) where URL.createObjectURL doesn't exist
        if (typeof URL.createObjectURL === 'function') {
            // Create a blob URL for the script and dynamically import it
            const blob = new Blob([script.text + uniq_comment], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            try {
                scriptModule = await import(url);
            }
            finally {
                // Clean up blob URL to prevent memory leak
                URL.revokeObjectURL(url);
            }
        }
        else {
            // Fallback: Base64 encoding method (for test environment)
            // Convert script to Base64 and import via data: URL
            const b64 = btoa(String.fromCodePoint(...new TextEncoder().encode(script.text + uniq_comment)));
            scriptModule = await import(`data:application/javascript;base64,${b64}`);
        }
    }
    else {
        warnMissingSection("script", path, 'expects <script type="module">');
    }
    script?.remove();
    // Extract and remove the <style> section
    const style = template.content.querySelector("style");
    if (!style) {
        warnMissingSection("style", path);
    }
    style?.remove();
    // Use default export as state class, or empty class if not provided
    const stateClass = (scriptModule.default ?? class {
    });
    // Return parsed component data
    return {
        text,
        // Restore Mustache expressions and trim whitespace from template
        html: unescapeEmbed(html?.innerHTML ?? "").trim(),
        // Extract CSS text content or use empty string
        css: style?.textContent ?? "",
        stateClass,
    };
}

/**
 * loadSingleFileComponent.ts
 *
 * Utility function to fetch a Single File Component (SFC) from a specified path, parse it, and return as IUserComponentData.
 *
 * Main responsibilities:
 * - Fetches the SFC file from the specified path using fetch
 * - Loads as text and parses via createSingleFileComponent
 * - Returns the parsed result (IUserComponentData)
 *
 * Design points:
 * - Uses import.meta.resolve for flexible path resolution
 * - Supports dynamic component loading via asynchronous processing
 */
/**
 * Loads a Single File Component from the specified path.
 *
 * Fetches the SFC file, reads its contents as text, and parses it to extract
 * the template, script, and style sections into a component data object.
 *
 * @param {string} path - Path or alias to the SFC file (e.g., './components/button.sfc' or '@components/button')
 * @returns {Promise<IUserComponentData>} Parsed component data containing html, css, stateClass, and text
 * @throws {Error} If fetch fails or the file cannot be read
 *
 * @example
 * // Load from relative path
 * const buttonData = await loadSingleFileComponent('./button.sfc');
 *
 * @example
 * // Load from importmap alias
 * const chartData = await loadSingleFileComponent('@components/chart');
 */
async function loadSingleFileComponent(path) {
    // Resolve path using import.meta.resolve if available
    // Fallback to raw path for SSR environments (Node/Vitest) where import.meta.resolve may not exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const resolved = import.meta.resolve ? import.meta.resolve(path) : path;
    const docsUrl = "./docs/error-codes.md#imp-202-component-load-failed";
    let text = "";
    try {
        // Fetch the SFC file from the resolved path
        const response = await fetch(resolved);
        if (!response.ok) {
            raiseError({
                code: "IMP-202",
                message: `Failed to load component from ${path}`,
                context: {
                    where: "WebComponents.loadSingleFileComponent",
                    path,
                    resolved,
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                },
                hint: "Make sure the import map entry points to a reachable SFC and the server returns a 2xx status.",
                docsUrl
            });
        }
        // Read the response body as text
        text = await response.text();
    }
    catch (e) {
        // failed single file component load
        raiseError({
            code: "IMP-202",
            message: `Failed to load component from ${path}`,
            context: {
                where: "WebComponents.loadSingleFileComponent",
                path,
                resolved
            },
            hint: "Confirm the SFC path is correct and accessible before bootstrapping.",
            docsUrl,
            cause: e
        });
    }
    // Parse the SFC text into component data (template, script, style)
    return createSingleFileComponent(path, text);
}

/**
 * Registers a Structive component class as a custom element.
 *
 * This is a convenience wrapper around the component class's define method,
 * which internally calls customElements.define() with the appropriate configuration.
 *
 * @param {string} tagName - The custom element tag name (must contain a hyphen, e.g., 'my-button')
 * @param {StructiveComponentClass} componentClass - The component class to register
 * @returns {void}
 * @throws {DOMException} If the tag name is invalid or already registered
 *
 * @example
 * const ButtonComponent = createComponentClass({
 *   stateClass: { count: 0 },
 *   html: '<button>{{count}}</button>',
 *   css: 'button { color: blue; }'
 * });
 * registerComponentClass('my-button', ButtonComponent);
 * // Now <my-button> can be used in HTML
 */
function registerComponentClass(tagName, componentClass) {
    // Delegates to the component class's define method, which handles customElements.define()
    componentClass.define(tagName);
}

/**
 * loadFromImportMap.ts
 *
 * Automatically registers routes and components by scanning importmap aliases.
 *
 * Processes two types of imports:
 * - @routes/*: Registers routing via entryRoute (/root normalized to /)
 * - @components/*: Loads SFC, generates ComponentClass, and registers via registerComponentClass
 * - #lazy suffix: Defers loading until component is actually needed
 *
 * @module loadFromImportMap
 */
/** Prefix for route aliases in importmap */
const ROUTES_KEY = "@routes/";
/** Prefix for component aliases in importmap */
const COMPONENTS_KEY = "@components/";
/** Suffix indicating a lazy-loaded component */
const LAZY_LOAD_SUFFIX = "#lazy";
/** Length of the lazy load suffix for efficient slicing */
const LAZY_LOAD_SUFFIX_LEN = LAZY_LOAD_SUFFIX.length;
/** Registry of lazy-loadable component aliases indexed by tag name */
const lazyLoadComponentAliasByTagName = {};
/**
 * Loads and registers all routes and components from the importmap.
 *
 * This function scans the importmap for @routes/* and @components/* entries:
 * - Route entries create routing configurations via entryRoute
 * - Component entries load SFC files and register them as custom elements
 * - Entries with #lazy suffix are deferred until explicitly loaded
 *
 * @returns {Promise<void>} Resolves when all non-lazy components are loaded and registered
 *
 * @example
 * // Importmap example:
 * // {
 * //   "imports": {
 * //     "@routes/home": "./routes/home.sfc",
 * //     "@components/my-button": "./components/button.sfc",
 * //     "@components/heavy-chart#lazy": "./components/chart.sfc"
 * //   }
 * // }
 * await loadFromImportMap();
 * // 'routes-home' and 'my-button' are now registered
 * // 'heavy-chart' will be loaded on demand
 */
async function loadFromImportMap() {
    // Load the importmap from the document
    const importmap = loadImportmap();
    if (importmap.imports) {
        // Collect non-lazy components to load immediately
        const loadAliasByTagName = new Map();
        // Phase 1: Scan all aliases and classify them
        for (const [alias, _value] of Object.entries(importmap.imports)) {
            let tagName, isLazyLoad;
            // Process route aliases (@routes/*)
            if (alias.startsWith(ROUTES_KEY)) {
                isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
                // Extract path: '@routes/users/:id' -> '/users/:id'
                const path = alias.slice(ROUTES_KEY.length - 1, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined);
                // Remove route parameters to create tag name: '/users/:id' -> '/users/'
                const pathWithoutParams = path.replace(/:[^\s/]+/g, "");
                // Convert path to tag name: '/users/' -> 'routes-users-'
                tagName = `routes${pathWithoutParams.replace(/\//g, "-")}`;
                // Register route (normalize '/root' to '/')
                entryRoute(tagName, path === "/root" ? "/" : path);
            }
            // Process component aliases (@components/*)
            if (alias.startsWith(COMPONENTS_KEY)) {
                isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
                // Extract tag name: '@components/my-button' -> 'my-button'
                tagName = alias.slice(COMPONENTS_KEY.length, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined);
            }
            // Skip if not a recognized alias format
            if (!tagName) {
                continue;
            }
            // Defer lazy-load components
            if (isLazyLoad) {
                // Store alias for later loading
                lazyLoadComponentAliasByTagName[tagName] = alias;
                continue;
            }
            // Queue non-lazy component for immediate loading
            loadAliasByTagName.set(tagName, alias);
        }
        // Phase 2: Load and register all non-lazy components
        for (const [tagName, alias] of loadAliasByTagName.entries()) {
            // Load the SFC file
            const componentData = await loadSingleFileComponent(alias);
            // Create the component class
            const componentClass = createComponentClass(componentData);
            // Register as custom element
            registerComponentClass(tagName, componentClass);
        }
    }
}
/**
 * Checks if there are any lazy-loadable components registered.
 *
 * @returns {boolean} True if at least one lazy-load component is registered
 *
 * @example
 * if (hasLazyLoadComponents()) {
 *   console.log('Lazy loading is available');
 * }
 */
function hasLazyLoadComponents() {
    return Object.keys(lazyLoadComponentAliasByTagName).length > 0;
}
/**
 * Checks if a specific tag name is registered as a lazy-load component.
 *
 * @param {string} tagName - The custom element tag name to check
 * @returns {boolean} True if the component is registered for lazy loading
 *
 * @example
 * if (isLazyLoadComponent('heavy-chart')) {
 *   loadLazyLoadComponent('heavy-chart');
 * }
 */
function isLazyLoadComponent(tagName) {
    return tagName in lazyLoadComponentAliasByTagName;
}
/**
 * Triggers lazy loading of a component by tag name.
 *
 * Loads the component asynchronously via microtask queue and removes it from
 * the lazy-load registry to prevent duplicate loading.
 *
 * @param {string} tagName - The custom element tag name to load
 * @returns {void}
 *
 * @example
 * // When component is needed
 * loadLazyLoadComponent('heavy-chart');
 * // Component loads asynchronously in next microtask
 */
function loadLazyLoadComponent(tagName) {
    const alias = lazyLoadComponentAliasByTagName[tagName];
    // Check if alias exists
    if (!alias) {
        // Treat as warning with structured metadata
        const err = {
            code: "IMP-201",
            message: `Alias not found for tagName: ${tagName}`,
            context: { where: 'loadFromImportMap.loadLazyLoadComponent', tagName },
            docsUrl: "./docs/error-codes.md#imp",
            severity: "warn",
        };
        // Log warning instead of throwing to maintain existing behavior
        console.warn(err.message, { code: err.code, context: err.context, docsUrl: err.docsUrl, severity: err.severity });
        return;
    }
    // Remove from registry to prevent duplicate loading
    delete lazyLoadComponentAliasByTagName[tagName];
    // Load component asynchronously in microtask queue
    queueMicrotask(() => {
        // Load the SFC file
        loadSingleFileComponent(alias).then((componentData) => {
            // Create the component class
            const componentClass = createComponentClass(componentData);
            // Register as custom element
            registerComponentClass(tagName, componentClass);
        }).catch((error) => {
            raiseError({
                code: "IMP-202",
                message: `Failed to load lazy component for tagName: ${tagName}`,
                context: {
                    where: "WebComponents.loadFromImportMap.loadLazyLoadComponent",
                    tagName,
                    alias,
                    errorMessage: error instanceof Error ? error.message : String(error),
                },
                docsUrl: "./docs/error-codes.md#imp",
                severity: "error",
            });
        });
    });
}

/**
 * Router.ts
 *
 * Implementation of Router custom element for single-page applications (SPA).
 *
 * Main responsibilities:
 * - Dynamically creates and displays custom elements based on URL path according to route definitions (entryRoute)
 * - History management and routing control using pushState/popstate events
 * - Route parameter extraction and passing to custom elements
 * - Display 404 page for undefined routes
 *
 * Design points:
 * - Register route path and custom element tag name pairs via entryRoute
 * - Automatically re-render on URL change via popstate event
 * - Extract route path parameters (:id etc.) using regex and pass via data-state attribute
 * - Global Router instance accessible via getRouter
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
/**
 * Router custom element for SPA routing.
 * Manages URL-based navigation and dynamic component rendering.
 */
class Router extends HTMLElement {
    _originalFileName = window.location.pathname.split('/').pop() || ''; // Store the original file name
    _basePath = document.querySelector('base')?.href.replace(window.location.origin, "") || DEFAULT_ROUTE_PATH;
    _popstateHandler;
    /**
     * Creates a new Router instance and binds popstate handler.
     */
    constructor() {
        super();
        this._popstateHandler = this.popstateHandler.bind(this);
    }
    /**
     * Web Component lifecycle callback invoked when element is connected to DOM.
     * Sets up routing and triggers initial render.
     */
    connectedCallback() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        globalRouter = this;
        this.innerHTML = '<slot name="content"></slot>';
        window.addEventListener('popstate', this._popstateHandler);
        window.dispatchEvent(new Event("popstate")); // Dispatch popstate event to trigger the initial render
    }
    /**
     * Web Component lifecycle callback invoked when element is disconnected from DOM.
     * Cleans up event listeners.
     */
    disconnectedCallback() {
        window.removeEventListener('popstate', this._popstateHandler);
        globalRouter = null;
    }
    /**
     * Handles popstate events for browser navigation.
     * @param event - PopStateEvent from browser history navigation
     */
    popstateHandler(event) {
        event.preventDefault();
        this.render();
    }
    /**
     * Navigates to a new route.
     * @param to - Target path to navigate to
     */
    navigate(to) {
        const toPath = to[0] === '/' ? (this._basePath + to.slice(1)) : to; // Ensure the path starts with '/'
        history.pushState({}, '', toPath);
        this.render();
    }
    /**
     * Renders the current route by creating and displaying the matching custom element.
     * Displays 404 if no route matches the current path.
     */
    render() {
        // Clear slot content
        const slotChildren = Array.from(this.childNodes).filter(n => n.getAttribute?.('slot') === 'content');
        slotChildren.forEach(n => this.removeChild(n));
        const paths = window.location.pathname.split('/');
        if (paths.at(-1) === this._originalFileName) {
            paths[paths.length - 1] = ''; // Ensure the last path is empty for root
        }
        const pathName = paths.join('/');
        const replacedPath = pathName.replace(this._basePath, ''); // Remove base path and ensure default route
        const currentPath = replacedPath[0] !== '/' ? `/${replacedPath}` : replacedPath; // Ensure the path starts with '/'
        let tagName = undefined;
        const params = {};
        // Check if the routePath matches any of the defined routes
        for (const [path, tag] of routeEntries) {
            const regex = new RegExp(`^${path.replace(/:[^\s/]+/g, '([^/]+)')}$`);
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
/**
 * Registers a route entry mapping a custom element tag to a URL path.
 * @param tagName - Custom element tag name to render for this route
 * @param routePath - URL path pattern (supports parameters like :id)
 */
function entryRoute(tagName, routePath) {
    let routePathNormalized;
    if (routePath.startsWith(ROUTE_PATH_PREFIX)) {
        routePathNormalized = routePath.substring(ROUTE_PATH_PREFIX.length); // Remove 'routes:' prefix
    }
    else {
        routePathNormalized = routePath;
    }
    routeEntries.push([routePathNormalized, tagName]);
}
/**
 * Gets the global Router instance.
 * @returns Current Router instance or null if not connected
 */
function getRouter() {
    return globalRouter;
}

/**
 * registerSingleFileComponents.ts
 *
 * Utility function to register multiple Single File Components (SFC) in bulk as Structive Web Components.
 *
 * Main responsibilities:
 * - Iterates through singleFileComponents (map of tagName to path) and asynchronously fetches and parses each SFC
 * - Registers routing information via entryRoute if enableRouter is active
 * - Generates Web Components classes via createComponentClass and registers them as custom elements via registerComponentClass
 *
 * Design points:
 * - Automates everything from SFC loading to Web Components registration and routing registration in bulk
 * - Supports dynamic registration of multiple components via asynchronous processing
 * - Flexible path processing including normalization of root path "/root" and removal of @routes prefix
 */
/**
 * Registers multiple SFC files as custom elements and optionally as routes.
 *
 * This function processes each SFC sequentially, loading the file, creating
 * a component class, and registering it. If routing is enabled and the path
 * starts with '@routes', it also registers the component as a route.
 *
 * @param {SingleFileComponents} singleFileComponents - Object mapping tag names to SFC file paths
 * @returns {Promise<void>} Resolves when all components are registered
 * @throws {Error} If any file cannot be fetched, parsed, or registered
 * @throws {DOMException} If any tag name is invalid or already registered
 *
 * @example
 * await registerSingleFileComponents({
 *   'my-button': './components/button.sfc',
 *   'user-card': '@components/user-card',
 *   'home-page': '@routes/home'  // Also registers as route if enableRouter is true
 * });
 */
async function registerSingleFileComponents(singleFileComponents) {
    // Process each component sequentially to maintain order
    for (const [tagName, path] of Object.entries(singleFileComponents)) {
        let componentData = null;
        // If router is enabled and path looks like a route, register routing info
        if (config$2.enableRouter) {
            // Remove '@routes' prefix if present (e.g., '@routes/home' -> '/home')
            const routePath = path.startsWith("@routes") ? path.slice(7) : path;
            // Normalize '/root' to '/' for the root route
            entryRoute(tagName, routePath === "/root" ? "/" : routePath);
        }
        // Load and parse the SFC file
        componentData = await loadSingleFileComponent(path);
        // Generate a Web Components class from the parsed data
        const componentClass = createComponentClass(componentData);
        // Register the class as a custom element
        registerComponentClass(tagName, componentClass);
    }
}

/**
 * MainWrapper.ts
 *
 * Implementation of MainWrapper custom element that manages application-wide layout and routing.
 *
 * Main responsibilities:
 * - Enables Shadow DOM and dynamically loads layout templates
 * - Applies layout templates and styles
 * - Dynamically adds router element (routerTagName)
 *
 * Design points:
 * - Toggles Shadow DOM enable/disable via config.shadowDomMode
 * - If config.layoutPath is specified, fetches layout HTML and applies template and styles
 * - Applies styles to ShadowRoot or document using adoptedStyleSheets
 * - Inserts default slot if no layout is specified
 * - Adds router element to slot if config.enableRouter is enabled
 */
const SLOT_KEY = "router";
const DEFAULT_LAYOUT = `<slot name="${SLOT_KEY}"></slot>`;
/**
 * MainWrapper custom element for managing application layout and routing.
 * Extends HTMLElement to provide layout template loading and router integration.
 */
class MainWrapper extends HTMLElement {
    /**
     * Creates a new MainWrapper instance and initializes Shadow DOM if configured.
     */
    constructor() {
        super();
        if (config$2.shadowDomMode !== "none") {
            this.attachShadow({ mode: 'open' });
        }
    }
    /**
     * Web Component lifecycle callback invoked when element is connected to DOM.
     * Loads layout and renders the component.
     */
    async connectedCallback() {
        await this.loadLayout();
        this.render();
    }
    /**
     * Gets the root element for content insertion (ShadowRoot or this element).
     * @returns ShadowRoot if Shadow DOM is enabled, otherwise the element itself
     */
    get root() {
        return this.shadowRoot ?? this;
    }
    /**
     * Loads layout template from configured path or uses default layout.
     * Fetches HTML, extracts template and styles, and applies them to root.
     * @throws TMP-101 If layout fetch fails
     */
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
                    context: { where: 'MainWrapper.loadLayout', layoutPath: config$2.layoutPath },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
        }
        else {
            this.root.innerHTML = DEFAULT_LAYOUT;
        }
    }
    /**
     * Renders the component by adding router element if enabled.
     */
    render() {
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
 * Entry point for initializing a Structive application.
 *
 * Main responsibilities:
 * - Registers and initializes necessary components, router, and main wrapper according to global configuration (config)
 * - Dynamically loads routes and components from importmap if autoLoadFromImportMap is enabled
 * - Registers Router component as a custom element if enableRouter is enabled
 * - Registers MainWrapper as a custom element if enableMainWrapper is enabled, and automatically inserts it into body if autoInsertMainWrapper is enabled
 *
 * Design points:
 * - Flexibly controls initialization processing according to configuration values
 * - Centralizes all processing necessary for Structive startup, including importmap, custom element registration, and automatic DOM insertion
 */
/**
 * Bootstraps the Structive application with configured features.
 *
 * This function initializes the application by:
 * 1. Loading components from importmap (if enabled)
 * 2. Registering the router component (if enabled)
 * 3. Registering the main wrapper and optionally inserting it into DOM (if enabled)
 *
 * Call this function once during application startup, typically after DOM is ready.
 *
 * @returns {Promise<void>} Resolves when bootstrap is complete
 * @throws {Error} If importmap loading fails or component registration encounters errors
 * @throws {DOMException} If custom element names are invalid or already registered
 *
 * @example
 * // Basic usage
 * await bootstrap();
 *
 * @example
 * // With configuration
 * import { config } from './WebComponents/getGlobalConfig';
 * config.enableRouter = true;
 * config.autoLoadFromImportMap = true;
 * await bootstrap();
 */
async function bootstrap() {
    // Phase 1: Load components and routes from importmap if configured
    if (config$2.autoLoadFromImportMap) {
        // Scans <script type="importmap"> tags and registers @routes/* and @components/*
        await loadFromImportMap();
    }
    // Phase 2: Register router component if routing is enabled
    if (config$2.enableRouter) {
        // Registers the Router component with the configured tag name (default: 'view-router')
        customElements.define(config$2.routerTagName, Router);
    }
    // Phase 3: Register and optionally insert main wrapper
    if (config$2.enableMainWrapper) {
        // Register MainWrapper component with the configured tag name (default: 'app-main')
        customElements.define(config$2.mainTagName, MainWrapper);
        // Automatically insert main wrapper into document body if configured
        if (config$2.autoInsertMainWrapper) {
            const mainWrapper = document.createElement(config$2.mainTagName);
            document.body.appendChild(mainWrapper);
        }
    }
}

/**
 * exports.ts
 *
 * Module for publicly exposing Structive's primary entry points and APIs.
 *
 * Main responsibilities:
 * - Exports main APIs such as registerSingleFileComponents, bootstrap, and config
 * - defineComponents: Registers a group of SFCs and automatically initializes if autoInit is enabled
 * - bootstrapStructive: Executes initialization processing only once
 *
 * Design points:
 * - Makes global configuration (config) accessible and modifiable from external code
 * - Prevents multiple executions of initialization processing, ensuring safe startup
 */
const config = config$2;
/** Flag to prevent multiple initialization */
let initialized = false;
/**
 * Defines and registers multiple Single File Components.
 *
 * This is the primary API for declaring components in a Structive application.
 * If config.autoInit is true, this function also automatically calls bootstrapStructive()
 * to initialize the application framework (router, main wrapper, etc.).
 *
 * @param {Record<string, string>} singleFileComponents - Object mapping tag names to SFC file paths
 * @returns {Promise<void>} Resolves when all components are registered (and bootstrap is complete if autoInit is true)
 * @throws {Error} If component loading, registration, or bootstrap fails
 *
 * @example
 * // Define components with auto-initialization
 * await defineComponents({
 *   'my-button': './components/button.sfc',
 *   'user-card': '@components/user-card',
 *   'home-page': '@routes/home'
 * });
 *
 * @example
 * // Define components without auto-initialization
 * config.autoInit = false;
 * await defineComponents({
 *   'my-component': './component.sfc'
 * });
 * await bootstrapStructive(); // Manually bootstrap later
 */
async function defineComponents(singleFileComponents) {
    // Register all provided SFC components
    await registerSingleFileComponents(singleFileComponents);
    // Automatically bootstrap if configured
    if (config.autoInit) {
        await bootstrapStructive();
    }
}
/**
 * Bootstraps the Structive application framework.
 *
 * This function initializes core features like the router and main wrapper based
 * on the global configuration. It ensures bootstrap only runs once, even if called
 * multiple times, making it safe to call from multiple places.
 *
 * Typically called automatically by defineComponents() if config.autoInit is true,
 * but can be manually invoked for more control over initialization timing.
 *
 * @returns {Promise<void>} Resolves when bootstrap is complete
 * @throws {Error} If bootstrap initialization fails
 *
 * @example
 * // Manual bootstrap
 * config.autoInit = false;
 * await defineComponents({ 'my-app': './app.sfc' });
 * await bootstrapStructive(); // Explicitly initialize framework
 *
 * @example
 * // Safe to call multiple times (only runs once)
 * await bootstrapStructive();
 * await bootstrapStructive(); // No-op, already initialized
 */
async function bootstrapStructive() {
    // Guard against multiple initialization
    if (!initialized) {
        // Execute core bootstrap process
        await bootstrap();
        // Mark as initialized to prevent re-execution
        initialized = true;
    }
}

export { bootstrapStructive, config, defineComponents };
//# sourceMappingURL=structive.mjs.map
