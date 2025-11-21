import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { NotifyRedrawSymbol } from "../../ComponentStateInput/symbols.js";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IStatePropertyRef } from "../../StatePropertyRef/types.js";
import { IRenderer } from "../../Updater/types.js";
import { raiseError } from "../../utils.js";
import { registerStructiveComponent, removeStructiveComponent } from "../../WebComponents/findStructiveParent.js";
import { getCustomTagName } from "../../WebComponents/getCustomTagName.js";
import { StructiveComponent } from "../../WebComponents/types";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeComponent class implements binding processing to StructiveComponent (custom component).
 *
 * Responsibilities:
 * - Binds parent component state to child component state property
 * - Propagates state changes via NotifyRedrawSymbol
 * - Manages parent-child component relationships and lifecycle
 *
 * @throws COMP-401 Cannot determine custom element tag name: When tag name cannot be determined
 */
class BindingNodeComponent extends BindingNode {
  tagName: string;
  
  /**
   * Determines custom element tag name from element's tagName or is attribute.
   * 
   * @param binding - Parent IBinding instance
   * @param node - Custom element node
   * @param name - Binding name
   * @param subName - Sub-property name (component state property)
   * @param filters - Filter functions to apply
   * @param decorates - Array of decorators
   * @throws COMP-401 Cannot determine custom element tag name
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
    
    const element = this.node as HTMLElement;
    if (element.tagName.includes("-")) {
      this.tagName = element.tagName.toLowerCase();
    } 
    else if (element.getAttribute("is")?.includes("-")) {
      this.tagName = element.getAttribute("is")!.toLowerCase();
    } 
    else {
      raiseError({
        code: 'COMP-401',
        message: 'Cannot determine custom element tag name',
        context: { where: 'BindingNodeComponent.constructor' },
        docsUrl: '/docs/error-codes.md#comp',
      });
    }
  }

  /**
   * Sends redraw notification to child component after custom element is defined.
   * 
   * @param refs - Array of state property references to notify
   */
  _notifyRedraw(refs: IStatePropertyRef[]): void {
    const component = this.node as StructiveComponent;
    const tagName = getCustomTagName(component);
    customElements.whenDefined(tagName).then(() => {
      component.state[NotifyRedrawSymbol](refs);
    });
  }

  /**
   * Filters and propagates only related references to child component.
   * Skips refs that:
   * 1. Match this binding's pattern (already processed by applyChange)
   * 2. Are not in cumulative path set
   * 3. Have mismatched loop indices
   * 
   * @param refs - Array of state property references to filter and propagate
   */
  notifyRedraw(refs: IStatePropertyRef[]): void {
    const notifyRefs: IStatePropertyRef[] = [];
    const compRef = this.binding.bindingState.ref;
    const listIndex = compRef.listIndex;
    const atIndex = (listIndex?.length ?? 0) - 1;
    
    for(const ref of refs) {
      if (ref.info.pattern === compRef.info.pattern) {
        continue;
      }
      if (!ref.info.cumulativePathSet.has(compRef.info.pattern)) {
        continue;
      }
      if (atIndex >= 0) {
        if (ref.listIndex?.at(atIndex) !== listIndex) {
          continue;
        }
      }
      notifyRefs.push(ref);
    }
    
    if (notifyRefs.length === 0) {
      return;
    }
    this._notifyRedraw(notifyRefs);
  }

  /**
   * Notifies child component of this binding's state change.
   * 
   * @param renderer - Renderer instance
   */
  applyChange(renderer: IRenderer): void {
    this._notifyRedraw([this.binding.bindingState.ref]);
  }

  /**
   * Registers parent-child component relationship and adds binding to tracking structures.
   */
  activate(): void {
    const engine = this.binding.engine;
    const parentComponent = engine.owner;
    const component = this.node as StructiveComponent;

    const tagName = getCustomTagName(component);
    customElements.whenDefined(tagName).then(() => {
      parentComponent.registerChildComponent(component);
      component.stateBinding.addBinding(this.binding);
    });

    registerStructiveComponent(parentComponent, component);
    
    let bindings = engine.bindingsByComponent.get(component);
    if (typeof bindings === "undefined") {
      engine.bindingsByComponent.set(component, bindings = new Set<IBinding>());
    }
    bindings.add(this.binding);
  }

  /**
   * Unregisters component relationships and cleans up binding tracking.
   */
  inactivate(): void {
    const engine = this.binding.engine;
    removeStructiveComponent(this.node as StructiveComponent);
    
    let bindings = engine.bindingsByComponent.get(this.node as StructiveComponent);
    if (typeof bindings !== "undefined") {
      bindings.delete(this.binding);
    }
  }

}

/**
 * Factory function to generate component binding node.
 * 
 * @param name - Binding name (e.g., "component.stateProp")
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeComponent with binding, node, and filters
 */
export const createBindingNodeComponent: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      const [, subName] = name.split(".");
      return new BindingNodeComponent(binding, node, name, subName, filterFns, decorates);
    }
