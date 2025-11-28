import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { FilterWithOptions } from "../../Filter/types";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

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
  assignValue(value: unknown) {
    if (!Array.isArray(value)) {
      raiseError({
        code: 'BIND-201',
        message: 'Value is not array',
        context: { where: 'BindingNodeClassList.update', receivedType: typeof value },
        docsUrl: '/docs/error-codes.md#bind',
        severity: 'error',
      });
    }
    
    const element = this.node as Element;
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
export const createBindingNodeClassList: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeClassList(binding, node, name, "", filterFns, decorates);
    }
