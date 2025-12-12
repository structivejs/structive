import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { createBindingFilters } from "../BindingFilter.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeRadio class implements binding processing for radio buttons.
 * - Controls checked state by comparing binding value with input element value
 * - Supports bidirectional binding (auto-updates state on user selection)
 * - Converts null/undefined to empty string for comparison
 */
class BindingNodeRadio extends BindingNode {
    /**
     * Constructor sets up radio button bidirectional binding.
     * - Validates decorates count (max 1)
     * - Registers event listener for state updates (skipped if readonly/ro)
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node (should be HTMLInputElement with type="radio")
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators (event name or "readonly"/"ro")
     * @throws BIND-201 Has multiple decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement) {
            return;
        }
        const inputElement = this.node;
        if (inputElement.type !== "radio") {
            return;
        }
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Radio binding has multiple decorators",
                context: {
                    where: "BindingNodeRadio.constructor",
                    bindName: this.name,
                    decoratesCount: decorates.length,
                },
                docsUrl: "./docs/error-codes.md#bind",
            });
        }
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        if (eventName === "readonly" || eventName === "ro") {
            return;
        }
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, (_e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, this.filteredValue);
                });
            });
        });
    }
    /**
     * Returns raw value attribute of radio input element.
     *
     * @returns Value attribute string
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * Returns value with all filters applied.
     *
     * @returns Filtered value
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * Sets checked state by comparing binding value with filteredValue.
     * Converts null/undefined to empty string for comparison.
     *
     * @param value - Value from state binding
     */
    assignValue(rawValue) {
        let value;
        if (rawValue === null || rawValue === undefined) {
            value = "";
        }
        else {
            value = rawValue;
        }
        const element = this.node;
        element.checked = value === this.filteredValue;
    }
}
/**
 * Factory function to generate radio button binding node.
 *
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeRadio with binding, node, and filters
 */
export const createBindingNodeRadio = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    return new BindingNodeRadio(binding, node, name, "", filterFns, decorates);
};
