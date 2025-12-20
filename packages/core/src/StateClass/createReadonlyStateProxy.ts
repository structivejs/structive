/**
 * createReadonlyStateProxy.ts
 *
 * Creates a "read-only" proxy for StateClass.
 *
 * Main responsibilities:
 * - Creates a read-only Proxy for State objects
 * - get trap supports bindings/API calls/dependency resolution/renderer integration
 * - set trap always throws an exception to prohibit writes
 * - has trap exposes internal API symbols (GetByRefSymbol, etc.)
 *
 * Throws:
 * - STATE-202 Cannot set property ... of readonly state (set trap)
 */
import { IComponentEngine } from "../ComponentEngine/types";
import { IReadonlyStateHandler, IState, IReadonlyStateProxy } from "./types";
import { raiseError } from "../utils";
import { ILoopContext } from "../LoopContext/types";
import { IRenderer, IUpdater } from "../Updater/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { GetByRefSymbol, GetListIndexesByRefSymbol } from "./symbols";
import { get as trapGet } from "./traps/get.js";

// Initial depth of the reference stack for tracking property access hierarchy
const STACK_DEPTH = 32;

/**
 * StateHandler class implementing read-only Proxy traps for State objects.
 * 
 * This handler intercepts property access and prohibits property modifications,
 * ensuring the State object remains immutable from the perspective of the proxy user.
 */
class StateHandler implements IReadonlyStateHandler {
  readonly engine: IComponentEngine;
  readonly updater: IUpdater;
  readonly renderer: IRenderer | null;
  readonly refStack: (IStatePropertyRef | null)[] = Array(STACK_DEPTH).fill(null) as (IStatePropertyRef | null)[];
  refIndex: number = -1;
  lastRefStack: IStatePropertyRef | null = null;
  loopContext: ILoopContext | null | undefined = undefined;
  readonly symbols: Set<PropertyKey> = new Set<PropertyKey>([ GetByRefSymbol, GetListIndexesByRefSymbol ]);
  readonly apis: Set<PropertyKey> = new Set<PropertyKey>([ 
    "$resolve", "$getAll", "$trackDependency", "$navigate", "$component" 
  ]);

  /**
   * Constructs a new StateHandler for read-only state proxy.
   * 
   * @param engine - Component engine containing state management infrastructure
   * @param updater - Updater for tracking state changes
   * @param renderer - Optional renderer for UI updates, null if not rendering
   */
  constructor(engine: IComponentEngine, updater: IUpdater, renderer: IRenderer | null) {
    this.engine = engine;
    this.updater = updater;
    this.renderer = renderer;
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
    receiver: IReadonlyStateProxy
  ): unknown {
    return trapGet(target, prop, receiver, this);
  }

  /**
   * Proxy set trap for property assignment.
   * 
   * Always throws an error to prohibit modifications to the read-only state.
   * 
   * @param target - State object being modified
   * @param prop - Property key being set
   * @param value - Value attempting to be assigned
   * @param receiver - Proxy object
   * @returns Never returns (always throws)
   * @throws {Error} STATE-202 - Always thrown to prevent writes to readonly state
   */
  set(
    _target  : object, 
    prop    : PropertyKey, 
    _value   : unknown, 
    _receiver: IReadonlyStateProxy
  ): boolean {
    raiseError({
      code: 'STATE-202',
      message: `Cannot set property ${String(prop)} of readonly state`,
      context: { where: 'createReadonlyStateProxy.set', prop: String(prop) },
      docsUrl: './docs/error-codes.md#state',
    });
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
 * Creates a read-only state handler instance.
 * 
 * @param engine - Component engine containing state management infrastructure
 * @param updater - Updater for tracking state changes
 * @param renderer - Optional renderer for UI updates, null if not rendering
 * @returns New readonly state handler instance
 */
export function createReadonlyStateHandler(
  engine: IComponentEngine, 
  updater: IUpdater, 
  renderer: IRenderer | null
): IReadonlyStateHandler {
  return new StateHandler(engine, updater, renderer);
}

/**
 * Creates a read-only proxy for a State object.
 * 
 * The returned proxy allows property reading but throws an error on unknown write attempt.
 * Supports special properties ($resolve, $getAll, etc.) and internal API symbols.
 * 
 * @param state - State object to wrap in a read-only proxy
 * @param handler - Read-only state handler implementing proxy traps
 * @returns Read-only proxy wrapping the state object
 */
export function createReadonlyStateProxy(
  state: IState,
  handler: IReadonlyStateHandler,
): IReadonlyStateProxy {
  return new Proxy<IState>(state, handler) as IReadonlyStateProxy;
}
