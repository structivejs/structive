import { findPathNodeByPath } from "../PathTree/PathNode";
import { createReadonlyStateHandler, createReadonlyStateProxy } from "../StateClass/createReadonlyStateProxy";
import { UpdatedCallbackSymbol } from "../StateClass/symbols";
import { useWritableStateProxy } from "../StateClass/useWritableStateProxy";
import { raiseError } from "../utils";
import { createRenderer, render } from "./Renderer";
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
    /**
     * Constructs a new Updater instance.
     * Automatically increments the engine's version number.
     *
     * @param {IComponentEngine} engine - The component engine to manage updates for
     */
    constructor(engine) {
        this._engine = engine;
        this._version = engine.versionUp();
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
        // Skip scheduling if already rendering (will process queue on next iteration)
        if (this._rendering) {
            return;
        }
        this._rendering = true;
        queueMicrotask(() => {
            // Execute rendering after async processing interruption or update completion
            this.rendering();
        });
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
     * Executes the rendering process for all queued updates.
     * Processes the queue in a loop until empty, allowing new updates during rendering.
     * Ensures rendering flag is reset even if errors occur.
     *
     * @returns {void}
     */
    rendering() {
        try {
            // Process queue until empty (new items may be added during rendering)
            while (this._queue.length > 0) {
                // Retrieve current queue and reset for new items
                const queue = this._queue;
                this._queue = [];
                // Execute rendering for all refs in this batch
                render(queue, this._engine, this);
            }
        }
        finally {
            // Always reset rendering flag, even if errors occurred
            this._rendering = false;
        }
    }
    /**
     * Performs the initial rendering of the component.
     * Creates a renderer and passes it to the callback for setup.
     *
     * @param {function(IRenderer): void} callback - Callback receiving the renderer
     * @returns {void}
     */
    initialRender(callback) {
        const renderer = createRenderer(this._engine, this);
        callback(renderer);
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
