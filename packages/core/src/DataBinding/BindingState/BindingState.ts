import { createFilters } from "../../BindingBuilder/createFilters";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { ILoopContext } from "../../LoopContext/types.js";
import { getByRef } from "../../StateClass/methods/getByRef.js";
import { setByRef } from "../../StateClass/methods/setByRef.js";
import { IStateHandler, IStateProxy, IWritableStateHandler, IWritableStateProxy } from "../../StateClass/types";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { IStructuredPathInfo } from "../../StateProperty/types";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IStatePropertyRef } from "../../StatePropertyRef/types.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { CreateBindingStateFn, IBindingState } from "./types";

/**
 * BindingState class manages state property access, filtering, and updates for bindings.
 * - Supports wildcard paths for array bindings with dynamic index resolution
 * - Handles bidirectional binding via assignValue
 */
class BindingState implements IBindingState {
  readonly pattern: string;
  readonly info: IStructuredPathInfo;
  readonly filters: Filters;
  readonly isLoopIndex: boolean = false;

  private _binding: IBinding;
  private _nullRef: IStatePropertyRef | null = null;
  private _ref: IStatePropertyRef | null = null;
  private _loopContext: ILoopContext | null = null;

  /**
   * Constructor initializes BindingState for property binding.
   * 
   * @param binding - Parent IBinding instance
   * @param pattern - State property pattern (e.g., "user.name", "items.*.value")
   * @param filters - Filter functions to apply
   */
  constructor(
    binding: IBinding, 
    pattern: string, 
    filters: Filters
  ) {
    this._binding = binding;
    this.pattern = pattern;
    this.info = getStructuredPathInfo(pattern);
    this.filters = filters;
    this._nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
  }

  /**
   * Returns list index from state property reference.
   * 
   * @returns IListIndex or null
   */
  get listIndex() {
    return this.ref.listIndex;
  }

  /**
   * Returns state property reference, dynamically resolved for wildcard paths.
   * 
   * @returns IStatePropertyRef instance
   * @throws BIND-201 LoopContext is null or ref is null
   */
  get ref() {
    if (this._nullRef === null) {
      if (this._loopContext === null) {
        raiseError({
          code: 'BIND-201',
          message: 'LoopContext is null',
          context: { pattern: this.pattern },
          docsUrl: '/docs/error-codes.md#bind',
          severity: 'error',
        });
      }
      if (this._ref === null) {
        this._ref = getStatePropertyRef(this.info, this._loopContext.listIndex);
      }
      return this._ref;
    } else {
      return this._nullRef ?? raiseError({
        code: 'BIND-201',
        message: 'ref is null',
        context: { pattern: this.pattern },
        docsUrl: '/docs/error-codes.md#bind',
        severity: 'error',
      });
    }
  }

  /**
   * Retrieves raw value from state without applying filters.
   * 
   * @param state - State proxy
   * @param handler - State handler
   * @returns Raw value from state
   */
  getValue(state:IStateProxy, handler:IStateHandler): unknown {
    return getByRef(this._binding.engine.state, this.ref, state, handler);
  }

  /**
   * Retrieves value from state and applies all filters.
   * 
   * @param state - State proxy
   * @param handler - State handler
   * @returns Filtered value
   */
  getFilteredValue(state:IStateProxy, handler:IStateHandler): unknown {
    let value = getByRef(this._binding.engine.state, this.ref, state, handler);
    for(let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }

  /**
   * Assigns value to state (for bidirectional binding).
   * 
   * @param writeState - Writable state proxy
   * @param handler - Writable state handler
   * @param value - Value to assign
   */
  assignValue(writeState: IWritableStateProxy, handler: IWritableStateHandler, value: unknown) {
    setByRef(this._binding.engine.state, this.ref, value, writeState, handler);
  }

  /**
   * Activates binding. Resolves loop context for wildcard bindings.
   * 
   * @throws BIND-201 Wildcard last parentPath is null or LoopContext is null
   */
  activate(): void {
    if (this.info.wildcardCount > 0) {
      const lastWildcardPath = this.info.lastWildcardPath ?? 
        raiseError({
          code: 'BIND-201',
          message: 'Wildcard last parentPath is null',
          context: { where: 'BindingState.init', pattern: this.pattern },
          docsUrl: '/docs/error-codes.md#bind',
          severity: 'error',
        });
      this._loopContext = this._binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ?? 
        raiseError({
          code: 'BIND-201',
          message: 'LoopContext is null',
          context: { where: 'BindingState.init', lastWildcardPath },
          docsUrl: '/docs/error-codes.md#bind',
          severity: 'error',
        });
    }
    this._binding.engine.saveBinding(this.ref, this._binding);
  }

  /**
   * Inactivates binding and clears references.
   */
  inactivate() {
    this._binding.engine.removeBinding(this.ref, this._binding);
    this._ref = null;
    this._loopContext = null;
  }
}

/**
 * Factory function to generate BindingState instance.
 * 
 * @param name - State property pattern
 * @param filterTexts - Array of filter text definitions
 * @returns Function that creates BindingState with binding and filters
 */
export const createBindingState: CreateBindingStateFn = 
  (name: string, filterTexts: IFilterText[]) => 
    (binding:IBinding, filters:FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      return new BindingState(binding, name, filterFns);
    }

