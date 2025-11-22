import { raiseError } from "../utils";

/**
 * Retrieves the custom element tag name from an HTMLElement.
 * 
 * Handles both autonomous custom elements (tag names with hyphens like <my-element>)
 * and customized built-in elements (standard elements with 'is' attribute like <button is="my-button">).
 * 
 * @param {HTMLElement} component - The HTML element to extract the tag name from
 * @returns {string} The custom element tag name in lowercase
 * @throws {Error} CE-001 - When neither the tag name nor 'is' attribute contains a hyphen
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
export function getCustomTagName(component: HTMLElement): string {
  // Check if it's an autonomous custom element (tag name contains hyphen)
  if (component.tagName.includes('-')) {
    return component.tagName.toLowerCase();
  } 
  // Check if it's a customized built-in element (has 'is' attribute with hyphen)
  else if (component.getAttribute('is')?.includes('-')) {
    return component.getAttribute('is')!.toLowerCase();
  } 
  // Neither format found - not a valid custom element
  else {
    raiseError({
      code: 'CE-001',
      message: 'Custom tag name not found',
      context: { where: 'ComponentEngine.customTagName.get' },
      docsUrl: './docs/error-codes.md#ce',
    });
  }

}