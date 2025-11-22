/**
 * set.ts
 *
 * Implementation of the set function as a Proxy trap for StateClass,
 * handling property setting and value assignment.
 *
 * Main responsibilities:
 * - For string properties, resolves path info via getResolvedPathInfo and retrieves list index via getListIndex
 * - Executes value setting corresponding to structured path and list index via setByRef
 * - For other cases (symbols, etc.), executes normal property setting via Reflect.set
 *
 * Design points:
 * - Flexibly supports bindings, nested loops, and paths with wildcards
 * - By utilizing setByRef, side effects like dependency resolution and re-rendering are centrally managed
 * - Ensures compatibility with standard property setting via Reflect.set
 */
import { getResolvedPathInfo } from "../../StateProperty/getResolvedPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { getListIndex } from "../methods/getListIndex.js";
import { setByRef } from "../methods/setByRef.js";
/**
 * Proxy trap handler for property setting on State objects.
 *
 * This function intercepts property assignments and handles:
 * - String properties: Resolves path info, retrieves list index, and sets value via setByRef
 * - Other properties: Falls back to default Reflect.set behavior
 *
 * The setByRef call ensures proper handling of wildcards, nested loops, dependency tracking,
 * and triggers necessary re-rendering and update callbacks.
 *
 * @param target - State object being modified
 * @param prop - Property key being set (string, symbol, or other)
 * @param value - Value to assign to the property
 * @param receiver - Proxy object that triggered this trap
 * @param handler - State handler containing context and configuration
 * @returns true if the property was successfully set, false otherwise
 */
export function set(target, prop, value, receiver, handler) {
    if (typeof prop === "string") {
        // Resolve path information and list index for structured property access
        const resolvedInfo = getResolvedPathInfo(prop);
        const listIndex = getListIndex(resolvedInfo, receiver, handler);
        const ref = getStatePropertyRef(resolvedInfo.info, listIndex);
        // Set value via setByRef to handle dependencies and updates
        return setByRef(target, ref, value, receiver, handler);
    }
    else {
        // For non-string properties (symbols, etc.), use default behavior
        return Reflect.set(target, prop, value, receiver);
    }
}
