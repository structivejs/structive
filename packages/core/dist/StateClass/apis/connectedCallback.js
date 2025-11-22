/**
 * connectedCallback.ts
 *
 * Utility function to invoke the StateClass lifecycle hook "$connectedCallback".
 *
 * Main responsibilities:
 * - Invokes $connectedCallback method if defined on the object (target)
 * - Callback is invoked with target's this context, passing IReadonlyStateProxy (receiver) as argument
 * - Executable as async function (await compatible)
 *
 * Design points:
 * - Safely retrieves $connectedCallback property using Reflect.get
 * - Does nothing if the callback doesn't exist
 * - Used for lifecycle management and custom initialization logic
 */
import { CONNECTED_CALLBACK_FUNC_NAME } from "../../constants";
/**
 * Invokes the $connectedCallback lifecycle hook if defined on the target.
 * @param target - Target object to check for callback
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy to pass as this context
 * @param handler - State handler (unused but part of signature)
 * @returns Promise or void depending on callback implementation
 */
export function connectedCallback(target, prop, receiver, handler) {
    const callback = Reflect.get(target, CONNECTED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        return callback.call(receiver);
    }
}
