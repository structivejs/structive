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
import { raiseError } from "../utils";

/**
 * Throws error when filter requires at least one option but none provided.
 * 
 * @param fnName - Name of the filter function
 * @returns Never returns (always throws)
 * @throws FLT-202 Filter requires at least one option
 */
export function optionsRequired(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires at least one option`,
    context: { fnName },
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
export function optionMustBeNumber(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires a number as option`,
    context: { fnName },
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
export function valueMustBeNumber(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires a number value`,
    context: { fnName },
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
export function valueMustBeString(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires a string value`,
    context: { fnName },
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
export function valueMustBeBoolean(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires a boolean value`,
    context: { fnName },
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
export function valueMustBeDate(fnName:string): never {
  raiseError({
    code: "FLT-202",
    message: `${fnName} requires a date value`,
    context: { fnName },
    docsUrl: "./docs/error-codes.md#flt",
  });
}