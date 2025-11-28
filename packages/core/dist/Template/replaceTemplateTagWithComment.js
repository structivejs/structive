/**
 * replaceTemplateTagWithComment.ts
 *
 * Utility function to replace <template> tags with comment nodes and recursively register templates.
 *
 * Main responsibilities:
 * - Replaces the specified HTMLTemplateElement with a comment node (<!--template:id-->)
 * - Converts template tags within SVG to regular template elements, preserving attributes and child nodes
 * - Recursively replaces and registers nested templates within templates
 * - Manages templates with IDs using registerTemplate
 *
 * Design points:
 * - Maintains template hierarchical structure while marking them as comment nodes in the DOM
 * - Supports SVG and attribute inheritance for versatile template processing
 * - Assigns unique IDs via generateId for centralized template management
 */
import { COMMENT_TEMPLATE_MARK, DATA_BIND_ATTRIBUTE } from "../constants.js";
import { generateId } from "../GlobalId/generateId.js";
import { config } from "../WebComponents/getGlobalConfig.js";
import { registerTemplate } from "./registerTemplate.js";
/** SVG namespace URI for detecting SVG context */
const SVG_NS = "http://www.w3.org/2000/svg";
/**
 * Replaces a template element with a comment node in the DOM and recursively processes nested templates.
 * Handles special cases for SVG templates and preserves template hierarchies through registration.
 *
 * @param {number} id - Unique identifier for this template
 * @param {HTMLTemplateElement} template - The template element to replace and register
 * @param {number} [rootId=id] - Root template ID for tracking nested template hierarchies
 * @returns {number} The template ID (same as input id)
 *
 * @example
 * const template = document.createElement('template');
 * template.innerHTML = '<div>{{name}}</div>';
 * const templateId = replaceTemplateTagWithComment(1, template);
 */
export function replaceTemplateTagWithComment(id, rawTemplate, rootId = id) {
    let template = rawTemplate;
    // Replace the template element with a comment node in the DOM
    // This preserves the template's position while removing it from the visible DOM
    // Extract data-bind attribute for optional debug information
    const bindText = template.getAttribute(DATA_BIND_ATTRIBUTE);
    // In debug mode, include binding expression in comment for easier debugging
    const bindTextForDebug = config.debug ? (bindText ?? "") : "";
    // Replace template with comment marker (<!--template:id bindText-->)
    template.parentNode?.replaceChild(document.createComment(`${COMMENT_TEMPLATE_MARK}${id} ${bindTextForDebug}`), template);
    // Special handling for templates within SVG context
    if (template.namespaceURI === SVG_NS) {
        // SVG doesn't support <template> natively, so convert to HTML template element
        const newTemplate = document.createElement("template");
        // Move all child nodes from SVG template to new HTML template
        const childNodes = Array.from(template.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            newTemplate.content.appendChild(childNode);
        }
        // Preserve data-bind attribute from original SVG template
        newTemplate.setAttribute(DATA_BIND_ATTRIBUTE, bindText ?? "");
        template = newTemplate;
    }
    // Recursively process all nested templates within this template
    // Each nested template gets its own unique ID and is registered separately
    template.content.querySelectorAll("template").forEach(template => {
        replaceTemplateTagWithComment(generateId(), template, rootId);
    });
    // Register the processed template for later instantiation
    registerTemplate(id, template, rootId);
    return id;
}
