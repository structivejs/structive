import { IPathNode } from "../PathTree/types";

export type Dependencies<T = string> = Map<T, Set<T>>;

/**
 * PathManager interface manages property paths and dependencies.
 * One instance is created per ComponentClass.
 */
export interface IPathManager {
  /**
   * Set of all paths
   */
  readonly alls: Set<string>;
  /**
   * Set of list paths
   * Obtained from {{ for: }}
   */
  readonly lists: Set<string>;
  /**
   * Set of list element paths
   * Derived from list paths, e.g., list -> list.*, always ending with *
   */
  readonly elements: Set<string>;
  /**
   * Set of function paths
   */
  readonly funcs: Set<string>;
  /**
   * Set of paths with getter definitions
   * Obtained from prototype.getOwnPropertyDescriptors()
   */
  readonly getters: Set<string>;
  /**
   * Set of paths with only getter definitions
   * Obtained from prototype.getOwnPropertyDescriptors()
   */
  readonly onlyGetters: Set<string>;
  /**
   * Set of paths with setter definitions
   * Obtained from prototype.getOwnPropertyDescriptors()
   */
  readonly setters: Set<string>;
  /**
   * Set of paths with both getter and setter definitions
   * Obtained from prototype.getOwnPropertyDescriptors()
   */
  readonly getterSetters: Set<string>;
  /**
   * Set of optimized getter/setter paths
   */
  readonly optimizes: Set<string>;
  /**
   * Map of static dependencies
   * key: source path
   * value: set of dependent paths
   */
  readonly staticDependencies: Dependencies<string>;
  /**
   * Map of dynamic dependencies
   * key: source path
   * value: set of dependent paths
   */
  readonly dynamicDependencies: Dependencies<string>;
  /**
   * Root node of the path tree
   */
  readonly rootNode: IPathNode;
  /**
   * Whether connected callback exists
   */
  readonly hasConnectedCallback: boolean;
  /**
   * Whether disconnected callback exists
   */
  readonly hasDisconnectedCallback: boolean;
  /**
   * Whether updated callback exists
   */
  readonly hasUpdatedCallback: boolean;
  /**
   * Adds a dynamic dependency between source and target paths.
   * @param target - Dependent path
   * @param source - Source path
   */
  addDynamicDependency(target: string, source: string): void;
  /**
   * Adds a new path to the manager dynamically.
   * @param path - Path to add
   * @param isList - Whether the path represents a list (default: false)
   */
  addPath(path: string, isList?: boolean): void;

}