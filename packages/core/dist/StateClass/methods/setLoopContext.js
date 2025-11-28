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
    if (handler.loopContext) {
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
    handler.loopContext = loopContext;
    let resultPromise;
    try {
        if (loopContext) {
            // Validate ref stack before pushing loop context ref
            if (handler.refStack.length === 0) {
                raiseError({
                    code: 'STC-002',
                    message: 'handler.refStack is empty in getByRef',
                    context: {
                        where: 'setLoopContext',
                        refIndex: handler.refIndex,
                        refStackLength: handler.refStack.length,
                    },
                    docsUrl: '/docs/error-codes.md#state',
                    hint: 'Invoke setLoopContext only after initializing refStack via asyncSetStatePropertyRef.',
                    severity: 'error',
                });
            }
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
            finally {
                // Always restore ref stack state
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            }
        }
        else {
            // No loop context, execute callback directly
            resultPromise = callback();
        }
    }
    finally {
        // For Promise, return a new Promise chain with finally applied
        if (resultPromise instanceof Promise) {
            resultPromise.finally(() => {
                handler.loopContext = null;
            }).catch((error) => {
                raiseError({
                    code: 'STC-002',
                    message: 'Error in setLoopContext finally block',
                    context: { where: 'setLoopContext.cleanup' },
                    docsUrl: '/docs/error-codes.md#state',
                    hint: 'Inspect the promise returned by the callback for cleanup failures.',
                    severity: 'error',
                    cause: error,
                });
            });
        }
        // For synchronous case, reset immediately
        handler.loopContext = null;
    }
    return resultPromise;
}
