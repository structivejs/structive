/**
 * createComponentClass.ts
 *
 * Utility for dynamically generating custom element classes for Structive Web Components.
 *
 * Main responsibilities:
 * - Generates Web Components classes from user-defined componentData (stateClass, html, css, etc.)
 * - Centrally manages and registers StateClass/template/CSS/binding information by ID
 * - Provides a feature-rich foundation including custom get/set traps, bindings, parent-child component discovery, and filter extensions
 * - Provides access to template, styles, StateClass, filters, and getter information via static properties
 * - Registers custom elements via the define method
 *
 * Design points:
 * - Uses findStructiveParent to discover parent Structive components, enabling hierarchical state management
 * - Supports getter/setter/binding optimization
 * - Centrally manages template/CSS/StateClass/binding information by ID, ensuring reusability and extensibility
 * - Filters and binding information can be flexibly extended via static properties
 */
import { inputBuiltinFilters, outputBuiltinFilters } from "../Filter/builtinFilters.js";
import { FilterWithOptions } from "../Filter/types";
import { generateId } from "../GlobalId/generateId.js";
import { getStateClassById, registerStateClass } from "../StateClass/registerStateClass.js";
import { getStyleSheetById } from "../StyleSheet/registerStyleSheet.js";
import { registerCss } from "../StyleSheet/regsiterCss.js";
import { createComponentEngine } from "../ComponentEngine/ComponentEngine.js";
import { IComponentEngine } from "../ComponentEngine/types.js";
import { registerHtml } from "../Template/registerHtml.js";
import { getTemplateById } from "../Template/registerTemplate.js";
import { getBaseClass } from "./getBaseClass.js";
import { getComponentConfig } from "./getComponentConfig.js";
import { IComponent, IUserComponentData, StructiveComponentClass, StructiveComponent } from "./types";
import { IStructiveState } from "../StateClass/types";
import { IBinding } from "../DataBinding/types";
import { IComponentStateInput } from "../ComponentStateInput/types.js";
import { findStructiveParent } from "./findStructiveParent.js";
import { IPathManager } from "../PathManager/types.js";
import { createPathManager } from "../PathManager/PathManager.js";
import { IComponentStateBinding } from "../ComponentStateBinding/types.js";
import { UpdateComplete } from "../Updater/types.js";

/**
 * Creates a custom Web Component class from user-defined component data.
 * 
 * This factory function generates a fully-configured custom element class that:
 * - Extends the appropriate base class (HTMLElement or specified custom element)
 * - Registers all templates, styles, and state management
 * - Provides static accessors for component resources (template, stylesheet, stateClass, filters)
 * - Implements the IComponent interface with lifecycle hooks and state management
 * 
 * @param {IUserComponentData} componentData - Configuration object containing stateClass, html, and css
 * @returns {StructiveComponentClass} A custom element class ready to be registered via customElements.define()
 * 
 * @example
 * const MyComponent = createComponentClass({
 *   stateClass: { count: 0 },
 *   html: '<div>{{count}}</div>',
 *   css: 'div { color: blue; }'
 * });
 * MyComponent.define('my-component');
 */
