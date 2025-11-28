import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IBindContent, IBinding, IRenderBinding } from "../types";

/**
 * Type definitions for BindingNode system.
 */

/**
 * Base interface for BindingNode implementations.
 */
export interface IBindingNodeBase {
  /**
   * DOM node associated with binding.
   */
  readonly node: Node;
  
  /**
   * Binding name (e.g., "text", "value", "for", "if").
   */
  readonly name: string;
  
  /**
   * Sub-name for binding details (e.g., "color" in "style.color").
   */
  readonly subName: string;
  
  /**
   * Decorators to control binding behavior (e.g., "once", "prevent", "stop").
   */
  readonly decorates: string[];
  
  /**
   * Parent binding object.
   */
  readonly binding: IBinding;
  
  /**
   * Filter functions applied to binding values.
   */
  readonly filters: Filters;
  
  /**
   * Whether node is a select element.
   */
  readonly isSelectElement: boolean;
  
  /**
   * Child BindContent array (used in for/if bindings).
   */
  readonly bindContents: IBindContent[];
  
  /**
   * Current value before filter application.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly value: any;
  
  /**
   * Value after filter application.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filteredValue: any;
  
  /**
   * Assigns value to binding node and updates DOM.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignValue(value: any): void;
  
  /**
   * Batch updates for list elements.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateElements(listIndexes: IListIndex[], values: any[]): void;
  
  /**
   * Notifies binding redraw.
   */
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

/**
 * Complete BindingNode interface with lifecycle methods.
 */
export type IBindingNode = IBindingNodeBase & Pick<IRenderBinding, "applyChange" | "activate" | "inactivate">;

/**
 * Function to generate BindingNode for specific node.
 */
export type CreateBindingNodeByNodeFn = 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => IBindingNode;

/**
 * Factory function to create BindingNode (curried).
 */
export type CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => CreateBindingNodeByNodeFn;
