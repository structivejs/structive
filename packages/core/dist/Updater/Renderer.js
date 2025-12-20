import { WILDCARD } from "../constants";
import { findPathNodeByPath } from "../PathTree/PathNode";
import { createReadonlyStateHandler, createReadonlyStateProxy } from "../StateClass/createReadonlyStateProxy";
import { GetListIndexesByRefSymbol } from "../StateClass/symbols";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef";
import { raiseError } from "../utils";
/**
 * Renderer is a coordinator that responds to State changes (a set of IStatePropertyRef references)
 * by traversing the PathTree and delegating applyChange to each Binding (IBinding).
 *
 * Main responsibilities
 * - reorderList: Collects element-level reordering requests and converts them to parent list-level diffs (IListDiff) for application
 * - render: Entry point. Creates ReadonlyState and executes in order: reorder → rendering each ref (renderItem)
 * - renderItem: Updates bindings tied to specified ref and recursively traverses static dependencies (child PathNodes) and dynamic dependencies
 *
 * Contract
 * - Binding#applyChange(renderer): If there are changes, must add itself to renderer.updatedBindings
 * - readonlyState[GetByRefSymbol](ref): Returns the new value (read-only view) of ref
 *
 * Thread/Reentrancy
 * - Assumes synchronous execution.
 *
 * Common exceptions
 * - UPD-001/002: Engine/ReadonlyState not initialized
 * - UPD-003/004/005/006: ListIndex/ParentInfo/OldList* inconsistency or ListDiff not generated
 * - PATH-101: PathNode not found
 */
