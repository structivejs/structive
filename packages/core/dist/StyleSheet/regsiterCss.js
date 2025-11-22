/**
 * regsiterCss.ts
 *
 * Utility function for creating CSSStyleSheet from CSS strings and registering them by ID.
 *
 * Main responsibilities:
 * - Creates CSSStyleSheet instances from CSS strings
 * - Registers the CSSStyleSheet with a specified ID using registerStyleSheet
 *
 * Design points:
 * - Uses styleSheet.replaceSync to apply CSS synchronously
 * - Enables global style management and dynamic style application
 */
import { registerStyleSheet } from "./registerStyleSheet.js";
/**
 * Creates a CSSStyleSheet from a CSS string and registers it with a unique ID.
 * The CSS is applied synchronously using replaceSync for immediate availability.
 *
 * @param {number} id - Unique numeric identifier for the stylesheet
 * @param {string} css - CSS rules as a string to be applied to the stylesheet
 * @returns {void}
 *
 * @example
 * registerCss(1, `
 *   .container { display: flex; }
 *   .item { padding: 10px; }
 * `);
 */
export function registerCss(id, css) {
    // Create a new CSSStyleSheet instance
    const styleSheet = new CSSStyleSheet();
    // Apply CSS rules synchronously to the stylesheet
    styleSheet.replaceSync(css);
    // Register the stylesheet in the global registry
    registerStyleSheet(id, styleSheet);
}
