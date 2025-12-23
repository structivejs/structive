import { IComponentEngine } from "../ComponentEngine/types";
import { IListIndex } from "../ListIndex/types";
import { IWritableStateHandler, IWritableStateProxy } from "../StateClass/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { IRenderer } from "../Updater/types";
import { CreateBindingNodeByNodeFn, IBindingNode } from "./BindingNode/types";
import { CreateBindingStateByStateFn, IBindingState } from "./BindingState/types";
import { IBindContent, IBinding } from "./types";

/**
 * Coordinates BindingNode (DOM operations) and BindingState (state management) to achieve reactive binding.
 * 
 * Optimizations:
 * - Duplicate update prevention via updatedBindings set
 * - Single binding optimization: Add non-dynamic single ref to processedRefs
 * - WeakMap cache for loop index bindings
 */
class Binding implements IBinding {
  readonly parentBindContent: IBindContent;
  readonly engine: IComponentEngine;
  readonly node: Node;
  readonly bindingNode: IBindingNode;
  readonly bindingState: IBindingState;
  readonly bindingsByListIndex: WeakMap<IListIndex, Set<IBinding>> = new WeakMap();

  private _isActive: boolean = false;
  
  /**
   * Initialize binding with factories for BindingNode and BindingState.
   * Call activate() after construction to enable.
   * 
   * @param parentBindContent - Parent BindContent instance
   * @param node - DOM node to bind
   * @param engine - Component engine instance
   * @param createBindingNode - Factory function to create BindingNode
   * @param createBindingState - Factory function to create BindingState
   */
  constructor(
    parentBindContent: IBindContent,
    node: Node,
    engine: IComponentEngine,
    createBindingNode: CreateBindingNodeByNodeFn, 
    createBindingState: CreateBindingStateByStateFn,
  ) {
    this.parentBindContent = parentBindContent
    this.node = node;
    this.engine = engine
    this.bindingNode = createBindingNode(this, node, engine.inputFilters);
    this.bindingState = createBindingState(this, engine.outputFilters);
  }

  /**
   * Returns child BindContent managed by structural control bindings (for, if, etc.)
   * 
   * @returns Array of child BindContent instances (empty for non-structural bindings)
   */
  get bindContents(): IBindContent[] {
    return this.bindingNode.bindContents;
  }

  /**
   * Returns whether binding is currently active.
   * 
   * @returns true if binding is active, false otherwise
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Update state value for bidirectional binding (used by input, checkbox, etc.)
   * 
   * @param writeState - Writable state proxy
   * @param handler - State update handler
   * @param void - Value to assign to state
   */
  updateStateValue(writeState:IWritableStateProxy, handler: IWritableStateHandler, value: unknown): void {
    this.bindingState.assignValue(writeState, handler, value);
  }

  /**
   * Notify BindingNode to redraw if its ref matches any in the provided refs array.
   * 
   * @param refs - Array of state property references that require redraw
   */
  notifyRedraw(refs: IStatePropertyRef[]) {
    this.bindingNode.notifyRedraw(refs);
  }

  /**
   * Apply state changes to DOM with duplicate update prevention.
   * Optimization: Mark single binding refs as processed to avoid redundant checks.
   * 
   * @param renderer - Renderer instance managing update cycle
   */
  applyChange(renderer: IRenderer): void {
    if (renderer.updatedBindings.has(this)) {return;}
    if (renderer.renderPhase === 'build' && !this.bindingNode.buildable) {
      if (this.bindingNode.isSelectElement) {
        renderer.applySelectPhaseBinidings.add(this);
      } else {
        renderer.applyPhaseBinidings.add(this);
      }
      return;
    } else if (renderer.renderPhase === 'apply' && (this.bindingNode.buildable || this.bindingNode.isSelectElement)) {
      return;
    } else if (renderer.renderPhase === 'applySelect' && (this.bindingNode.buildable || !this.bindingNode.isSelectElement)) {
      return;
    }
    renderer.updatedBindings.add(this);
    this.bindingNode.applyChange(renderer);
    
    const ref = this.bindingState.ref;
    if (!this.bindingState.isLoopIndex && !this.engine.pathManager.dynamicDependencies.has(ref.info.pattern)) {
      const bindings = this.engine.getBindings(ref);
      if (bindings.length === 1) {
        renderer.processedRefs.add(ref);
      }
    }
  }

  /** Activate binding: subscribe to state and render to DOM. Not idempotent. */
  activate(): void {
    this._isActive = true;
    this.bindingState.activate();
    this.bindingNode.activate();
  }
  
  /** Inactivate binding: unsubscribe from state and cleanup resources. Idempotent. */
  inactivate(): void {
    if (this.isActive) {
      this.bindingNode.inactivate();
      this.bindingState.inactivate();
      this._isActive = false;
    }
  }
}

/**
 * Factory function to create Binding instance. Call activate() after creation.
 * 
 * @param parentBindContent - Parent BindContent instance
 * @param node - DOM node to bind
 * @param engine - Component engine instance
 * @param createBindingNode - Factory function to create BindingNode
 * @param createBindingState - Factory function to create BindingState
 * @returns New Binding instance
 */
export function createBinding(
  parentBindContent: IBindContent,
  node: Node, 
  engine: IComponentEngine, 
  createBindingNode: CreateBindingNodeByNodeFn, 
  createBindingState: CreateBindingStateByStateFn
): IBinding {
  return new Binding(
    parentBindContent, 
    node, 
    engine, 
    createBindingNode, 
    createBindingState
  );
}