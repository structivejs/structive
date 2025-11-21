import { createFilters } from "../../BindingBuilder/createFilters.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeAttribute class implements binding node for attribute bindings (e.g., attr.src, attr.alt).
 * Converts null/undefined/NaN to empty string to conform to HTML spec.
 */
class BindingNodeAttribute extends BindingNode {
    /**
     * Assigns attribute value to DOM element.
     * Converts null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to attribute
     */
    assignValue(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            value = "";
        }
        const element = this.node;
        element.setAttribute(this.subName, value.toString());
    }
}
/**
 * Factory function to generate attribute binding node.
 *
 * @param name - Binding name (e.g., "attr.src", "attr.alt")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeAttribute with binding, node, and filters
 */
export const createBindingNodeAttribute = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeAttribute(binding, node, name, subName, filterFns, decorates);
};
