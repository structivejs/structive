import { IBinding } from "../DataBinding/types";
import { IListIndex } from "../ListIndex/types";
import { ILoopContext } from "../LoopContext/types";
import { IReadonlyStateHandler, IReadonlyStateProxy, IStructiveState, IWritableStateHandler, IWritableStateProxy } from "../StateClass/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";

/**
 * Callback function for update operations that receives writable state.
 * Can be synchronous or asynchronous.
 * 
 * @param {IWritableStateProxy} state - Writable state proxy for modifications
 * @param {IWritableStateHandler} handler - Handler for the writable state
 * @returns {Promise<any> | any} Result of the update operation
 */
export type UpdateCallback = (state: IWritableStateProxy, handler: IWritableStateHandler) => Promise<any> | any;

/**
 * Callback function for read-only state operations.
 * Can be synchronous or asynchronous.
 * 
 * @template T - The return type of the callback
 * @param {IReadonlyStateProxy} state - Read-only state proxy
 * @param {IReadonlyStateHandler} handler - Handler for the read-only state
 * @returns {Promise<T> | T} Result of the read operation
 */
export type ReadonlyStateCallback<T = any> = (state: IReadonlyStateProxy, handler: IReadonlyStateHandler) => Promise<T> | T;

/**
 * Interface for managing state updates and triggering rendering as needed.
 * Coordinates state modifications, queues changes, and orchestrates the rendering cycle.
 * 
 * @interface IUpdater
 */
export interface IUpdater {
  /** 
   * Current version number, incremented on each update cycle.
   * Used for cache invalidation and change tracking.
   */
  readonly version: number;
  
  /** 
   * Current revision number within the version.
   * Incremented for sub-updates within the same version.
   */
  readonly revision: number;
  
  /**
   * Map storing swap information for list elements.
   * Tracks which list elements were moved/reordered during updates.
   * Key: State property reference, Value: List information including indexes
   */
  readonly swapInfoByRef: Map<IStatePropertyRef, IListSnapshot>;

  /**
   * Enqueues a reference for update in the next rendering cycle.
   * Changes are batched and processed together for efficiency.
   * 
   * @param {IStatePropertyRef} ref - State property reference to be updated
   * @returns {void}
   */
  enqueueRef(ref: IStatePropertyRef): void;
  
  /**
   * Executes an update operation within a specific loop context.
   * Creates a writable state proxy, executes the callback, and triggers rendering.
   * 
   * @template R - The return type of the callback
   * @param {ILoopContext | null} loopContext - Loop context for resolving wildcards, or null for root context
   * @param {UpdateCallback} callback - Callback function that performs state modifications
   * @returns {R} The result returned by the callback
   */
  update<R>(
    loopContext: ILoopContext | null, 
    callback: (state: IWritableStateProxy, handler: IWritableStateHandler) => R
  ): R;

  /**
   * Creates a read-only state context and executes a callback within it.
   * Used for safe state reading without modifications.
   * 
   * @template R - The return type of the callback
   * @param {ReadonlyStateCallback<R>} callback - Callback receiving read-only state
   * @returns {R} The result returned by the callback
   */
  createReadonlyState<R>(
    callback: (state: IReadonlyStateProxy, handler: IReadonlyStateHandler) => R
  ): R;

  /**
   * Performs the initial rendering of the component.
   * Sets up the rendering infrastructure and processes the initial state.
   * 
   * @param {function(IRenderer): void} callback - Callback receiving the renderer instance
   * @returns {void}
   */
  initialRender(callback: (renderer: IRenderer) => void): void;
}

/**
 * Snapshot of a list's state at a specific point in time.
 * 
 * This interface captures both the array elements and their corresponding ListIndex values,
 * enabling the system to detect element reordering and calculate minimal diffs between renders.
 * 
 * **Primary Use Cases:**
 * 1. **Swap Tracking (Updater.swapInfoByRef)**: Captures list state before element modifications occur
 * 2. **Diff Calculation (Renderer.lastListInfoByRef)**: Stores previous render's state to compare against current state
 * 
 * **How It Works:**
 * - When a list element is modified, a snapshot is taken before the change
 * - During rendering, the renderer compares current state with the snapshot
 * - The `listIndexes` array tracks element identity across reorders (not just positions)
 * - This enables efficient detection of which elements moved, were added, or removed
 * 
 * @interface IListSnapshot
 * @example
 * // Before swap: [A, B, C] with indexes [1, 2, 3]
 * const beforeSnapshot: IListSnapshot = {
 *   value: ['A', 'B', 'C'],
 *   listIndexes: [index1, index2, index3]
 * };
 * 
 * // After swap: [C, A, B] with same indexes [3, 1, 2]
 * // The renderer can detect this is a reorder, not new elements
 */
export interface IListSnapshot {
  /** 
   * The array of values in the list at snapshot time.
   * Represents the actual data elements.
   */
  value: any[];
  
  /** 
   * Array of list indexes corresponding to each element.
   * Used to track element identity across reorders - even if elements move positions,
   * their ListIndex remains constant, enabling accurate swap detection.
   */
  listIndexes: IListIndex[];
}

/**
 * Interface for the rendering coordinator.
 * Manages the rendering cycle, traverses dependencies, and applies changes to bindings.
 * Maintains rendering state and ensures efficient updates by tracking processed references.
 * 
 * @interface IRenderer
 */
export interface IRenderer {
  /**
   * Set of bindings that have been updated during the current rendering cycle.
   * Bindings add themselves to this set when changes are applied.
   */
  readonly updatedBindings: Set<IBinding>;

  /**
   * Set of state property references that have been processed.
   * Used to prevent duplicate processing and circular dependency issues.
   */
  readonly processedRefs: Set<IStatePropertyRef>;

  /**
   * Map storing the last known list information for each reference.
   * Used to compute diffs and identify new list elements.
   */
  readonly lastListInfoByRef: Map<IStatePropertyRef, IListSnapshot>;
  
  /**
   * Read-only state proxy for accessing state values during rendering.
   * Only available during active render cycle.
   */
  readonly readonlyState: IReadonlyStateProxy;
  
  /**
   * Handler for the read-only state proxy.
   * Manages state access and dependency tracking.
   */
  readonly readonlyHandler: IReadonlyStateHandler;

  /**
   * Array of references currently being updated in this render cycle.
   */
  readonly updatingRefs: IStatePropertyRef[];
  
  /**
   * Set version of updatingRefs for fast lookup.
   */
  readonly updatingRefSet: Set<IStatePropertyRef>;

  /**
   * Starts the rendering process for the given state property references.
   * Traverses dependencies, applies binding changes, and coordinates the update.
   * 
   * @param {IStatePropertyRef[]} items - Array of state property references to render
   * @returns {void}
   */
  render(items: IStatePropertyRef[]): void;

  /**
   * Creates a read-only state context and executes a callback within it.
   * Provides safe access to state values without modification capabilities.
   * 
   * @template T - The return type of the callback
   * @param {ReadonlyStateCallback<T>} callback - Callback function receiving read-only state
   * @returns {T} The result returned by the callback
   */
  createReadonlyState<T = any>(callback: ReadonlyStateCallback<T>): T;
}
