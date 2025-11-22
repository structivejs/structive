/**
 * WeakMap storing parent-child relationships between Structive components.
 * Uses WeakMap to allow automatic garbage collection when components are destroyed.
 */
const parentStructiveComponentByStructiveComponent = new WeakMap();
/**
 * Finds the parent Structive component for a given component.
 * Returns the registered parent component or null if none exists.
 *
 * @param {StructiveComponent} el - The component to find the parent for
 * @returns {StructiveComponent | null} The parent component or null if not found
 *
 * @example
 * const parent = findStructiveParent(childComponent);
 * if (parent) {
 *   // Access parent component
 * }
 */
export function findStructiveParent(el) {
    return parentStructiveComponentByStructiveComponent.get(el) ?? null;
}
/**
 * Registers a parent-child relationship between two Structive components.
 * This allows child components to access their parent via findStructiveParent.
 *
 * @param {StructiveComponent} parentComponent - The parent component
 * @param {StructiveComponent} component - The child component to register
 * @returns {void}
 *
 * @example
 * registerStructiveComponent(parentComponent, childComponent);
 */
export function registerStructiveComponent(parentComponent, component) {
    parentStructiveComponentByStructiveComponent.set(component, parentComponent);
}
/**
 * Removes a component from the parent-child relationship registry.
 * Called during component cleanup/disconnection to prevent memory leaks.
 *
 * @param {StructiveComponent} component - The component to remove from registry
 * @returns {void}
 *
 * @example
 * removeStructiveComponent(component); // Called in disconnectedCallback
 */
export function removeStructiveComponent(component) {
    parentStructiveComponentByStructiveComponent.delete(component);
}
