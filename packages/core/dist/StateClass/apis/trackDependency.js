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
import { raiseError } from "../../utils";
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
export function trackDependency(_target, _prop, _receiver, handler) {
    return (path) => {
        // Get the currently resolving getter's info from the stack
        const lastInfo = handler.lastRefStack?.info ?? raiseError({
            code: 'STATE-202',
            message: 'Internal error: lastRefStack is null',
            context: { where: 'trackDependency', path },
            docsUrl: '/docs/error-codes.md#state',
        });
        // Only register dependency if source is a getter and target is different
        // This prevents self-references and only tracks getter -> property dependencies
        if (handler.engine.pathManager.getters.has(lastInfo.pattern) &&
            lastInfo.pattern !== path) {
            handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, path);
        }
    };
}
