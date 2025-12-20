import { set as trapSet } from "./traps/set.js";
import { setLoopContext } from "./methods/setLoopContext";
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
class StateHandler {
    engine;
    updater;
    renderer = null;
    refStack = Array(STACK_DEPTH).fill(null);
    refIndex = -1;
    lastRefStack = null;
    loopContext = undefined;
    symbols = new Set([
        GetByRefSymbol, SetByRefSymbol, GetListIndexesByRefSymbol,
        ConnectedCallbackSymbol, DisconnectedCallbackSymbol,
        UpdatedCallbackSymbol
    ]);
    apis = new Set([
        "$resolve", "$getAll", "$trackDependency", "$navigate", "$component", "$invoke", "$wrap", "$updateComplete"
    ]);
    /**
     * Constructs a new StateHandler for writable state proxy.
     *
     * @param engine - Component engine containing state management infrastructure
     * @param updater - Updater for tracking and propagating state changes
     */
    constructor(engine, updater) {
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
    get(target, prop, receiver) {
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
    set(target, prop, value, receiver) {
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
    has(target, prop) {
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
export function useWritableStateProxy(engine, updater, state, loopContext, callback) {
    // Create handler and proxy for writable state access
    const handler = new StateHandler(engine, updater);
    const stateProxy = new Proxy(state, handler);
    // Execute callback within loop context scope (automatically cleaned up)
    return setLoopContext(handler, loopContext, () => {
        return callback(stateProxy, handler);
    });
}
