/**
 * Interface for a node in the property path tree.
 * Represents a hierarchical path structure with parent-child relationships.
 */
export interface IPathNode {
  /** Path of the parent node */
  readonly parentPath: string;
  
  /** Full path of this node */
  readonly currentPath: string;
  
  /** Name of this node (last segment of the path) */
  readonly name: string;
  
  /** Map of child nodes keyed by their names */
  readonly childNodeByName: Map<string, IPathNode>;
  
  /** Depth level in the tree (0 for root) */
  readonly level: number;
  
  /**
   * Finds a node by traversing path segments.
   * @param segments - Array of path segments to traverse
   * @param segIndex - Current segment index (default: 0)
   * @returns Found node or null if not found
   */
  find(segments: string[], segIndex?: number): IPathNode | null;
  
  /**
   * Appends a child node with the given name.
   * @param childName - Name of the child node to append
   * @returns Child node (existing or newly created)
   */
  appendChild(childName: string): IPathNode;
}
