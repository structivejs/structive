
/**
 * Interface for hierarchical loop index management in nested loops.
 * Tracks parent-child relationships, versions, and provides access to index hierarchy.
 */
export interface IListIndex {
  /** Parent list index for nested loops, or null for top-level */
  readonly parentListIndex: IListIndex | null;
  
  /** Unique numeric identifier */
  readonly id: number;
  
  /** String representation of id */
  readonly sid: string;
  
  /** Position in loop hierarchy (0-based, 0 for root) */
  readonly position: number;
  
  /** Total depth of loop hierarchy (position + 1) */
  readonly length: number;
  
  /** Current index value (mutable for loop iteration) */
  index: number;
  
  /** Version number for change tracking */
  readonly version: number;
  
  /** Whether parent indexes have changed since last access */
  readonly dirty: boolean;
  
  /** Array of all index values from root to current level */
  readonly indexes: number[];
  
  /** Array of WeakRef to all ListIndex instances from root to current */
  readonly listIndexes: WeakRef<IListIndex>[];
  
  /** Variable name for this loop index ($1, $2, etc.) */
  readonly varName: string;
  
  /**
   * Gets ListIndex at specified position in hierarchy.
   * 
   * @param position - Position index (0-based, negative for from end)
   * @returns ListIndex at position or null if not found/garbage collected
   */
  at(position: number): IListIndex | null;
}
