import { createBindContent } from "../DataBinding/BindContent.js";
import { attachShadow } from "./attachShadow.js";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol } from "../StateClass/symbols.js";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo.js";
import { raiseError } from "../utils.js";
import { createComponentStateBinding } from "../ComponentStateBinding/createComponentStateBinding.js";
import { createComponentStateInput } from "../ComponentStateInput/createComponentStateInput.js";
import { createComponentStateOutput } from "../ComponentStateOutput/createComponentStateOutput.js";
import { AssignStateSymbol } from "../ComponentStateInput/symbols.js";
import { createUpdater } from "../Updater/Updater.js";
import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef.js";
import { RESERVED_WORD_SET } from "../constants.js";
import { addPathNode } from "../PathTree/PathNode.js";
import { createCompleteQueue } from "../Updater/CompleteQueue.js";
/**
 * ComponentEngine integrates state, dependencies, bindings, lifecycle, and rendering
 * for Structive components as the core engine.
 *
 * Key Responsibilities:
 * - State instance and proxy generation/management
 * - Template/stylesheet/filter/binding management
 * - Dependency graph (PathTree) construction and maintenance
 * - Binding and list information storage/retrieval
 * - Lifecycle (connected/disconnected) processing
 * - Shadow DOM application or block mode placeholder management
 * - State property get/set operations
 * - Binding addition, existence checking, and list management
 *
 * Error Codes:
 * - BIND-201: BindContent not initialized yet / Block parent node not set
 * - STATE-202: Failed to parse state from dataset
 *
 * Design Notes:
 * - Provides async initialization via readyResolvers
 * - Achieves efficient rendering through batch updates with Updater
 */
