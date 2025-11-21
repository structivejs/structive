/**
 * Utility function to determine whether an element with the specified tag name can have a ShadowRoot.
 *
 * - Creates an element with the specified tag name and checks if the attachShadow method exists
 * - Returns false for invalid tag names or elements that don't support attachShadow
 *
 * @param tagName - Tag name of the element to check (e.g., "div", "span", "input")
 * @returns true if the element can have a ShadowRoot, false otherwise
 */
export function canHaveShadowRoot(tagName: string): boolean {
  try {
    // Temporarily create an element
    const element = document.createElement(tagName);
    // Check if the `attachShadow` method exists and is callable
    if (typeof element.attachShadow !== "function") {
      return false;
    }
    // Attempt to attach a ShadowRoot temporarily
    const shadowRoot = element.attachShadow({ mode: 'open' });
    return true;
  } catch {
    // Return false if an invalid tag name or other error occurs
    return false;
  }
}
