import { raiseError } from "../../utils.js";
/**
 * BindingNode class is the base class for binding processing on a single target node (Element, Text, etc.).
 *
 * Architecture:
 * - _binding: Reference to parent binding (IBinding)
 * - _node: Target DOM node for binding
 * - _name: Property name of binding (e.g., "textContent", "value")
 * - _filters: Array of filter functions applied when retrieving value
 * - _decorates: Array of decorator strings (e.g., ["prevent", "stop"])
 * - _bindContents: Array of child BindContent (for structural control bindings)
 *
 * Main responsibilities:
 * 1. Hold node, property name, filters, decorators, and binding info
 * 2. Provide interface for binding value update (applyChange → assignValue)
 * 3. Manage multiple bind contents (bindContents) for structural control bindings
 * 4. Extend binding processing per node/property type by implementing assignValue, updateElements in subclasses
 *
 * Design patterns:
 * - Template Method: applyChange provides common flow, assignValue implemented in subclasses
 * - Strategy: Customize behavior with filters and decorators
 *
 * Subclasses:
 * - BindingNodeAttribute: Attribute binding
 * - BindingNodeProperty*: Property binding (value, checked, etc.)
 * - BindingNodeEvent*: Event binding
 * - BindingNodeFor, BindingNodeIf: Structural control binding
 *
 * Design points:
 * - assignValue, updateElements are unimplemented (must override in subclasses)
 * - isSelectElement, value, filteredValue etc. extended in subclasses as needed
 * - Flexible handling of filters, decorators, and bind contents
 */
export class BindingNode {
    _binding;
    _node;
    _name;
    _subName;
    _filters;
    _decorates;
    /**
     * Getter to return target DOM node for binding.
     *
     * @returns Target DOM node
     */
    get node() {
        return this._node;
    }
    /**
     * Getter to return property name of binding (e.g., "textContent", "value").
     *
     * @returns Property name string
     */
    get name() {
        return this._name;
    }
    /**
     * Getter to return sub-property name (same as name in base class, can be overridden in subclasses).
     *
     * @returns Sub-property name string
     */
    get subName() {
        return this._subName;
    }
    /**
     * Getter to return parent binding (IBinding).
     *
     * @returns Parent IBinding instance
     */
    get binding() {
        return this._binding;
    }
    /**
     * Getter to return array of decorator strings (e.g., ["prevent", "stop"]).
     *
     * @returns Array of decorator strings
     */
    get decorates() {
        return this._decorates;
    }
    /**
     * Getter to return array of filter functions.
     *
     * @returns Array of filter functions
     */
    get filters() {
        return this._filters;
    }
    /**
     * Getter to return array of child BindContent (for structural control bindings).
     *
     * @returns Array of IBindContent instances (empty in base class)
     */
    get bindContents() {
        return [];
    }
    /**
     * Constructor.
     * - binding: Parent binding
     * - node: Target DOM node for binding
     * - name: Property name of binding
     * - filters: Array of filter functions
     * - decorates: Array of decorator strings
     *
     * Initialization process:
     * 1. Save all parameters to private fields
     * 2. bindContents initialized as empty array
     * 3. Subclasses can implement additional initialization in activate()
     *
     * @param binding - Parent IBinding instance
     * @param node - Target DOM node
     * @param name - Property name of binding
     * @param subName - Sub-property name
     * @param filters - Array of filter functions
     * @param decorates - Array of decorator strings
     */
    constructor(binding, node, name, subName, filters, decorates) {
        this._binding = binding;
        this._node = node;
        this._name = name;
        this._subName = subName;
        this._filters = filters;
        this._decorates = decorates;
    }
    /**
     * Method to assign value to DOM (unimplemented in base class, must override in subclasses).
     * - Attribute binding: Set attribute value
     * - Property binding: Set property value
     * - Event binding: Register event listener
     * - Structural control binding: Modify DOM structure
     *
     * @param value - Value to assign to DOM
     * @throws BIND-301 Not implemented
     */
    assignValue(value) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.assignValue', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Method to batch update multiple elements (unimplemented in base class, override in structural control bindings).
     * - BindingNodeFor: Batch update of loop items
     * - Other bindings: Normally not used
     *
     * @param listIndexes - Array of list indices
     * @param values - Array of values
     * @throws BIND-301 Not implemented
     */
    updateElements(listIndexes, values) {
        raiseError({
            code: 'BIND-301',
            message: 'Not implemented',
            context: { where: 'BindingNode.updateElements', name: this.name },
            docsUrl: '/docs/error-codes.md#bind',
        });
    }
    /**
     * Redraw notification method (empty implementation in base class, can override in subclasses).
     * - Used to update related bindings after dynamic dependency resolution
     * - Used in structural control bindings to notify child BindContent
     *
     * @param refs - Array of state references for redraw
     */
    notifyRedraw(refs) {
        // Subclasses can implement notification considering parent-child relationships
    }
    /**
     * Change application method (Template Method pattern).
     * - Retrieves filtered value from BindingState
     * - Calls assignValue to reflect to DOM
     * - Subclasses override assignValue to implement specific processing
     *
     * @param renderer - Renderer instance for state access
     */
    applyChange(renderer) {
        const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
        this.assignValue(filteredValue);
    }
    /**
     * Method to activate binding node (empty implementation in base class, can override in subclasses).
     * - Execute initial rendering
     * - Register event listeners (event binding)
     * - Initialize child BindContent (structural control binding)
     */
    activate() {
        // Subclasses can implement activation processing
    }
    /**
     * Method to inactivate binding node (empty implementation in base class, can override in subclasses).
     * - Unregister event listeners (event binding)
     * - Cleanup child BindContent (structural control binding)
     */
    inactivate() {
        // Subclasses can implement inactivation processing
    }
    /**
     * Getter to determine if node is HTMLSelectElement.
     * Used for special handling of select elements in property binding.
     *
     * @returns true if node is HTMLSelectElement, false otherwise
     */
    get isSelectElement() {
        return this.node instanceof HTMLSelectElement;
    }
    /**
     * Getter to return current value (null in base class, override in subclasses).
     * Used to get current DOM value in bidirectional binding.
     *
     * @returns Current value or null
     */
    get value() {
        return null;
    }
    /**
     * Getter to return filtered value (null in base class, override in subclasses).
     * Used to get filtered DOM value in bidirectional binding.
     *
     * @returns Filtered value or null
     */
    get filteredValue() {
        return null;
    }
}
