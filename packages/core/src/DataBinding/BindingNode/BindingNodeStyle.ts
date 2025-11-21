import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

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
  assignValue(value:any) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      value = "";
    }
    
    const element = this.node as HTMLElement;
    element.style.setProperty(this.subName, value.toString());
  }
}

/**
 * Factory function to generate style attribute binding node.
 * 
 * @param name - Binding name (e.g., "style.color")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeStyle with binding, node, and filters
 */
export const createBindingNodeStyle: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      const [, subName] = name.split(".");
      return new BindingNodeStyle(binding, node, name, subName, filterFns, decorates);
    }


