import { IFilterText } from "../../BindingBuilder/types";
import { FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types.js";
import { GetByRefSymbol, GetListIndexesByRefSymbol } from "../../StateClass/symbols.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { IStructuredPathInfo } from "../../StateProperty/types.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IRenderer } from "../../Updater/types.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { createBindingFilters } from "../BindingFilter.js";
import { IBindContent, IBinding } from "../types";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
import { CreateBindingNodeFn } from "./types";

type BindContext = {
  where: string;
  bindName: string;
  statePath: string;
};

type ListDiffResult = {
  hasRemoves: boolean; // at least one remove
  willRemoveAll: boolean; // all items will be removed
  hasAdds: boolean; // at least one add
  isAllNew: boolean; // all items are new
}

type ElementsResult = {
  changes: IListIndex[];
  overwrites: IListIndex[];
}

const TOO_MANY_BIND_CONTENTS_THRESHOLD = 1000;

// Reusable DocumentFragment for DOM operations, minimizes GC overhead
const workFragment = document.createDocumentFragment();

/**
 * BindingNode for loop rendering (for binding).
 * Manages BindContent instances for each list element with efficient diff detection and pooling.
 */
class BindingNodeFor extends BindingNodeBlock {
  private _bindContents: IBindContent[] = [];
  private _bindContentByListIndex: WeakMap<IListIndex, IBindContent> = new WeakMap();
  private _bindContentPool: (IBindContent | null)[] = [];
  private _bindContentPoolSize: number = 0;
  private _bindContentPoolIndex: number = -1;
  private _cacheLoopInfo: IStructuredPathInfo | undefined = undefined;
  private _oldListIndexes: IListIndex[] = [];
  private _oldListIndexSet: Set<IListIndex> = new Set();

  /**
   * Returns array of active BindContent instances for each list element.
   * 
   * @returns Array of IBindContent instances
   */
  get bindContents(): IBindContent[] {
    return this._bindContents;
  }

