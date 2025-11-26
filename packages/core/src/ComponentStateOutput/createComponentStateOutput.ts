import { IComponentEngine } from "../ComponentEngine/types";
import { IComponentStateBinding } from "../ComponentStateBinding/types";
import { IListIndex } from "../ListIndex/types";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { IStructuredPathInfo } from "../StateProperty/types";
import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { raiseError } from "../utils";
import { IComponentStateOutput } from "./types";

/**
 * Implementation of component state output that bridges child and parent component states.
 * Translates child component state operations to parent component state operations
 * using path mapping from the component state binding.
 */
class ComponentStateOutput implements IComponentStateOutput {
  private _binding: IComponentStateBinding;
  private _childEngine: IComponentEngine;
  private _parentPaths: Set<string> = new Set<string>();
  /**
   * Constructor initializes component state output.
   * 
   * @param binding - Component state binding for path mapping
   * @param childEngine - Child component engine
   */
  constructor(binding: IComponentStateBinding, childEngine: IComponentEngine) {
    this._binding = binding;
    this._childEngine = childEngine;
  }

  /**
   * Gets the value of a child state property by delegating to the parent component.
   * Translates the child path to parent path and retrieves the value from parent engine.
   * 
   * @param ref - Child state property reference
   * @returns The value from the parent component state
   * @throws CSO-101 No child path found for path
   * @throws CSO-102 No binding found for child path
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(ref: IStatePropertyRef): any {
    const childPath = this._binding.startsWithByChildPath(ref.info);
    if (childPath === null) {
      raiseError({
        code: 'CSO-101',
        message: `No child path found for path "${ref.info.pattern}".`,
        context: { where: 'ComponentStateOutput.get', path: ref.info.pattern },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentBinding = this._binding.bindingByChildPath.get(childPath);
    if (typeof parentBinding === "undefined") {
      raiseError({
        code: 'CSO-102',
        message: `No binding found for child path "${childPath}".`,
        context: { where: 'ComponentStateOutput.get', childPath },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentPath = this._binding.toParentPathFromChildPath(ref.info.pattern);
    const parentInfo = getStructuredPathInfo(parentPath);
    const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
    if (!this._parentPaths.has(parentRef.info.pattern)) {
      const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
      parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
      this._parentPaths.add(parentRef.info.pattern);
    }
    return parentBinding.engine.getPropertyValue(parentRef);
  }

  /**
   * Sets the value of a child state property by delegating to the parent component.
   * Translates the child path to parent path and sets the value in parent engine.
   * 
   * @param ref - Child state property reference
   * @param value - New value to set
   * @returns true if the operation succeeded
   * @throws CSO-101 No child path found for path
   * @throws CSO-102 No binding found for child path
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(ref: IStatePropertyRef, value: any): boolean {
    const childPath = this._binding.startsWithByChildPath(ref.info);
    if (childPath === null) {
      raiseError({
        code: 'CSO-101',
        message: `No child path found for path "${ref.info.pattern}".`,
        context: { where: 'ComponentStateOutput.set', path: ref.info.pattern },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentBinding = this._binding.bindingByChildPath.get(childPath);
    if (typeof parentBinding === "undefined") {
      raiseError({
        code: 'CSO-102',
        message: `No binding found for child path "${childPath}".`,
        context: { where: 'ComponentStateOutput.set', childPath },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentPath = this._binding.toParentPathFromChildPath(ref.info.pattern);
    const parentInfo = getStructuredPathInfo(parentPath);
    const parentRef = getStatePropertyRef(parentInfo, ref.listIndex ?? parentBinding.bindingState.listIndex);
    if (!this._parentPaths.has(parentRef.info.pattern)) {
      const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
      parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
      this._parentPaths.add(parentRef.info.pattern);
    }
    parentBinding.engine.setPropertyValue(parentRef, value);
    return true;
  }

  /**
   * Checks if a given path pattern is handled by this state output.
   * 
   * @param pathInfo - Structured path information to check
   * @returns true if the path matches a child path in the binding
   */
  startsWith(pathInfo: IStructuredPathInfo): boolean {
    return this._binding.startsWithByChildPath(pathInfo) !== null;
  }

  /**
   * Gets list indexes for a child state property by delegating to the parent component.
   * Translates the child path to parent path and retrieves list indexes from parent engine.
   * 
   * @param ref - Child state property reference
   * @returns Array of list indexes or null if not a list
   * @throws CSO-101 No child path found for path
   * @throws CSO-102 No binding found for child path
   */
  getListIndexes(ref: IStatePropertyRef): IListIndex[] | null {
    const childPath = this._binding.startsWithByChildPath(ref.info);
    if (childPath === null) {
      raiseError({
        code: 'CSO-101',
        message: `No child path found for path "${ref.info.pattern}".`,
        context: { where: 'ComponentStateOutput.getListIndexes', path: ref.info.pattern },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentBinding = this._binding.bindingByChildPath.get(childPath);
    if (typeof parentBinding === "undefined") {
      raiseError({
        code: 'CSO-102',
        message: `No binding found for child path "${childPath}".`,
        context: { where: 'ComponentStateOutput.getListIndexes', childPath },
        docsUrl: './docs/error-codes.md#cso',
      });
    }
    const parentPathInfo = getStructuredPathInfo(this._binding.toParentPathFromChildPath(ref.info.pattern));
    const parentRef = getStatePropertyRef(parentPathInfo, ref.listIndex);
    if (!this._parentPaths.has(parentRef.info.pattern)) {
      const isList = this._childEngine.pathManager.lists.has(ref.info.pattern);
      parentBinding.engine.pathManager.addPath(parentRef.info.pattern, isList);
      this._parentPaths.add(parentRef.info.pattern);
    }
    return parentBinding.engine.getListIndexes(parentRef);
  }
}

/**
 * Creates a component state output instance for bridging child and parent component states.
 * 
 * @param binding - Component state binding for path mapping between child and parent
 * @param childEngine - Child component engine for accessing child state metadata
 * @returns Component state output interface
 */
export function createComponentStateOutput(
  binding: IComponentStateBinding, 
  childEngine: IComponentEngine
): IComponentStateOutput {
  return new ComponentStateOutput(binding, childEngine);
}