import { raiseError } from "../../utils";
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
export function setLoopContext(handler, loopContext, callback) {
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
            handler.loopContext = null;
            throw error;
        }
        // Cleanup after async completion
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
                handler.loopContext = null;
            });
        }
        // Synchronous cleanup
        handler.refStack[handler.refIndex] = null;
        handler.refIndex--;
        handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
        handler.loopContext = null;
    }
    else {
        handler.loopContext = loopContext;
        // No loop context, execute callback directly
        try {
            resultPromise = callback();
        }
        catch (error) {
            // Cleanup on synchronous error
            handler.loopContext = null;
            throw error;
        }
        // Cleanup after async completion
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.loopContext = null;
            });
        }
        // Synchronous cleanup
        handler.loopContext = null;
    }
    return resultPromise;
}
