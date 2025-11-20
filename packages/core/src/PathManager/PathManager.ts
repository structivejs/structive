import { getListPathsSetById, getPathsSetById } from "../BindingBuilder/registerDataBindAttributes";
import { CONNECTED_CALLBACK_FUNC_NAME, DISCONNECTED_CALLBACK_FUNC_NAME, RESERVED_WORD_SET, UPDATED_CALLBACK_FUNC_NAME } from "../constants";
import { addPathNode, createRootNode } from "../PathTree/PathNode";
import { IPathNode } from "../PathTree/types";
import { createAccessorFunctions } from "../StateProperty/createAccessorFunctions";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { Constructor } from "../types";
import { StructiveComponentClass } from "../WebComponents/types";
import { Dependencies, IPathManager } from "./types";

class PathManager implements IPathManager {
  alls: Set<string> = new Set<string>();
  lists: Set<string> = new Set<string>();
  elements: Set<string> = new Set<string>();
  funcs: Set<string> = new Set<string>();
  getters: Set<string> = new Set<string>();
  onlyGetters: Set<string> = new Set<string>();
  setters: Set<string> = new Set<string>();
  getterSetters: Set<string> = new Set<string>();
  optimizes: Set<string> = new Set<string>();
  staticDependencies: Dependencies<string> = new Map<string, Set<string>>();
  dynamicDependencies: Dependencies<string> = new Map<string, Set<string>>();
  rootNode: IPathNode = createRootNode();
  hasConnectedCallback: boolean = false;
  hasDisconnectedCallback: boolean = false;
  hasUpdatedCallback: boolean = false;
  #id: number;
  #stateClass: Constructor<any>;

  constructor(componentClass: StructiveComponentClass) {
    this.#id = componentClass.id;
    this.#stateClass = componentClass.stateClass;
    const alls = getPathsSetById(this.#id);
    const listsFromAlls = new Set<string>();
    for(const path of alls) {
      const info = getStructuredPathInfo(path);
      this.alls = this.alls.union(info.cumulativePathSet);
      // Check all paths in cumulativePathSet for wildcards
      for(const cumulativePath of info.cumulativePathSet) {
        const cumulativeInfo = getStructuredPathInfo(cumulativePath);
        if (cumulativeInfo.lastSegment === "*") {
          listsFromAlls.add(cumulativeInfo.parentPath!);
        }
      }
    }
    const lists = getListPathsSetById(this.#id);
    this.lists = this.lists.union(lists).union(listsFromAlls);
    for(const listPath of this.lists) {
      const elementPath = listPath + ".*";
      this.elements.add(elementPath);
    }
    let currentProto = this.#stateClass.prototype;
    while (currentProto && currentProto !== Object.prototype) {
      const getters = Object.getOwnPropertyDescriptors(currentProto);
      if (getters) {
        for (const [key, desc] of Object.entries(getters)) {
          if (RESERVED_WORD_SET.has(key)) {
            continue;
          }
          if (typeof desc.value === "function") {
            this.funcs.add(key);
            if (key === CONNECTED_CALLBACK_FUNC_NAME) {
              this.hasConnectedCallback = true;
            }
            if (key === DISCONNECTED_CALLBACK_FUNC_NAME) {
              this.hasDisconnectedCallback = true;
            }
            if (key === UPDATED_CALLBACK_FUNC_NAME) {
              this.hasUpdatedCallback = true;
            }
            continue;
          }
          const hasGetter = (desc as PropertyDescriptor).get !== undefined;
          const hasSetter = (desc as PropertyDescriptor).set !== undefined;
          const info = getStructuredPathInfo(key);
          this.alls = this.alls.union(info.cumulativePathSet);
          if (hasGetter) {
            this.getters.add(key);
          }
          if (hasSetter) {
            this.setters.add(key);
          }
          if (hasGetter && !hasSetter) {
            this.onlyGetters.add(key);
          }
          if (hasGetter && hasSetter) {
            this.getterSetters.add(key);
          }
        }
      }
      currentProto = Object.getPrototypeOf(currentProto);
    }
    // 最適化対象のパスを決定し、最適化する
    for(const path of this.alls) {
      if (this.getters.has(path)) {
        continue;
      }
      if (this.setters.has(path)) {
        continue;
      }
      const info = getStructuredPathInfo(path);
      if (info.pathSegments.length === 1) {
        continue;
      }
      const funcs = createAccessorFunctions(info, this.getters);
      Object.defineProperty(this.#stateClass.prototype, path, {
        get: funcs.get,
        set: funcs.set,
        enumerable: true,
        configurable: true,
      });
      this.optimizes.add(path);
    }
    // 静的依存関係の設定
    for(const path of this.alls) {
      addPathNode(this.rootNode, path);
      const info = getStructuredPathInfo(path);
      if (info.parentPath) {
        this.staticDependencies.get(info.parentPath)?.add(path) ?? 
          this.staticDependencies.set(info.parentPath, new Set([path]));
      }
    }
  }
  
  addPath(addPath: string, isList: boolean = false): void {
    const info = getStructuredPathInfo(addPath);
    if (isList && !this.lists.has(addPath)) {
      this.lists.add(addPath);
      const elementPath = addPath + ".*";
      this.elements.add(elementPath);
    } else if (info.lastSegment === "*") {
      this.elements.add(addPath);
      this.lists.add(info.parentPath!);
    }
    for(const path of info.cumulativePathSet) {
      if (this.alls.has(path)) continue;
      this.alls.add(path);
      addPathNode(this.rootNode, path);
      const pathInfo = getStructuredPathInfo(path);
      if (pathInfo.lastSegment === "*") {
        this.elements.add(path);
        this.lists.add(pathInfo.parentPath!);
      }      
      if (pathInfo.pathSegments.length > 1) {
        const funcs = createAccessorFunctions(pathInfo, this.getters);
        Object.defineProperty(this.#stateClass.prototype, path, {
          get: funcs.get,
          set: funcs.set,
          enumerable: true,
          configurable: true,
        });
        this.optimizes.add(path);
      }

      if (pathInfo.parentPath) {
        this.staticDependencies.get(pathInfo.parentPath)?.add(path) ?? 
          this.staticDependencies.set(pathInfo.parentPath, new Set([path]));
      }
    }
  }
  #dynamicDependencyKeys = new Set<string>();
  addDynamicDependency(target: string, source: string) {
    const key = source + "=>" + target;
    if (this.#dynamicDependencyKeys.has(key)) {
      return;
    }
    if (!this.alls.has(source)) {
      this.addPath(source)
    }
    this.#dynamicDependencyKeys.add(key);
    this.dynamicDependencies.get(source)?.add(target) ?? 
      this.dynamicDependencies.set(source, new Set([target]));
  }
}

export function createPathManager(componentClass: StructiveComponentClass): IPathManager {
  return new PathManager(componentClass);
}