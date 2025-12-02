import { IStatePropertyRef } from "../StatePropertyRef/types";
import { AssignStateSymbol, NotifyRedrawSymbol } from "./symbols";

/**
 * Handler interface for managing component state input operations.
 * Provides methods for assigning state and notifying redraws.
 */
export interface IComponentStateInputHandler {
  /**
   * Assigns state properties to the component.
   * @param object - The state object to assign
   */
  assignState(object: Record<string, unknown>): void;
  
  /**
   * Notifies the component to redraw based on changed state property references.
   * @param refs - Array of state property references that have changed
   */
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

/**
 * Component state input interface that exposes state properties and control methods.
 * Allows external systems to assign state and trigger redraws via symbol-based methods.
 */
export interface IComponentStateInput {
  /** Dynamic state properties accessible by string keys */
  [key:string]: unknown;
  
  /** Symbol-based method to assign state from JSON data */
  [AssignStateSymbol]: (json: Record<string, unknown>) => void;
  
  /** Symbol-based method to notify component of state changes requiring redraw */
  [NotifyRedrawSymbol]: (refs: IStatePropertyRef[]) => void;
}

