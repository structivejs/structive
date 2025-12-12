import { raiseError } from "../../utils.js";
import { createBindingFilters } from "../BindingFilter.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeClassName class implements toggle control for individual class names.
 * Uses classList.toggle based on boolean value.
 *
 * @throws BIND-201 Value is not boolean: When non-boolean value is passed
 */
class BindingNodeClassName extends BindingNode {
    /**
     * Adds or removes class based on boolean value using classList.toggle.
     *
     * @param value - Boolean value (true: add class, false: remove class)
     * @throws BIND-201 Value is not boolean
     */
    assignValue(value) {
        if (typeof value !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'ClassName value is not boolean',
                context: { where: 'BindingNodeClassName.update', receivedType: typeof value },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const element = this.node;
        element.classList.toggle(this.subName, value);
    }
}
/**
 * Factory function to generate class name binding node.
 *
 * @param name - Binding name (e.g., "class.active")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeClassName with binding, node, and filters
 */
export const createBindingNodeClassName = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const [, subName] = name.split(".");
    return new BindingNodeClassName(binding, node, name, subName, filterFns, decorates);
};
