import { raiseError } from "../../utils.js";
import { createBindingFilters } from "../BindingFilter.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeClassList class implements binding for class attribute (classList).
 * Converts array value to space-separated string and sets to className.
 * One-way binding only.
 *
 * @throws BIND-201 Value is not array: When non-array value is passed
 */
class BindingNodeClassList extends BindingNode {
    /**
     * Converts array to space-separated string and sets to element.className.
     *
     * @param value - Array of class names
     * @throws BIND-201 Value is not array
     */
    assignValue(value) {
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'ClassList value is not array',
                context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.className = value.join(" ");
    }
}
/**
 * Factory function to generate classList binding node.
 *
 * @param name - Binding name ("class")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeClassList with binding, node, and filters
 */
export const createBindingNodeClassList = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeClassList(binding, node, name, "", filterFns, decorates);
};
