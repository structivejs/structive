import { GetByRefSymbol, GetListIndexesByRefSymbol } from "../../StateClass/symbols.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { createBindingFilters } from "../BindingFilter.js";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
const TOO_MANY_BIND_CONTENTS_WARNING_THRESHOLD = 1000;
/**
 * BindingNode for loop rendering (for binding).
 * Manages BindContent instances for each list element with efficient diff detection and pooling.
 */
class BindingNodeFor extends BindingNodeBlock {
    _bindContents = [];
    _bindContentByListIndex = new WeakMap();
    _bindContentPool = [];
    _bindContentLastIndex = 0;
    _cacheLoopInfo = undefined;
    _oldList = undefined;
    _oldListIndexes = [];
    _oldListIndexSet = new Set();
    /**
     * Returns array of active BindContent instances for each list element.
     *
     * @returns Array of IBindContent instances
     */
    get bindContents() {
        return this._bindContents;
    }
    /**
     * Returns current pool size.
     *
     * @returns Number of BindContent instances in pool
     */
    get _poolLength() {
        return this._bindContentPool.length;
    }
    /**
     * Sets pool size, truncating if smaller than current size.
     *
     * @param length - New pool length
     * @throws BIND-202 Length is negative
     */
    set _poolLength(length) {
        if (length < 0) {
            raiseError({
                code: 'BIND-202',
                message: 'BindContent pool length is negative',
                context: { where: 'BindingNodeFor.setPoolLength', bindName: this.name, requestedLength: length },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        this._bindContentPool.length = length;
    }
    /**
     * Returns structured path info for loop with wildcard (lazy-initialized).
     *
     * @returns IStructuredPathInfo for loop elements
     */
    get _loopInfo() {
        if (typeof this._cacheLoopInfo === "undefined") {
            this._cacheLoopInfo = getStructuredPathInfo(this._elementsPath);
        }
        return this._cacheLoopInfo;
    }
    /**
     * Returns elements path for loop elements.
     *
     * @returns String path for loop elements
     */
    get _elementsPath() {
        return `${this.binding.bindingState.info.pattern}.*`;
    }
    /**
     * Creates or reuses BindContent from pool for given list index.
     *
     * @param renderer - Renderer instance (unused)
     * @param listIndex - List index for new BindContent
     * @returns Created or reused IBindContent instance
     */
    _createBindContent(listIndex) {
        let bindContent;
        if (this._bindContentLastIndex >= 0) {
            bindContent = this._bindContentPool[this._bindContentLastIndex];
            this._bindContentLastIndex--;
            bindContent.assignListIndex(listIndex);
        }
        else {
            const loopRef = getStatePropertyRef(this._loopInfo, listIndex);
            bindContent = createBindContent(this.binding, this.id, this.binding.engine, loopRef);
        }
        this._bindContentByListIndex.set(listIndex, bindContent);
        bindContent.activate();
        return bindContent;
    }
    /**
     * Unmounts and inactivates BindContent (returned to pool later).
     *
     * @param bindContent - BindContent to delete
     */
    _deleteBindContent(bindContent) {
        bindContent.unmount();
        bindContent.inactivate();
    }
    /**
     * Not implemented. Use applyChange for list updates.
     *
     * @param value - Value (unused)
     * @throws BIND-301 Not implemented
     */
    assignValue(_value) {
        raiseError({
            code: 'BIND-301',
            message: 'Binding assignValue not implemented',
            context: { where: 'BindingNodeFor.assignValue' },
            hint: 'Call applyChange to update loop bindings',
            docsUrl: './docs/error-codes.md#bind',
        });
    }
    /**
     * Removes all BindContents and resets state.
     *
     * @param node - Node to remove from
     * @param parentNode - Parent node containing the node
     * @param bindContents - Array of BindContent instances
     * @param baseContext - Context for error reporting
     * @returns Boolean indicating if removal was successful
     */
    _allRemove(node, parentNode, bindContents, baseContext) {
        const lastContent = bindContents.at(-1) ?? raiseError({
            code: 'BIND-201',
            message: 'Last BindContent not found',
            context: { ...baseContext, bindContentCount: bindContents.length },
            docsUrl: './docs/error-codes.md#bind',
        });
        let firstNode = parentNode.firstChild;
        while (firstNode && firstNode.nodeType === Node.TEXT_NODE && firstNode.textContent?.trim() === "") {
            firstNode = firstNode.nextSibling;
        }
        let lastNode = parentNode.lastChild;
        while (lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent?.trim() === "") {
            lastNode = lastNode.previousSibling;
        }
        if (firstNode === node && lastNode === lastContent.getLastNode(parentNode)) {
            parentNode.textContent = "";
            parentNode.append(node);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Partially removes BindContents for removed list indexes.
     *
     * @param newListIndexesSet - Set of new list indexes
     * @param oldListIndexesSet - Set of old list indexes
     * @param bindContentByListIndex - WeakMap of list indexes to BindContents
     * @param baseContext - Context for error reporting
     * @returns Array of removed IBindContent instances
     */
    _partialRemove(newListIndexesSet, oldListIndexesSet, bindContentByListIndex, baseContext) {
        const removeBindContents = [];
        for (const oldListIndex of oldListIndexesSet) {
            if (!newListIndexesSet.has(oldListIndex)) {
                const bindContent = bindContentByListIndex.get(oldListIndex);
                if (typeof bindContent === "undefined") {
                    raiseError({
                        code: 'BIND-201',
                        message: 'BindContent not found',
                        context: { ...baseContext, phase: 'initial removes', listIndex: oldListIndex.index },
                        docsUrl: './docs/error-codes.md#bind',
                    });
                }
                this._deleteBindContent(bindContent);
                removeBindContents.push(bindContent);
            }
        }
        return removeBindContents;
    }
    /**
     * Pools BindContent instances for future reuse.
     *
     * @param bindContents - Array of IBindContent instances to pool
     */
    _poolBindContents(bindContents) {
        if (this._bindContentPool.length > 0) {
            if (bindContents.length < TOO_MANY_BIND_CONTENTS_WARNING_THRESHOLD) {
                this._bindContentPool.push(...bindContents);
            }
            else {
                this._bindContentPool = this._bindContentPool.concat(bindContents);
            }
        }
        else {
            this._bindContentPool = bindContents;
        }
    }
    /**
     * Clears all active BindContents.
     */
    _clearBindContents() {
        for (let i = 0; i < this._bindContents.length; i++) {
            this._bindContents[i].inactivate();
        }
        this._poolBindContents(this._bindContents);
        this._bindContents = [];
    }
    /**
     * Applies changes to the loop binding using diff detection.
     * Efficiently handles adds, removes, reorders, and overwrites.
     * @param newListIndexSet - Set of new list indexes
     * @param oldListIndexSet - Set of old list indexes
     * @returns ListDiffResult indicating the types of changes detected
     */
    _getListDiffResult(newListIndexSet, oldListIndexSet) {
        const oldSize = oldListIndexSet.size;
        const newSize = newListIndexSet.size;
        // edge case for empty lists
        if (oldSize === 0 && newSize === 0) {
            return { hasRemoves: false, willRemoveAll: false, hasAdds: false, isAllNew: false };
        }
        if (oldSize === 0) {
            return { hasRemoves: false, willRemoveAll: false, hasAdds: true, isAllNew: true };
        }
        if (newSize === 0) {
            return { hasRemoves: true, willRemoveAll: true, hasAdds: false, isAllNew: false };
        }
        // calculate removes and retains
        let removedCount = 0;
        let retainedCount = 0;
        for (const oldIndex of oldListIndexSet) {
            if (newListIndexSet.has(oldIndex)) {
                retainedCount++;
            }
            else {
                removedCount++;
            }
            // early exit: both remove and retain detected
            if (removedCount > 0 && retainedCount > 0) {
                break;
            }
        }
        const hasRemoves = removedCount > 0;
        const willRemoveAll = retainedCount === 0;
        // detect adds
        let addedCount = 0;
        for (const newIndex of newListIndexSet) {
            if (!oldListIndexSet.has(newIndex)) {
                addedCount++;
                break; // early exit: at least one add detected
            }
        }
        const hasAdds = addedCount > 0;
        const isAllNew = willRemoveAll && newSize > 0;
        return { hasRemoves, willRemoveAll, hasAdds, isAllNew };
    }
    /**
     * Retrieves elements result based on renderer updates.
     *
     * @param renderer - Renderer instance
     * @param elementsPath - Path to elements
     * @param oldListIndexSet - Set of old list indexes
     * @param baseContext - Context for error reporting
     * @returns ElementsResult containing changes and overwrites
     */
    _getElementsResult(renderer, elementsPath, oldListIndexSet, baseContext) {
        const changes = [];
        const overwrites = [];
        for (let i = 0; i < renderer.updatingRefs.length; i++) {
            const updatingRef = renderer.updatingRefs[i];
            if (updatingRef.info.pattern !== elementsPath) {
                continue;
            }
            if (renderer.processedRefs.has(updatingRef)) {
                continue;
            }
            const listIndex = updatingRef.listIndex;
            if (listIndex === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'ListIndex is null',
                    context: { ...baseContext, refPattern: updatingRef.info.pattern },
                    docsUrl: './docs/error-codes.md#bind',
                });
            }
            if (oldListIndexSet.has(listIndex)) {
                changes.push(listIndex);
            }
            else {
                overwrites.push(listIndex);
            }
            renderer.processedRefs.add(updatingRef);
        }
        return { changes, overwrites };
    }
    /**
     * Applies changes using document fragment for efficient DOM updates.
     *
     * @param useAllAppend - Whether to use document fragment for all appends
     * @param renderer - Renderer instance
     * @param parentNode - Parent DOM node
     * @param firstNode - First child node of the parent
     * @param oldListIndexes - Array of old list indexes
     * @param oldListIndexSet - Set of old list indexes
     * @param newListIndexes - Array of new list indexes
     * @param bindContentByListIndex - WeakMap of list indexes to bind contents
     * @param bindingsByListIndex - WeakMap of list indexes to bindings
     * @param baseContext - Context for error reporting
     * @returns Array of new bind contents
     */
    _applyChange(useAllAppend, renderer, parentNode, firstNode, oldListIndexes, oldListIndexSet, newListIndexes, bindContentByListIndex, bindingsByListIndex, baseContext) {
        const newBindContents = [];
        let lastBindContent = null;
        // Rebuild path: create/reuse BindContents in new order
        const oldIndexByListIndex = new Map();
        for (let i = 0; i < oldListIndexes.length; i++) {
            oldIndexByListIndex.set(oldListIndexes[i], i);
        }
        const fragmentParentNode = useAllAppend ? document.createDocumentFragment() : parentNode;
        const fragmentFirstNode = useAllAppend ? null : firstNode;
        const changeListIndexes = [];
        for (let i = 0; i < newListIndexes.length; i++) {
            const listIndex = newListIndexes[i];
            const lastNode = lastBindContent?.getLastNode(fragmentParentNode) ?? fragmentFirstNode;
            let bindContent;
            if (!oldListIndexSet.has(listIndex)) {
                bindContent = this._createBindContent(listIndex);
                bindContent.mountAfter(fragmentParentNode, lastNode);
                bindContent.applyChange(renderer);
            }
            else {
                bindContent = bindContentByListIndex.get(listIndex);
                if (typeof bindContent === "undefined") {
                    raiseError({
                        code: 'BIND-201',
                        message: 'BindContent not found',
                        context: { ...baseContext, phase: 'reuse', listIndex: listIndex.index },
                        docsUrl: './docs/error-codes.md#bind',
                    });
                }
                if (lastNode?.nextSibling !== bindContent.firstChildNode) {
                    bindContent.mountAfter(fragmentParentNode, lastNode);
                }
                const oldIndex = oldIndexByListIndex.get(listIndex);
                if (typeof oldIndex !== "undefined" && oldIndex !== i) {
                    changeListIndexes.push(listIndex);
                }
            }
            newBindContents.push(bindContent);
            lastBindContent = bindContent;
        }
        if (useAllAppend) {
            parentNode.insertBefore(fragmentParentNode, firstNode.nextSibling);
        }
        for (const listIndex of changeListIndexes) {
            const bindings = bindingsByListIndex.get(listIndex) ?? [];
            for (const binding of bindings) {
                if (renderer.updatedBindings.has(binding)) {
                    continue;
                }
                binding.applyChange(renderer);
            }
        }
        return newBindContents;
    }
    /**
     *  Reorders BindContents based on detected changes.
     *
     * @param renderer - Renderer instance
     * @param parentNode - Parent DOM node
     * @param firstNode - First child node of the parent
     * @param elementsResult - Result of elements diff detection
     * @param bindContents - Current array of bind contents
     * @param bindContentByListIndex - WeakMap of list indexes to bind contents
     * @param baseContext - Context for error reporting
     * @returns Array of reordered bind contents
     */
    _reorder(renderer, parentNode, firstNode, elementsResult, bindContents, bindContentByListIndex, baseContext) {
        let newBindContents = bindContents;
        if (elementsResult.changes.length > 0) {
            const workBindContents = bindContents;
            const changeIndexes = elementsResult.changes;
            changeIndexes.sort((a, b) => a.index - b.index);
            for (const listIndex of changeIndexes) {
                const bindContent = bindContentByListIndex.get(listIndex);
                if (typeof bindContent === "undefined") {
                    raiseError({
                        code: 'BIND-201',
                        message: 'BindContent not found',
                        context: { ...baseContext, phase: 'reorder', listIndex: listIndex.index },
                        docsUrl: './docs/error-codes.md#bind',
                    });
                }
                workBindContents[listIndex.index] = bindContent;
                const lastNode = workBindContents[listIndex.index - 1]?.getLastNode(parentNode) ?? firstNode;
                bindContent.mountAfter(parentNode, lastNode);
            }
            newBindContents = workBindContents;
        }
        if (elementsResult.overwrites.length > 0) {
            for (let i = 0; i < elementsResult.overwrites.length; i++) {
                const listIndex = elementsResult.overwrites[i];
                const bindContent = bindContentByListIndex.get(listIndex);
                if (typeof bindContent === "undefined") {
                    raiseError({
                        code: 'BIND-201',
                        message: 'BindContent not found',
                        context: { ...baseContext, phase: 'overwrites', listIndex: listIndex.index },
                        docsUrl: './docs/error-codes.md#bind',
                    });
                }
                bindContent.applyChange(renderer);
            }
        }
        return newBindContents;
    }
    /**
     * Applies list changes using diff detection algorithm.
     * Handles adds, removes, reorders, and overwrites efficiently.
     *
     * @param renderer - Renderer instance for state access
     * @throws BIND-201 ListIndex is null, BindContent not found, ParentNode is null, Last content is null
     */
    applyChange(renderer) {
        let newBindContents = [];
        const baseContext = {
            where: 'BindingNodeFor.applyChange',
            bindName: this.name,
            statePath: this.binding.bindingState.pattern,
        };
        // Ensure parent node exists
        const parentNode = this.node.parentNode ?? raiseError({
            code: 'BIND-201',
            message: 'Parent node not found',
            context: { ...baseContext, nodeType: this.node.nodeType },
            docsUrl: './docs/error-codes.md#bind',
        });
        // Detect changes: adds, removes, changeIndexes, overwrites
        const newList = renderer.readonlyState[GetByRefSymbol](this.binding.bindingState.ref);
        if (!Array.isArray(newList)) {
            raiseError({
                code: 'BIND-201',
                message: 'Loop value is not array',
                context: { ...baseContext, receivedType: newList === null ? 'null' : typeof newList },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        const oldList = typeof this._oldList === "undefined" ? [] : this._oldList;
        if (!Array.isArray(oldList)) {
            raiseError({
                code: 'BIND-201',
                message: 'Previous loop value is not array',
                context: { ...baseContext, receivedType: oldList === null ? 'null' : typeof oldList },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
        const newListIndexesSet = new Set(newListIndexes);
        const listDiff = this._getListDiffResult(newListIndexesSet, this._oldListIndexSet);
        const elementsResult = this._getElementsResult(renderer, this._elementsPath, this._oldListIndexSet, baseContext);
        // Optimization: clear all if new list is empty
        let isCleared = false;
        if (listDiff.willRemoveAll) {
            isCleared = this._allRemove(this.node, parentNode, this._bindContents, baseContext);
            if (isCleared) {
                this._clearBindContents();
            }
        }
        // Handle removes: unmount and pool BindContents
        if (!isCleared && listDiff.hasRemoves) {
            const removeBindContents = this._partialRemove(newListIndexesSet, this._oldListIndexSet, this._bindContentByListIndex, baseContext);
            if (removeBindContents.length > 0) {
                this._poolBindContents(removeBindContents);
            }
        }
        // set pool length before creating new BindContents
        this._poolLength = this._bindContentPool.length;
        this._bindContentLastIndex = this._poolLength - 1;
        // Optimization: reorder-only path when no adds/removes
        const isReorder = !listDiff.hasAdds && !listDiff.hasRemoves &&
            (elementsResult.changes.length > 0 || elementsResult.overwrites.length > 0);
        if (!isReorder) {
            // Use document fragment only when all are appends and node is connected
            const useAllAppend = listDiff.isAllNew && parentNode.isConnected;
            newBindContents = this._applyChange(useAllAppend, renderer, parentNode, this.node, this._oldListIndexes, this._oldListIndexSet, newListIndexes, this._bindContentByListIndex, this.binding.bindingsByListIndex, baseContext);
        }
        else {
            // Reorder path: only move DOM nodes without recreating
            newBindContents = this._reorder(renderer, parentNode, this.node, elementsResult, this._bindContents, this._bindContentByListIndex, baseContext);
        }
        // Update state for next diff detection
        this._poolLength = this._bindContentLastIndex + 1;
        this._bindContents = newBindContents;
        this._oldList = [...newList];
        this._oldListIndexes = [...newListIndexes];
        this._oldListIndexSet = newListIndexesSet;
    }
    /**
     * Inactivates all BindContents and resets state.
     */
    inactivate() {
        for (let i = 0; i < this._bindContents.length; i++) {
            const bindContent = this._bindContents[i];
            bindContent.unmount();
            bindContent.inactivate();
        }
        this._bindContentPool.push(...this._bindContents);
        this._bindContents = [];
        this._bindContentByListIndex = new WeakMap();
        this._bindContentLastIndex = 0;
        this._oldList = undefined;
        this._oldListIndexes = [];
        this._oldListIndexSet = new Set();
    }
}
/**
 * Factory function to create BindingNodeFor instances.
 *
 * @param name - Binding name (list property path)
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeFor with binding, node, and filters
 */
export const createBindingNodeFor = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeFor(binding, node, name, "", filterFns, decorates);
};
