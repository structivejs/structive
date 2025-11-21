import { IComponentStateBinding } from "../ComponentStateBinding/types";
import { IComponentStateInput } from "../ComponentStateInput/types";
import { IComponentStateOutput } from "../ComponentStateOutput/types";
import { IBindContent, IBinding } from "../DataBinding/types";
import { FilterWithOptions } from "../Filter/types";
import { IListIndex } from "../ListIndex/types";
import { IPathManager } from "../PathManager/types";
import { IState, IStructiveState } from "../StateClass/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { ComponentType, IComponentConfig, StructiveComponent } from "../WebComponents/types";

/**
 * IComponentEngine defines the core interface for the Structive component engine,
 * managing state, dependencies, bindings, lifecycle, and rendering.
 *
 * Key Responsibilities:
 * - State management: Instantiation, proxy creation, and state property operations
 * - Resource management: Templates, stylesheets, filters, and bindings
 * - Dependency tracking: PathTree construction and dependency graph maintenance
 * - Binding registry: Storage, retrieval, and existence checking of binding information
 * - Lifecycle coordination: Connected/disconnected callbacks and async initialization
 * - Shadow DOM or block mode: Style application and placeholder management
 * - Cache management: Property reference caching and version tracking
 *
 * Design Patterns:
 * - Immutable core properties: Most properties are readonly after construction
 * - Mutable collections: WeakMaps and Sets for dynamic binding/component relationships
 * - Async initialization: Promise-based readyResolvers for component readiness
 * - Batch updates: Integration with Updater for efficient rendering cycles
 *
 * Error Codes:
 * - BIND-201: bindContent not initialized or block parent node not set
 * - STATE-202: Failed to parse state from dataset attribute
 *
 * This interface serves as the foundation for Structive's reactive state management,
 * binding system, and dependency resolution architecture.
 */
export interface IComponentEngine {
  readonly type: ComponentType;
  readonly config: IComponentConfig;

  readonly template: HTMLTemplateElement;
  readonly styleSheet: CSSStyleSheet;
  readonly stateClass: IStructiveState;
  readonly state: IState;
  readonly inputFilters: FilterWithOptions;
  readonly outputFilters: FilterWithOptions;
  readonly baseClass: typeof HTMLElement;
  readonly owner: StructiveComponent;

  readonly bindContent: IBindContent;
  readonly pathManager: IPathManager;
  readonly readyResolvers: PromiseWithResolvers<void>;

  readonly stateInput: IComponentStateInput;
  readonly stateOutput: IComponentStateOutput;
  readonly stateBinding: IComponentStateBinding;

  /** Map of child Structive components to their bindings */
  readonly bindingsByComponent: WeakMap<StructiveComponent, Set<IBinding>>;
  /** Set of child Structive components */
  readonly structiveChildComponents: Set<StructiveComponent>;
  readonly currentVersion: number;
  readonly versionRevisionByPath: Map<string, IVersionRevision>;

  getCacheEntry(ref: IStatePropertyRef): ICacheEntry | null;
  setCacheEntry(ref: IStatePropertyRef, entry: ICacheEntry): void;
  getBindings(ref: IStatePropertyRef): IBinding[];
  saveBinding(ref: IStatePropertyRef, binding: IBinding): void;
  removeBinding(ref: IStatePropertyRef, binding: IBinding): void;
  setup(): void;
  connectedCallback(): Promise<void>;
  disconnectedCallback(): Promise<void>;
  getListIndexes(ref: IStatePropertyRef): IListIndex[] | null;
  /** Gets the property value by reference */
  getPropertyValue(ref: IStatePropertyRef): any;
  /** Sets the property value by reference */
  setPropertyValue(ref: IStatePropertyRef, value: any): void;
  /** Registers a Structive component as a child */
  registerChildComponent(component: StructiveComponent): void;
  /** Unregisters a Structive component from children */
  unregisterChildComponent(component: StructiveComponent): void;
  versionUp(): number;
}

