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
export function raiseError(messageOrPayload) {
    // Handle simple string message
    if (typeof messageOrPayload === "string") {
        throw new Error(messageOrPayload);
    }
    // Handle structured payload
    const { message, code, context, hint, docsUrl, severity, cause } = messageOrPayload;
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
