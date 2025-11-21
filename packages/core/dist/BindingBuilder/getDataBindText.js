import { COMMENT_EMBED_MARK, COMMENT_TEMPLATE_MARK, DATA_BIND_ATTRIBUTE } from "../constants.js";
import { getTemplateById } from "../Template/registerTemplate.js";
/**
 * Cache comment mark lengths (performance optimization)
 */
const COMMENT_EMBED_MARK_LEN = COMMENT_EMBED_MARK.length;
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;
/**
 * Utility function that retrieves data-bind text (binding definition string) for each node type.
 * Extracts binding expressions appropriately based on how mustache syntax or comment bindings
 * were transformed during template preprocessing.
 *
 * Processing by node type:
 * 1. Text: Text node restored from comment
 *    - Get text after COMMENT_EMBED_MARK (e.g., "@@:")
 *    - Add "textContent:" prefix to create binding expression
 *    - Example: "@@:user.name" → "textContent:user.name"
 *
 * 2. HTMLElement: Regular HTML element
 *    - Get data-bind attribute value as-is
 *    - Example: <div data-bind="class:active"> → "class:active"
 *
 * 3. Template: Template reference comment
 *    - Extract template ID after COMMENT_TEMPLATE_MARK (e.g., "@@|")
 *    - Get template by ID and return its data-bind attribute value
 *    - Example: "@@|123 if:isVisible" → data-bind attribute of template 123
 *
 * 4. SVGElement: SVG element
 *    - Get data-bind attribute value as-is (same as HTML element)
 *
 * Usage examples:
 * ```typescript
 * // Text node (converted from mustache syntax)
 * const text = document.createTextNode("@@:user.name");
 * getDataBindText("Text", text); // → "textContent:user.name"
 *
 * // HTML element
 * const div = document.createElement("div");
 * div.setAttribute("data-bind", "class:active");
 * getDataBindText("HTMLElement", div); // → "class:active"
 *
 * // Template reference comment
 * const comment = document.createComment("@@|123 if:isVisible");
 * getDataBindText("Template", comment); // → data-bind value of template 123
 * ```
 *
 * @param nodeType - Node type
 * @param node - Target node
 * @returns Binding definition string (may be empty string)
 */
export function getDataBindText(nodeType, node) {
    switch (nodeType) {
        case "Text": {
            // Case 1: Text node (converted from mustache syntax)
            // Get text after comment mark (e.g., "@@:") and trim
            // Add "textContent:" prefix to create binding expression
            const text = node.textContent?.slice(COMMENT_EMBED_MARK_LEN).trim() ?? "";
            return "textContent:" + text;
        }
        case "HTMLElement": {
            // Case 2: HTMLElement (regular HTML element)
            // Return data-bind attribute value as-is
            // Return empty string if attribute doesn't exist
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "Template": {
            // Case 3: Template (template reference comment node)
            // Comment text format: "@@|123 if:isVisible" format
            // Step 1: Get text after comment mark
            const text = node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN).trim();
            // Step 2: Split by space and get first element as template ID
            // Example: "123 if:isVisible" → idText = "123"
            const [idText,] = text?.split(' ', 2) ?? [];
            const id = Number(idText);
            // Step 3: Get template element by ID
            const template = getTemplateById(id);
            // Step 4: Return data-bind attribute value of template
            // Binding definition that template itself has (e.g., "if:isVisible", "for:items")
            return template.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        case "SVGElement": {
            // Case 4: SVGElement (SVG element)
            // Return data-bind attribute value as-is, same as HTML element
            return node.getAttribute(DATA_BIND_ATTRIBUTE) ?? "";
        }
        default:
            // Other node types (normally unreachable)
            // Return empty string
            return "";
    }
}