/**
 * Metadata associated with a property reference for dependency tracking and caching.
 * 
 * Purpose:
 * - Central storage for all bindings observing a specific property reference
 * - Manages cache entries for computed property values
 * - Enables efficient dependency resolution and update propagation
 * 
 * Storage:
 * - Stored in ComponentEngine._propertyRefMetadataByRef WeakMap
 * - Keyed by IStatePropertyRef for O(1) lookup
 * - Automatically garbage collected when property reference is no longer used
 * 
 * Lifecycle:
 * - Created on-demand when first binding is saved or cache is set
 * - Updated throughout component lifetime as bindings are added/removed
 * - Destroyed when property reference becomes unreachable
 * 
 * Usage Patterns:
 * - saveBinding: Adds binding to the bindings array
 * - removeBinding: Removes binding from the bindings array
 * - setCacheEntry: Updates the cacheEntry field
 * - getCacheEntry: Retrieves the cacheEntry
 * - getBindings: Returns all bindings for update propagation
 * 
 * Mutability Analysis:
 * - bindings: Mutable array (push in saveBinding, splice in removeBinding)
 *   → CANNOT be readonly: Array mutations required for dynamic binding management
 * - cacheEntry: Mutable reference (assigned in setCacheEntry)
 *   → CAN be readonly: Only reference reassignment, not object mutation
 *   → However, kept mutable for consistency with bindings field
 * 
 * Design Decision:
 * - Both fields are mutable for simplicity and performance
 * - Avoids creating new metadata objects on every binding operation
 * - Centralized metadata enables efficient batch updates during rendering
 */
export interface IPropertyRefMetadata {
  bindings: IBinding[];
  cacheEntry: ICacheEntry | null;
}

/**
 * Cache entry for storing computed property values and dependency information.
 * 
 * Purpose:
 * - Avoids redundant computation by caching resolved values
 * - Tracks version/revision for cache invalidation
 * - Maintains list indexes for array dependencies
 * 
 * Lifecycle:
 * - Created/updated in getByRef when property value is resolved
 * - Reused and mutated in-place for performance (fields are NOT readonly)
 * - Invalidated when version/revision mismatches
 * 
 * Mutability Analysis:
 * - value: Mutated in getByRef.ts line 120 (`cacheEntry.value = value`)
 * - listIndexes: Mutated in getByRef.ts line 121 (`cacheEntry.listIndexes = newListIndexes`)
 * - version: Mutated in getByRef.ts line 122 (`cacheEntry.version = handler.updater.version`)
 * - revision: Mutated in getByRef.ts line 123 (`cacheEntry.revision = handler.updater.revision`)
 * 
 * Design Decision:
 * - In-place mutation is intentional for performance optimization
 * - Avoids allocating new objects on every property access
 * - Fields CANNOT be readonly due to mutation requirements
 */
export interface ICacheEntry {
  value: any;
  listIndexes: IListIndex[] | null;
  version: number;
  revision: number;
}

/**
 * Version and revision tracking for cache invalidation.
 * 
 * Purpose:
 * - Tracks the version and revision of property updates
 * - Used to determine if cached values are still valid
 * - Enables fine-grained cache invalidation per property path
 * 
 * Storage:
 * - Stored in ComponentEngine.versionRevisionByPath Map
 * - Keyed by property path string (e.g., "items", "user.name")
 * - Created during update cycles in Updater.collectMaybeUpdates
 * 
 * Lifecycle:
 * - Created as new object in Updater.ts line 182-185
 * - Set to versionRevisionByPath Map without modification
 * - Retrieved in getByRef.ts line 57 for cache validation
 * - Never mutated after creation
 * 
 * Cache Invalidation Logic:
 * - getByRef compares cacheEntry.version/revision with versionRevision
 * - If cacheEntry < versionRevision, cache is invalidated
 * - If cacheEntry >= versionRevision, cache is still valid
 * 
 * Mutability Analysis:
 * - version: Immutable after creation (set once in Updater)
 *   → CAN be readonly: No mutations found
 * - revision: Immutable after creation (set once in Updater)
 *   → CAN be readonly: No mutations found
 * 
 * Design Decision:
 * - Fields CAN be readonly for type safety
 * - Objects are created fresh on each update cycle
 * - Immutability ensures consistent cache validation
 */
export interface IVersionRevision {
  readonly version: number;
  readonly revision: number;
}