export function createComponentClass(componentData: IUserComponentData): StructiveComponentClass {
  // Extract and process component configuration
  const config = (componentData.stateClass.$config ?? {});
  const componentConfig = getComponentConfig(config);
  
  // Generate unique ID for this component class
  const id = generateId();
  const { html, css, stateClass } = componentData;
  
  // Initialize filter collections with built-in filters
  const inputFilters:FilterWithOptions = Object.assign({}, inputBuiltinFilters);
  const outputFilters:FilterWithOptions = Object.assign({}, outputBuiltinFilters);
  
  // Mark as Structive component and register all resources
  stateClass.$isStructive = true;
  registerHtml(id, html);
  registerCss(id, css);
  registerStateClass(id, stateClass);
  
  // Determine base class to extend (HTMLElement or custom element)
  const baseClass = getBaseClass(componentConfig.extends);
  const extendTagName = componentConfig.extends;
  
  return class extends baseClass implements IComponent {
    /**
     * Registers this component class as a custom element.
     * 
     * @param {string} tagName - The custom element tag name (must contain a hyphen)
     * @returns {void}
     * 
     * @example
     * MyComponent.define('my-component');
     */
    static define(tagName:string) {
      // Register as extended built-in element if extends is specified
      if (extendTagName) {
        customElements.define(tagName, this, { extends: extendTagName });
      } else {
        customElements.define(tagName, this);
      }
    }

    /** Gets the unique numeric ID for this component class */
    static get id():number {
      return id;
    }
    
    /** HTML template string for this component */
    static _html:string = html;
    static get html():string {
      return this._html;
    }
    /**
     * Updates the HTML template and invalidates cached template/pathManager.
     * This allows dynamic template modification after component class creation.
     */
    static set html(value:string) {
      this._html = value;
      registerHtml(this.id, value);
      this._template = null;
      this._pathManager = null; // Reset path information when template changes
    }

    /** CSS stylesheet string for this component */
    static _css:string = css;
    static get css() {
      return this._css;
    }
    /**
     * Updates the CSS stylesheet and invalidates cached stylesheet.
     * Allows dynamic style modification after component class creation.
     */
    static set css(value:string) {
      this._css = value;
      registerCss(this.id, value);
      this._styleSheet = null;
    }
    
    /** Cached HTMLTemplateElement instance */
    static _template: HTMLTemplateElement | null = null;
    /**
     * Gets the compiled HTMLTemplateElement for this component.
     * Lazily loads and caches on first access.
     */
    static get template():HTMLTemplateElement {
      if (!this._template) {
        this._template = getTemplateById(this.id);
      }
      return this._template;
    }
    
    /** Cached CSSStyleSheet instance */
    static _styleSheet: CSSStyleSheet | null = null;
    /**
     * Gets the CSSStyleSheet for this component.
     * Lazily loads and caches on first access.
     */
    static get styleSheet():CSSStyleSheet {
      if (!this._styleSheet) {
        this._styleSheet = getStyleSheetById(this.id);
      }
      return this._styleSheet;
    }
    
    /** Cached state class definition */
    static _stateClass: IStructiveState | null = null;
    /**
     * Gets the state class definition for this component.
     * Lazily loads and caches on first access.
     */
    static get stateClass():IStructiveState {
      if (!this._stateClass) {
        this._stateClass = getStateClassById(this.id);
      }
      return this._stateClass;
    }
    
    /** Input filters for data binding transformations */
    static _inputFilters:FilterWithOptions = inputFilters;
    static get inputFilters():FilterWithOptions {
      return this._inputFilters;
    }
    
    /** Output filters for data binding transformations */
    static _outputFilters:FilterWithOptions = outputFilters;
    static get outputFilters():FilterWithOptions {
      return this._outputFilters;
    }
    
    /** Cached PathManager instance for managing state paths and bindings */
    static _pathManager: IPathManager | null = null;
    /**
     * Gets the PathManager for analyzing and managing state property paths.
     * Lazily creates and caches on first access.
     */
    static get pathManager(): IPathManager {
      if (!this._pathManager) {
        this._pathManager = createPathManager(this as StructiveComponentClass);
      }
      return this._pathManager;
    }

    /** Component engine that manages lifecycle, state, and rendering */
    private _engine: IComponentEngine;

    /** Cached reference to parent Structive component (undefined = not yet searched) */
    _parentStructiveComponent: StructiveComponent | null | undefined;

    /**
     * Constructs a new component instance.
     * Creates the component engine and performs initial setup.
     */
    constructor() {
      super();
      // Create the component engine with configuration
      this._engine = createComponentEngine(componentConfig, this as StructiveComponent);
      // Initialize bindings, state, and prepare for rendering
      this._engine.setup();
    }

    /**
     * Called when the element is inserted into the DOM.
     * Triggers component initialization and rendering.
     */
    connectedCallback() {
      this._engine.connectedCallback();
    }

    /**
     * Called when the element is removed from the DOM.
     * Performs cleanup and resource disposal.
     */
    disconnectedCallback() {
      this._engine.disconnectedCallback();
    }

    /**
     * Gets the nearest parent Structive component in the DOM tree.
     * Result is cached after first lookup for performance.
     * 
     * @returns {StructiveComponent | null} Parent component or null if none found
     */
    get parentStructiveComponent(): StructiveComponent | null {
      if (typeof this._parentStructiveComponent === "undefined") {
        // Search up the DOM tree for parent Structive component
        this._parentStructiveComponent = findStructiveParent(this as StructiveComponent);
      }
      return this._parentStructiveComponent;
    }

    /**
     * Gets the state input interface for accessing and modifying component state.
     * 
     * @returns {IComponentStateInput} State input interface
     */
    get state(): IComponentStateInput {
      return this._engine.stateInput;
    }

    /**
     * Gets the state binding interface for managing bindings between parent and child components.
     * 
     * @returns {IComponentStateBinding} State binding interface
     */
    get stateBinding(): IComponentStateBinding {
      return this._engine.stateBinding;
    }

    /**
     * Checks if this is a Structive component.
     * 
     * @returns {boolean} True if this is a Structive component
     */
    get isStructive(): boolean {
      return this._engine.stateClass.$isStructive ?? false;
    }

    /**
     * Gets the Promise resolvers for component ready state.
     * Allows external code to wait for component initialization to complete.
     * 
     * @returns {PromiseWithResolvers<void>} Promise resolvers for ready state
     */
    get readyResolvers(): PromiseWithResolvers<void> {
      return this._engine.readyResolvers;
    }

    get updateComplete(): UpdateComplete | null {
      return this._engine.updateCompleteQueue.current;
    }

    /**
     * Retrieves the set of bindings associated with a specific child component.
     * 
     * @param {IComponent} component - The child component to query
     * @returns {Set<IBinding> | null} Set of bindings or null if component not found
     */
    getBindingsFromChild(component: IComponent): Set<IBinding> | null {
      return this._engine.bindingsByComponent.get(component as StructiveComponent) ?? null;
    }

    /**
     * Registers a child component, establishing parent-child relationship.
     * Called when a child Structive component is connected.
     * 
     * @param {StructiveComponent} component - The child component to register
     * @returns {void}
     */
    registerChildComponent(component:StructiveComponent): void {
      this._engine.registerChildComponent(component);
    }
    
    /**
     * Unregisters a child component, cleaning up the parent-child relationship.
     * Called when a child Structive component is disconnected.
     * 
     * @param {StructiveComponent} component - The child component to unregister
     * @returns {void}
     */
    unregisterChildComponent(component:StructiveComponent): void {
      this._engine.unregisterChildComponent(component);
    }

  } as StructiveComponentClass;
}
