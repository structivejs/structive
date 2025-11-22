/**
 * registerHtml.ts
 *
 * Utility function for registering HTML strings as templates.
 *
 * Main responsibilities:
 * - Creates an HTML template with a specified ID and assigns a data-id attribute
 * - Converts Mustache syntax ({{ }}) to template tags (using replaceMustacheWithTemplateTag)
 * - Replaces template tags with comments (using replaceTemplateTagWithComment)
 *
 * Design points:
 * - Supports dynamic template generation/management and flexible template processing through syntax conversion
 * - Templates are created using document.createElement("template") and identified via data-id
 */
import { replaceMustacheWithTemplateTag } from "./replaceMustacheWithTemplateTag.js";
import { replaceTemplateTagWithComment } from "./replaceTemplateTagWithComment.js";
/**
 * Registers an HTML template by converting Mustache syntax to template tags and then to comments.
 * Creates a template element, assigns it an ID, and processes it for use in the template system.
 *
 * @param {number} id - Unique numeric identifier for the template
 * @param {string} html - HTML string that may contain Mustache syntax ({{ }})
 * @returns {void}
 *
 * @example
 * registerHtml(1, `
 *   <div>
 *     <h1>{{ title }}</h1>
 *     <p>{{ content }}</p>
 *   </div>
 * `);
 */
export function registerHtml(id, html) {
    // Create a new template element
    const template = document.createElement("template");
    // Assign the template ID as a data attribute for later retrieval
    template.dataset.id = id.toString();
    // Convert Mustache syntax ({{ }}) to template tags, then set as innerHTML
    template.innerHTML = replaceMustacheWithTemplateTag(html);
    // Replace template tags with comment nodes for data binding
    replaceTemplateTagWithComment(id, template);
}