class ComponentEngine {
    // ===== Readonly fields (Core component resources) =====
    /** Component type: 'autonomous' or 'builtin' */
    type = 'autonomous';
    /** Component configuration */
    config;
    /** HTMLTemplateElement for component rendering */
    template;
    /** CSSStyleSheet for component styling */
    styleSheet;
    /** State class constructor */
    stateClass;
    /** State instance */
    state;
    /** Input filter functions */
    inputFilters;
    /** Output filter functions */
    outputFilters;
    /** Base HTML element class */
    baseClass = HTMLElement;
    /** Owner component instance */
    owner;
    /** Path manager for dependency tracking */
    pathManager;
    /** Promise resolvers for async initialization */
    readyResolvers = Promise.withResolvers();
    /** State input proxy for parent-to-child communication */
    stateInput;
    /** State output proxy for child-to-parent communication */
    stateOutput;
    /** State binding for parent-child relationship */
    stateBinding;
    /** Map of child components to their bindings */
    bindingsByComponent = new WeakMap();
    /** Set of child Structive components */
    structiveChildComponents = new Set();
    /** Version and revision tracking by path */
    versionRevisionByPath = new Map();
    updateCompleteQueue = createCompleteQueue();
    // ===== Private fields (Internal state) =====
    /** Bind content instance (initialized in setup()) */
    _bindContent = null;
    /** Block mode placeholder comment node */
    _blockPlaceholder = null;
    /** Block mode placeholder parent node */
    _blockParentNode = null;
    /** Flag to ignore disconnectedCallback during replaceWith */
    _ignoreDissconnectedCallback = false;
    /** Current version number for change tracking */
    _currentVersion = 0;
    /** WeakMap storing binding metadata by property reference */
    _propertyRefMetadataByRef = new WeakMap();
    /**
     * Constructs a new ComponentEngine instance.
     * Initializes all readonly fields and creates state management infrastructure.
     *
     * @param config - Component configuration
     * @param owner - Owner component instance
     */
    constructor(config, owner) {
        this.config = config;
        // Set type to 'builtin' if extending native elements
        if (this.config.extends) {
            this.type = 'builtin';
        }
        const componentClass = owner.constructor;
        this.template = componentClass.template;
        this.styleSheet = componentClass.styleSheet;
        this.stateClass = componentClass.stateClass;
        this.state = new this.stateClass();
        this.inputFilters = componentClass.inputFilters;
        this.outputFilters = componentClass.outputFilters;
        this.owner = owner;
        this.stateBinding = createComponentStateBinding();
        this.stateInput = createComponentStateInput(this, this.stateBinding);
        this.stateOutput = createComponentStateOutput(this.stateBinding, this);
        this.pathManager = componentClass.pathManager;
    }
    // ===== Getters =====
    /**
     * Gets the bind content instance.
     * Throws BIND-201 if accessed before setup() is called.
     *
     * @returns IBindContent instance
    * @throws BIND-201 BindContent not initialized yet
     */
    get bindContent() {
        if (this._bindContent === null) {
            raiseError({
                code: 'BIND-201',
                message: 'BindContent not initialized yet',
                context: { where: 'ComponentEngine.bindContent.get', componentId: this.owner.constructor.id },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        return this._bindContent;
    }
    /**
     * Gets the current version number for change tracking.
     *
     * @returns Current version number
     */
    get currentVersion() {
        return this._currentVersion;
    }
    // ===== Public methods =====
    /**
     * Increments and returns the version number.
     * Used for invalidating caches when state changes.
     *
     * @returns New version number
     */
    versionUp() {
        return ++this._currentVersion;
    }
    /**
     * Sets up the component engine.
     * Registers all state properties to PathManager and creates bindContent.
     * Must be called after construction and before connectedCallback.
     */
    setup() {
        // Register all instantiated state object properties to PathManager
        // TODO: Should traverse prototype chain for inherited properties
        for (const path in this.state) {
            if (RESERVED_WORD_SET.has(path) || this.pathManager.alls.has(path)) {
                continue;
            }
            this.pathManager.alls.add(path);
            addPathNode(this.pathManager.rootNode, path);
        }
        const componentClass = this.owner.constructor;
        const rootRef = getStatePropertyRef(getStructuredPathInfo(''), null);
        // Create bindContent (may modify stateArrayPropertyNamePatterns)
        this._bindContent = createBindContent(null, componentClass.id, this, rootRef);
    }
    /**
     * Handles component connection to DOM.
     * - Attaches Shadow DOM or sets up block mode placeholder
     * - Mounts bindContent
     * - Initializes state from data-state attribute if present
     * - Performs initial render
     * - Calls state's connectedCallback if defined
     *
     * Why not do this in setup():
     * - setup() is called at component instantiation
     * - connectedCallback() is called when connected to DOM
     * - State initialization and rendering must be redone if reconnected after disconnect
     *
    * @throws BIND-201 Block parent node not set
     * @throws STATE-202 Failed to parse state from dataset
     * @throws COMP-301 Error in connectedCallback
     */
    connectedCallback() {
        if (this.config.enableWebComponents) {
            attachShadow(this.owner, this.config, this.styleSheet);
        }
        else {
            // Block mode: Replace component with placeholder
            this._blockParentNode = this.owner.parentNode;
            this._blockPlaceholder = document.createComment("Structive block placeholder");
            // Set flag to ignore disconnectedCallback triggered by replaceWith
            this._ignoreDissconnectedCallback = true;
            try {
                this.owner.replaceWith(this._blockPlaceholder);
            }
            finally {
                this._ignoreDissconnectedCallback = false;
            }
        }
        if (this.config.enableWebComponents) {
            // Mount bind content to Shadow DOM
            this.bindContent.mount(this.owner.shadowRoot ?? this.owner);
        }
        else {
            // Mount bind content after block placeholder
            const parentNode = this._blockParentNode ?? raiseError({
                code: 'BIND-201',
                message: 'Block parent node not set',
                context: { where: 'ComponentEngine.connectedCallback', mode: 'block' },
                docsUrl: './docs/error-codes.md#bind',
            });
            this.bindContent.mountAfter(parentNode, this._blockPlaceholder);
        }
        // Initialize component state from data-state attribute if present
        if (this.owner.dataset.state) {
            try {
                const json = JSON.parse(this.owner.dataset.state);
                this.stateInput[AssignStateSymbol](json);
            }
            catch (e) {
                raiseError({
                    code: 'STATE-202',
                    message: 'Failed to parse state from dataset',
                    context: { where: 'ComponentEngine.connectedCallback', datasetState: this.owner.dataset.state },
                    docsUrl: './docs/error-codes.md#state',
                    cause: e,
                });
            }
        }
        // Perform initial render
        this.bindContent.activate();
        createUpdater(this, (updater) => {
            updater.initialRender(this.bindContent);
        });
        // Call state's connectedCallback if implemented
        if (this.pathManager.hasConnectedCallback) {
            const resultPromise = createUpdater(this, (updater) => {
                return updater.update(null, (stateProxy) => {
                    return stateProxy[ConnectedCallbackSymbol]();
                });
            });
            if (resultPromise instanceof Promise) {
                resultPromise.finally(() => {
                    this.readyResolvers.resolve();
                }).catch(() => {
                    raiseError({
                        code: 'COMP-301',
                        message: 'Connected callback failed',
                        context: { where: 'ComponentEngine.connectedCallback' },
                        docsUrl: './docs/error-codes.md#comp',
                    });
                });
            }
            else {
                this.readyResolvers.resolve();
            }
        }
        else {
            this.readyResolvers.resolve();
        }
    }
    /**
     * Handles component disconnection from DOM.
     * - Calls state's disconnectedCallback if defined
     * - Unregisters from parent component
     * - Removes block placeholder if in block mode
     * - Inactivates and unmounts bindContent
     * @throws COMP-302 Error in disconnectedCallback
     */
    disconnectedCallback() {
        // Ignore if flag is set (during replaceWith in connectedCallback)
        if (this._ignoreDissconnectedCallback) {
            return;
        }
        try {
            // Call state's disconnectedCallback if implemented (synchronous)
            if (this.pathManager.hasDisconnectedCallback) {
                createUpdater(this, (updater) => {
                    updater.update(null, (stateProxy) => {
                        stateProxy[DisconnectedCallbackSymbol]();
                    });
                });
            }
        }
        catch (e) {
            raiseError({
                code: 'COMP-302',
                message: 'Disconnected callback failed',
                context: { where: 'ComponentEngine.disconnectedCallback' },
                docsUrl: './docs/error-codes.md#comp',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cause: e,
            });
        }
        finally {
            // Unregister from parent component
            this.owner.parentStructiveComponent?.unregisterChildComponent(this.owner);
            if (!this.config.enableWebComponents) {
                this._blockPlaceholder?.remove();
                this._blockPlaceholder = null;
                this._blockParentNode = null;
            }
            // Inactivate state and unmount (bindContent.unmount is called within inactivate)
            this.bindContent.inactivate();
        }
    }
    /**
     * Gets list indexes for a property reference.
     * Delegates to stateOutput if the path matches parent-child binding.
     *
     * @param ref - State property reference
     * @returns Array of list indexes or null if not a list
     */
    getListIndexes(ref) {
        if (this.stateOutput.startsWith(ref.info)) {
            return this.stateOutput.getListIndexes(ref);
        }
        let value = null;
        // Synchronous operation
        createUpdater(this, (updater) => {
            return value = updater.createReadonlyState((stateProxy) => {
                return stateProxy[GetListIndexesByRefSymbol](ref);
            });
        });
        return value;
    }
    /**
     * Gets a property value by reference.
     * Uses readonly state proxy to access the value synchronously.
     *
     * @param ref - State property reference
     * @returns Property value
     */
    getPropertyValue(ref) {
        let value;
        // Synchronous operation
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy) => {
                return stateProxy[GetByRefSymbol](ref);
            });
        });
        return value;
    }
    /**
     * Sets a property value by reference.
     * Uses writable state proxy to set the value synchronously.
     *
     * @param ref - State property reference
     * @param value - New value to set
     */
    setPropertyValue(ref, value) {
        // Synchronous operation
        createUpdater(this, (updater) => {
            updater.update(null, (stateProxy) => {
                stateProxy[SetByRefSymbol](ref, value);
            });
        });
    }
    /**
     * Registers a child Structive component.
     * Used for parent-child relationship tracking.
     *
     * @param component - Child StructiveComponent instance to register
     */
    registerChildComponent(component) {
        this.structiveChildComponents.add(component);
    }
    /**
     * Unregisters a child Structive component.
     * Called when child is disconnected or destroyed.
     *
     * @param component - Child StructiveComponent instance to unregister
     */
    unregisterChildComponent(component) {
        this.structiveChildComponents.delete(component);
    }
    /**
     * Gets the cache entry for a property reference.
     * Returns null if no cache exists.
     *
     * @param ref - State property reference
     * @returns Cache entry or null
     */
    getCacheEntry(ref) {
        return this._propertyRefMetadataByRef.get(ref)?.cacheEntry ?? null;
    }
    /**
     * Sets the cache entry for a property reference.
     * Creates a new PropertyRefMetadata if it doesn't exist.
     *
     * @param ref - State property reference
     * @param entry - Cache entry to set
     */
    setCacheEntry(ref, entry) {
        const metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata === "undefined") {
            this._propertyRefMetadataByRef.set(ref, { bindings: [], cacheEntry: entry });
        }
        else {
            metadata.cacheEntry = entry;
        }
    }
    /**
     * Gets all bindings associated with a property reference.
     * Returns empty array if no bindings exist.
     *
     * @param ref - State property reference
     * @returns Array of IBinding instances
     */
    getBindings(ref) {
        return this._propertyRefMetadataByRef.get(ref)?.bindings ?? [];
    }
    /**
     * Saves a binding for a property reference.
     * Creates a new PropertyRefMetadata if it doesn't exist.
     *
     * @param ref - State property reference
     * @param binding - IBinding instance to save
     */
    saveBinding(ref, binding) {
        const metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata === "undefined") {
            this._propertyRefMetadataByRef.set(ref, { bindings: [binding], cacheEntry: null });
        }
        else {
            metadata.bindings.push(binding);
        }
    }
    /**
     * Removes a binding from a property reference.
     * Does nothing if the binding doesn't exist.
     *
     * @param ref - State property reference
     * @param binding - IBinding instance to remove
     */
    removeBinding(ref, binding) {
        const metadata = this._propertyRefMetadataByRef.get(ref);
        if (typeof metadata !== "undefined") {
            const index = metadata.bindings.indexOf(binding);
            if (index >= 0) {
                metadata.bindings.splice(index, 1);
            }
        }
    }
}
/**
 * Factory function to create a ComponentEngine instance.
 *
 * @param config - Component configuration
 * @param component - Owner component instance
 * @returns A new ComponentEngine instance
 */
export function createComponentEngine(config, component) {
    return new ComponentEngine(config, component);
}
