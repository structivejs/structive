/**
 * registerComponentClass.ts
 *
 * Utility function to register a Structive Web Components class as a custom element with the specified tag name.
 *
 * Main responsibilities:
 * - registerComponentClass: Registers the provided componentClass using the define method with the given tagName
 *
 * Design points:
 * - Concisely wraps Web Components custom element registration for improved reusability
 */
import { StructiveComponentClass } from "./types";

/**
 * Registers a Structive component class as a custom element.
 * 
 * This is a convenience wrapper around the component class's define method,
 * which internally calls customElements.define() with the appropriate configuration.
 * 
 * @param {string} tagName - The custom element tag name (must contain a hyphen, e.g., 'my-button')
 * @param {StructiveComponentClass} componentClass - The component class to register
 * @returns {void}
 * @throws {DOMException} If the tag name is invalid or already registered
 * 
 * @example
 * const ButtonComponent = createComponentClass({
 *   stateClass: { count: 0 },
 *   html: '<button>{{count}}</button>',
 *   css: 'button { color: blue; }'
 * });
 * registerComponentClass('my-button', ButtonComponent);
 * // Now <my-button> can be used in HTML
 */
export function registerComponentClass(tagName: string, componentClass: StructiveComponentClass) {
  // Delegates to the component class's define method, which handles customElements.define()
  componentClass.define(tagName);
}