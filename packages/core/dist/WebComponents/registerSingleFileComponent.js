/**
 * registerSingleFileComponent.ts
 *
 * Utility function to load a Single File Component (SFC) from a specified path and register it as a Structive Web Component.
 *
 * Main responsibilities:
 * - Asynchronously fetches and parses the SFC file via loadSingleFileComponent
 * - Generates a Web Components class via createComponentClass
 * - Registers as a custom element with the specified tag name via registerComponentClass
 *
 * Design points:
 * - Supports dynamic component registration via asynchronous processing
 * - Provides a concise API that executes everything from SFC parsing to registration in one call
 */
import { createComponentClass } from "./createComponentClass.js";
import { loadSingleFileComponent } from "./loadSingleFileComponent.js";
import { registerComponentClass } from "./registerComponentClass.js";
/**
 * Loads an SFC file and registers it as a custom element in one operation.
 *
 * This is a high-level convenience function that combines loading, parsing,
 * class generation, and registration into a single async call. Ideal for
 * dynamically loading components at runtime.
 *
 * @param {string} tagName - The custom element tag name (must contain a hyphen, e.g., 'my-button')
 * @param {string} path - Path or alias to the SFC file (e.g., './button.sfc' or '@components/button')
 * @returns {Promise<void>} Resolves when the component is fully registered
 * @throws {Error} If the file cannot be fetched, parsed, or registered
 * @throws {DOMException} If the tag name is invalid or already registered
 *
 * @example
 * // Register a component from a relative path
 * await registerSingleFileComponent('my-button', './components/button.sfc');
 * // Now <my-button> can be used in HTML
 *
 * @example
 * // Register a component from an importmap alias
 * await registerSingleFileComponent('user-card', '@components/user-card');
 */
export async function registerSingleFileComponent(tagName, path) {
    // Step 1: Load and parse the SFC file (template, script, style)
    const componentData = await loadSingleFileComponent(path);
    // Step 2: Generate a Web Components class from the parsed data
    const componentClass = createComponentClass(componentData);
    // Step 3: Register the class as a custom element with the specified tag name
    registerComponentClass(tagName, componentClass);
}
