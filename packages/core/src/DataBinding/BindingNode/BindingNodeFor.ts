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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
const USE_ALL_APPEND = (globalThis as any).__STRUCTIVE_USE_ALL_APPEND__ === true;

/**
 * BindingNode for loop rendering (for binding).
 * Manages BindContent instances for each list element with efficient diff detection and pooling.
 */
class BindingNodeFor extends BindingNodeBlock {
  private _bindContents: IBindContent[] = [];
  private _bindContentByListIndex: WeakMap<IListIndex, IBindContent> = new WeakMap();
  private _bindContentPool: IBindContent[] = [];
  private _bindContentLastIndex: number = 0;
  private _loopInfo: IStructuredPathInfo | undefined = undefined;
  private _oldList: unknown = undefined;
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
   * Returns last index of available BindContent in pool.
   * 
   * @returns Last pool index (-1 if pool is empty)
   */
  get bindContentLastIndex():number {
    return this._bindContentLastIndex;
  }

  /**
   * Sets last index of available BindContent in pool.
   * 
   * @param value - New last index value
   */
  set bindContentLastIndex(value:number) {
    this._bindContentLastIndex = value;
  }

  /**
   * Returns current pool size.
   * 
   * @returns Number of BindContent instances in pool
   */
  get poolLength():number {
    return this._bindContentPool.length;
  }

