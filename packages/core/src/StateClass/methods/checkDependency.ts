import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IStateHandler } from "../types";

/**
 * Checks and registers dynamic dependency between the currently resolving getter and the referenced property.
 * Only registers dependencies for getters that are not self-referencing.
 * @param handler - State handler containing reference stack and path manager
 * @param ref - State property reference being accessed
 */
export function checkDependency(
  handler: IStateHandler,
  ref: IStatePropertyRef,
): void {
  // Register dynamic dependency only if we're inside a getter resolution (refIndex >= 0)
  if (handler.refIndex >= 0) {
    const lastInfo = handler.lastRefStack?.info ?? null;
    if (lastInfo !== null) {
      // Only register if source is a getter and not accessing itself
      if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern) &&
        lastInfo.pattern !== ref.info.pattern) {
        handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, ref.info.pattern);
      }
    }
  }
}