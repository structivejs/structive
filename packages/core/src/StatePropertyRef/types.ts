/**
 * types.ts
 *
 * Type definition file for StatePropertyRef-related types.
 *
 * Main responsibilities:
 * - IStatePropertyRef: Defines the type for State property references that combine structured path
 *   information (IStructuredPathInfo) with list indexes (IListIndex)
 *
 * Design points:
 * - Manages path information and list index together, used for state management, dependency resolution, and caching
 * - listIndex is nullable to support non-list references
 */
import { IListIndex } from "../ListIndex/types";
import { IStructuredPathInfo } from "../StateProperty/types";

/**
 * Interface representing a unique reference to a State property.
 * Combines structured path information with optional list index context to uniquely identify
 * a property within the state tree, enabling precise dependency tracking and caching.
 * 
 * @interface IStatePropertyRef
 */
export interface IStatePropertyRef {
  /** 
   * Structured information about the property path pattern.
   * Contains hierarchy, wildcard positions, and parent-child relationships.
   */
  readonly info: IStructuredPathInfo;
  
  /** 
   * Optional list index context for this property reference.
   * Null for non-list properties or properties without list iteration context.
   * Used to resolve wildcards in nested loop structures.
   */
  readonly listIndex: IListIndex | null;
  
  /** 
   * Unique string key composed from info.sid and listIndex.sid.
   * Used for caching, Map keys, and reference equality checks.
   */
  readonly key: string;
  
  /** 
   * Reference to the parent property (one level up in the path hierarchy).
   * Null if this is a root-level property.
   * Automatically adjusts list index based on wildcard counts.
   */
  readonly parentRef: IStatePropertyRef | null;
}