  /**
   * Sets pool size, truncating if smaller than current size.
   * 
   * @param length - New pool length
   * @throws BIND-202 Length is negative
   */
  set poolLength(length: number) {
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
  get loopInfo(): IStructuredPathInfo {
    if (typeof this._loopInfo === "undefined") {
      const loopPath = `${this.binding.bindingState.pattern  }.*`;
      this._loopInfo = getStructuredPathInfo(loopPath);
    }
    return this._loopInfo;
  }

  /**
   * Creates or reuses BindContent from pool for given list index.
   * 
   * @param renderer - Renderer instance (unused)
   * @param listIndex - List index for new BindContent
   * @returns Created or reused IBindContent instance
   */
  createBindContent(renderer: IRenderer, listIndex: IListIndex): IBindContent {
    let bindContent: IBindContent;
    if (this._bindContentLastIndex >= 0) {
      bindContent = this._bindContentPool[this._bindContentLastIndex];
      this._bindContentLastIndex--;
      bindContent.assignListIndex(listIndex);
    } else {
      const loopRef = getStatePropertyRef(this.loopInfo, listIndex);
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
  deleteBindContent(bindContent: IBindContent): void {
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
   * Applies list changes using diff detection algorithm.
   * Handles adds, removes, reorders, and overwrites efficiently.
   * 
   * @param renderer - Renderer instance for state access
   * @throws BIND-201 ListIndex is null, BindContent not found, ParentNode is null, Last content is null
   */
  applyChange(renderer: IRenderer): void {
    let newBindContents: IBindContent[] = [];
    const baseContext = {
      where: 'BindingNodeFor.applyChange',
      bindName: this.name,
      statePath: this.binding.bindingState.pattern,
    };

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
    const oldList = typeof this._oldList === "undefined" ? [] : this._oldList;
    if (!Array.isArray(oldList)) {
      raiseError({
        code: 'BIND-201',
        message: 'Previous loop value is not array',
        context: { ...baseContext, receivedType: oldList === null ? 'null' : typeof oldList },
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    const oldListLength = oldList.length ?? 0;
    const removesSet = newListIndexesSet.size === 0 
      ? this._oldListIndexSet 
      : this._oldListIndexSet.difference(newListIndexesSet);
    const addsSet = this._oldListIndexSet.size === 0 
      ? newListIndexesSet 
      : newListIndexesSet.difference(this._oldListIndexSet);
    const newListLength = newList?.length ?? 0;
    const changeIndexesSet = new Set<IListIndex>();
    const overwritesSet = new Set<IListIndex>();

    // Classify updating refs into changeIndexes or overwrites
    const elementsPath = `${this.binding.bindingState.info.pattern  }.*`;
    for(let i = 0; i < renderer.updatingRefs.length; i++) {
      const updatingRef = renderer.updatingRefs[i];
      if (updatingRef.info.pattern !== elementsPath) {continue;}
      if (renderer.processedRefs.has(updatingRef)) {continue;}
      const listIndex = updatingRef.listIndex;
      if (listIndex === null) {
        raiseError({
          code: 'BIND-201',
          message: 'ListIndex is null',
          context: { ...baseContext, refPattern: updatingRef.info.pattern },
          docsUrl: './docs/error-codes.md#bind',
        });
      }
      if (this._oldListIndexSet.has(listIndex)) {
        changeIndexesSet.add(listIndex);
      } else {
        overwritesSet.add(listIndex);
      }
      renderer.processedRefs.add(updatingRef);
    }
    const parentNode = this.node.parentNode ?? raiseError({
      code: 'BIND-201',
      message: 'Parent node not found',
      context: { ...baseContext, nodeType: this.node.nodeType },
      docsUrl: './docs/error-codes.md#bind',
    });
    const removeBindContentsSet = new Set<IBindContent>();
    const isAllRemove = (oldListLength === removesSet.size && oldListLength > 0);

    // Optimization: clear parent node if removing all elements
    let isParentNodeHasOnlyThisNode = false;
    if (isAllRemove) {
      const parentChildNodes = Array.from(parentNode.childNodes);
      const lastContent = this._bindContents.at(-1) ?? raiseError({
        code: 'BIND-201',
        message: 'Last BindContent not found',
        context: { ...baseContext, bindContentCount: this._bindContents.length },
        docsUrl: './docs/error-codes.md#bind',
      });
      let firstNode: Node | null = parentChildNodes[0];
      while(firstNode && firstNode.nodeType === Node.TEXT_NODE && firstNode.textContent?.trim() === "") {
        firstNode = firstNode.nextSibling;
      }
      let lastNode: Node | null = parentChildNodes.at(-1) ?? null;
      while(lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent?.trim() === "") {
        lastNode = lastNode.previousSibling;
      }
      if (firstNode === this.node && lastNode === lastContent.getLastNode(parentNode)) {
        isParentNodeHasOnlyThisNode = true;
      }
    }
    if (isAllRemove && isParentNodeHasOnlyThisNode) {
      parentNode.textContent = "";
      parentNode.append(this.node);
      for(let i = 0; i < this._bindContents.length; i++) {
        this._bindContents[i].inactivate();
      }
      this._bindContentPool.push(...this._bindContents);
    } else {
      if (removesSet.size > 0) {
        for(const listIndex of removesSet) {
          const bindContent = this._bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { ...baseContext, phase: 'removes', listIndex: listIndex.index },
              docsUrl: './docs/error-codes.md#bind',
            });
          }
          this.deleteBindContent(bindContent);
          removeBindContentsSet.add(bindContent);
        }
        this._bindContentPool.push(...removeBindContentsSet);
      }
    }
    let lastBindContent = null;
    const firstNode = this.node;
    this.bindContentLastIndex = this.poolLength - 1;
    const isAllAppend = USE_ALL_APPEND && (newListLength === addsSet.size && newListLength > 0);

    // Optimization: reorder-only path when no adds/removes
    const isReorder = addsSet.size === 0 && removesSet.size === 0 &&
      (changeIndexesSet.size > 0 || overwritesSet.size > 0 );
    if (!isReorder) {
      // Rebuild path: create/reuse BindContents in new order
      const oldIndexByListIndex = new Map<IListIndex, number>();
      for(let i = 0; i < this._oldListIndexes.length; i++) {
        oldIndexByListIndex.set(this._oldListIndexes[i], i);
      }
      const fragmentParentNode = isAllAppend ? document.createDocumentFragment() : parentNode;
      const fragmentFirstNode = isAllAppend ? null : firstNode;
      const changeListIndexes = [];
      for(let i = 0; i < newListIndexes.length; i++) {
        const listIndex = newListIndexes[i];
        const lastNode = lastBindContent?.getLastNode(fragmentParentNode) ?? fragmentFirstNode;
        let bindContent;
        if (addsSet.has(listIndex)) {
          bindContent = this.createBindContent(renderer, listIndex);
          bindContent.mountAfter(fragmentParentNode, lastNode);
          bindContent.applyChange(renderer);
        } else {
          bindContent = this._bindContentByListIndex.get(listIndex);
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
      if (isAllAppend) {
        const beforeNode = firstNode.nextSibling;
        parentNode.insertBefore(fragmentParentNode, beforeNode);
      }
      for(const listIndex of changeListIndexes) {
        const bindings = this.binding.bindingsByListIndex.get(listIndex) ?? [];
        for(const binding of bindings) {
          if (renderer.updatedBindings.has(binding)) {continue;}
          binding.applyChange(renderer);
        }
      }
    } else {
      // Reorder path: only move DOM nodes without recreating
      if (changeIndexesSet.size > 0) {
        const bindContents = Array.from(this._bindContents);
        const changeIndexes = Array.from(changeIndexesSet);
        changeIndexes.sort((a, b) => a.index - b.index);
        for(const listIndex of changeIndexes) {
          const bindContent = this._bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { ...baseContext, phase: 'reorder', listIndex: listIndex.index },
              docsUrl: './docs/error-codes.md#bind',
            });
          }
          bindContents[listIndex.index] = bindContent;
          const lastNode = bindContents[listIndex.index - 1]?.getLastNode(parentNode) ?? firstNode;
          bindContent.mountAfter(parentNode, lastNode);
        }
        newBindContents = bindContents;
      }
      if (overwritesSet.size > 0) {
        for (const listIndex of overwritesSet) {
          const bindContent = this._bindContentByListIndex.get(listIndex);
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
    }

    // Update state for next diff detection
    this.poolLength = this.bindContentLastIndex + 1;
    this._bindContents = newBindContents;
    this._oldList = [...newList as unknown[]];
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
export const createBindingNodeFor: CreateBindingNodeFn = 
(name: string, filterTexts: IFilterText[], decorates: string[]) => 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeFor(binding, node, name, "", filterFns, decorates);
  }