class Renderer {
    updatedBindings = new Set();
    processedRefs = new Set();
    lastListInfoByRef = new Map();
    _engine;
    _updater;
    _updatingRefs = [];
    _updatingRefSet = new Set();
    _readonlyState = null;
    _readonlyHandler = null;
    _resolver;
    /**
     * Constructs a new Renderer instance.
     *
     * @param {IComponentEngine} engine - The component engine to render
     * @param {IUpdater} updater - The updater managing this renderer
     */
    constructor(engine, updater, resolver) {
        this._engine = engine;
        this._updater = updater;
        this._resolver = resolver;
    }
    get updatingRefs() {
        return this._updatingRefs;
    }
    get updatingRefSet() {
        return this._updatingRefSet;
    }
    /**
     * Gets the read-only State view. Throws exception if not during render execution.
     * Throws: UPD-002
     */
    get readonlyState() {
        if (!this._readonlyState) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyState not initialized",
                context: { where: "Updater.Renderer.readonlyState" },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this._readonlyState;
    }
    get readonlyHandler() {
        if (!this._readonlyHandler) {
            raiseError({
                code: "UPD-002",
                message: "ReadonlyHandler not initialized",
                context: { where: "Updater.Renderer.readonlyHandler" },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        return this._readonlyHandler;
    }
    /**
     * Creates a read-only state and passes it to the callback
     * @param callback
     * @returns
     */
    createReadonlyState(callback) {
        const handler = createReadonlyStateHandler(this._engine, this._updater, this);
        const stateProxy = createReadonlyStateProxy(this._engine.state, handler);
        this._readonlyState = stateProxy;
        this._readonlyHandler = handler;
        try {
            return callback(stateProxy, handler);
        }
        finally {
            this._readonlyState = null;
            this._readonlyHandler = null;
        }
    }
    /**
     * Entry point for rendering. Creates ReadonlyState and
     * processes in order: reordering → rendering each reference.
     *
     * Notes
     * - readonlyState is only valid within this method's scope.
     * - SetCacheableSymbol enables caching of reference resolution in bulk.
     */
    render(items) {
        this.processedRefs.clear();
        this.updatedBindings.clear();
        this._updatingRefs = [...items];
        this._updatingRefSet = new Set(items);
        // Implement actual rendering logic
        this.createReadonlyState(() => {
            // First, process list reordering
            const remainItems = [];
            const itemsByListRef = new Map();
            const refSet = new Set();
            // Phase 1: Classify refs into list elements and other refs
            for (let i = 0; i < items.length; i++) {
                const ref = items[i];
                refSet.add(ref);
                // Check if this ref represents a list element
                if (!this._engine.pathManager.elements.has(ref.info.pattern)) {
                    // Not a list element - handle later
                    remainItems.push(ref);
                    continue;
                }
                // This is a list element - group by parent list ref
                const listRef = ref.parentRef ?? raiseError({
                    code: "UPD-004",
                    message: `ParentInfo is null for ref: ${ref.key}`,
                    context: {
                        where: "Updater.Renderer.render",
                        refKey: ref.key,
                        pattern: ref.info.pattern,
                    },
                    docsUrl: "./docs/error-codes.md#upd",
                });
                // Group element refs by their parent list
                if (!itemsByListRef.has(listRef)) {
                    itemsByListRef.set(listRef, new Set());
                }
                itemsByListRef.get(listRef).add(ref);
            }
            // Phase 2: Apply changes to list bindings (for list reordering)
            for (const [listRef, refs] of itemsByListRef) {
                // If the parent list itself is in the update set, skip individual elements
                // (parent list update will handle all children)
                if (refSet.has(listRef)) {
                    for (const ref of refs) {
                        this.processedRefs.add(ref); // Completed
                    }
                    continue; // Skip if parent list exists
                }
                // Apply list bindings (e.g., for reordering)
                const bindings = this._engine.getBindings(listRef);
                for (let i = 0; i < bindings.length; i++) {
                    if (this.updatedBindings.has(bindings[i])) {
                        continue;
                    }
                    bindings[i].applyChange(this);
                }
                this.processedRefs.add(listRef);
            }
            // Phase 3: Process remaining refs (non-list-elements)
            for (let i = 0; i < remainItems.length; i++) {
                const ref = remainItems[i];
                // Find the PathNode for this ref pattern
                const node = findPathNodeByPath(this._engine.pathManager.rootNode, ref.info.pattern);
                if (node === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${ref.info.pattern}`,
                        context: { where: "Updater.Renderer.render", pattern: ref.info.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (!this.processedRefs.has(ref)) {
                    this.renderItem(ref, node);
                }
            }
            // Phase 4: Notify child Structive components of changes
            // This allows nested components to update based on parent state changes
            if (this._engine.structiveChildComponents.size > 0) {
                for (const structiveComponent of this._engine.structiveChildComponents) {
                    const structiveComponentBindings = this._engine.bindingsByComponent.get(structiveComponent) ?? new Set();
                    for (const binding of structiveComponentBindings) {
                        // Notify each binding about refs that might affect it
                        binding.notifyRedraw(remainItems);
                    }
                }
            }
        });
    }
    /**
     * Renders a single reference ref and its corresponding PathNode.
     *
     * - First applies its own bindings
     * - Then static dependencies (including wildcards)
     * - Finally dynamic dependencies (wildcards are expanded hierarchically)
     *
     * Static dependencies (child nodes)
     * - Otherwise: Inherit parent's listIndex to generate child reference and render recursively
     *
     * Dynamic dependencies
     * - Based on paths registered in pathManager.dynamicDependencies, render recursively while expanding wildcards
     *
    * Throws
    * - PATH-101: PathNode not detected for dynamic dependency
     */
    renderItem(ref, node) {
        this.processedRefs.add(ref);
        // Apply changes to bindings
        // Bindings with changes must add themselves to updatedBindings (responsibility of applyChange implementation)
        const bindings = this._engine.getBindings(ref);
        for (let i = 0; i < bindings.length; i++) {
            if (this.updatedBindings.has(bindings[i])) {
                continue;
            }
            bindings[i].applyChange(this);
        }
        // Calculate which list indexes are new (added) since last render
        // This optimization ensures we only traverse new list elements
        let diffListIndexes = new Set();
        if (this._engine.pathManager.lists.has(ref.info.pattern)) {
            // Get current list indexes for this ref
            const currentListIndexes = new Set(this.readonlyState[GetListIndexesByRefSymbol](ref) ?? []);
            // Get previous list indexes from last render
            const { listIndexes } = this.lastListInfoByRef.get(ref) ?? {};
            const lastListIndexSet = new Set(listIndexes ?? []);
            // Compute difference: new indexes = current - previous
            diffListIndexes = currentListIndexes.difference(lastListIndexSet);
        }
        // Traverse static dependencies
        for (const [name, childNode] of node.childNodeByName) {
            const childInfo = getStructuredPathInfo(childNode.currentPath);
            if (name === WILDCARD) {
                // Wildcard child: traverse only new list indexes
                for (const listIndex of diffListIndexes) {
                    const childRef = getStatePropertyRef(childInfo, listIndex);
                    if (!this.processedRefs.has(childRef)) {
                        this.renderItem(childRef, childNode);
                    }
                }
            }
            else {
                // Regular property child: inherit parent's listIndex
                const childRef = getStatePropertyRef(childInfo, ref.listIndex);
                if (!this.processedRefs.has(childRef)) {
                    this.renderItem(childRef, childNode);
                }
            }
        }
        // Traverse dynamic dependencies
        const deps = this._engine.pathManager.dynamicDependencies.get(ref.info.pattern);
        if (deps) {
            for (const depPath of deps) {
                const depInfo = getStructuredPathInfo(depPath);
                const depNode = findPathNodeByPath(this._engine.pathManager.rootNode, depInfo.pattern);
                if (depNode === null) {
                    raiseError({
                        code: "PATH-101",
                        message: `PathNode not found: ${depInfo.pattern}`,
                        context: { where: "Updater.Renderer.renderItem", pattern: depInfo.pattern },
                        docsUrl: "./docs/error-codes.md#path",
                    });
                }
                if (depInfo.wildcardCount > 0) {
                    // Dynamic dependency has wildcards - need hierarchical expansion
                    const infos = depInfo.wildcardParentInfos;
                    // Recursive walker to expand wildcards level by level
                    const walk = (depRef, index, nextInfo) => {
                        // Get list indexes at current wildcard level
                        const listIndexes = this.readonlyState[GetListIndexesByRefSymbol](depRef) || [];
                        if ((index + 1) < infos.length) {
                            // More wildcard levels to traverse
                            for (let i = 0; i < listIndexes.length; i++) {
                                const nextRef = getStatePropertyRef(nextInfo, listIndexes[i]);
                                // Recurse to next wildcard level
                                walk(nextRef, index + 1, infos[index + 1]);
                            }
                        }
                        else {
                            // Reached final wildcard level - render all elements
                            for (let i = 0; i < listIndexes.length; i++) {
                                const subDepRef = getStatePropertyRef(depInfo, listIndexes[i]);
                                if (!this.processedRefs.has(subDepRef)) {
                                    this.renderItem(subDepRef, depNode);
                                }
                            }
                        }
                    };
                    // Start traversal from first wildcard parent
                    const startRef = getStatePropertyRef(depInfo.wildcardParentInfos[0], null);
                    walk(startRef, 0, depInfo.wildcardParentInfos[1] || null);
                }
                else {
                    // No wildcards - simple direct dependency
                    const depRef = getStatePropertyRef(depInfo, null);
                    if (!this.processedRefs.has(depRef)) {
                        this.renderItem(depRef, depNode);
                    }
                }
            }
        }
    }
}
/**
 * Convenience function. Creates a Renderer instance and calls render in one go.
 */
export function render(refs, engine, updater, resolver) {
    const renderer = new Renderer(engine, updater, resolver);
    try {
        renderer.render(refs);
    }
    finally {
        resolver.resolve();
    }
}
/**
 * Creates a new Renderer instance.
 *
 * @param {IComponentEngine} engine - The component engine to render
 * @param {IUpdater} updater - The updater managing this renderer
 * @returns {IRenderer} A new renderer instance
 */
export function createRenderer(engine, updater, resolver) {
    return new Renderer(engine, updater, resolver);
}
