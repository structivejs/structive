/**
 * createWritableStateProxy.ts
 *
 * Implementation file for creating "writable" proxies for StateClass.
 *
 * Main responsibilities:
 * - Creates a writable Proxy for State objects
 * - StateHandler class implements various APIs and traps (get/set)
 * - get trap supports bindings, API calls, dependency resolution, etc.
 * - set trap centrally manages value writes and side effects (dependency resolution, re-rendering)
 *
 * Design points:
 * - StateHandler implements IWritableStateHandler and serves as the foundation for state management and API calls
 * - Maps various API symbols and functions to callableApi for flexible API extension
 * - Enables consistent creation and usage via createWritableStateProxy
 * - Multi-functional design including dependency resolution, caching, loop/property reference scope management
 */
import { IComponentEngine } from "../ComponentEngine/types";
import { IState, IWritableStateHandler, IWritableStateProxy } from "./types";
import { set as trapSet } from "./traps/set.js";
import { ILoopContext } from "../LoopContext/types";
import { setLoopContext } from "./methods/setLoopContext";
import { IRenderer, IUpdater } from "../Updater/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol, UpdatedCallbackSymbol } from "./symbols";
import { get as trapGet } from "./traps/get.js";

// Initial depth of the reference stack for tracking property access hierarchy
const STACK_DEPTH = 32;

/**
 * StateHandler class implementing writable Proxy traps for State objects.
 * 
 * This handler intercepts property access and modifications, supporting full
 * read-write operations with dependency tracking, re-rendering, and update propagation.
 */
class StateHandler implements IWritableStateHandler {
  readonly engine: IComponentEngine;
  readonly updater: IUpdater;
  readonly renderer: IRenderer | null = null;
  readonly refStack: (IStatePropertyRef | null)[] = Array(STACK_DEPTH).fill(null) as (IStatePropertyRef | null)[];
  refIndex: number = -1;
  lastRefStack: IStatePropertyRef | null = null;
  loopContext: ILoopContext | null | undefined = undefined;
  readonly symbols: Set<PropertyKey> = new Set<PropertyKey>([ 
    GetByRefSymbol, SetByRefSymbol, GetListIndexesByRefSymbol, 
    ConnectedCallbackSymbol, DisconnectedCallbackSymbol,
    UpdatedCallbackSymbol
  ]);
  readonly apis: Set<PropertyKey> = new Set<PropertyKey>([ "$resolve", "$getAll", "$trackDependency", "$navigate", "$component" ]);
  
  /**
   * Constructs a new StateHandler for writable state proxy.
   * 
   * @param engine - Component engine containing state management infrastructure
   * @param updater - Updater for tracking and propagating state changes
   */
  constructor(engine: IComponentEngine, updater: IUpdater) {
    this.engine = engine;
    this.updater = updater;
  }

  /**
   * Proxy get trap for property access.
   * 
   * Delegates to the shared get trap handler that supports bindings, API calls,
   * and dependency tracking.
   * 
   * @param target - State object being accessed
   * @param prop - Property key being accessed
   * @param receiver - Proxy object
   * @returns Value of the accessed property
   */
  get(
    target  : object, 
    prop    : PropertyKey, 
    receiver: IWritableStateProxy
  ): unknown {
    return trapGet(target, prop, receiver, this);
  }

  /**
   * Proxy set trap for property assignment.
   * 
   * Delegates to the shared set trap handler that handles value updates,
   * dependency tracking, and triggers re-rendering.
   * 
   * @param target - State object being modified
   * @param prop - Property key being set
   * @param value - Value to assign
   * @param receiver - Proxy object
   * @returns true if the property was successfully set
   */
  set(
    target  : object, 
    prop    : PropertyKey, 
    value   : unknown, 
    receiver: IWritableStateProxy
  ): boolean {
    return trapSet(target, prop, value, receiver, this);
  }

  /**
   * Proxy has trap for property existence checking.
   * 
   * Returns true if the property exists in the target, or is a known symbol/API.
   * 
   * @param target - State object being checked
   * @param prop - Property key being checked for existence
   * @returns true if property exists in target or is a known symbol/API
   */
  has(
    target: object, 
    prop  : PropertyKey
  ): boolean {
    return Reflect.has(target, prop) || this.symbols.has(prop) || this.apis.has(prop);
  }
}

/**
 * Creates a writable state proxy and executes a callback within a loop context scope.
 * 
 * This function creates a temporary writable proxy for the state object, sets up a loop context
 * (if provided), and executes the callback with the proxy and handler. The loop context is
 * automatically cleaned up after callback execution, even if an exception occurs.
 * 
 * Supports both synchronous and asynchronous callbacks.
 * 
 * @param engine - Component engine containing state management infrastructure
 * @param updater - Updater for tracking and propagating state changes
 * @param state - State object to wrap in a writable proxy
 * @param loopContext - Optional loop context for nested loop bindings, null if not in a loop
 * @param callback - Function to execute with the writable state proxy
 * @returns Result of the callback execution
 */
export function useWritableStateProxy<R>(
  engine: IComponentEngine, 
  updater: IUpdater,
  state: IState,
  loopContext: ILoopContext | null,
  callback: (stateProxy: IWritableStateProxy, handler: IWritableStateHandler) => R
): R {
  // Create handler and proxy for writable state access
  const handler = new StateHandler(engine, updater);
  const stateProxy = new Proxy<IState>(state, handler) as IWritableStateProxy;
  // Execute callback within loop context scope (automatically cleaned up)
  return setLoopContext<R>(handler, loopContext, () => {
    return callback(stateProxy, handler);
  });
}

