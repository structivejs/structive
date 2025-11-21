import { createFilters } from "../../BindingBuilder/createFilters.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
/**
 * BindingNode for conditional rendering (if binding).
 * Controls BindContent mount/unmount based on boolean value.
 * Uses comment node as marker to insert/remove content.
 *
 * @throws BIND-201 assignValue not implemented
 * @throws BIND-201 Value must be boolean
 * @throws BIND-201 ParentNode is null
 */
class BindingNodeIf extends BindingNodeBlock {
    _bindContent;
    _trueBindContents;
    _falseBindContents = [];
    _bindContents;
    /**
     * Initializes BindContent with blank reference.
     * Initial state treated as false (unmounted).
     *
     * @param binding - Parent IBinding instance
     * @param node - Comment node as marker
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const blankInfo = getStructuredPathInfo("");
        const blankRef = getStatePropertyRef(blankInfo, null);
        this._bindContent = createBindContent(this.binding, this.id, this.binding.engine, blankRef);
        this._trueBindContents = [this._bindContent];
        this._bindContents = this._falseBindContents;
    }
    /**
     * Returns active BindContent array (true: [_bindContent], false: []).
     *
     * @returns Array of active IBindContent instances
     */
    get bindContents() {
        return this._bindContents;
    }
    /**
     * Not implemented. Use applyChange for mount/unmount control.
     *
     * @param value - Value (unused)
     * @throws BIND-201 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-201',
            message: 'Not implemented',
            context: { where: 'BindingNodeIf.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
    }
    /**
     * Validates boolean value and controls mount/unmount.
     * True: activate + mount + applyChange
     * False: unmount + inactivate
     *
     * @param renderer - Renderer instance for state access
     * @throws BIND-201 Value is not boolean
     * @throws BIND-201 ParentNode is null
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        if (typeof filteredValue !== "boolean") {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not boolean',
                context: { where: 'BindingNodeIf.applyChange', valueType: typeof filteredValue },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        const parentNode = this.node.parentNode;
        if (parentNode == null) {
            raiseError({
                code: 'BIND-201',
                message: 'ParentNode is null',
                context: { where: 'BindingNodeIf.applyChange', nodeType: this.node.nodeType },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        if (filteredValue) {
            this._bindContent.activate();
            this._bindContent.mountAfter(parentNode, this.node);
            this._bindContent.applyChange(renderer);
            this._bindContents = this._trueBindContents;
        }
        else {
            this._bindContent.unmount();
            this._bindContent.inactivate();
            this._bindContents = this._falseBindContents;
        }
    }
    /**
     * Cleanup: unmount and inactivate content.
     */
    inactivate() {
        this._bindContent.unmount();
        this._bindContent.inactivate();
        this._bindContents = this._falseBindContents;
    }
}
/**
 * Factory function to create BindingNodeIf instances.
 *
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeIf with binding, node, and filters
 */
export const createBindingNodeIf = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeIf(binding, node, name, "", filterFns, decorates);
};
