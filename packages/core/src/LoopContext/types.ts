/**
 * LoopContext/types.ts
 *
 * Interface definitions for LoopContext management used in loop bindings (for, etc.).
 *
 * Main responsibilities:
 * - ILoopContext: Interface for managing property path, index, and BindContent associations per loop
 *   - path: Property path of the loop
 *   - info: Structured path information
 *   - bindContent: Associated BindContent instance
 *   - listIndex: Current list index
 *   - parentLoopContext: Parent loop context (for nested loops)
 *   - assignListIndex/clearListIndex: Index reassignment and clearing
 *   - find: Search loop context by name (with caching)
 *   - walk: Traverse hierarchy and execute callback
 *   - serialize: Get loop hierarchy as array
 *
 * Design points:
 * - Flexible design to support nested loops and binding structures
 * - Efficient interface for searching, enumerating, and exploring parent-child relationships and hierarchical structures
 */
import { IBindContent } from "../DataBinding/types";
import { IListIndex } from "../ListIndex/types";
import { IStructuredPathInfo } from "../StateProperty/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";

/**
 * Interface for loop context management in loop bindings.
 * Manages property path, index, and BindContent associations for each loop iteration.
 */
export interface ILoopContext {
  /** State property reference with path and index information */
  readonly ref              : IStatePropertyRef;
  
  /** Property path pattern of the loop */
  readonly path             : string;
  
  /** Structured path information */
  readonly info             : IStructuredPathInfo;
  
  /** Associated BindContent instance */
  readonly bindContent      : IBindContent;
  
  /** Current list index for this loop */
  readonly listIndex        : IListIndex;
  
  /** Parent loop context for nested loops, or null if top-level */
  readonly parentLoopContext: ILoopContext | null;
  
  /**
   * Assigns a new list index to this loop context.
   * @param listIndex - New list index to assign
   */
  assignListIndex(listIndex: IListIndex): void;
  
  /**
   * Clears the list index reference.
   */
  clearListIndex(): void;
  
  /**
   * Finds a loop context by path name in the hierarchy.
   * @param name - Path name to search for
   * @returns Loop context with matching path or null if not found
   */
  find(name: string): ILoopContext | null;
  
  /**
   * Walks through the loop context hierarchy from current to root.
   * @param callback - Function to call for each loop context
   */
  walk(callback: (loopContext: ILoopContext) => void): void;
  
  /**
   * Serializes the loop context hierarchy to an array from root to current.
   * @returns Array of loop contexts ordered from root to current
   */
  serialize(): ILoopContext[];
  
}

