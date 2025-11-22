/**
 * types.ts
 *
 * Type definition file for StateClass-related interfaces and types.
 *
 * Main responsibilities:
 * - Defines interfaces for StateClass, its proxies, handlers, and dependent properties
 * - IState/IReadonlyStateProxy: Types for State objects and Proxies (including extensions via API symbols)
 * - IStateHandler/IReadonlyStateHandler/IWritableStateHandler: Types for handlers managing state and API calls, scope management
 * - IStructiveStaticState/IStructiveState: Definitions for static properties and constructor types
 *
 * Design points:
 * - Designed for type-safe handling of Proxy traps and API calls
 * - Supports multi-functional state management including dependency resolution, caching, loop/property reference scope management
 * - Foundation supporting StateClass extension, testing, and type-safe usage
 */
import { IComponentEngine } from "../ComponentEngine/types";
import { IListIndex } from "../ListIndex/types";
import { ILoopContext } from "../LoopContext/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { Constructor } from "../types";
import { IRenderer, IUpdater } from "../Updater/types";
import { IUserConfig } from "../WebComponents/types";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol, UpdatedCallbackSymbol } from "./symbols";

/**
 * Base interface for State objects in Structive framework.
 * 
 * Defines the core properties and lifecycle methods that can be implemented
 * in a State class, including special properties (starting with $) for APIs
 * and lifecycle hooks.
 */
export interface IState {
  [propName: string]: any;
  /** Lifecycle hook called when the component is connected to the DOM */
  $connectedCallback?(): Promise<void> | void;
  /** Lifecycle hook called when the component is disconnected from the DOM */
  $disconnectedCallback?(): void;
  /** Lifecycle hook called when state properties are updated */
  $updatedCallback?(paths: string[], indexesByPath: Record<string, number[]>): Promise<void> | void;
  /** Reference to the component instance that owns this state */
  $component?: any;
  /** Navigation function for routing */
  $navigate?(to:string): void;
  /** Resolves a value by pattern and optional indexes */
  $resolve?(pattern:string, indexes?: number[]): any;
  /** Retrieves all values matching a pattern with optional indexes */
  $getAll?(pattern:string, indexes?: number[]): any[];
  /** Registers a dependency for tracking */
  $trackDependency?(pattern:string): void;
}

/**
 * Read-only proxy interface for State objects.
 * 
 * Extends IState with symbol-based methods for internal operations.
 * Supports property reading and list index retrieval, but not modification.
 */
export interface IReadonlyStateProxy extends IState {
  /** Retrieves a value by property reference */
  [GetByRefSymbol](ref: IStatePropertyRef): any;
  /** Retrieves list indexes for a property reference */
  [GetListIndexesByRefSymbol](ref: IStatePropertyRef): IListIndex[] | null;
}

/**
 * Writable proxy interface for State objects.
 * 
 * Extends IState with symbol-based methods for both read and write operations.
 * Supports property modification, lifecycle callbacks, and update tracking.
 */
export interface IWritableStateProxy extends IState {
  /** Retrieves a value by property reference */
  [GetByRefSymbol](ref: IStatePropertyRef): any;
  /** Sets a value by property reference */
  [SetByRefSymbol](ref: IStatePropertyRef, value: any): void;
  /** Retrieves list indexes for a property reference */
  [GetListIndexesByRefSymbol](ref: IStatePropertyRef): IListIndex[] | null;
  /** Invokes the connected lifecycle callback */
  [ConnectedCallbackSymbol](): Promise<void> | void;
  /** Invokes the disconnected lifecycle callback */
  [DisconnectedCallbackSymbol](): void;
  /** Invokes the updated lifecycle callback with changed property references */
  [UpdatedCallbackSymbol](refs: IStatePropertyRef[]): Promise<void> | void;
}

/**
 * Union type representing either a read-only or writable state proxy.
 */
export type IStateProxy = IReadonlyStateProxy | IWritableStateProxy;

/**
 * Interface for static properties on Structive State classes.
 * 
 * Defines metadata and configuration that can be attached to State class constructors.
 */
export interface IStructiveStaticState {
  /** Whether the state is structive or not */
  $isStructive?: boolean;
  /** The config of the component */
  $config?: IUserConfig;
  /** The list properties of the component */
  $listProperties?: string[];
}

/**
 * Type combining a State class constructor with static Structive properties.
 */
export type IStructiveState = Constructor<IState> & IStructiveStaticState;

/**
 * Handler interface for read-only state proxies.
 * 
 * Implements Proxy trap handlers that support reading but prohibit modifications.
 * Manages reference stack, loop context, and provides access to engine and updater.
 */
export interface IReadonlyStateHandler {
  /** Component engine containing state management infrastructure */
  readonly engine: IComponentEngine;
  /** Updater for tracking state changes */
  readonly updater: IUpdater;
  /** Optional renderer for UI updates */
  readonly renderer: IRenderer | null;
  /** Stack tracking property reference hierarchy during access */
  readonly refStack: (IStatePropertyRef | null)[];
  /** Current index in the reference stack */
  refIndex: number;
  /** Most recently accessed property reference */
  lastRefStack: IStatePropertyRef | null;
  /** Current loop context for nested loop bindings */
  loopContext: ILoopContext | null;
  /** Set of symbol keys for internal APIs */
  readonly symbols: Set<PropertyKey>;
  /** Set of string keys for special $ properties */
  readonly apis: Set<PropertyKey>;
  /** Proxy get trap handler */
  get(target: Object, prop: PropertyKey, receiver: IReadonlyStateProxy): any;
  /** Proxy set trap handler (throws error for read-only) */
  set(target: Object, prop: PropertyKey, value: any, receiver: IReadonlyStateProxy): boolean;
}

/**
 * Handler interface for writable state proxies.
 * 
 * Implements Proxy trap handlers that support both reading and writing.
 * Manages reference stack, loop context, and provides access to engine and updater.
 * Enables full state modification with dependency tracking and update propagation.
 */
export interface IWritableStateHandler {
  /** Component engine containing state management infrastructure */
  readonly engine: IComponentEngine;
  /** Updater for tracking and propagating state changes */
  readonly updater: IUpdater;
  /** Optional renderer for UI updates */
  readonly renderer: IRenderer | null;
  /** Stack tracking property reference hierarchy during access */
  readonly refStack: (IStatePropertyRef | null)[];
  /** Current index in the reference stack */
  refIndex: number;
  /** Most recently accessed property reference */
  lastRefStack: IStatePropertyRef | null;
  /** Current loop context for nested loop bindings */
  loopContext: ILoopContext | null;
  /** Set of symbol keys for internal APIs */
  readonly symbols: Set<PropertyKey>;
  /** Set of string keys for special $ properties */
  readonly apis: Set<PropertyKey>;
  /** Proxy get trap handler */
  get(target: Object, prop: PropertyKey, receiver: IWritableStateProxy): any;
  /** Proxy set trap handler */
  set(target: Object, prop: PropertyKey, value: any, receiver: IWritableStateProxy): boolean;
}

/**
 * Union type representing either a read-only or writable state handler.
 */
export type IStateHandler = IReadonlyStateHandler | IWritableStateHandler;