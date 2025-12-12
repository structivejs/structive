import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { createBindingFilters } from "../BindingFilter.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 * Extracts event name from binding name ("onClick" → "click") and registers as event listener.
 * Supports preventDefault/stopPropagation decorators and passes loop indexes to handlers.
 *
 * @throws BIND-201 Binding value is not a function: When handler is missing
 */
class BindingNodeEvent extends BindingNode {
    /**
     * Registers event listener once at initialization.
     *
     * @param binding - Parent IBinding instance
     * @param node - DOM node to attach event listener
     * @param name - Binding name (e.g., "onClick", "onInput")
     * @param subName - Event name extracted from binding name (e.g., "click", "input")
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators ("preventDefault", "stopPropagation")
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const element = node;
        element.addEventListener(this.subName, (e) => this.handler(e));
    }
    /**
     * Event binding does nothing on state change.
     */
    update() {
    }
    /**
     * Executes bound function with event object and loop indexes as arguments.
     * Supports preventDefault/stopPropagation decorators.
     *
     * @param e - DOM event object
     * @returns Promise if handler returns Promise, void otherwise
     * @throws BIND-201 Binding value is not a function
     */
    handler(e) {
        const engine = this.binding.engine;
        const loopContext = this.binding.parentBindContent.currentLoopContext;
        const indexes = loopContext?.serialize().map((context) => context.listIndex.index) ?? [];
        const options = this.decorates;
        if (options.includes("preventDefault")) {
            e.preventDefault();
        }
        if (options.includes("stopPropagation")) {
            e.stopPropagation();
        }
        const resultPromise = createUpdater(engine, (updater) => {
            return updater.update(loopContext, (state, handler) => {
                const func = this.binding.bindingState.getValue(state, handler);
                if (typeof func === "function") {
                    return Reflect.apply(func, state, [e, ...indexes]);
                }
                raiseError({
                    code: 'BIND-201',
                    message: 'Binding value is not a function',
                    context: {
                        where: 'BindingNodeEvent.handler',
                        bindName: this.name,
                        eventName: this.subName,
                        receivedType: typeof func,
                    },
                    docsUrl: './docs/error-codes.md#bind',
                    severity: 'error',
                });
            });
        });
        if (resultPromise instanceof Promise) {
            resultPromise.catch((error) => {
                const cause = error instanceof Error ? error : new Error(String(error));
                raiseError({
                    code: 'BIND-202',
                    message: 'Event handler rejected',
                    context: { where: 'BindingNodeEvent.handler', bindName: this.name, eventName: this.subName },
                    docsUrl: './docs/error-codes.md#bind',
                    severity: 'error',
                    cause,
                });
            });
        }
    }
    /**
     * Event binding does nothing on state change.
     *
     * @param renderer - Renderer instance (unused)
     */
    applyChange(_renderer) {
    }
}
/**
 * Factory function to generate event binding node.
 *
 * @param name - Binding name (e.g., "onClick", "onInput")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators ("preventDefault", "stopPropagation")
 * @returns Function that creates BindingNodeEvent with binding, node, and filters
 */
export const createBindingNodeEvent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createBindingFilters(filters, filterTexts);
    const subName = name.slice(2);
    return new BindingNodeEvent(binding, node, name, subName, filterFns, decorates);
};
