/**
 * getListIndexesByRef.ts
 *
 * Internal API function for StateClass that retrieves the list indexes (IListIndex[])
 * for a given property reference.
 *
 * Main responsibilities:
 * - Validates that the reference points to a list path
 * - Retrieves list indexes from stateOutput if available (optimization)
 * - Updates cache by calling getByRef and retrieves list indexes from cache
 * - Throws detailed errors if list indexes cannot be found
 *
 * Design points:
 * - Checks stateOutput first for performance optimization
 * - Uses getByRef to ensure cache is up to date
 * - Validates cache entry existence and list indexes presence
 * - Provides detailed error context for debugging
 */
import { IListIndex } from "../../ListIndex/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { raiseError } from "../../utils";
import { IStateHandler, IStateProxy } from "../types";
import { getByRef } from "./getByRef";

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
export function getListIndexesByRef(
  target   : object, 
  ref      : IStatePropertyRef,
  receiver : IStateProxy,
  handler  : IStateHandler
 
): IListIndex[] {
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