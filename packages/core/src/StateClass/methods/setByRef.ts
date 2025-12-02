/**
 * setByRef.ts
 *
 * Internal API function for StateClass that sets values to the state object (target)
 * by specifying structured path information (IStructuredPathInfo) and list index (IListIndex).
 *
 * Main responsibilities:
 * - Sets State values for specified path/index (supports multiple loops and wildcards)
 * - Temporarily sets scope with SetStatePropertyRefSymbol when setting via getter/setter
 * - Recursively sets values by traversing parent info and listIndex if not found
 * - Registers update information via engine.updater.addUpdatedStatePropertyRefValue after setting
 *
 * Design points:
 * - Flexibly supports wildcards and multiple loops, achieving recursive value setting
 * - Always registers update information in finally block for re-rendering and dependency resolution
 * - Design considers scope switching via getter/setter
 */
import { createListIndex } from "../../ListIndex/ListIndex";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IListSnapshot } from "../../Updater/types";
import { raiseError } from "../../utils.js";
import { GetByRefSymbol, GetListIndexesByRefSymbol } from "../symbols";
import { IStateProxy, IStateHandler } from "../types";
import { getByRef } from "./getByRef";

/**
 * Sets a value to the state object for the specified property reference.
 * 
 * This function handles value setting with support for wildcards, multiple loops, and nested structures.
 * It manages scope switching for getter/setter execution and tracks swap operations for element updates.
 * Update information is always registered in the finally block for re-rendering and dependency resolution.
 * 
 * @param target - State object
 * @param ref - State property reference indicating where to set the value
 * @param value - Value to set
 * @param receiver - State proxy object
 * @param handler - State handler containing engine and updater references
 * @returns Result of the set operation
 * @throws {Error} STATE-202 - When required parent info or list index is missing
 */
export function setByRef(
    target   : object, 
    ref      : IStatePropertyRef,
    value    : unknown, 
    receiver : IStateProxy,
    handler  : IStateHandler
): unknown {
  // Check if this path represents an element in a list
  const isElements = handler.engine.pathManager.elements.has(ref.info.pattern);
  let parentRef: IStatePropertyRef | null = null;
  let swapInfo: IListSnapshot | null = null;
  // Prepare swapInfo for elements to track value swapping in lists
  if (isElements) {
    parentRef = ref.parentRef ?? raiseError({
      code: 'STATE-202',
      message: 'propRef.stateProp.parentInfo is undefined',
      context: { where: 'StateClass.setByRef', scope: 'element', refPath: ref.info.pattern },
      docsUrl: './docs/error-codes.md#state',
    });
    // Get or create swap info for tracking list element changes
    swapInfo = handler.updater.swapInfoByRef.get(parentRef) || null;
    if (swapInfo === null) {
      const parentValue = receiver[GetByRefSymbol](parentRef) ?? [];
      if (!Array.isArray(parentValue)) {
        raiseError({
          code: 'STATE-202',
          message: 'Expected array value for list elements',
          context: { where: 'StateClass.setByRef', scope: 'element', refPath: parentRef.info.pattern },
          docsUrl: './docs/error-codes.md#state',
        });
      }
      swapInfo = {
        value: [...parentValue as unknown[]],
        listIndexes: [...(receiver[GetListIndexesByRefSymbol](parentRef) ?? [])]
      }
      handler.updater.swapInfoByRef.set(parentRef, swapInfo);
    }
  }
  try {
    // If getters with parent-child relationships exist, set value through external dependencies
    // TODO: When getter exists in state (path prefix matches), retrieve via getter
    if (handler.engine.stateOutput.startsWith(ref.info) && 
        handler.engine.pathManager.setters.intersection(ref.info.cumulativePathSet).size === 0) {
      return handler.engine.stateOutput.set(ref, value);
    }
    // If property exists directly in target, set via setter
    if (ref.info.pattern in target) {
      // Push current ref onto stack for scope tracking during setter execution
      handler.refIndex++;
      if (handler.refIndex >= handler.refStack.length) {
        handler.refStack.push(null);
      }
      handler.refStack[handler.refIndex] = handler.lastRefStack = ref;
      try {
        // Execute the setter
        return Reflect.set(target, ref.info.pattern, value, receiver);
      } finally {
        // Always restore ref stack state
        handler.refStack[handler.refIndex] = null;
        handler.refIndex--;
        handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
      }
    } else {
      // Property doesn't exist directly, need to traverse parent hierarchy
      const parentInfo = ref.info.parentInfo ?? raiseError({
        code: 'STATE-202',
        message: 'propRef.stateProp.parentInfo is undefined',
        context: { where: 'StateClass.setByRef', refPath: ref.info.pattern },
        docsUrl: './docs/error-codes.md#state',
      });
      // Calculate parent list index based on wildcard hierarchy
      const parentListIndex = parentInfo.wildcardCount < ref.info.wildcardCount 
        ? (ref.listIndex?.parentListIndex ?? null) 
        : ref.listIndex;
      const parentRef = getStatePropertyRef(parentInfo, parentListIndex);
      // Get the parent value to set property on
      const parentValue = getByRef(target, parentRef, receiver, handler);
      if (parentValue === null || typeof parentValue !== "object") {
        raiseError({
          code: 'STATE-202',
          message: 'Parent value is not an object',
          context: { where: 'StateClass.setByRef', refPath: parentRef.info.pattern },
          docsUrl: './docs/error-codes.md#state',
        });
      }
      const lastSegment = ref.info.lastSegment;
      // Handle wildcard (array element) vs named property
      if (lastSegment === "*") {
        const index = ref.listIndex?.index ?? raiseError({
          code: 'STATE-202',
          message: 'propRef.listIndex?.index is undefined',
          context: { where: 'StateClass.setByRef', refPath: ref.info.pattern },
          docsUrl: './docs/error-codes.md#state',
        });
        return Reflect.set(parentValue, index, value);
      } else {
        return Reflect.set(parentValue, lastSegment, value);
      }
    }
  } finally {
    // Always register this ref for update processing
    handler.updater.enqueueRef(ref);
    if (isElements) {
      // Handle list element swap tracking
      const index = swapInfo!.value.indexOf(value);
      const currentListIndexes = receiver[GetListIndexesByRefSymbol](parentRef!) ?? [];
      const curIndex = ref.listIndex!.index; 
      // Assign list index from swap info or create new one
      const listIndex = (index !== -1) ? swapInfo!.listIndexes[index] : createListIndex(parentRef!.listIndex, -1);
      currentListIndexes[curIndex] = listIndex;
      // Check for duplicates to determine if swap is complete
      // If no duplicates, consider swap complete and update indexes
      const parentValue = receiver[GetByRefSymbol](parentRef!) ?? [];
      if (parentValue === null || !Array.isArray(parentValue)) {
        raiseError({
          code: 'STATE-202',
          message: 'Parent value is not an array during swap check',
          context: { where: 'StateClass.setByRef', scope: 'element swap', refPath: parentRef!.info.pattern },
          docsUrl: './docs/error-codes.md#state',
        });
      }
      const listValueSet = new Set(parentValue);
      if (listValueSet.size === swapInfo!.value.length) {
        // Swap complete, renormalize indexes to match current positions
        for(let i = 0; i < currentListIndexes.length; i++) {
          currentListIndexes[i].index = i;
        }
        // Delete swapInfo as swap is complete
        handler.updater.swapInfoByRef.delete(parentRef!);
      }
    }
  }
}
