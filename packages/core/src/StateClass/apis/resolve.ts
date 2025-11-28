/**
 * resolve.ts
 *
 * Implementation of resolve function for StateClass API to get/set State values
 * by specifying path and indexes.
 *
 * Main responsibilities:
 * - Gets or sets State values from string path and index array
 * - Supports paths with wildcards and nested loops
 * - Executes get (getByRef) when value not specified, set (setByRef) when specified
 *
 * Design points:
 * - Parses path with getStructuredPathInfo and resolves list indexes for each wildcard level
 * - Gets list index collection for each level via handler.engine.getListIndexesSet
 * - Centrally handles value get/set with getByRef/setByRef
 * - Enables flexible binding and API-based usage
 */
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { raiseError } from "../../utils.js";
import { IStateHandler, IStateProxy } from "../types";
import { IListIndex } from "../../ListIndex/types.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { GetListIndexesByRefSymbol, SetByRefSymbol } from "../symbols.js";
import { setByRef } from "../methods/setByRef.js";
import { getByRef } from "../methods/getByRef.js";

type ResolveFunction = (path: string, indexes: number[], value?: unknown) => unknown;

/**
 * Creates a resolve function to get/set State values by path and indexes.
 * @param target - Target object to access
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy for context
 * @param handler - State handler with engine and dependency tracking
 * @returns Function that accepts path, indexes, and optional value
 * @throws STATE-202 If indexes length insufficient or setting on readonly proxy
 * @throws LIST-201 If list index not found at any wildcard level
 */
export function resolve(
  target: object, 
  _prop: PropertyKey, 
  receiver: IStateProxy,
  handler: IStateHandler
): ResolveFunction {
  return (path: string, indexes: number[], value?: unknown): unknown => {
    const info = getStructuredPathInfo(path);
    const lastInfo = handler.lastRefStack?.info ?? null;
    if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
      // Register dependency if included in getters
      if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
        handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
      }
    }

    // Validate that enough indexes are provided for all wildcard levels
    if (info.wildcardParentInfos.length > indexes.length) {
      raiseError({
        code: 'STATE-202',
        message: `indexes length is insufficient: ${path}`,
        context: { path, expected: info.wildcardParentInfos.length, received: indexes.length },
        docsUrl: '/docs/error-codes.md#state',
        severity: 'error',
      });
    }
    // Resolve ListIndex for each wildcard level by walking through the hierarchy
    let listIndex: IListIndex | null = null;
    for(let i = 0; i < info.wildcardParentInfos.length; i++) {
      const wildcardParentPattern = info.wildcardParentInfos[i];
      // Get reference for current wildcard level
      const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
      // Access the value to ensure list exists
      getByRef(target, wildcardRef, receiver, handler);
      // Get all list indexes at this level
      const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
      if (listIndexes === null) {
        raiseError({
          code: 'LIST-201',
          message: `ListIndexes not found: ${wildcardParentPattern.pattern}`,
          context: { pattern: wildcardParentPattern.pattern },
          docsUrl: '/docs/error-codes.md#list',
          severity: 'error',
        });
      }
      // Get the specific list index for this level using provided index
      const index = indexes[i];
      listIndex = listIndexes[index] ?? raiseError({
        code: 'LIST-201',
        message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
        context: { pattern: wildcardParentPattern.pattern, index },
        docsUrl: '/docs/error-codes.md#list',
        severity: 'error',
      });
    }

    // Create reference with resolved list index and perform get or set
    // Determine if Writable or Readonly and call appropriate method
    const ref = getStatePropertyRef(info, listIndex);
    const hasSetValue = typeof value !== "undefined";
    // Check if receiver supports setting (has SetByRefSymbol)
    if (SetByRefSymbol in receiver) {
      if (!hasSetValue) {
        return getByRef(target, ref, receiver, handler);
      } else {
        setByRef(target, ref, value, receiver, handler);
      }
    } else {
      if (!hasSetValue) {
        return getByRef(target, ref, receiver, handler);
      } else {
        // Cannot set on readonly proxy
        raiseError({
          code: 'STATE-202',
          message: `Cannot set value on a readonly proxy: ${path}`,
          context: { path },
          docsUrl: '/docs/error-codes.md#state',
          severity: 'error',
        });
      }
    }
  };
} 