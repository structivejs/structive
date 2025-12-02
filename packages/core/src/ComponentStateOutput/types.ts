import { IListIndex } from "../ListIndex/types";
import { IStructuredPathInfo } from "../StateProperty/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";

/**
 * Interface for child component state output that delegates operations to parent component state.
 * Maps child component state paths to parent component state paths and forwards operations.
 */
export interface IComponentStateOutput {
  /**
   * Gets the value of a child state property by delegating to the parent component.
   * @param ref - Child state property reference
   * @returns The value from the parent component state
   */
  get(ref: IStatePropertyRef): unknown;
  
  /**
   * Sets the value of a child state property by delegating to the parent component.
   * @param ref - Child state property reference
   * @param value - New value to set
   * @returns true if the operation succeeded
   */
  set(ref: IStatePropertyRef, value: unknown): boolean;
  
  /**
   * Checks if a given path pattern is handled by this state output.
   * @param pathInfo - Structured path information to check
   * @returns true if the path is bound to parent state
   */
  startsWith(pathInfo: IStructuredPathInfo): boolean;
  
  /**
   * Gets list indexes for a child state property by delegating to the parent component.
   * @param ref - Child state property reference
   * @returns Array of list indexes or null if not a list
   */
  getListIndexes(ref: IStatePropertyRef): IListIndex[] | null;
}

