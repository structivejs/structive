import { raiseError } from "../utils";
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
class StateHandler {
    engine;
    updater;
    renderer;
    refStack = Array(STACK_DEPTH).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = undefined;
    symbols = new Set([GetByRefSymbol, GetListIndexesByRefSymbol]);
    apis = new Set(["$resolve", "$getAll", "$trackDependency", "$navigate", "$component"]);
    /**
     * Constructs a new StateHandler for read-only state proxy.
     *
     * @param engine - Component engine containing state management infrastructure
     * @param updater - Updater for tracking state changes
     * @param renderer - Optional renderer for UI updates, null if not rendering
     */
    constructor(engine, updater, renderer) {
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
    get(target, prop, receiver) {
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
    set(_target, prop, _value, _receiver) {
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
    has(target, prop) {
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
export function createReadonlyStateHandler(engine, updater, renderer) {
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
export function createReadonlyStateProxy(state, handler) {
    return new Proxy(state, handler);
}
