/**
 * registerStyleSheet.ts
 *
 * Management module for registering and retrieving CSSStyleSheet instances by ID.
 *
 * Main responsibilities:
 * - styleSheetById: Record that manages CSSStyleSheet instances keyed by ID
 * - registerStyleSheet: Registers a CSSStyleSheet instance with a specified ID
 * - getStyleSheetById: Retrieves a CSSStyleSheet instance by ID (throws error if not registered)
 *
 * Design points:
 * - Centrally manages CSSStyleSheet instances globally, enabling fast access via ID
 * - Throws clear exceptions via raiseError when accessing non-existent IDs
 */
import { raiseError } from "../utils.js";

/**
 * Global registry for CSSStyleSheet instances keyed by numeric ID.
 * Enables fast lookup and sharing of stylesheets across components.
 */
const styleSheetById: Record<number,CSSStyleSheet> = {};

/**
 * Registers a CSSStyleSheet instance with a unique numeric ID.
 * Allows the stylesheet to be retrieved later via getStyleSheetById.
 * Overwrites any existing stylesheet with the same ID.
 * 
 * @param {number} id - Unique numeric identifier for the stylesheet
 * @param {CSSStyleSheet} css - The CSSStyleSheet instance to register
 * @returns {void}
 * 
 * @example
 * const sheet = new CSSStyleSheet();
 * registerStyleSheet(1, sheet);
 */
export function registerStyleSheet(id: number, css: CSSStyleSheet) {
  styleSheetById[id] = css;
}

/**
 * Retrieves a registered CSSStyleSheet instance by its numeric ID.
 * Throws an error if no stylesheet is found with the given ID.
 * 
 * @param {number} id - The numeric identifier of the stylesheet to retrieve
 * @returns {CSSStyleSheet} The registered CSSStyleSheet instance
 * @throws {Error} Throws CSS-001 error if the stylesheet ID is not registered
 * 
 * @example
 * const sheet = getStyleSheetById(1);
 * document.adoptedStyleSheets = [sheet];
 */
export function getStyleSheetById(id: number): CSSStyleSheet {
  // Return the stylesheet if found, otherwise throw a descriptive error
  return styleSheetById[id] ?? raiseError({
    code: "CSS-001",
    message: `Stylesheet not found: ${id}`,
    context: { where: 'registerStyleSheet.getStyleSheetById', styleSheetId: id },
    docsUrl: "./docs/error-codes.md#css",
  });
}