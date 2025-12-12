import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IRenderer } from "../../Updater/types.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { createBindingFilters } from "../BindingFilter.js";
import { IBindContent, IBinding } from "../types";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNode for conditional rendering (if binding).
 * Controls BindContent mount/unmount based on boolean value.
 * Uses comment node as marker to insert/remove content.
 *
 * @throws BIND-201 assignValue not implemented
 * @throws BIND-201 Value must be boolean
 * @throws BIND-201 ParentNode is null
 */
class BindingNodeIf extends BindingNodeBlock {
  private _bindContent: IBindContent;
  private _trueBindContents: IBindContent[];
  private _falseBindContents: IBindContent[] = [];
  private _bindContents: IBindContent[];

  /**
   * Initializes BindContent with blank reference.
   * Initial state treated as false (unmounted).
   * 
   * @param binding - Parent IBinding instance
   * @param node - Comment node as marker
   * @param name - Binding name
   * @param subName - Sub-property name
   * @param filters - Filter functions to apply
   * @param decorates - Array of decorators
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
    const blankInfo = getStructuredPathInfo("");
    const blankRef = getStatePropertyRef(blankInfo, null);
    
    this._bindContent = createBindContent(
      this.binding, 
      this.id, 
      this.binding.engine,
      blankRef, 
    );
    
    this._trueBindContents = [this._bindContent];
    this._bindContents = this._falseBindContents;
  }

  /**
   * Returns active BindContent array (true: [_bindContent], false: []).
   * 
   * @returns Array of active IBindContent instances
   */
  get bindContents(): IBindContent[] {
    return this._bindContents;
  }

  /**
   * Not implemented. Use applyChange for mount/unmount control.
   * 
   * @param value - Value (unused)
   * @throws BIND-201 Not implemented
   */
  assignValue(_value: unknown): void {
    raiseError({
      code: 'BIND-301',
      message: 'Binding assignValue not implemented',
      context: { where: 'BindingNodeIf.assignValue', bindName: this.name },
      docsUrl: './docs/error-codes.md#bind',
    });
  }
  
  /**
   * Validates boolean value and controls mount/unmount.
   * True: activate + mount + applyChange
   * False: unmount + inactivate
   * 
   * @param renderer - Renderer instance for state access
   * @throws BIND-201 Value is not boolean
   * @throws BIND-201 ParentNode is null
   */
  applyChange(renderer: IRenderer): void {
    const baseContext = {
      where: 'BindingNodeIf.applyChange',
      bindName: this.name,
    };
    const filteredValue = this.binding.bindingState.getFilteredValue(renderer.readonlyState, renderer.readonlyHandler);
    if (typeof filteredValue !== "boolean") {
      raiseError({
        code: 'BIND-201',
        message: 'If binding value is not boolean',
        context: { ...baseContext, receivedType: typeof filteredValue },
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    
    const parentNode = this.node.parentNode;
    if (parentNode === null) {
      raiseError({
        code: 'BIND-201',
        message: 'Parent node not found',
        context: { ...baseContext, nodeType: this.node.nodeType },
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    
    if (filteredValue) {
      this._bindContent.activate();
      this._bindContent.mountAfter(parentNode, this.node);
      this._bindContent.applyChange(renderer);
      this._bindContents = this._trueBindContents;
    } 
    else {
      this._bindContent.unmount();
      this._bindContent.inactivate();
      this._bindContents = this._falseBindContents;
    }
  }

  /**
   * Cleanup: unmount and inactivate content.
   */
  inactivate(): void {
    this._bindContent.unmount();
    this._bindContent.inactivate();
    this._bindContents = this._falseBindContents;
  }
}

/**
 * Factory function to create BindingNodeIf instances.
 * 
 * @param name - Binding name
 * @param filterTexts - Array of filter text definitions
 * @param decorates - Array of decorators
 * @returns Function that creates BindingNodeIf with binding, node, and filters
 */
export const createBindingNodeIf: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      const filterFns = createBindingFilters(filters, filterTexts);
      return new BindingNodeIf(binding, node, name, "", filterFns, decorates);
    }
