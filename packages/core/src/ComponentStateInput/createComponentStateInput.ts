import { IComponentEngine } from "../ComponentEngine/types";
import { IComponentStateBinding } from "../ComponentStateBinding/types";
import { SetByRefSymbol } from "../StateClass/symbols";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { createUpdater } from "../Updater/Updater";
import { raiseError } from "../utils";
import { AssignStateSymbol, NotifyRedrawSymbol } from "./symbols";
import { IComponentStateInput, IComponentStateInputHandler } from "./types";

/**
 * Handler class for ComponentStateInput proxy.
 * Manages state property access, assignment, and redraw notifications
 * by coordinating with the component engine and state binding.
 */
class ComponentStateInputHandler implements IComponentStateInputHandler {
  private _componentStateBinding: IComponentStateBinding;
  private _engine: IComponentEngine;
  /**
   * Constructor initializes component state input handler.
   * 
   * @param engine - Component engine instance
   * @param componentStateBinding - State binding configuration for path mapping
   */
  constructor(engine:IComponentEngine, componentStateBinding: IComponentStateBinding) {
    this._componentStateBinding = componentStateBinding;
    this._engine = engine;
  }

  /**
   * Assigns multiple state properties from an object synchronously.
   * 
   * @param object - Key-value pairs of state properties to assign
   */
  assignState(object: Record<string, unknown>): void {
    // Synchronous processing
    createUpdater<void>(this._engine, (updater) => {
      updater.update(null, (stateProxy, ) => {
        for(const [key, value] of Object.entries(object)) {
          const childPathInfo = getStructuredPathInfo(key);
          const childRef = getStatePropertyRef(childPathInfo, null);
          stateProxy[SetByRefSymbol](childRef, value);
        }
      });
    });
  }

  /**
   * Notifies the component to redraw based on parent state property changes.
   * Translates parent paths to child paths and enqueues update references.
   * 
   * @param refs - Array of parent state property references that have changed
   * @throws LIST-201 ListIndex not found for parent ref
   */
  notifyRedraw(refs: IStatePropertyRef[]): void {
    createUpdater<void>(this._engine, (updater) => {
      for(const parentPathRef of refs) {
        let childPath;
        try {
          childPath = this._componentStateBinding.toChildPathFromParentPath(parentPathRef.info.pattern);
        } catch(_e) {
          // Ignore non-target paths
          continue;
        }
        const childPathInfo = getStructuredPathInfo(childPath);
        const atIndex = childPathInfo.wildcardCount - 1;
        const childListIndex = (atIndex >= 0) ? (parentPathRef.listIndex?.at(atIndex) ?? null) : null;
        if (atIndex >= 0 && childListIndex === null) {
          raiseError({
            code: 'LIST-201',
            message: `ListIndex not found for parent ref: ${parentPathRef.info.pattern}`,
            context: {
              where: 'ComponentStateInput.notifyRedraw',
              parentPattern: parentPathRef.info.pattern,
              childPattern: childPathInfo.pattern,
            },
            docsUrl: './docs/error-codes.md#list',
          });
        }
        const childRef = getStatePropertyRef(childPathInfo, childListIndex);
        // Add to state update queue based on ref information
        updater.enqueueRef(childRef);
      }
    });
  }

  /**
   * Proxy get trap for accessing state properties and symbol-based methods.
   * 
   * @param target - Proxy target object
   * @param prop - Property key being accessed
   * @param receiver - Proxy receiver
   * @returns Property value or bound method
   * @throws Error if property is not supported
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target: any, prop: PropertyKey, _receiver: IComponentStateInput): unknown {
    if (prop === AssignStateSymbol) {
      return this.assignState.bind(this);
    } else if (prop === NotifyRedrawSymbol) {
      return this.notifyRedraw.bind(this);
    } else if (typeof prop === "string") {
      const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
      return this._engine.getPropertyValue(ref);
    }
    raiseError({
      code: 'STATE-204',
      message: `ComponentStateInput property not supported: ${String(prop)}`,
      context: { where: 'ComponentStateInput.get', prop: String(prop) },
      docsUrl: './docs/error-codes.md#state',
    });
  }

  /**
   * Proxy set trap for updating state properties.
   * 
   * @param target - Proxy target object
   * @param prop - Property key being set
   * @param value - New value to assign
   * @param receiver - Proxy receiver
   * @returns true if set operation succeeded
   * @throws Error if property is not supported
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(_target: any, prop: PropertyKey, value: any, _receiver: IComponentStateInput): boolean {
    if (typeof prop === "string") {
      const ref = getStatePropertyRef(getStructuredPathInfo(prop), null);
      this._engine.setPropertyValue(ref, value);
      return true;
    }
    raiseError({
      code: 'STATE-204',
      message: `ComponentStateInput property not supported: ${String(prop)}`,
      context: { where: 'ComponentStateInput.set', prop: String(prop) },
      docsUrl: './docs/error-codes.md#state',
    });
  }
}

/**
 * Creates a component state input proxy for managing parent-child state bindings.
 * 
 * @param engine - Component engine instance
 * @param componentStateBinding - State binding configuration for parent-child path mapping
 * @returns Proxied component state input interface
 */
export function createComponentStateInput(
  engine: IComponentEngine,
  componentStateBinding: IComponentStateBinding
): IComponentStateInput {
  const handler = new ComponentStateInputHandler(engine, componentStateBinding);
  return new Proxy({}, handler) as IComponentStateInput;
}