/**
 * getAll
 *
 * Retrieves all elements as an array from a State path containing wildcards.
 * Throws: LIST-201 (unresolved index), BIND-201 (wildcard information inconsistency)
 */
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { raiseError } from "../../utils.js";
import { getContextListIndex } from "../methods/getContextListIndex";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { resolve } from "./resolve.js";
import { getByRef } from "../methods/getByRef.js";
import { GetListIndexesByRefSymbol } from "../symbols.js";
/**
 * Creates a function to retrieve all elements from a wildcard path.
 * @param target - Target object to retrieve from
 * @param prop - Property key (unused but part of signature)
 * @param receiver - State proxy for context
 * @param handler - State handler with engine and dependency tracking
 * @returns Function that accepts path and optional indexes, returns array of values
 * @throws LIST-201 If list index not found
 * @throws BIND-201 If wildcard information is inconsistent
 */
export function getAll(target, prop, receiver, handler) {
    const resolveFn = resolve(target, prop, receiver, handler);
    return (path, _indexes) => {
        let indexes = _indexes;
        const info = getStructuredPathInfo(path);
        const lastInfo = handler.lastRefStack?.info ?? null;
        if (lastInfo !== null && lastInfo.pattern !== info.pattern) {
            // Register dependency if included in getters
            if (handler.engine.pathManager.onlyGetters.has(lastInfo.pattern)) {
                handler.engine.pathManager.addDynamicDependency(lastInfo.pattern, info.pattern);
            }
        }
        // If indexes not provided, try to extract from context
        if (typeof indexes === "undefined") {
            for (let i = 0; i < info.wildcardInfos.length; i++) {
                const wildcardPattern = info.wildcardInfos[i] ?? raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard info is missing',
                    context: {
                        where: 'StateClass.getAll',
                        wildcardIndex: i,
                        pattern: info.pattern,
                    },
                    docsUrl: './docs/error-codes.md#bind',
                });
                const listIndex = getContextListIndex(handler, wildcardPattern.pattern);
                if (listIndex) {
                    indexes = listIndex.indexes;
                    break;
                }
            }
            if (typeof indexes === "undefined") {
                indexes = [];
            }
        }
        /**
         * Recursively walks through wildcard patterns to collect all matching indexes.
         * @param wildcardParentInfos - Array of wildcard parent path infos
         * @param wildardIndexPos - Current position in wildcard hierarchy
         * @param listIndex - Current list index or null
         * @param indexes - Array of specified indexes (empty for all)
         * @param indexPos - Current position in indexes array
         * @param parentIndexes - Accumulated parent indexes
         * @param results - Output array to collect all matching index combinations
         */
        const walkWildcardPattern = (wildcardParentInfos, wildardIndexPos, listIndex, indexes, indexPos, parentIndexes, results) => {
            const wildcardParentPattern = wildcardParentInfos[wildardIndexPos] ?? null;
            // Base case: no more wildcards, add accumulated indexes to results
            if (wildcardParentPattern === null) {
                results.push(parentIndexes);
                return;
            }
            // Get the list at current wildcard level
            const wildcardRef = getStatePropertyRef(wildcardParentPattern, listIndex);
            getByRef(target, wildcardRef, receiver, handler);
            const listIndexes = receiver[GetListIndexesByRefSymbol](wildcardRef);
            if (listIndexes === null) {
                raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: {
                        where: 'StateClass.getAll',
                        pattern: wildcardParentPattern.pattern,
                    },
                    docsUrl: './docs/error-codes.md#list',
                });
            }
            const index = indexes[indexPos] ?? null;
            // If no specific index provided, iterate through all list items
            if (index === null) {
                for (let i = 0; i < listIndexes.length; i++) {
                    const listIndex = listIndexes[i];
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
            }
            else {
                // Specific index provided, use it
                const listIndex = listIndexes[index] ?? raiseError({
                    code: 'LIST-201',
                    message: `ListIndex not found: ${wildcardParentPattern.pattern}`,
                    context: {
                        where: 'StateClass.getAll',
                        pattern: wildcardParentPattern.pattern,
                        index,
                    },
                    docsUrl: './docs/error-codes.md#list',
                });
                // Continue to next wildcard level if exists
                if ((wildardIndexPos + 1) < wildcardParentInfos.length) {
                    walkWildcardPattern(wildcardParentInfos, wildardIndexPos + 1, listIndex, indexes, indexPos + 1, parentIndexes.concat(listIndex.index), results);
                }
                else {
                    // Reached the final wildcard layer, finalize the result
                    results.push(parentIndexes.concat(listIndex.index));
                }
            }
        };
        // Collect all matching index combinations
        const resultIndexes = [];
        walkWildcardPattern(info.wildcardParentInfos, 0, null, indexes, 0, [], resultIndexes);
        // Resolve values for each collected index combination
        const resultValues = [];
        for (let i = 0; i < resultIndexes.length; i++) {
            resultValues.push(resolveFn(info.pattern, resultIndexes[i]));
        }
        return resultValues;
    };
}
