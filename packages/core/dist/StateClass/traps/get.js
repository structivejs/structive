/**
 * get.ts
 *
 * Implementation of the get function as a Proxy trap for StateClass,
 * handling property access and value retrieval.
 *
 * Main responsibilities:
 * - For string properties, returns values or APIs based on special properties ($1-$9, $resolve, $getAll, $navigate)
 * - For regular properties, resolves path info via getResolvedPathInfo and retrieves list index via getListIndex
 * - Retrieves values corresponding to structured path and list index via getByRef
 * - For symbol properties, calls APIs via handler.callableApi
 * - For other cases, executes normal property access via Reflect.get
 *
 * Design points:
 * - $1-$9 are special properties that return list index values from the most recent StatePropertyRef
 * - $resolve, $getAll, $navigate return API functions or router instances
 * - Regular property access also supports bindings and nested loops
 * - Ensures extensibility and compatibility through symbol APIs and Reflect.get
 */
import { getRouter } from "../../Router/Router.js";
import { getResolvedPathInfo } from "../../StateProperty/getResolvedPathInfo.js";
import { raiseError } from "../../utils.js";
import { getListIndex } from "../methods/getListIndex.js";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol, UpdatedCallbackSymbol } from "../symbols.js";
import { trackDependency } from "../apis/trackDependency.js";
import { indexByIndexName } from "./indexByIndexName.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { resolve } from "../apis/resolve.js";
import { getByRef } from "../methods/getByRef.js";
import { setByRef } from "../methods/setByRef.js";
import { connectedCallback } from "../apis/connectedCallback.js";
import { disconnectedCallback } from "../apis/disconnectedCallback.js";
import { getAll } from "../apis/getAll.js";
import { getListIndexesByRef } from "../methods/getListIndexesByRef.js";
import { updatedCallback } from "../apis/updatedCallback.js";
/**
 * Proxy trap handler for property access on State objects.
 *
 * This function intercepts property access and handles:
 * - Index name properties ($1-$9): Returns list index values from current context
 * - Special properties ($resolve, $getAll, $navigate, etc.): Returns API functions
 * - String properties: Resolves path and retrieves value via getByRef
 * - Symbol properties: Returns internal API functions for StateClass operations
 * - Other properties: Falls back to default Reflect.get behavior
 *
 * @param target - State object being accessed
 * @param prop - Property key being accessed (string, symbol, or other)
 * @param receiver - Proxy object that triggered this trap
 * @param handler - State handler containing context and configuration
 * @returns Value of the accessed property or an API function
 * @throws {Error} LIST-201 - When list index is not found for index name properties
 */
export function get(target, prop, receiver, handler) {
    // Check if property is an index name ($1-$9)
    const index = indexByIndexName[prop];
    if (typeof index !== "undefined") {
        // Retrieve list index from the most recent property reference
        const listIndex = handler.lastRefStack?.listIndex;
        return listIndex?.indexes[index] ?? raiseError({
            code: 'LIST-201',
            message: `ListIndex not found: ${prop.toString()}`,
            context: { prop: String(prop), indexes: listIndex?.indexes ?? null, index },
            docsUrl: '/docs/error-codes.md#list',
            severity: 'error',
        });
    }
    // Handle string properties
    if (typeof prop === "string") {
        // Check for special properties starting with $
        if (prop[0] === "$") {
            switch (prop) {
                case "$resolve":
                    return resolve(target, prop, receiver, handler);
                case "$getAll":
                    return getAll(target, prop, receiver, handler);
                case "$trackDependency":
                    return trackDependency(target, prop, receiver, handler);
                case "$navigate":
                    return (to) => getRouter()?.navigate(to);
                case "$component":
                    return handler.engine.owner;
            }
        }
        // Regular property access: resolve path, get list index, and retrieve value
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        return getByRef(target, ref, receiver, handler);
    }
    else if (typeof prop === "symbol") {
        // Handle symbol properties for internal APIs
        if (handler.symbols.has(prop)) {
            // Return API functions based on symbol type
            switch (prop) {
                case GetByRefSymbol:
                    return (ref) => getByRef(target, ref, receiver, handler);
                case SetByRefSymbol:
                    return (ref, value) => setByRef(target, ref, value, receiver, handler);
                case GetListIndexesByRefSymbol:
                    return (ref) => getListIndexesByRef(target, ref, receiver, handler);
                case ConnectedCallbackSymbol:
                    return () => connectedCallback(target, prop, receiver, handler);
                case DisconnectedCallbackSymbol:
                    return () => disconnectedCallback(target, prop, receiver, handler);
                case UpdatedCallbackSymbol:
                    return (refs) => updatedCallback(target, refs, receiver, handler);
            }
        }
        else {
            // Unknown symbol, use default behavior
            return Reflect.get(target, prop, receiver);
        }
    }
}
