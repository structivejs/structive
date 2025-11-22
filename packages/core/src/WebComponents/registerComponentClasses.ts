/**
 * registerComponentClasses.ts
 *
 * Utility function to register multiple Structive Web Components classes as custom elements in bulk.
 *
 * Main responsibilities:
 * - Iterates through the provided componentClasses (map of tagName to componentClass) and registers each class via the define method
 *
 * Design points:
 * - Enables concise bulk registration of multiple components, improving reusability and maintainability
 */
import { StructiveComponentClasses } from "./types";

/**
 * Registers multiple Structive component classes as custom elements in bulk.
 * 
 * This is a convenience function for registering many components at once,
 * typically used during application initialization to define all custom elements.
 * 
 * @param {StructiveComponentClasses} componentClasses - Object mapping tag names to component classes
 * @returns {void}
 * @throws {DOMException} If any tag name is invalid or already registered
 * 
 * @example
 * const components = {
 *   'my-button': ButtonComponent,
 *   'my-card': CardComponent,
 *   'my-header': HeaderComponent
 * };
 * registerComponentClasses(components);
 * // All three components are now registered and can be used in HTML
 */
export function registerComponentClasses(componentClasses:StructiveComponentClasses) {
  // Iterate through each tag name and component class pair
  Object.entries(componentClasses).forEach(([tagName, componentClass]) => {
    // Register each component class with its corresponding tag name
    componentClass.define(tagName);
  });
}