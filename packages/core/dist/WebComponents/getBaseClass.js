/**
 * Gets the base class constructor for a custom element.
 *
 * If extendTagName is provided, creates a temporary element to retrieve its constructor,
 * enabling customized built-in elements (e.g., extending <button>, <input>).
 * Otherwise, returns the standard HTMLElement constructor.
 *
 * @param {string | null} extendTagName - Tag name of the element to extend, or null for standard HTMLElement
 * @returns {Constructor<HTMLElement>} The constructor of the specified element or HTMLElement
 *
 * @example
 * // Get base class for extending a button
 * const ButtonClass = getBaseClass('button'); // Returns HTMLButtonElement constructor
 *
 * @example
 * // Get base class for standard custom element
 * const BaseClass = getBaseClass(null); // Returns HTMLElement
 */
export function getBaseClass(extendTagName) {
    // If extending a built-in element, create a temporary instance to get its constructor
    // Otherwise, use the standard HTMLElement class
    return extendTagName ? document.createElement(extendTagName).constructor : HTMLElement;
}
