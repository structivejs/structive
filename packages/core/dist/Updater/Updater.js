import { findPathNodeByPath } from "../PathTree/PathNode";
import { createReadonlyStateHandler, createReadonlyStateProxy } from "../StateClass/createReadonlyStateProxy";
import { UpdatedCallbackSymbol } from "../StateClass/symbols";
import { useWritableStateProxy } from "../StateClass/useWritableStateProxy";
import { raiseError } from "../utils";
import { createRenderer } from "./Renderer";
import { createRenderMain } from "./RenderMain";
class UpdaterObserver {
    _version = 0;
    _processResolvers = [];
    _waitResolver = null;
    _renderMain;
    _processing = false;
    constructor(renderMain) {
        this._renderMain = renderMain;
    }
    createProcessResolver() {
        const resolver = Promise.withResolvers();
        this._processResolvers.push(resolver);
        if (this._waitResolver === null) {
            this._main();
        }
        else {
            this._waitResolver.reject();
        }
        return resolver;
    }
    _getVersionUp() {
        this._version++;
        return this._version;
    }
    _nextWaitPromise() {
        const version = this._getVersionUp();
        this._waitResolver = Promise.withResolvers();
        const processPromises = this._processResolvers.map(c => c.promise);
        Promise.all(processPromises).then(() => {
            if (this._version !== version) {
                return;
            }
            if (this._waitResolver === null) {
                raiseError({
                    code: 'UPD-007',
                    message: 'UpdaterObserver waitResolver is null.',
                    context: { where: 'UpdaterObserver.nextWaitPromise' },
                    docsUrl: "./docs/error-codes.md#upd",
                });
            }
            this._waitResolver.resolve();
        });
        return this._waitResolver.promise;
    }
    async _main() {
        this._processing = true;
        try {
            let waitPromise = this._nextWaitPromise();
            while (waitPromise) {
                try {
                    await waitPromise;
                    break;
                }
                catch (e) {
                    waitPromise = this._nextWaitPromise();
                }
            }
        }
        finally {
            // 終了処理
            this._renderMain.terminate();
            this._processing = false;
            this._waitResolver = null;
            this._processResolvers = [];
        }
    }
    get isProcessing() {
        return this._processing;
    }
}
function createUpdaterObserver(renderMain) {
    return new UpdaterObserver(renderMain);
}
/**
 * The Updater class plays a central role in state management and updates.
 * Instances are created on-demand when state updates are needed.
 *
 * Main features:
 * - Queues state property references that need updating
 * - Schedules and executes rendering cycles via microtasks
 * - Manages version/revision tracking for cache invalidation
 * - Collects dependent paths affected by state changes
 * - Provides read-only and writable state contexts
 *
 * @class Updater
 * @implements {IUpdater}
 */
