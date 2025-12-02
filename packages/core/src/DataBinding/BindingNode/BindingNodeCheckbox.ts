import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeCheckbox class implements binding for checkboxes (input[type="checkbox"]).
 * Controls checked state by comparing array value with checkbox value.
 * Supports bidirectional binding and readonly mode.
 *
 * @throws BIND-201 Value is not array: When non-array value is passed
 * @throws BIND-201 Decorator conflict: When multiple decorators are specified
 */
class BindingNodeCheckbox extends BindingNode {
  /**
   * Returns raw value attribute of checkbox input element.
   * 
   * @returns Value attribute string
   */
  get value(): unknown {
    const element = this.node as HTMLInputElement;
    return element.value;
  }
  
  /**
   * Returns value with all filters applied.
   * 
   * @returns Filtered value
   */
  get filteredValue(): unknown {
    let value = this.value;
    for (let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }
  
  /**
   * Sets up bidirectional binding with event listener.
   * Event name: "input" (default), "change" (if onchange/change decorator), or none (if readonly/ro).
   * 
   * @param binding - Parent IBinding instance
   * @param node - DOM node (should be HTMLInputElement with type="checkbox")
   * @param name - Binding name
   * @param subName - Sub-property name
   * @param filters - Filter functions to apply
   * @param decorates - Array of decorators (event name or "readonly"/"ro")
  * @throws BIND-201 Decorator conflict
   */
  constructor(
    binding: IBinding,
    node: Node,
    name: string,
    subName: string,
    filters: Filters,
    decorates: string[],
  ) {
    super(binding, node, name, subName, filters, decorates);

    const isInputElement = this.node instanceof HTMLInputElement;
    if (!isInputElement) {return;}
    const inputElement = this.node;
    if (inputElement.type !== "checkbox") {return;}
    
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Checkbox binding has multiple decorators",
        context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
        docsUrl: "./docs/error-codes.md#bind",
        severity: "error",
      });
    }
    
    const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
    const eventName = event ?? "input";
    
    if (eventName === "readonly" || eventName === "ro") {return;}
    
    const engine = this.binding.engine;
    this.node.addEventListener(eventName, (_e) => {
      const loopContext = this.binding.parentBindContent.currentLoopContext;
      createUpdater<void>(engine, (updater) => {
        updater.update(loopContext, (state, handler) => {
          binding.updateStateValue(state, handler, this.filteredValue);
        });
      });
    });
  }
  
  /**
   * Sets checked state based on whether array includes filteredValue.
   * 
   * @param value - Array of checked values
   * @throws BIND-201 Value is not array
   */
  assignValue(value: unknown) {
    if (!Array.isArray(value)) {
      raiseError({
        code: 'BIND-201',
        message: 'Checkbox value is not array',
        context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
        docsUrl: './docs/error-codes.md#bind',
        severity: 'error',
      });
    }
    
    const element = this.node as HTMLInputElement;
    element.checked = value.includes(this.filteredValue);
  }
}

/**
 * Factory function to generate checkbox binding node.
 * 
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeCheckbox with binding, node, and filters
 */
export const createBindingNodeCheckbox: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeCheckbox(binding, node, name, "", filterFns, decorates);
    }
