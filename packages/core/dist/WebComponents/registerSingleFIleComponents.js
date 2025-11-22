/**
 * registerSingleFileComponents.ts
 *
 * Utility function to register multiple Single File Components (SFC) in bulk as Structive Web Components.
 *
 * Main responsibilities:
 * - Iterates through singleFileComponents (map of tagName to path) and asynchronously fetches and parses each SFC
 * - Registers routing information via entryRoute if enableRouter is active
 * - Generates Web Components classes via createComponentClass and registers them as custom elements via registerComponentClass
 *
 * Design points:
 * - Automates everything from SFC loading to Web Components registration and routing registration in bulk
 * - Supports dynamic registration of multiple components via asynchronous processing
 * - Flexible path processing including normalization of root path "/root" and removal of @routes prefix
 */
import { entryRoute } from "../Router/Router.js";
import { createComponentClass } from "./createComponentClass.js";
import { config } from "./getGlobalConfig.js";
import { loadSingleFileComponent } from "./loadSingleFileComponent.js";
import { registerComponentClass } from "./registerComponentClass.js";
/**
 * Registers multiple SFC files as custom elements and optionally as routes.
 *
 * This function processes each SFC sequentially, loading the file, creating
 * a component class, and registering it. If routing is enabled and the path
 * starts with '@routes', it also registers the component as a route.
 *
 * @param {SingleFileComponents} singleFileComponents - Object mapping tag names to SFC file paths
 * @returns {Promise<void>} Resolves when all components are registered
 * @throws {Error} If any file cannot be fetched, parsed, or registered
 * @throws {DOMException} If any tag name is invalid or already registered
 *
 * @example
 * await registerSingleFileComponents({
 *   'my-button': './components/button.sfc',
 *   'user-card': '@components/user-card',
 *   'home-page': '@routes/home'  // Also registers as route if enableRouter is true
 * });
 */
export async function registerSingleFileComponents(singleFileComponents) {
    // Process each component sequentially to maintain order
    for (const [tagName, path] of Object.entries(singleFileComponents)) {
        let componentData = null;
        // If router is enabled and path looks like a route, register routing info
        if (config.enableRouter) {
            // Remove '@routes' prefix if present (e.g., '@routes/home' -> '/home')
            const routePath = path.startsWith("@routes") ? path.slice(7) : path;
            // Normalize '/root' to '/' for the root route
            entryRoute(tagName, routePath === "/root" ? "/" : routePath);
        }
        // Load and parse the SFC file
        componentData = await loadSingleFileComponent(path);
        // Generate a Web Components class from the parsed data
        const componentClass = createComponentClass(componentData);
        // Register the class as a custom element
        registerComponentClass(tagName, componentClass);
    }
}
