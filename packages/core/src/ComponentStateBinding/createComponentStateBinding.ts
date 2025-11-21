import { IBinding } from "../DataBinding/types";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { IStructuredPathInfo } from "../StateProperty/types";
import { raiseError } from "../utils";
import { StructiveComponent } from "../WebComponents/types";
import { IComponentStateBinding } from "./types";

/**
 * ComponentStateBinding
 *
 * Purpose:
 * - Associates parent component state paths with child component sub-paths in a one-to-one relationship,
 *   enabling bidirectional path conversion and referencing (parent->child/child->parent).
 *
 * Constraints:
 * - Parent path/child path is 1:1 only (duplicate registration results in STATE-303)
 * - Performs path conversion with longest match, concatenating lower segments as-is
 */
class ComponentStateBinding implements IComponentStateBinding {
  childPaths: Set<string> = new Set<string>();
  parentPaths: Set<string> = new Set<string>();
  bindingByParentPath: Map<string, IBinding> = new Map();
  bindingByChildPath: Map<string, IBinding> = new Map();

  private _childPathByParentPath: Map<string, string> = new Map();
  private _parentPathByChildPath: Map<string, string> = new Map();
  private _bindings: WeakSet<IBinding> = new WeakSet();

  /**
   * Adds a binding to establish parent-child path mapping.
   * Validates that paths are not already mapped and registers the binding.
   */
  addBinding(binding: IBinding): void {
    if (this._bindings.has(binding)) {
      return; // Skip if binding is already added
    }
    const parentPath = binding.bindingState.pattern;
    const childPath = binding.bindingNode.subName;
    if (this._childPathByParentPath.has(parentPath)) {
      raiseError({
        code: "STATE-303",
        message: `Parent path "${parentPath}" already has a child path`,
        context: { parentPath, existingChildPath: this._childPathByParentPath.get(parentPath) },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    if (this._parentPathByChildPath.has(childPath)) {
      raiseError({
        code: "STATE-303",
        message: `Child path "${childPath}" already has a parent path`,
        context: { childPath, existingParentPath: this._parentPathByChildPath.get(childPath) },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    this._childPathByParentPath.set(parentPath, childPath);
    this._parentPathByChildPath.set(childPath, parentPath);
    this.parentPaths.add(parentPath);
    this.childPaths.add(childPath);
    this.bindingByParentPath.set(parentPath, binding);
    this.bindingByChildPath.set(childPath, binding);
    this._bindings.add(binding);
  }
  
  /**
   * Gets the child path mapped to the given parent path.
   * Returns undefined if no mapping exists.
   */
  getChildPath(parentPath: string): string | undefined {
    return this._childPathByParentPath.get(parentPath);
  }

  /**
   * Gets the parent path mapped to the given child path.
   * Returns undefined if no mapping exists.
   */
  getParentPath(childPath: string): string | undefined {
    return this._parentPathByChildPath.get(childPath);
  }

  /**
   * Converts a child path to its corresponding parent path.
   * Uses longest match algorithm and concatenates remaining segments.
   * Throws error if no matching parent path is found.
   */
  toParentPathFromChildPath(childPath: string): string {
    // Child to parent: Find longest matching entry in childPaths, concatenate remaining segments to parent
    const childPathInfo = getStructuredPathInfo(childPath);
    const matchPaths = childPathInfo.cumulativePathSet.intersection(this.childPaths);
    if (matchPaths.size === 0) {
      raiseError({
        code: "STATE-302",
        message: `No parent path found for child path "${childPath}"`,
        context: { childPath },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    const matchPathArray = Array.from(matchPaths);
    const longestMatchPath = matchPathArray[matchPathArray.length - 1];
    const remainPath = childPath.slice(longestMatchPath.length); // include the dot
    const matchParentPath = this._parentPathByChildPath.get(longestMatchPath);
    if (typeof matchParentPath === "undefined") {
      raiseError({
        code: "STATE-302",
        message: `No parent path found for child path "${childPath}"`,
        context: { childPath, longestMatchPath },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    return matchParentPath + remainPath;
  }

  /**
   * Converts a parent path to its corresponding child path.
   * Uses longest match algorithm and concatenates remaining segments.
   * Throws error if no matching child path is found.
   */
  toChildPathFromParentPath(parentPath: string): string {
    // Parent to child: Find longest matching entry in parentPaths, concatenate remaining segments to child
    const parentPathInfo = getStructuredPathInfo(parentPath);
    const matchPaths = parentPathInfo.cumulativePathSet.intersection(this.parentPaths);
    if (matchPaths.size === 0) {
      raiseError({
        code: "STATE-302",
        message: `No child path found for parent path "${parentPath}"`,
        context: { parentPath },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    const matchPathArray = Array.from(matchPaths);
    const longestMatchPath = matchPathArray[matchPathArray.length - 1];
    const remainPath = parentPath.slice(longestMatchPath.length); // include the dot
    const matchChildPath = this._childPathByParentPath.get(longestMatchPath);
    if (typeof matchChildPath === "undefined") {
      raiseError({
        code: "STATE-302",
        message: `No child path found for parent path "${parentPath}"`,
        context: { parentPath, longestMatchPath },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    return matchChildPath + remainPath;
  }

  /**
   * Checks if the given child path has a registered mapping.
   * Returns the longest matching child path, or null if no match exists.
   */
  startsWithByChildPath(childPathInfo: IStructuredPathInfo): string | null {
    if (this.childPaths.size === 0) {
      return null;
    }
    const matchPaths = childPathInfo.cumulativePathSet.intersection(this.childPaths);
    if (matchPaths.size === 0) {
      return null;
    } else {
      const matches = Array.from(matchPaths);
      const longestMatchPath = matches[matches.length - 1];
      return longestMatchPath;
    }
  }

  /**
   * Binds parent and child components by collecting and registering all bindings
   * from parent to child component.
   */
  bind(parentComponent: StructiveComponent, childComponent: StructiveComponent): void {
    // bindParentComponent
    const bindings = parentComponent.getBindingsFromChild(childComponent);
    for (const binding of bindings ?? []) {
      this.addBinding(binding);
    }
  }
}

export function createComponentStateBinding(): IComponentStateBinding {
  return new ComponentStateBinding();
}