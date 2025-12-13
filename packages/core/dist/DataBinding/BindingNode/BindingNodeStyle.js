import { createBindingFilters } from "../BindingFilter.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeStyle class implements binding processing for style attributes.
 * - Extracts CSS property name (subName) from name and sets value with style.setProperty
 * - Converts null/undefined/NaN to empty string
 */
class BindingNodeStyle extends BindingNode {
    /**
     * Sets CSS property value. Converts null/undefined/NaN to empty string.
     *
     * @param value - Value to assign to CSS property
     */
    assignValue(value) {
        const element = this.node;
        const stringValue = value === null ||
            value === undefined ||
            (typeof value === "number" && Number.isNaN(value))
            ? ""
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            : String(value);
        element.style.setProperty(this.subName, stringValue.toString());
    }
}
const subNameByName = {};
/**
 * Factory function to generate style attribute binding node.
 *
 * @param name - Binding name (e.g., "style.color")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeStyle with binding, node, and filters
 */
export const createBindingNodeStyle = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = subNameByName[name] ?? (subNameByName[name] = name.split(".")[1]);
    return new BindingNodeStyle(binding, node, name, subName, filterFns, decorates);
};
