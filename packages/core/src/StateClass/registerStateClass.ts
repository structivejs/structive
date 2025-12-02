/**
 * registerStateClass.ts
 *
 * Management module for registering and retrieving StateClass instances by ID.
 *
 * Main responsibilities:
 * - stateClassById: Record managing StateClass instances keyed by ID
 * - registerStateClass: Registers a StateClass instance with the specified ID
 * - getStateClassById: Retrieves a StateClass instance by ID (throws error if not registered)
 *
 * Design points:
 * - Centrally manages StateClass instances globally for fast access via ID
 * - Raises clear exceptions via raiseError when accessing non-existent IDs
 */
import { raiseError } from "../utils.js";
import { IStructiveState } from "./types";

// Global registry mapping StateClass IDs to their instances
const stateClassById: Record<number,IStructiveState> = {};

/**
 * Registers a StateClass instance with a unique ID.
 * 
 * This function stores the StateClass instance in a global registry,
 * making it accessible for retrieval via getStateClassById.
 * 
 * @param id - Unique identifier for the StateClass instance
 * @param stateClass - StateClass instance to register
 */
export function registerStateClass(id: number, stateClass: IStructiveState) {
  stateClassById[id] = stateClass;
}

/**
 * Retrieves a registered StateClass instance by its ID.
 * 
 * This function looks up a StateClass instance from the global registry.
 * If the ID is not found, it throws a descriptive error.
 * 
 * @param id - Unique identifier of the StateClass instance to retrieve
 * @returns The registered StateClass instance
 * @throws {Error} STATE-101 - When no StateClass is registered with the given ID
 */
export function getStateClassById(id: number): IStructiveState {
  return stateClassById[id] ?? raiseError({
    code: "STATE-101",
    message: `StateClass not found: ${id}`,
    context: { where: 'StateClass.getStateClassById', stateClassId: id },
    docsUrl: "./docs/error-codes.md#state",
  });
}
