import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * Checks if element supports bidirectional binding.
 * 
 * @param element - HTML element to check
 * @returns true if element is input/textarea/select, false otherwise
 */
function isTwoWayBindable(element: HTMLElement): boolean {
  return element instanceof HTMLInputElement
    || element instanceof HTMLTextAreaElement
    || element instanceof HTMLSelectElement;
}

/**
 * Default event names for bidirectional binding by property name.
 */
const defaultEventByName: Record<string, string> = {
  value: "input",
  valueAsNumber: "input",
  valueAsDate: "input",
  checked: "change",
  selected: "change",
};

type DefaultPropertyByElementType = {
  [key: string]: Set<string>;
};

/**
 * Bidirectional bindable properties by input type.
 */
const twoWayPropertyByElementType: DefaultPropertyByElementType = {
  radio: new Set(["checked"]),
  checkbox: new Set(["checked"]),
};

const VALUES_SET = new Set(["value", "valueAsNumber", "valueAsDate"]);

const BLANK_SET = new Set<string>();

/**
 * Returns bidirectional bindable property set for element.
 * 
 * @param node - DOM node to check
 * @returns Set of bindable property names (e.g., "value", "checked")
 */
const getTwoWayPropertiesHTMLElement = (node: Node): Set<string> =>
  node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement
    ? VALUES_SET
    : node instanceof HTMLInputElement
      ? (twoWayPropertyByElementType[node.type] ?? VALUES_SET)
      : BLANK_SET;


/**
 * BindingNode for property binding (value, checked, etc.).
 * Supports bidirectional binding with event listeners.
 * Converts null/undefined/NaN to empty string.
 */
class BindingNodeProperty extends BindingNode {
  /**
   * Returns raw property value from DOM node.
   * 
   * @returns Property value
   */
  get value(): any {
    // @ts-ignore
    return this.node[this.name];
  }
  
  /**
   * Returns property value with filters applied.
   * 
   * @returns Filtered property value
   */
  get filteredValue(): any {
    let value = this.value;
    for (let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }
  
  /**
   * Registers event listener for bidirectional binding if:
   * - Element supports two-way binding (input/textarea/select)
   * - Property name is bindable (value, checked, etc.)
   * - Not readonly decorator
   * 
   * @param binding - Parent IBinding instance
   * @param node - DOM node
   * @param name - Property name (e.g., "value", "checked")
   * @param subName - Sub-property name
   * @param filters - Filter functions to apply
   * @param decorates - Array of decorators (event name or "readonly"/"ro")
   * @throws BIND-201 Has multiple decorators
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

    const isElement = this.node instanceof HTMLElement;
    if (!isElement) return;
    
    if (!isTwoWayBindable(this.node)) return;
    
    const defaultNames = getTwoWayPropertiesHTMLElement(this.node);
    if (!defaultNames.has(this.name)) return;
    
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Has multiple decorators",
        context: { where: "BindingNodeProperty.constructor", name: this.name, decoratesCount: decorates.length },
        docsUrl: "/docs/error-codes.md#bind",
        severity: "error",
      });
    }
    
    const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
    const eventName = event ?? defaultEventByName[this.name] ?? "readonly";
    
    if (eventName === "readonly" || eventName === "ro") return;

    const engine = this.binding.engine;
    this.node.addEventListener(eventName, async () => {
      const loopContext = this.binding.parentBindContent.currentLoopContext;
      const value = this.filteredValue;
      createUpdater<void>(engine, (updater) => {
        updater.update(loopContext, (state, handler) => {
          binding.updateStateValue(state, handler, value);
        });
      });
    });
  }

  /**
   * Assigns value to property, converting null/undefined/NaN to empty string.
   * 
   * @param value - Value to assign to property
   */
  assignValue(value: any) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      value = "";
    }
    // @ts-ignore
    this.node[this.name] = value;
  }
}

/**
 * Factory function to create BindingNodeProperty instances.
 * 
 * @param name - Property name (e.g., "value", "checked")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators (event name or "readonly"/"ro")
 * @returns Function that creates BindingNodeProperty with binding, node, and filters
 */
export const createBindingNodeProperty: CreateBindingNodeFn =
  (name: string, filterTexts: IFilterText[], decorates: string[]) =>
    (binding: IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeProperty(binding, node, name, "", filterFns, decorates);
    };

