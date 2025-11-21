import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IRenderer } from "../../Updater/types.js";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 * Extracts event name from binding name ("onClick" → "click") and registers as event listener.
 * Supports preventDefault/stopPropagation decorators and passes loop indexes to handlers.
 *
 * @throws BIND-201 is not a function: When binding value is not a function
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
  constructor(
    binding: IBinding, 
    node: Node, 
    name: string,
    subName: string,
    filters: Filters,
    decorates: string[]
  ) {
    super(binding, node, name, subName, filters, decorates);
    
    const element = node as HTMLElement;
    element.addEventListener(this.subName, (e:Event) => this.handler(e));
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
  async handler(e: Event) {
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
    
    const resultPromise = createUpdater<Promise<void> | void>(engine, (updater) => {
      return updater.update<Promise<void> | void>(loopContext, (state, handler) => {
        const func = this.binding.bindingState.getValue(state, handler);
        if (typeof func !== "function") {
          raiseError({
            code: 'BIND-201',
            message: `${this.name} is not a function`,
            context: { where: 'BindingNodeEvent.handler', name: this.name, receivedType: typeof func },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
          });
        }
        return Reflect.apply(func, state, [e, ...indexes]);
      });
    });
    
    if (resultPromise instanceof Promise) {
      await resultPromise;
    }
  }
  
  /**
   * Event binding does nothing on state change.
   * 
   * @param renderer - Renderer instance (unused)
   */
  applyChange(renderer: IRenderer): void {
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
export const createBindingNodeEvent: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      const subName = name.slice(2);
      return new BindingNodeEvent(binding, node, name, subName, filterFns, decorates);
    }
