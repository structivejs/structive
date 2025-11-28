/**
 * getContextListIndex.ts
 *
 * Internal API function for StateClass that retrieves the list index (IListIndex)
 * corresponding to the specified structuredPath (wildcard property path) in the
 * current property reference scope.
 *
 * Main responsibilities:
 * - Retrieves list index for the specified path from the last accessed StatePropertyRef in handler
 * - Supports wildcard hierarchies, enabling use in multiple loops and nested array bindings
 *
 * Design points:
 * - Retrieves the most recent property reference information
 * - Identifies the index of structuredPath from info.wildcardPaths
 * - Gets list index for the corresponding level using listIndex.at(index)
 * - Returns null if path doesn't match or reference doesn't exist
 */
import { IListIndex } from "../../ListIndex/types";
import { IStateHandler } from "../types";

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
export function getContextListIndex(
  handler: IStateHandler,
  structuredPath: string
): IListIndex | null {
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
