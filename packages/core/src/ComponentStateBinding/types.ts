import { IBinding } from "../DataBinding/types";
import { IStructuredPathInfo } from "../StateProperty/types";
import { StructiveComponent } from "../WebComponents/types";

/**
 * Component state binding interface for managing parent-child component state relationships.
 * 
 * Purpose:
 * - Manages bidirectional path mapping between parent and child component states
 * - Enables state synchronization across component boundaries
 * - Tracks bindings for efficient parent-child state propagation
 * 
 * Architecture:
 * - Created once per child component during initialization
 * - Populated dynamically as bindings are activated
 * - Used by ComponentStateInput/Output for path resolution
 * 
 * Usage Patterns:
 * - addBinding: Registers a new parent-child path mapping
 * - toChildPathFromParentPath: Converts parent path to child path
 * - toParentPathFromChildPath: Converts child path to parent path
 * - startsWithByChildPath: Checks if a path has a registered mapping
 * - bind: Initializes bindings from parent to child component
 * 
 * Mutability Analysis:
 * - childPaths: Mutable Set (add in addBinding line 52)
 *   → CANNOT be readonly: Dynamic path registration required
 * - parentPaths: Mutable Set (add in addBinding line 51)
 *   → CANNOT be readonly: Dynamic path registration required
 * - bindingByParentPath: Mutable Map (set in addBinding line 53)
 *   → CANNOT be readonly: Dynamic binding registration required
 * - bindingByChildPath: Mutable Map (set in addBinding line 54)
 *   → CANNOT be readonly: Dynamic binding registration required
 * 
 * Design Decision:
 * - All fields must be mutable for dynamic binding management
 * - Bindings are registered incrementally as components activate
 * - Mutation is intentional and necessary for runtime flexibility
 */
export interface IComponentStateBinding {
  childPaths: Set<string>;
  parentPaths: Set<string>;
  bindingByParentPath: Map<string, IBinding>;
  bindingByChildPath: Map<string, IBinding>;

  getChildPath(parentPath: string): string | undefined;
  getParentPath(childPath: string): string | undefined;
  toChildPathFromParentPath(parentPath: string): string;
  toParentPathFromChildPath(childPath: string): string;
  startsWithByChildPath(childPathInfo: IStructuredPathInfo): string | null;
  bind(parentComponent: StructiveComponent, childComponent: StructiveComponent): void;
  addBinding(binding: IBinding): void;
}
