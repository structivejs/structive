/**
 * loadFromImportMap.ts
 *
 * Automatically registers routes and components by scanning importmap aliases.
 * 
 * Processes two types of imports:
 * - @routes/*: Registers routing via entryRoute (/root normalized to /)
 * - @components/*: Loads SFC, generates ComponentClass, and registers via registerComponentClass
 * - #lazy suffix: Defers loading until component is actually needed
 *
 * @module loadFromImportMap
 */
import { entryRoute } from "../Router/Router";
import { raiseError } from "../utils";
import { createComponentClass } from "./createComponentClass";
import { loadImportmap } from "./loadImportmap";
import { loadSingleFileComponent } from "./loadSingleFileComponent";
import { registerComponentClass } from "./registerComponentClass";

/** Prefix for route aliases in importmap */
const ROUTES_KEY = "@routes/";
/** Prefix for component aliases in importmap */
const COMPONENTS_KEY = "@components/";
/** Suffix indicating a lazy-loaded component */
const LAZY_LOAD_SUFFIX = "#lazy";
/** Length of the lazy load suffix for efficient slicing */
const LAZY_LOAD_SUFFIX_LEN = LAZY_LOAD_SUFFIX.length;

/** Registry of lazy-loadable component aliases indexed by tag name */
const lazyLoadComponentAliasByTagName: Record<string, string> = {};

/**
 * Loads and registers all routes and components from the importmap.
 * 
 * This function scans the importmap for @routes/* and @components/* entries:
 * - Route entries create routing configurations via entryRoute
 * - Component entries load SFC files and register them as custom elements
 * - Entries with #lazy suffix are deferred until explicitly loaded
 * 
 * @returns {Promise<void>} Resolves when all non-lazy components are loaded and registered
 * 
 * @example
 * // Importmap example:
 * // {
 * //   "imports": {
 * //     "@routes/home": "./routes/home.sfc",
 * //     "@components/my-button": "./components/button.sfc",
 * //     "@components/heavy-chart#lazy": "./components/chart.sfc"
 * //   }
 * // }
 * await loadFromImportMap();
 * // 'routes-home' and 'my-button' are now registered
 * // 'heavy-chart' will be loaded on demand
 */
export async function loadFromImportMap(): Promise<void> {
  // Load the importmap from the document
  const importmap = loadImportmap();
  if (importmap.imports) {
    // Collect non-lazy components to load immediately
    const loadAliasByTagName: Map<string, string> = new Map();
    
    // Phase 1: Scan all aliases and classify them
    for (const [alias, _value] of Object.entries(importmap.imports)) {
      let tagName, isLazyLoad;
      
      // Process route aliases (@routes/*)
      if (alias.startsWith(ROUTES_KEY)) {
        isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
        // Extract path: '@routes/users/:id' -> '/users/:id'
        const path = alias.slice(ROUTES_KEY.length - 1, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined); 
        // Remove route parameters to create tag name: '/users/:id' -> '/users/'
        const pathWithoutParams = path.replace(/:[^\s/]+/g, "");
        // Convert path to tag name: '/users/' -> 'routes-users-'
        tagName = `routes${  pathWithoutParams.replace(/\//g, "-")}`;
        // Register route (normalize '/root' to '/')
        entryRoute(tagName, path === "/root" ? "/" : path);
      } 
      // Process component aliases (@components/*)
      if (alias.startsWith(COMPONENTS_KEY)) {
        isLazyLoad = alias.endsWith(LAZY_LOAD_SUFFIX);
        // Extract tag name: '@components/my-button' -> 'my-button'
        tagName = alias.slice(COMPONENTS_KEY.length, isLazyLoad ? -LAZY_LOAD_SUFFIX_LEN : undefined);
      }
      
      // Skip if not a recognized alias format
      if (!tagName) {
        continue;
      }
      
      // Defer lazy-load components
      if (isLazyLoad) {
        // Store alias for later loading
        lazyLoadComponentAliasByTagName[tagName] = alias;
        continue;
      }
      
      // Queue non-lazy component for immediate loading
      loadAliasByTagName.set(tagName, alias);
    }
    
    // Phase 2: Load and register all non-lazy components
    for (const [tagName, alias] of loadAliasByTagName.entries()) {
      // Load the SFC file
      const componentData = await loadSingleFileComponent(alias);
      // Create the component class
      const componentClass = createComponentClass(componentData);
      // Register as custom element
      registerComponentClass(tagName, componentClass);
    }
  }
}

/**
 * Checks if there are any lazy-loadable components registered.
 * 
 * @returns {boolean} True if at least one lazy-load component is registered
 * 
 * @example
 * if (hasLazyLoadComponents()) {
 *   console.log('Lazy loading is available');
 * }
 */
export function hasLazyLoadComponents(): boolean {
  return Object.keys(lazyLoadComponentAliasByTagName).length > 0;
}

/**
 * Checks if a specific tag name is registered as a lazy-load component.
 * 
 * @param {string} tagName - The custom element tag name to check
 * @returns {boolean} True if the component is registered for lazy loading
 * 
 * @example
 * if (isLazyLoadComponent('heavy-chart')) {
 *   loadLazyLoadComponent('heavy-chart');
 * }
 */
export function isLazyLoadComponent(tagName: string): boolean {
  return tagName in lazyLoadComponentAliasByTagName;
}

/**
 * Triggers lazy loading of a component by tag name.
 * 
 * Loads the component asynchronously via microtask queue and removes it from
 * the lazy-load registry to prevent duplicate loading.
 * 
 * @param {string} tagName - The custom element tag name to load
 * @returns {void}
 * 
 * @example
 * // When component is needed
 * loadLazyLoadComponent('heavy-chart');
 * // Component loads asynchronously in next microtask
 */
export function loadLazyLoadComponent(tagName: string): void {
  const alias = lazyLoadComponentAliasByTagName[tagName];
  
  // Check if alias exists
  if (!alias) {
    // Treat as warning with structured metadata
    const err = {
      code: "IMP-201",
      message: `Alias not found for tagName: ${tagName}`,
      context: { where: 'loadFromImportMap.loadLazyLoadComponent', tagName },
      docsUrl: "./docs/error-codes.md#imp",
      severity: "warn" as const,
    };
    // Log warning instead of throwing to maintain existing behavior
    console.warn(err.message, { code: err.code, context: err.context, docsUrl: err.docsUrl, severity: err.severity });
    return;
  }
  
  // Remove from registry to prevent duplicate loading
  delete lazyLoadComponentAliasByTagName[tagName];
  
  // Load component asynchronously in microtask queue
  queueMicrotask(() => {
    // Load the SFC file
    loadSingleFileComponent(alias).then((componentData) => {
      // Create the component class
      const componentClass = createComponentClass(componentData);
      // Register as custom element
      registerComponentClass(tagName, componentClass);
    }).catch((error) => {
      raiseError({
        code: "IMP-202",
        message: `Failed to load lazy component for tagName: ${tagName}`,
        context: {
          where: "WebComponents.loadFromImportMap.loadLazyLoadComponent",
          tagName,
          alias,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        docsUrl: "./docs/error-codes.md#imp",
        severity: "error",
      });
    });
  });
}