  /**
   * Returns structured path info for loop with wildcard (lazy-initialized).
   * 
   * @returns IStructuredPathInfo for loop elements
   */
  private get _loopInfo(): IStructuredPathInfo {
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
  private get _elementsPath(): string {
    return `${this.binding.bindingState.info.pattern}.*`;
  }

  private _getBindContentFromPool(): IBindContent | null {
    if (this._bindContentPoolIndex >= 0) {
      const bindContent = this._bindContentPool[this._bindContentPoolIndex];
      this._bindContentPool[this._bindContentPoolIndex] = null;
      this._bindContentPoolIndex--;
      return bindContent;
    }
    return null;
  }

  /**
   * Creates or reuses BindContent from pool for given list index.
   * 
   * @param renderer - Renderer instance (unused)
   * @param listIndex - List index for new BindContent
   * @returns Created or reused IBindContent instance
   */
  private _createBindContent(listIndex: IListIndex): IBindContent {
    let bindContent: IBindContent | null = this._getBindContentFromPool();
    if (bindContent !== null) {
      bindContent.assignListIndex(listIndex);
    } else {
      const loopRef = getStatePropertyRef(this._loopInfo, listIndex);
      bindContent = createBindContent(
        this.binding,
        this.id,
        this.binding.engine,
        loopRef
      );
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
  private _deleteBindContent(bindContent: IBindContent): void {
    bindContent.unmount();
    bindContent.inactivate();
  }

  /**
   * Not implemented. Use applyChange for list updates.
   * 
   * @param value - Value (unused)
   * @throws BIND-301 Not implemented
   */
  assignValue(_value: unknown) {
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
   * @param parentNode - Parent node containing the node
   * @param lastContent - Last BindContent in the current list
   * @returns Boolean indicating if removal was successful
   */
  private _allRemove(
    parentNode: ParentNode, 
    lastContent: IBindContent
  ): boolean {
    let workFirstNode: Node | null = parentNode.firstChild;
    while(workFirstNode && workFirstNode.nodeType === Node.TEXT_NODE && workFirstNode.textContent?.trim() === "") {
      workFirstNode = workFirstNode.nextSibling;
    }
    let workLastNode: Node | null = parentNode.lastChild;
    while(workLastNode && workLastNode.nodeType === Node.TEXT_NODE && workLastNode.textContent?.trim() === "") {
      workLastNode = workLastNode.previousSibling;
    }
    if (workFirstNode === this.node && workLastNode === lastContent.lastNode) {
      // safe to clear all, needless to unmount each
      parentNode.textContent = "";
      parentNode.append(this.node);
      return true;
    } else {
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
  private _partialRemove(
    newListIndexesSet: Set<IListIndex>, 
    oldListIndexesSet: Set<IListIndex>, 
    bindContentByListIndex: WeakMap<IListIndex, IBindContent>,
    baseContext: BindContext
  ): IBindContent[] {
    const removeBindContents: IBindContent[] = [];
    for(const oldListIndex of oldListIndexesSet) {
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
  private _poolBindContents(bindContents: IBindContent[]): void {
    // exhaust pool first
    if (this._bindContentPoolIndex === -1) {
      this._bindContentPool = bindContents;
      this._bindContentPoolSize = bindContents.length;
      this._bindContentPoolIndex = this._bindContentPoolSize - 1;
      return;
    }
    // full pool expansion
    if (this._bindContentPoolSize === (this._bindContentPoolIndex + 1)) {
      if (bindContents.length > TOO_MANY_BIND_CONTENTS_THRESHOLD) {
        // large batch, concat for stack overflow safety
        this._bindContentPool = this._bindContentPool.concat(bindContents);
      } else {
        this._bindContentPool.push(...bindContents);
      }
      this._bindContentPoolSize = this._bindContentPool.length;
      this._bindContentPoolIndex += bindContents.length;
      return;
    }
    const availableSpace = this._bindContentPoolSize - (this._bindContentPoolIndex + 1);
    const neededSpace = bindContents.length;
    if (neededSpace <= availableSpace) {
      // enough space available
      for(let i = 0; i < bindContents.length; i++) {
        this._bindContentPoolIndex++;
        this._bindContentPool[this._bindContentPoolIndex] = bindContents[i];
      }
    } else {
      // expand pool
      for(let i = 0; i < bindContents.length; i++) {
        this._bindContentPoolIndex++;
        if (this._bindContentPoolIndex >= this._bindContentPoolSize) {
          this._bindContentPool.push(bindContents[i]);
        } else {
          this._bindContentPool[this._bindContentPoolIndex] = bindContents[i];
        }
      }
      this._bindContentPoolSize = this._bindContentPool.length;
    }
  }

  /**
   * Clears all active BindContents.
   * for _allRemove optimization.
   * needless to unmount each BindContent.
   */
  private _clearBindContents(): void {
    for(let i = 0; i < this._bindContents.length; i++) {
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
  private _getListDiffResult(
    newListIndexSet: Set<IListIndex>, 
    oldListIndexSet: Set<IListIndex>
  ): ListDiffResult {
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
      } else {
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
  private _getElementsResult(
    renderer: IRenderer, 
    elementsPath: string, 
    oldListIndexSet: Set<IListIndex>,
    baseContext: BindContext
  ): ElementsResult {
    const changes: IListIndex[] = [];
    const overwrites: IListIndex[] = [];
    for(const updatingRef of renderer.updatingRefSet) {
      if (updatingRef.info.pattern !== elementsPath) {continue;}
      /* v8 ignore start -- branch covered by tests but v8 reports partial coverage */
      if (renderer.processedRefs.has(updatingRef)) {continue;}
      /* v8 ignore stop */
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
      } else {
        overwrites.push(listIndex);
      }
      renderer.processedRefs.add(updatingRef);
    }
    return { changes, overwrites };
  }

  /**
   * Applies changes using document fragment for efficient DOM updates.
   * 
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
  private _applyChange(
    renderer: IRenderer,
    parentNode: ParentNode,
    firstNode: Node,
    oldListIndexes: IListIndex[],
    oldListIndexSet: Set<IListIndex>,
    newListIndexes: IListIndex[],
    bindContentByListIndex: WeakMap<IListIndex, IBindContent>,
    bindingsByListIndex: WeakMap<IListIndex, Set<IBinding>>,
    baseContext: BindContext
  ): IBindContent[] {
    const newBindContents: IBindContent[] = [];
    let lastBindContent = null;

    // Rebuild path: create/reuse BindContents in new order
    const oldIndexByListIndex = new Map<IListIndex, number>();
    for(let i = 0; i < oldListIndexes.length; i++) {
      oldIndexByListIndex.set(oldListIndexes[i], i);
    }
    const changeListIndexes: IListIndex[] = [];
    for(let i = 0; i < newListIndexes.length; i++) {
      const listIndex = newListIndexes[i];
      const lastNode = lastBindContent?.lastNode ?? firstNode;
      let bindContent;
      if (!oldListIndexSet.has(listIndex)) {
        bindContent = this._createBindContent(listIndex);
        bindContent.mountAfter(parentNode, lastNode);
        bindContent.applyChange(renderer);
      } else {
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
          bindContent.mountAfter(parentNode, lastNode);
        }
        const oldIndex = oldIndexByListIndex.get(listIndex);
        if (typeof oldIndex !== "undefined" && oldIndex !== i) {
          changeListIndexes.push(listIndex);
        }
      }
      newBindContents.push(bindContent);
      lastBindContent = bindContent;
    }
    for(const listIndex of changeListIndexes) {
      const bindings = bindingsByListIndex.get(listIndex) ?? [];
      for(const binding of bindings) {
        if (!binding.bindingNode.renderable) {continue;}
        if (renderer.updatedBindings.has(binding)) {continue;}
        binding.applyChange(renderer);
      }
    }
    return newBindContents;
  }

  /**
   *  Reorders BindContents based on detected changes.
   * 
   * @param parentNode - Parent DOM node
   * @param firstNode - First child node of the parent
   * @param changes - List of changes detected
   * @param bindContents - Current array of bind contents
   * @param bindContentByListIndex - WeakMap of list indexes to bind contents
   * @param baseContext - Context for error reporting
   */
  private _reorder(
    parentNode: ParentNode,
    firstNode: Node,
    changes: IListIndex[],
    bindContents: IBindContent[],
    bindContentByListIndex: WeakMap<IListIndex, IBindContent>,
    baseContext: BindContext
  ): void {
    const changeIndexes = changes;
    changeIndexes.sort((a, b) => a.index - b.index);
    for(const listIndex of changeIndexes) {
      const bindContent = bindContentByListIndex.get(listIndex);
      if (typeof bindContent === "undefined") {
        raiseError({
          code: 'BIND-201',
          message: 'BindContent not found',
          context: { ...baseContext, phase: 'reorder', listIndex: listIndex.index },
          docsUrl: './docs/error-codes.md#bind',
        });
      }
      bindContents[listIndex.index] = bindContent;
      const lastNode = bindContents[listIndex.index - 1]?.lastNode ?? firstNode;
      bindContent.mountAfter(parentNode, lastNode);
    }
  }

  /**
   *  Applies overwrites to BindContents based on detected changes.
   * 
   * @param renderer - Renderer instance
   * @param overwrites - List of changes detected
   * @param bindContents - Current array of bind contents
   * @param bindContentByListIndex - WeakMap of list indexes to bind contents
   * @param baseContext - Context for error reporting
   */
  private _overwrite(
    renderer: IRenderer,
    overwrites: IListIndex[],
    bindContentByListIndex: WeakMap<IListIndex, IBindContent>,
    baseContext: BindContext
  ): void {
    for(let i = 0; i < overwrites.length; i++) {
      const listIndex = overwrites[i];
      const bindContent = bindContentByListIndex.get(listIndex);
      /* v8 ignore start -- defensive: unreachable when isReorder=true requires hasAdds=false */
      if (typeof bindContent === "undefined") {
        raiseError({
          code: 'BIND-201',
          message: 'BindContent not found',
          context: { ...baseContext, phase: 'overwrites', listIndex: listIndex.index },
          docsUrl: './docs/error-codes.md#bind',
        });
      }
      /* v8 ignore stop */
      bindContent.applyChange(renderer);
    }
  }

  /**
   * replaces BindContents optimally when all items are new.
   * 
   * @param parentNode - Parent DOM node
   * @param firstNode - First child node of the parent
   * @param renderer - Renderer instance
   * @param oldListIndexes - Previous list indexes
   * @param newListIndexes - New list indexes
   * @param bindContentByListIndex - WeakMap of list indexes to bind contents
   * @param bindContents - Current array of bind contents
   * @param baseContext - Context for error reporting
   * @returns removed IBindContent instances
   */
  private _optimizedReplace(
    parentNode: ParentNode,
    firstNode: Node,
    renderer: IRenderer,
    oldListIndexes: IListIndex[],
    newListIndexes: IListIndex[],
    bindContentByListIndex: WeakMap<IListIndex, IBindContent>,
    bindContents: IBindContent[],
    baseContext: BindContext
  ): IBindContent[] {
    const removeBindContents: IBindContent[] = [];
    // Note: isAllNew is only true when newListIndexes.length > 0
    // so oldListIndexes.length === 0 && newListIndexes.length === 0 case is unreachable
    if (oldListIndexes.length > newListIndexes.length) {
      for(let i = newListIndexes.length; i < oldListIndexes.length; i++) {
        const listIndex = oldListIndexes[i];
        const bindContent = bindContentByListIndex.get(listIndex);
        if (typeof bindContent === "undefined") {
          raiseError({
            code: 'BIND-201',
            message: 'BindContent not found',
            context: { ...baseContext, phase: 'optimized replace', listIndex: listIndex.index },
            docsUrl: './docs/error-codes.md#bind',
          });
        }
        this._deleteBindContent(bindContent);
        removeBindContents.push(bindContent);
      }
      bindContents.length = newListIndexes.length;
    }
    const minBindContentsLength = Math.min(oldListIndexes.length, newListIndexes.length);
    for(let i = 0; i < minBindContentsLength; i++) {
      const listIndex = newListIndexes[i];
      const bindContent = bindContents[i];
      bindContent.assignListIndex(listIndex);
      bindContent.activate();
      bindContent.applyChange(renderer);
      bindContentByListIndex.set(listIndex, bindContent);
    }
    if (oldListIndexes.length < newListIndexes.length) {
      let replaceParentNode: ParentNode = parentNode;
      const useFragement = oldListIndexes.length === 0 && parentNode.isConnected;
      if (useFragement) {
        workFragment.textContent = "";
        replaceParentNode = workFragment;
        replaceParentNode.append(firstNode);
      }
      let lastBindContent: IBindContent | null = null;
      for(let i = oldListIndexes.length; i < newListIndexes.length; i++) {
        const listIndex = newListIndexes[i];
        const lastNode = lastBindContent?.lastNode ?? firstNode;
        const bindContent = this._createBindContent(listIndex);
        bindContent.mountAfter(replaceParentNode, lastNode);
        bindContent.applyChange(renderer);
        bindContents.push(bindContent);
        lastBindContent = bindContent;
      }
      if (useFragement) {
        parentNode.append(replaceParentNode);
      }
    }
    return removeBindContents;
  }
  /**
   * Applies list changes using diff detection algorithm.
   * Handles adds, removes, reorders, and overwrites efficiently.
   * 
   * @param renderer - Renderer instance for state access
   * @throws BIND-201 ListIndex is null, BindContent not found, ParentNode is null, Last content is null
   */
  applyChange(renderer: IRenderer): void {
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
    const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
    const newListIndexesSet = new Set<IListIndex>(newListIndexes);
    
    const listDiff = this._getListDiffResult(newListIndexesSet, this._oldListIndexSet);
    const elementsResult = this._getElementsResult(renderer, this._elementsPath, this._oldListIndexSet, baseContext);

    let optimizedReplaceDone = false;

    if (listDiff.isAllNew) {
      const removeBindContents = this._optimizedReplace(
        parentNode,
        this.node,
        renderer,
        this._oldListIndexes,
        newListIndexes,
        this._bindContentByListIndex,
        this._bindContents,
        baseContext
      );
      if (removeBindContents.length > 0) {
        this._poolBindContents(removeBindContents);
      }
      optimizedReplaceDone = true;
    }

    // Optimization: clear all if new list is empty
    let isCleared = false;
    if (!optimizedReplaceDone && listDiff.willRemoveAll) {
      /* v8 ignore start -- defensive: willRemoveAll requires oldSize>0, so bindContents is never empty here */
      const lastContent = this.bindContents[this.bindContents.length - 1] ?? raiseError({
        code: 'BIND-201',
        message: 'Last BindContent not found',
        context: { ...baseContext, bindContentCount: this.bindContents.length },
        docsUrl: './docs/error-codes.md#bind',
      });
      /* v8 ignore stop */

      isCleared = this._allRemove(parentNode, lastContent);
      if (isCleared) {
        this._clearBindContents();
      }
    }

    // Handle removes: unmount and pool BindContents
    if (!optimizedReplaceDone && !isCleared && listDiff.hasRemoves) {
      const removeBindContents = this._partialRemove(
        newListIndexesSet, this._oldListIndexSet, this._bindContentByListIndex, baseContext
      );
      if (removeBindContents.length > 0) {
        this._poolBindContents(removeBindContents);
        // Update _bindContents to remove deleted entries
        if (!listDiff.hasAdds) {
          const removeSet = new Set(removeBindContents);
          this._bindContents = this._bindContents.filter(bc => !removeSet.has(bc));
        }
      }
    }

    // Optimization: reorder-only path when no adds/removes
    const isReorder = !listDiff.hasAdds && !listDiff.hasRemoves &&
      (elementsResult.changes.length > 0 || elementsResult.overwrites.length > 0 );

    if (!optimizedReplaceDone && listDiff.hasAdds) {
      // Rebuild path: create/reuse BindContents in new order
      this._bindContents = this._applyChange(
        renderer,
        parentNode,
        this.node,
        this._oldListIndexes,
        this._oldListIndexSet,
        newListIndexes,
        this._bindContentByListIndex,
        this.binding.bindingsByListIndex,
        baseContext
      );
    } else if (!optimizedReplaceDone && isReorder) {
      // Reorder path: only move DOM nodes without recreating
      if (elementsResult.changes.length > 0) {
        this._reorder(
          parentNode,
          this.node,
          elementsResult.changes,
          this._bindContents,
          this._bindContentByListIndex,
          baseContext
        );
      }
      if (elementsResult.overwrites.length > 0) {
        this._overwrite(
          renderer,
          elementsResult.overwrites,
          this._bindContentByListIndex,
          baseContext
        );
      }
    }

    // Update state for next diff detection
    this._oldListIndexes = [...newListIndexes];
    this._oldListIndexSet = newListIndexesSet;
  }

  /**
   * Inactivates all BindContents and resets state.
   */
  inactivate(): void {
    for(let i = 0; i < this._bindContents.length; i++) {
      const bindContent = this._bindContents[i];
      bindContent.unmount();
      bindContent.inactivate();
    }
    this._poolBindContents(this._bindContents);
    this._bindContents = [];
    this._bindContentByListIndex = new WeakMap();
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
export const createBindingNodeFor: CreateBindingNodeFn = 
(name: string, filterTexts: IFilterText[], decorates: string[]) => 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeFor(binding, node, name, "", filterFns, decorates);
  }
