/**
 * types.ts
 *
 * Type definition file for StateProperty-related types.
 *
 * Main responsibilities:
 * - Defines types for State property path information, wildcard information, accessor functions, etc.
 * - IStructuredPathInfo: Detailed structured information including path hierarchy, wildcards, and parent-child relationships
 * - IResolvedPathInfo: Actual path strings, element arrays, wildcard types, and index information
 * - IAccessorFunctions: Types for dynamically generated getter/setter functions
 *
 * Design points:
 * - Strictly represents path hierarchical structure and wildcard hierarchy in types for type-safe binding and access
 * - Explicitly types wildcard types such as context/all/partial/none
 * - Type definitions for accessor functions support dynamic getter/setter generation
 */

/**
 * Interface representing comprehensive structured information about a State property path pattern.
 * Provides detailed analysis of path hierarchy, wildcard positions, parent-child relationships,
 * and various access patterns optimized for binding and dependency tracking.
 * 
 * @interface IStructuredPathInfo
 */
export interface IStructuredPathInfo {
  /** Unique numeric identifier for this path info instance */
  readonly id: number;
  
  /** Unique ID as a string representation */
  readonly sid: string;
  
  /** 
   * Array of individual path segments split by dot notation.
   * Wildcards are preserved as "*" in the array.
   * @example "aaa.*.bbb.*.ccc" => ["aaa", "*", "bbb", "*", "ccc"]
   */
  readonly pathSegments: string[];
  
  /** The last (rightmost) segment of the path */
  readonly lastSegment: string;
  
  /** 
   * Array of cumulative paths from root to each segment.
   * Each element represents the path up to that segment, useful for hierarchical traversal.
   * @example "aaa.*.bbb.*.ccc" => [
   *   "aaa",
   *   "aaa.*",
   *   "aaa.*.bbb",
   *   "aaa.*.bbb.*",
   *   "aaa.*.bbb.*.ccc"
   * ]
   */
  readonly cumulativePaths: string[];
  
  /** Set of cumulative paths for fast lookup operations */
  readonly cumulativePathSet: Set<string>;
  
  /** Array of IStructuredPathInfo instances for each cumulative path */
  readonly cumulativeInfos: IStructuredPathInfo[];
  
  /** Set of cumulative info instances for fast lookup */
  readonly cumulativeInfoSet: Set<IStructuredPathInfo>;
  
  /** 
   * The parent path (one level up from current path).
   * Null if this is a root-level path.
   * @example "aaa.*.bbb.*.ccc" => "aaa.*.bbb.*"
   */
  readonly parentPath: string | null;
  
  /** IStructuredPathInfo instance for the parent path, or null if no parent */
  readonly parentInfo: IStructuredPathInfo | null;
  
  /**
   * Array of all paths that end with a wildcard within this pattern.
   * Used to identify iteration points in nested loop structures.
   * @example "aaa.*.bbb.*.ccc" => [
   *   "aaa.*",
   *   "aaa.*.bbb.*"
   * ]
   */
  readonly wildcardPaths: string[];
  
  /** Set of wildcard paths for fast lookup */
  readonly wildcardPathSet: Set<string>;
  
  /** 
   * Mapping from wildcard path to its ordinal index (0-based).
   * Used to resolve $1, $2, etc. in loop contexts.
   */
  readonly indexByWildcardPath: Record<string, number>;
  
  /** Array of IStructuredPathInfo instances for each wildcard path */
  readonly wildcardInfos: IStructuredPathInfo[];
  
  /** Set of wildcard info instances for fast lookup */
  readonly wildcardInfoSet: Set<IStructuredPathInfo>;
  
  /** Array of parent paths for each wildcard (path immediately before the wildcard) */
  readonly wildcardParentPaths: string[];
  
  /** Set of wildcard parent paths for fast lookup */
  readonly wildcardParentPathSet: Set<string>;
  
  /** Array of IStructuredPathInfo instances for each wildcard parent path */
  readonly wildcardParentInfos: IStructuredPathInfo[];
  
  /** Set of wildcard parent info instances for fast lookup */
  readonly wildcardParentInfoSet: Set<IStructuredPathInfo>;
  
  /** The deepest (rightmost) wildcard path in the pattern, or null if no wildcards */
  readonly lastWildcardPath: string | null;
  
  /** IStructuredPathInfo instance for the last wildcard path, or null if no wildcards */
  readonly lastWildcardInfo: IStructuredPathInfo | null;
  
  /**
   * The complete path pattern string.
   * @example "aaa.*.bbb.*.ccc"
   */
  readonly pattern: string;
  
  /** Total count of wildcards in this path pattern */
  readonly wildcardCount: number;
}

/**
 * Classification of how wildcards are used within a property path.
 * 
 * @type {WildcardType}
 * - "none": Path contains no wildcards (e.g., "user.name")
 * - "context": Path uses wildcards that must be resolved from current loop context (e.g., "items.*.name" when inside a loop)
 * - "partial": Path contains wildcards with explicit indexes for some but not all (mixed resolution)
 * - "all": All wildcards in the path are resolved with explicit numeric indexes (e.g., "items.0.name")
 */
export type WildcardType = "none" | "context" | "partial" | "all";

/**
 * Interface representing a resolved (concrete) property path with actual indexes.
 * Contains the parsed structure of a path where wildcards may be replaced with numeric indexes,
 * along with metadata about wildcard types and the relationship to the pattern.
 * 
 * @interface IResolvedPathInfo
 */
export interface IResolvedPathInfo {
  /** Unique numeric identifier for this resolved path info instance */
  readonly id: number;
  
  /**
   * The complete resolved path string with actual indexes.
   * @example "aaa.0.bbb.2.ccc" => "aaa.0.bbb.2.ccc"
   */
  readonly name: string;
  
  /** 
   * Array of individual path segments split by dot notation.
   * Numeric indexes are preserved as strings.
   * @example "aaa.0.bbb.2.ccc" => ["aaa", "0", "bbb", "2", "ccc"]
   */
  readonly elements: string[];
  
  /** 
   * Array of cumulative paths from root to each segment in the resolved path.
   * Useful for hierarchical value retrieval and dependency tracking.
   * @example "aaa.0.bbb.2.ccc" => [
   *   "aaa",
   *   "aaa.0",
   *   "aaa.0.bbb",
   *   "aaa.0.bbb.2",
   *   "aaa.0.bbb.2.ccc"
   * ]
   */
  readonly paths: string[];
  
  /** 
   * Classification of wildcard usage in this path.
   * Determines how the path should be resolved in different contexts.
   */
  readonly wildcardType: WildcardType;
  
  /**
   * Array of numeric indexes for each wildcard position in the pattern.
   * Null for positions without wildcards or unresolved wildcards.
   * Length matches the wildcard count of the associated pattern.
   */
  readonly wildcardIndexes: (number | null)[];
  
  /** Reference to the structured pattern information this resolved path is based on */
  readonly info: IStructuredPathInfo;
}

/**
 * Interface for dynamically generated getter and setter accessor functions.
 * These functions provide optimized access to State properties based on resolved path information.
 * 
 * @interface IAccessorFunctions
 */
export interface IAccessorFunctions {
  /** 
   * Getter function to retrieve the current value at the property path.
   * @returns {unknown} The current value at the path, or undefined if not set
   */
  get: () => unknown;
  
  /** 
   * Setter function to update the value at the property path.
   * Triggers dependency tracking and re-rendering as needed.
   * @param {unknown} value - The new value to set at the path
   * @returns {void}
   */
  set: (value: unknown) => void;
}