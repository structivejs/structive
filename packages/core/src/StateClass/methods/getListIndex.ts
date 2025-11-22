/**
 * getListIndex.ts
 *
 * Internal API function for StateClass that retrieves the list index (IListIndex)
 * corresponding to the given path information (IResolvedPathInfo).
 *
 * Main responsibilities:
 * - Resolves list index based on path's wildcard type (context/all/partial/none)
 * - context type retrieves list index from current loop context
 * - all type traverses list index collections at each hierarchy level to retrieve the index
 * - partial and none types are not implemented or return null
 *
 * Design points:
 * - Flexibly supports wildcards, multiple loops, and nested array bindings
 * - Retrieves list index collections for each hierarchy level via handler.engine.getListIndexesSet
 * - Throws detailed exceptions via raiseError on errors
 */
import { IListIndex } from "../../ListIndex/types";
import { IResolvedPathInfo } from "../../StateProperty/types";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef";
import { raiseError } from "../../utils.js";
import { GetListIndexesByRefSymbol } from "../symbols";
import { IStateHandler, IReadonlyStateProxy, IStateProxy } from "../types";
import { getContextListIndex } from "./getContextListIndex";

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
export function getListIndex(
  resolvedPath: IResolvedPathInfo, 
  receiver: IStateProxy,
  handler: IStateHandler
): IListIndex | null {
  switch (resolvedPath.wildcardType) {
    case "none":
      // No wildcards in path, no list index needed
      return null;
    case "context":
      // Get the last wildcard path from resolved path info
      const lastWildcardPath = resolvedPath.info.lastWildcardPath ?? 
        raiseError({
          code: 'STATE-202',
          message: 'lastWildcardPath is null',
          context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
          docsUrl: '/docs/error-codes.md#state',
        });
      // Retrieve list index from current loop context
      return getContextListIndex(handler, lastWildcardPath) ?? 
        raiseError({
          code: 'LIST-201',
          message: `ListIndex not found: ${resolvedPath.info.pattern}`,
          context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
          docsUrl: '/docs/error-codes.md#list',
        });
    case "all":
      // Traverse all wildcard levels to build complete list index hierarchy
      let parentListIndex: IListIndex | null = null;
      for(let i = 0; i < resolvedPath.info.wildcardCount; i++) {
        // Get the parent info for this wildcard level
        const wildcardParentPattern = resolvedPath.info.wildcardParentInfos[i] ?? 
          raiseError({
            code: 'STATE-202',
            message: 'wildcardParentPattern is null',
            context: { where: 'getListIndex', pattern: resolvedPath.info.pattern, index: i },
            docsUrl: '/docs/error-codes.md#state',
          });
        // Create a reference for the current wildcard level
        const wildcardRef = getStatePropertyRef(wildcardParentPattern, parentListIndex);
        // Get all list indexes at this wildcard level
        const listIndexes: IListIndex[] = receiver[GetListIndexesByRefSymbol](wildcardRef) ?? 
          raiseError({
            code: 'LIST-201',
            message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
            context: { where: 'getListIndex', wildcardParent: wildcardParentPattern.pattern },
            docsUrl: '/docs/error-codes.md#list',
          });
        // Get the specific index for this wildcard level
        const wildcardIndex = resolvedPath.wildcardIndexes[i] ?? 
          raiseError({
            code: 'STATE-202',
            message: 'wildcardIndex is null',
            context: { where: 'getListIndex', pattern: resolvedPath.info.pattern, index: i },
            docsUrl: '/docs/error-codes.md#state',
          });
        // Select the list index at the specified position for this level
        parentListIndex = listIndexes[wildcardIndex] ?? 
          raiseError({
            code: 'LIST-201',
            message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
            context: { where: 'getListIndex', wildcardParent: wildcardParentPattern.pattern, wildcardIndex },
            docsUrl: '/docs/error-codes.md#list',
          });
      }
      // Return the final list index after traversing all levels
      return parentListIndex;
    case "partial":
      // Partial wildcard support is not yet implemented
      raiseError({
        code: 'STATE-202',
        message: `Partial wildcard type is not supported yet: ${resolvedPath.info.pattern}`,
        context: { where: 'getListIndex', pattern: resolvedPath.info.pattern },
        docsUrl: '/docs/error-codes.md#state',
      });
  }
}
