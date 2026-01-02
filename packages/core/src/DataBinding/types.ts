
import { ILoopContext } from "../LoopContext/types";           
import { IComponentEngine } from "../ComponentEngine/types";     
import { IBindingNode } from "./BindingNode/types";             
import { IBindingState } from "./BindingState/types";           
import { IWritableStateHandler, IWritableStateProxy } from "../StateClass/types"; 
import { IStatePropertyRef } from "../StatePropertyRef/types";   
import { IListIndex } from "../ListIndex/types";                 
import { IRenderer } from "../Updater/types";
/**
 * Type definitions for DataBinding module.
 * Defines interfaces for reactive data binding system including BindContent, Binding, and their rendering capabilities.
 */

/**
 * Common interface for rendering functionality.
 * Implemented by IBindContent and IBinding for unified rendering control.
 */
export interface IRenderBinding {
  applyChange(renderer: IRenderer): void;
  activate(): void;
  inactivate(): void;
  readonly isActive: boolean;
}

/**
 * Base interface for BindContent managing DOM fragments and bindings.
 */
export interface IBindContentBase {
  parentBinding: IBinding | null;
  readonly loopContext: ILoopContext | null;
  readonly id: number;
  readonly firstChildNode: Node | null;
  readonly lastChildNode: Node | null;
  readonly currentLoopContext: ILoopContext | null;
  readonly fragment: DocumentFragment;
  readonly childNodes: Node[];
  readonly bindings: IBinding[];

  mount(parentNode:Node):void;
  mountBefore(parentNode:Node, beforeNode:Node | null):void;
  mountAfter(parentNode:Node, afterNode:Node | null):void;
  unmount():void;
  assignListIndex(listIndex: IListIndex): void;
  readonly lastNode: Node | null;
}

/**
 * Complete interface combining IBindContentBase and IRenderBinding.
 */
export type IBindContent = IBindContentBase & IRenderBinding;

/**
 * Base interface for Binding managing correspondence between DOM node and state property.
 * Integrates BindingNode (DOM operations) and BindingState (state management).
 */
export interface IBindingBase {
  readonly parentBindContent: IBindContent;
  readonly engine: IComponentEngine;
  readonly node: Node;
  readonly bindingNode: IBindingNode;
  readonly bindingState: IBindingState;
  readonly bindContents: IBindContent[];
  readonly bindingsByListIndex: WeakMap<IListIndex, Set<IBinding>>;
  updateStateValue(writeState: IWritableStateProxy, handler: IWritableStateHandler, value: unknown): void;
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

/**
 * Complete interface combining IBindingBase and IRenderBinding.
 */
export type IBinding = IBindingBase & IRenderBinding;

/**
 * Map linking loop contexts and BindContent per state property.
 * Structure: Map<PropertyPath, WeakMap<ILoopContext, IBindContent>>
 * WeakMap enables automatic cleanup when LoopContext is destroyed.
 */
export type StateBindSummary = Map<string, WeakMap<ILoopContext, IBindContent>>;


