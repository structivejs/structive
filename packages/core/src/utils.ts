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
 * Payload object for structured error information.
 * Extends standard Error with additional debugging metadata.
 */
export type StructiveErrorPayload = {
  /** Error code for categorization (e.g., 'UPD-001', 'CE-202') */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional context data for debugging (e.g., variable values, location) */
  context?: Record<string, unknown>;
  /** Suggestion for resolving the error */
  hint?: string;
  /** URL to documentation explaining this error code */
  docsUrl?: string;
  /** Severity level: 'error' for failures, 'warn' for non-critical issues */
  severity?: "error" | "warn";
  /** Original error that caused this error (for error chaining) */
  cause?: unknown;
};

/**
 * Throws an error with a simple message.
 * 
 * @param {string} message - Error message
 * @returns {never} This function never returns (always throws)
 */
export function raiseError(message: string): never;

/**
 * Throws an error with structured metadata for enhanced debugging.
 * 
 * @param {StructiveErrorPayload} payload - Structured error information
 * @returns {never} This function never returns (always throws)
 */
export function raiseError(payload: StructiveErrorPayload): never;

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
export function raiseError(messageOrPayload: string | StructiveErrorPayload): never {
  // Handle simple string message
  if (typeof messageOrPayload === "string") {
    throw new Error(messageOrPayload);
  }
  
  // Handle structured payload
  const { message, code, context, hint, docsUrl, severity, cause } = messageOrPayload;
  
  // Create base Error with the message
  const err = new Error(message);
  
  // Attach additional metadata as properties (keeping message for existing compatibility)
  (err as any).code = code;
  if (context) {(err as any).context = context;}
  if (hint) {(err as any).hint = hint;}
  if (docsUrl) {(err as any).docsUrl = docsUrl;}
  if (severity) {(err as any).severity = severity;}
  if (cause) {(err as any).cause = cause;}
  
  throw err;
}
