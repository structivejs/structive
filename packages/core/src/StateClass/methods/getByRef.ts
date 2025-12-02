/**
 * getByRef.ts
 *
 * Implementation of getByRef function as internal API for StateClass to retrieve values from
 * state object (target) by specifying structured path info (IStructuredPathInfo) and list index (IListIndex).
 *
 * Main responsibilities:
 * - Retrieves State values for specified path/index (supports nested loops and wildcards)
 * - Automatic dependency registration (wrapped with setTracking when trackedGetters enabled)
 * - Cache mechanism (caches values by refKey when handler.cacheable)
 * - Sets scope temporarily with SetStatePropertyRefSymbol when retrieving via getter
 * - Recursively retrieves values by traversing parent info and listIndex if not found
 *
 * Design points:
 * - Enables dependency tracking with setTracking when included in handler.engine.trackedGetters
 * - Optimizes by caching values with refKey when cache enabled, retrieves and reuses them
 * - Flexibly supports wildcards and nested loops, achieving recursive value retrieval
 * - Guarantees cache storage in finally block
 */
import { ICacheEntry } from "../../ComponentEngine/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { raiseError } from "../../utils";
import { IStateProxy, IStateHandler } from "../types";
import { checkDependency } from "./checkDependency";
import { createListIndexes } from "./createListIndexes";

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
export function getByRef(
  target   : object, 
  ref      : IStatePropertyRef,
  receiver : IStateProxy,
  handler  : IStateHandler
): unknown {
  // Check and register dependency if called from within a getter
  checkDependency(handler, ref);

  let value: unknown;
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
      } else {
        // Check version to determine if cache is still valid
        if (lastCacheEntry.version > handler.updater.version) {
          // This can occur when async updates happen
          return lastCacheEntry.value;
        }
        // Compare versions and revisions to detect updates
        if (lastCacheEntry.version < versionRevision.version || lastCacheEntry.revision < versionRevision.revision) {
          // Updates detected
        } else {
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
    } finally {
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
              } else {
                handler.renderer.lastListInfoByRef.set(ref, { listIndexes: [], value: [] });
              }
            }
          }
          // Calculate new list indexes by comparing old and new values
          newListIndexes = createListIndexes(
            ref.listIndex, lastCacheEntry?.value, value, lastCacheEntry?.listIndexes ?? []
          );
        }
        // Create or update cache entry with new value and metadata
        const cacheEntry: ICacheEntry = lastCacheEntry ?? {
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
  } else {
    // Error if not exists
    raiseError({
      code: "STC-001",
      message: `Property "${ref.info.pattern}" does not exist in state.`,
      context: {
        where: 'StateClass.getByRef',
        pattern: ref.info.pattern,
      },
      docsUrl: "./docs/error-codes.md#stc",
    })
  }
}
