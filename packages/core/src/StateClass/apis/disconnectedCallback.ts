/**
 * disconnectedCallback.ts
 *
 * Utility function to invoke the StateClass lifecycle hook "$disconnectedCallback".
 *
 * Main responsibilities:
 * - Invokes $disconnectedCallback method if defined on the object (target)
 * - Callback is invoked with target's this context, passing IReadonlyStateProxy (receiver) as argument
 * - Executable as async function (await compatible)
 *
 * Design points:
 * - Safely retrieves $disconnectedCallback property using Reflect.get
 * - Does nothing if the callback doesn't exist
 * - Used for lifecycle management and cleanup logic
 */
import { DISCONNECTED_CALLBACK_FUNC_NAME } from "../../constants";
import { IStateHandler, IStateProxy } from "../types";

/**
 * Invokes the $disconnectedCallback lifecycle hook if defined on the target.
 * @param target - Target object to check for callback
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy to pass as this context
 * @param handler - State handler (unused but part of signature)
 */
export function disconnectedCallback(
  target: object, 
  _prop: PropertyKey, 
  receiver: IStateProxy,
  _handler: IStateHandler
): unknown {
  const callback: unknown = Reflect.get(target, DISCONNECTED_CALLBACK_FUNC_NAME);
  if (typeof callback === "function") {
    return callback.call(receiver);
  }
}