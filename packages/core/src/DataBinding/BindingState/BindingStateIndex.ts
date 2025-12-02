import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { ILoopContext } from "../../LoopContext/types.js";
import { IStateHandler, IStateProxy, IWritableStateHandler, IWritableStateProxy } from "../../StateClass/types";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { CreateBindingStateFn, IBindingState } from "./types";

/**
 * BindingStateIndex manages binding state for loop index values ($1, $2, ...).
 * - Extracts index from loop context, supports filtering
 * - Read-only (assignValue not implemented)
 */
class BindingStateIndex implements IBindingState {
  readonly filters: Filters;

  private _binding: IBinding;
  private _pattern: string;
  private _indexNumber: number;
  private _loopContext: ILoopContext | null = null;

  /**
   * Constructor initializes BindingStateIndex for loop index binding.
   * 
   * @param binding - Parent IBinding instance
   * @param pattern - Index pattern string (e.g., "$1", "$2")
   * @param filters - Filter functions to apply
   * @throws BIND-202 Pattern is not a number
   */
  constructor(
    binding: IBinding, 
    pattern: string, 
    filters: Filters
  ) {
    this._binding = binding;
    this._pattern = pattern;
    const indexNumber = Number(pattern.slice(1));
    if (isNaN(indexNumber)) {
      raiseError({
        code: 'BIND-202',
        message: 'Pattern is not a number',
        context: { where: 'BindingStateIndex.constructor', pattern },
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    this._indexNumber = indexNumber;
    this.filters = filters;
  }

  private createContext(where: string, extra: Record<string, unknown> = {}) {
    return {
      where,
      pattern: this._pattern,
      indexNumber: this._indexNumber,
      ...extra,
    };
  }

  /**
   * Not implemented for index binding.
   * 
   * @throws BIND-301 Not implemented
   */
  get pattern(): string {
    return raiseError({
      code: 'BIND-301',
      message: 'Binding pattern not implemented',
      context: this.createContext('BindingStateIndex.pattern'),
      docsUrl: './docs/error-codes.md#bind',
    });
  }
  /**
   * Not implemented for index binding.
   * 
   * @throws BIND-301 Not implemented
   */
  get info() {
    return raiseError({
      code: 'BIND-301',
      message: 'Binding info not implemented',
      context: this.createContext('BindingStateIndex.info'),
      docsUrl: './docs/error-codes.md#bind',
    });
  }

  /**
   * Returns list index from current loop context.
   * 
   * @returns IListIndex instance
   * @throws LIST-201 listIndex is null
   */
  get listIndex() {
    return this._loopContext?.listIndex ?? raiseError({
      code: 'LIST-201',
      message: 'listIndex is null',
      context: this.createContext('BindingStateIndex.listIndex'),
      docsUrl: './docs/error-codes.md#list',
    });
  }

  /**
   * Returns state property reference from loop context.
   * 
   * @returns IStatePropertyRef instance
   * @throws STATE-202 ref is null
   */
  get ref() {
    return this._loopContext?.ref ?? raiseError({
      code: 'STATE-202',
      message: 'ref is null',
      context: this.createContext('BindingStateIndex.ref'),
      docsUrl: './docs/error-codes.md#state',
    });
  }

  /**
   * Always returns true for index binding.
   * 
   * @returns true
   */
  get isLoopIndex() {
    return true;
  }

  /**
   * Returns raw index value from list index.
   * 
   * @param state - State proxy (unused)
   * @param handler - State handler (unused)
   * @returns Index number
   * @throws LIST-201 listIndex is null
   */
  getValue(_state: IStateProxy, _handler: IStateHandler): number {
    return this.listIndex?.index ?? raiseError({
      code: 'LIST-201',
      message: 'listIndex is null',
      context: this.createContext('BindingStateIndex.getValue'),
      docsUrl: './docs/error-codes.md#list',
    });
  }

  /**
   * Returns filtered index value.
   * 
   * @param state - State proxy (unused)
   * @param handler - State handler (unused)
   * @returns Filtered index value
   * @throws LIST-201 listIndex is null
   */
  getFilteredValue(_tate: IStateProxy, _handler: IStateHandler): unknown {
    let value: unknown = this.listIndex?.index ?? raiseError({
      code: 'LIST-201',
      message: 'listIndex is null',
      context: this.createContext('BindingStateIndex.getFilteredValue'),
      docsUrl: './docs/error-codes.md#list',
    });
    for(let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }


  /**
   * Not implemented (index is read-only).
   * 
   * @param writeState - Writable state proxy (unused)
   * @param handler - Writable state handler (unused)
   * @param value - Value to assign (unused)
   * @throws BIND-301 Not implemented
   */
  assignValue(_writeState:IWritableStateProxy, _handler:IWritableStateHandler, _value:unknown): void {
    raiseError({
      code: 'BIND-301',
      message: 'Binding assignValue not implemented',
      context: this.createContext('BindingStateIndex.assignValue'),
      docsUrl: './docs/error-codes.md#bind',
    });
  }


  /**
   * Activates binding. Resolves loop context and registers to bindingsByListIndex.
   * 
   * @throws BIND-201 LoopContext is null or binding for list is null
   */
  activate(): void {
    const baseContext = this.createContext('BindingStateIndex.activate');
    const loopContext = this._binding.parentBindContent.currentLoopContext ??
      raiseError({
        code: 'BIND-201',
        message: 'LoopContext is null',
        context: baseContext,
        docsUrl: './docs/error-codes.md#bind',
      });
    const loopContexts = loopContext.serialize();
    this._loopContext = loopContexts[this._indexNumber - 1] ??
      raiseError({
        code: 'BIND-201',
        message: 'Current loopContext is null',
        context: this.createContext('BindingStateIndex.activate', {
          serializedIndex: this._indexNumber - 1,
          serializedLength: loopContexts.length,
        }),
        docsUrl: './docs/error-codes.md#bind',
      });
    const bindingForList = this._loopContext.bindContent?.parentBinding ?? null;
    if (bindingForList === null) {
      raiseError({
        code: 'BIND-201',
        message: 'Binding for list is null',
        context: baseContext,
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    const bindings = bindingForList.bindingsByListIndex.get(this.listIndex);
    if (typeof bindings === "undefined") {
      bindingForList.bindingsByListIndex.set(this.listIndex, new Set([this._binding]));
    } else {
      bindings.add(this._binding);
    }
  }

  /**
   * Inactivates binding and clears loop context reference.
   */
  inactivate(): void {
    this._loopContext = null;
  }
}

/**
 * Factory function to generate BindingStateIndex instance.
 * 
 * @param name - Index pattern string (e.g., "$1", "$2")
 * @param filterTexts - Array of filter text definitions
 * @returns Function that creates BindingStateIndex with binding and filters
 */
export const createBindingStateIndex: CreateBindingStateFn = 
  (name: string, filterTexts: IFilterText[]) => 
    (binding:IBinding, filters:FilterWithOptions) => {
      const filterFns = createFilters(filters, filterTexts);
      return new BindingStateIndex(binding, name, filterFns);
    }

