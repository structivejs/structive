import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types";
import { IStateHandler, IStateProxy, IWritableStateHandler, IWritableStateProxy } from "../../StateClass/types";
import { IStructuredPathInfo } from "../../StateProperty/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IBinding, IRenderBinding } from "../types";

/**
 * Type definitions for binding state.
 * Defines interfaces and factory types for state property access, filtering, and value management.
 */

/**
 * Common interface for binding state.
 * Unified for normal binding (BindingState) and index binding (BindingStateIndex).
 */
export interface IBindingStateBase {
  readonly pattern      : string;
  readonly info         : IStructuredPathInfo;
  readonly listIndex    : IListIndex | null;
  readonly ref          : IStatePropertyRef;
  readonly filters      : Filters;
  readonly isLoopIndex  : boolean;
  assignValue(writeState:IWritableStateProxy, handler:IWritableStateHandler, value:unknown): void;
  getValue(state: IStateProxy, handler: IStateHandler): unknown;
  getFilteredValue(state: IStateProxy, handler: IStateHandler): unknown;
}

/**
 * Complete type of binding state, combining base functionality with activate/inactivate.
 */
export type IBindingState = IBindingStateBase & Pick<IRenderBinding, "activate" | "inactivate">;

/**
 * Factory type for generating binding state from binding instance and filter info.
 */
export type CreateBindingStateByStateFn = (binding:IBinding, filters: FilterWithOptions) => IBindingState;

/**
 * Factory-of-factory type for generating binding state factory functions.
 */
export type CreateBindingStateFn = (name: string, filterTexts: IFilterText[]) => CreateBindingStateByStateFn;
