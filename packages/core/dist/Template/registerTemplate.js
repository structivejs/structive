/**
 * Management module for registering and retrieving HTMLTemplateElement by ID.
 *
 * Responsibilities:
 * - registerTemplate: Registers a template with a specified ID (removes empty text nodes and parses data-bind)
 * - getTemplateById: Retrieves a template by ID (throws error if not registered)
 *
 * Throws (getTemplateById):
 * - TMP-001 Template not found: Requested template ID is not registered
 */
import { registerDataBindAttributes } from "../BindingBuilder/registerDataBindAttributes.js";
import { raiseError } from "../utils.js";
import { removeEmptyTextNodes } from "./removeEmptyTextNodes.js";
/**
 * Global registry for HTMLTemplateElement instances keyed by numeric ID.
 * Stores processed templates after empty text node removal and data-bind parsing.
 */
const templateById = {};
/**
 * Registers a template by ID and builds internal index and data-bind information.
 * Performs preprocessing to remove empty text nodes and parse data-bind attributes
 * for efficient template instantiation and data binding.
 *
 * @param {number} id - Unique template ID for registration and retrieval
 * @param {HTMLTemplateElement} template - The template element to register
 * @param {number} rootId - Root template ID used for nested template parsing and resolution
 * @returns {number} The registered template ID (same as input id)
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = '<div data-bind="text:name"></div>';
 * registerTemplate(1, template, 1);
 */
export function registerTemplate(id, template, rootId) {
    // Remove whitespace-only text nodes to clean up the template structure
    removeEmptyTextNodes(template.content);
    // Parse and index all data-bind attributes for efficient binding setup
    registerDataBindAttributes(id, template.content, rootId);
    // Store the processed template in the global registry
    templateById[id] = template;
    return id;
}
/**
 * Retrieves a registered template by its ID.
 * Throws an error if the template has not been registered.
 *
 * @param {number} id - The template ID to retrieve
 * @returns {HTMLTemplateElement} The registered template element
 * @throws {Error} Throws TMP-001 error if the template ID is not found in the registry
 *
 * @example
 * const template = getTemplateById(1);
 * const clone = template.content.cloneNode(true);
 */
export function getTemplateById(id) {
    // Return the template if found, otherwise throw a descriptive error
    return templateById[id] ?? raiseError({
        code: "TMP-001",
        message: `Template not found: ${id}`,
        context: { where: 'Template.getTemplateById', templateId: id },
        docsUrl: "./docs/error-codes.md#tmp",
    });
}
