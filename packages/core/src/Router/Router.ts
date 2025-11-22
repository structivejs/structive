/**
 * Router.ts
 *
 * Implementation of Router custom element for single-page applications (SPA).
 *
 * Main responsibilities:
 * - Dynamically creates and displays custom elements based on URL path according to route definitions (entryRoute)
 * - History management and routing control using pushState/popstate events
 * - Route parameter extraction and passing to custom elements
 * - Display 404 page for undefined routes
 *
 * Design points:
 * - Register route path and custom element tag name pairs via entryRoute
 * - Automatically re-render on URL change via popstate event
 * - Extract route path parameters (:id etc.) using regex and pass via data-state attribute
 * - Global Router instance accessible via getRouter
 */
import { isLazyLoadComponent, loadLazyLoadComponent } from "../WebComponents/loadFromImportMap";
import { IRouter } from "./types";

const DEFAULT_ROUTE_PATH = '/'; // Default route path
const ROUTE_PATH_PREFIX = 'routes:'; // Prefix for route paths
/**
 * example:
 * ```ts
 * entryRoute('my-view', '/my-view/:id');
 */
const routeEntries: Array<[string, string]> = [];

let globalRouter : Router | null = null;

/**
 * Router custom element for SPA routing.
 * Manages URL-based navigation and dynamic component rendering.
 */
export class Router extends HTMLElement implements IRouter {
  private _originalFileName = window.location.pathname.split('/').pop() || ''; // Store the original file name
  private _basePath = document.querySelector('base')?.href.replace(window.location.origin, "") || DEFAULT_ROUTE_PATH;
  private _popstateHandler: (event: PopStateEvent) => void;

  /**
   * Creates a new Router instance and binds popstate handler.
   */
  constructor() {
    super();
    this._popstateHandler = this.popstateHandler.bind(this);
  }

  /**
   * Web Component lifecycle callback invoked when element is connected to DOM.
   * Sets up routing and triggers initial render.
   */
  connectedCallback() {
    globalRouter = this;
    this.innerHTML = '<slot name="content"></slot>';
    window.addEventListener('popstate', this._popstateHandler);
    window.dispatchEvent(new Event("popstate")); // Dispatch popstate event to trigger the initial render
  }

  /**
   * Web Component lifecycle callback invoked when element is disconnected from DOM.
   * Cleans up event listeners.
   */
  disconnectedCallback() {
    window.removeEventListener('popstate', this._popstateHandler);
    globalRouter = null;
  }

  /**
   * Handles popstate events for browser navigation.
   * @param event - PopStateEvent from browser history navigation
   */
  popstateHandler(event: PopStateEvent) {
    event.preventDefault();
    this.render();
  }

  /**
   * Navigates to a new route.
   * @param to - Target path to navigate to
   */
  navigate(to: string) {
    const toPath = to[0] === '/' ? (this._basePath + to.slice(1)) : to; // Ensure the path starts with '/'
    history.pushState({}, '', toPath);
    this.render();
  }

  /**
   * Renders the current route by creating and displaying the matching custom element.
   * Displays 404 if no route matches the current path.
   */
  render() {
    // Clear slot content
    const slotChildren = Array.from(this.childNodes).filter(
      n => (n as HTMLElement).getAttribute?.('slot') === 'content'
    );
    slotChildren.forEach(n => this.removeChild(n));

    const paths = window.location.pathname.split('/');
    if (paths.at(-1) === this._originalFileName) {
      paths[paths.length - 1] = ''; // Ensure the last path is empty for root
    }
    const pathName = paths.join('/');
    const replacedPath = pathName.replace(this._basePath, ''); // Remove base path and ensure default route
    const currentPath = replacedPath[0] !== '/' ? `/${  replacedPath}` : replacedPath; // Ensure the path starts with '/'
    let tagName: string | undefined = undefined;
    const params: Record<string, string> = {};
    // Check if the routePath matches any of the defined routes
    for (const [path, tag] of routeEntries) {
      const regex = new RegExp(`^${  path.replace(/:[^\s/]+/g, '([^/]+)')  }$`);
      if (regex.test(currentPath)) {
        tagName = tag;
        // Extract the parameters from the routePath
        const matches = currentPath.match(regex);
        if (matches) {
          const keys = path.match(/:[^\s/]+/g) || [];
          keys.forEach((key, index) => {
            params[key.substring(1)] = matches[index + 1]; // +1 to skip the full match
          });
        }
        break;
      }
    }
    if (tagName) {
      // If a route matches, create the custom element and set its state
      // Create the custom element with the tag name
      // project the custom element into the router slot
      const customElement = document.createElement(tagName);
      customElement.setAttribute('data-state', JSON.stringify(params));
      customElement.setAttribute('slot', 'content');
      this.appendChild(customElement);
      if (isLazyLoadComponent(tagName)) {
        loadLazyLoadComponent(tagName); // Load lazy load component if necessary
      }
    } else {
      // If no route matches, show 404 content
      const messageElement = document.createElement('h1') as HTMLElement;
      messageElement.setAttribute('slot', 'content');
      messageElement.textContent = '404 Not Found';
      this.appendChild(messageElement);
    }
  }

}

/**
 * Registers a route entry mapping a custom element tag to a URL path.
 * @param tagName - Custom element tag name to render for this route
 * @param routePath - URL path pattern (supports parameters like :id)
 */
export function entryRoute(tagName: string, routePath: string): void {
  if (routePath.startsWith(ROUTE_PATH_PREFIX)) {
    routePath = routePath.substring(ROUTE_PATH_PREFIX.length); // Remove 'routes:' prefix
  }
  routeEntries.push([routePath, tagName]);
}

/**
 * Gets the global Router instance.
 * @returns Current Router instance or null if not connected
 */
export function getRouter(): Router | null {
  return globalRouter;
}

