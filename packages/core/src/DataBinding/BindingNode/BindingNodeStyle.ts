import { IFilterText } from "../../BindingBuilder/types";
import { FilterWithOptions } from "../../Filter/types";
import { createBindingFilters } from "../BindingFilter.js";
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
  assignValue(value: unknown) {
    const element = this.node as HTMLElement;
    const stringValue = 
      value === null || 
      value === undefined || 
      (typeof value === "number" && Number.isNaN(value))
        ? ""
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        : String(value);

    element.style.setProperty(this.subName, stringValue.toString());
  }
}

const subNameByName: Record<string, string> = {};

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
      const filterFns = createBindingFilters(filters, filterTexts);
      const subName = subNameByName[name] ?? (subNameByName[name] = name.split(".")[1]);
      return new BindingNodeStyle(binding, node, name, subName, filterFns, decorates);
    }
