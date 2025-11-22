/**
 * removeEmptyTextNodes.ts
 *
 * Utility function to remove empty text nodes from a DocumentFragment.
 *
 * Main responsibilities:
 * - Detects and removes whitespace-only text nodes directly under the content (DocumentFragment)
 *
 * Design points:
 * - Converts childNodes to an array using Array.from and traverses all nodes with forEach
 * - Removes nodes via removeChild when nodeType is TEXT_NODE and nodeValue contains only whitespace
 * - Used for template processing and clean DOM generation
 */
/**
 * Removes all whitespace-only text nodes from a DocumentFragment.
 * This cleans up the DOM structure by removing unnecessary text nodes that contain
 * only spaces, tabs, newlines, or other whitespace characters.
 *
 * @param {DocumentFragment} content - The DocumentFragment to clean up
 * @returns {void}
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = `
 *   <div>
 *     <span>Hello</span>
 *   </div>
 * `;
 * removeEmptyTextNodes(template.content); // Removes whitespace text nodes
 */
export function removeEmptyTextNodes(content) {
    // Convert NodeList to array to safely iterate and remove nodes
    Array.from(content.childNodes).forEach(node => {
        // Check if node is a text node and contains only whitespace
        if (node.nodeType === Node.TEXT_NODE && !(node.nodeValue ?? "").trim()) {
            // Remove the empty text node from the fragment
            content.removeChild(node);
        }
    });
}
