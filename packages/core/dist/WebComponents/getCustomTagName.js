import { raiseError } from "../utils";
/**
 * Retrieves the custom element tag name from an HTMLElement.
 *
 * Handles both autonomous custom elements (tag names with hyphens like <my-element>)
 * and customized built-in elements (standard elements with 'is' attribute like <button is="my-button">).
 *
 * @param {HTMLElement} component - The HTML element to extract the tag name from
 * @returns {string} The custom element tag name in lowercase
 * @throws {Error} COMP-401 - When neither the tag name nor 'is' attribute contains a hyphen
 *
 * @example
 * // Autonomous custom element
 * const tagName = getCustomTagName(document.querySelector('my-element'));
 * // Returns: 'my-element'
 *
 * @example
 * // Customized built-in element
 * const tagName = getCustomTagName(document.querySelector('[is="my-button"]'));
 * // Returns: 'my-button'
 */
export function getCustomTagName(component) {
    // Check if it's an autonomous custom element (tag name contains hyphen)
    if (component.tagName.includes('-')) {
        return component.tagName.toLowerCase();
    }
    const isAttribute = component.getAttribute('is');
    // Check if it's a customized built-in element (has 'is' attribute with hyphen)
    if (isAttribute?.includes('-')) {
        return isAttribute.toLowerCase();
    }
    // Neither format found - not a valid custom element
    raiseError({
        code: 'COMP-401',
        message: 'Custom element tag name not found',
        context: {
            where: 'WebComponents.getCustomTagName',
            tagName: component.tagName,
            isAttribute: isAttribute ?? null,
        },
        docsUrl: './docs/error-codes.md#comp',
    });
}
