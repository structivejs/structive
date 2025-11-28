import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { FilterWithOptions } from "../../Filter/types";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

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
  assignValue(value: unknown): void {
    const element = this.node as Element;
    const stringValue = 
      value === null || 
      value === undefined || 
      (typeof value === "number" && Number.isNaN(value))
        ? ""
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        : String(value);
    
    element.setAttribute(this.subName, stringValue);
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
export const createBindingNodeAttribute: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      const [, subName] = name.split(".");
      return new BindingNodeAttribute(binding, node, name, subName, filterFns, decorates);
    }