class Updater {
    /** Map storing swap/reorder information for list elements */
    swapInfoByRef = new Map();
    /** Queue of state property references waiting to be rendered */
    _queue = [];
    /** Flag indicating if rendering is currently in progress */
    _rendering = false;
    /** Reference to the component engine being updated */
    _engine;
    /** Current version number for this update cycle */
    _version;
    /** Current revision number within the version */
    _revision = 0;
    /** Queue of refs saved for deferred updated callbacks */
    _saveQueue = [];
    /** Cache mapping paths to their dependent paths for optimization */
    _cacheUpdatedPathsByPath = new Map();
    _completedResolvers = Promise.withResolvers();
    _renderMain;
    _isAlive = true;
    _observer;
    /**
     * Constructs a new Updater instance.
     * Automatically increments the engine's version number.
     *
     * @param {IComponentEngine} engine - The component engine to manage updates for
     */
    constructor(engine) {
        this._engine = engine;
        this._version = engine.versionUp();
        this._renderMain = createRenderMain(engine, this, this._completedResolvers);
        this._observer = createUpdaterObserver(this._renderMain);
        engine.updateCompleteQueue.enqueue(this._completedResolvers.promise);
        this._completedResolvers.promise.finally(() => {
            this._isAlive = false;
        });
    }
    /**
     * Gets the current version number.
     * Version is incremented each time a new Updater is created.
     *
     * @returns {number} Current version number
     */
    get version() {
        return this._version;
    }
    /**
     * Gets the current revision number.
     * Revision is incremented with each enqueueRef call within the same version.
     *
     * @returns {number} Current revision number
     */
    get revision() {
        return this._revision;
    }
    /**
     * Gets a promise that resolves when all updates are complete.
     * The promise resolves to true if all updates succeeded, false if any failed.
     *
     * @returns {UpdateComplete} Promise resolving when updates are complete
     */
    get updateComplete() {
        return this._completedResolvers.promise;
    }
    _rebuild() {
        if (this._isAlive) {
            raiseError({
                code: 'UPD-006',
                message: 'Updater has already been used. Create a new Updater instance for rebuild.',
                context: { where: 'Updater._rebuild' },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        this._isAlive = true;
        this._completedResolvers = Promise.withResolvers();
        this._version = this._engine.versionUp();
        this._renderMain = createRenderMain(this._engine, this, this._completedResolvers);
        this._observer = createUpdaterObserver(this._renderMain);
        this._engine.updateCompleteQueue.enqueue(this._completedResolvers.promise);
        this._completedResolvers.promise.finally(() => {
            this._isAlive = false;
        });
    }
    /**
     * Adds a state property reference to the update queue and schedules rendering.
     * Increments revision, collects dependent paths, and schedules async rendering via microtask.
     * If rendering is already in progress, the ref is queued but no new render is scheduled.
     *
     * @param {IStatePropertyRef} ref - The state property reference that changed
     * @returns {void}
     *
     * @example
     * updater.enqueueRef(getStatePropertyRef(pathInfo, listIndex));
     */
    enqueueRef(ref) {
        // Increment revision to track sub-updates within this version
        this._revision++;
        // Add to both queues: render queue and save queue for callbacks
        this._queue.push(ref);
        this._saveQueue.push(ref);
        // Collect all paths that might be affected by this change
        this.collectMaybeUpdates(this._engine, ref.info.pattern, this._engine.versionRevisionByPath, this._revision);
        this._renderMain.wakeup();
    }
    /**
     * Executes a state update operation within a writable state context.
     * Creates a writable proxy, executes the callback, and handles updated callbacks.
     * Supports both synchronous and asynchronous update operations.
     *
     * @template R - The return type of the callback
     * @param {ILoopContext | null} loopContext - Loop context for wildcard resolution, or null for root
     * @param {function} callback - Callback that performs state modifications
     * @returns {R} The result returned by the callback (may be a Promise)
     *
     * @example
     * updater.update(null, (state) => {
     *   state.count = 42;
     * });
     */
    update(loopContext, callback) {
        const resolvers = this._observer.createProcessResolver();
        // Create writable state proxy and execute update callback
        const resultPromise = useWritableStateProxy(this._engine, this, this._engine.state, loopContext, (state, handler) => {
            // Execute user's state modification callback
            return callback(state, handler);
        });
        // Handler to process updated callbacks after state changes
        const updatedCallbackHandler = () => {
            // If there are updated callbacks registered and refs in save queue
            if (this._engine.pathManager.hasUpdatedCallback && this._saveQueue.length > 0) {
                const saveQueue = this._saveQueue;
                this._saveQueue = [];
                // Schedule updated callbacks in next microtask
                queueMicrotask(() => {
                    const updatedPromise = this.update(null, (state) => {
                        // Invoke updated callbacks with the saved refs
                        return state[UpdatedCallbackSymbol](saveQueue);
                    });
                    if (updatedPromise instanceof Promise) {
                        updatedPromise.catch(() => {
                            raiseError({
                                code: 'UPD-005',
                                message: 'An error occurred during asynchronous state update.',
                                context: { where: 'Updater.update.updatedCallback' },
                                docsUrl: "./docs/error-codes.md#upd",
                            });
                        });
                    }
                });
            }
            else {
                resolvers.resolve();
            }
        };
        // Handle both Promise and non-Promise results
        if (resultPromise instanceof Promise) {
            // For async updates, run handler after promise completes
            return resultPromise.finally(() => {
                updatedCallbackHandler();
            });
        }
        else {
            // For sync updates, run handler immediately
            updatedCallbackHandler();
        }
        return resultPromise;
    }
    /**
     * Retrieves and clears the queue of state property references pending update.
     *
     * @returns {IStatePropertyRef[]} Array of state property references to be updated
     */
    retrieveAndClearQueue() {
        const queue = this._queue;
        this._queue = [];
        return queue;
    }
    /**
     * Performs the initial rendering of the component.
     * Creates a renderer and passes it to the callback for setup.
     *
     * @param {function(IRenderer): void} callback - Callback receiving the renderer
     * @returns {void}
     */
    initialRender(callback) {
        const processResolvers = this._observer.createProcessResolver();
        const resolver = Promise.withResolvers();
        const renderer = createRenderer(this._engine, this, resolver);
        try {
            callback(renderer);
        }
        finally {
            // 2フェイズレンダリング対応時、この行は不要になる可能性あり
            processResolvers.resolve();
        }
    }
    /**
     *
     * @param callback
     * @returns
     */
    invoke(callback) {
        if (!this._isAlive) {
            this._rebuild();
        }
        const processResolvers = this._observer.createProcessResolver();
        try {
            return callback();
        }
        finally {
            processResolvers.resolve();
        }
    }
    /**
     * Recursively collects all paths that may be affected by a change to the given path.
     * Traverses child nodes and dynamic dependencies to build a complete dependency graph.
     * Uses visitedInfo set to prevent infinite recursion on circular dependencies.
     *
     * @param {IComponentEngine} engine - The component engine
     * @param {string} path - The path that changed
     * @param {IPathNode} node - The PathNode corresponding to the path
     * @param {Set<string>} visitedInfo - Set tracking already visited paths
     * @param {boolean} isSource - True if this is the source path that changed
     * @returns {void}
     */
    recursiveCollectMaybeUpdates(engine, path, node, visitedInfo, isSource) {
        // Skip if already processed this path
        if (visitedInfo.has(path)) {
            return;
        }
        // Skip list elements when processing source to avoid redundant updates
        // (list container updates will handle elements)
        if (isSource && engine.pathManager.elements.has(path)) {
            return;
        }
        // Mark as visited
        visitedInfo.add(path);
        // Collect all static child dependencies
        for (const [, childNode] of node.childNodeByName.entries()) {
            const childPath = childNode.currentPath;
            this.recursiveCollectMaybeUpdates(engine, childPath, childNode, visitedInfo, false);
        }
        // Collect all dynamic dependencies (registered via data-bind)
        const deps = engine.pathManager.dynamicDependencies.get(path) ?? [];
        for (const depPath of deps) {
            const depNode = findPathNodeByPath(engine.pathManager.rootNode, depPath);
            if (depNode === null) {
                raiseError({
                    code: "UPD-004",
                    message: `Path node not found for pattern: ${depPath}`,
                    context: { where: 'Updater.recursiveCollectMaybeUpdates', depPath },
                    docsUrl: "./docs/error-codes.md#upd",
                });
            }
            this.recursiveCollectMaybeUpdates(engine, depPath, depNode, visitedInfo, false);
        }
    }
    /**
     * Collects all paths that might need updating based on a changed path.
     * Uses caching to avoid redundant dependency traversal for the same paths.
     * Updates the versionRevisionByPath map for cache invalidation.
     *
     * @param {IComponentEngine} engine - The component engine
     * @param {string} path - The path that changed
     * @param {Map<string, IVersionRevision>} versionRevisionByPath - Map to update with version info
     * @param {number} revision - Current revision number
     * @returns {void}
     * @throws {Error} Throws UPD-003 if path node not found
     */
    collectMaybeUpdates(engine, path, versionRevisionByPath, revision) {
        const node = findPathNodeByPath(engine.pathManager.rootNode, path);
        if (node === null) {
            raiseError({
                code: "UPD-003",
                message: `Path node not found for pattern: ${path}`,
                context: { where: 'Updater.collectMaybeUpdates', path },
                docsUrl: "./docs/error-codes.md#upd",
            });
        }
        // Check cache for previously computed dependencies
        let updatedPaths = this._cacheUpdatedPathsByPath.get(path);
        if (typeof updatedPaths === "undefined") {
            // Cache miss: compute dependencies recursively
            updatedPaths = new Set();
            this.recursiveCollectMaybeUpdates(engine, path, node, updatedPaths, true);
        }
        // Create version/revision marker for cache invalidation
        const versionRevision = {
            version: this.version,
            revision: revision,
        };
        // Update version info for all affected paths
        for (const updatedPath of updatedPaths) {
            versionRevisionByPath.set(updatedPath, versionRevision);
        }
        // Cache the computed dependencies for future use
        this._cacheUpdatedPathsByPath.set(path, updatedPaths);
    }
    /**
     * Creates a read-only state context and executes a callback within it.
     * Provides safe read access to state without modification capabilities.
     *
     * @template R - The return type of the callback
     * @param {function} callback - Callback receiving read-only state and handler
     * @returns {R} The result returned by the callback
     *
     * @example
     * const value = updater.createReadonlyState((state) => {
     *   return state.someProperty;
     * });
     */
    createReadonlyState(callback) {
        // Create read-only handler and proxy
        const handler = createReadonlyStateHandler(this._engine, this, null);
        const stateProxy = createReadonlyStateProxy(this._engine.state, handler);
        // Execute callback with read-only state
        return callback(stateProxy, handler);
    }
}
/**
 * Creates a new Updater instance and passes it to a callback.
 * This pattern provides clear scope management for update operations.
 * The updater is created with an incremented version number.
 *
 * @template R - The return type of the callback
 * @param {IComponentEngine} engine - The component engine to create updater for
 * @param {function(IUpdater): R} callback - Callback receiving the updater instance
 * @returns {R} The result returned by the callback
 *
 * @example
 * createUpdater(engine, (updater) => {
 *   updater.update(null, (state) => {
 *     state.count++;
 *   });
 * });
 */
export function createUpdater(engine, callback) {
    const updater = new Updater(engine);
    return callback(updater);
}
