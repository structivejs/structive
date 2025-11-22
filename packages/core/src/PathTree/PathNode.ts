import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo";
import { IPathNode } from "./types";

/**
 * NodePath class represents a node in the property path tree.
 * Manages hierarchical path structure with parent-child relationships.
 */
class NodePath implements IPathNode {
  readonly parentPath: string;
  readonly currentPath: string;
  readonly name: string;
  readonly childNodeByName: Map<string, IPathNode>;
  readonly level: number;
  
  /**
   * Creates a new NodePath instance.
   * @param parentPath - Path of the parent node
   * @param name - Name of this node
   * @param level - Depth level in the tree (0 for root)
   */
  constructor(parentPath: string, name: string, level: number) {
    this.parentPath = parentPath;
    this.currentPath = parentPath ? parentPath + "." + name : name;
    this.name = name;
    this.level = level;
    this.childNodeByName = new Map<string, IPathNode>();
  }

  /**
   * Finds a node by traversing path segments.
   * @param segments - Array of path segments to traverse
   * @param segIndex - Current segment index (default: 0)
   * @returns Found node or null if not found
   */
  find(segments: string[], segIndex: number = 0): IPathNode | null {
    if (segIndex >= segments.length) {
      return null;
    }

    const currentSegment = segments[segIndex];
    const childNode = this.childNodeByName.get(currentSegment);

    if (childNode) {
      if (segIndex === segments.length - 1) {
        return childNode;
      }
      return childNode.find(segments, segIndex + 1);
    }
    return null;
  }

  /**
   * Appends a child node with the given name.
   * Creates new child if it doesn't exist, otherwise returns existing child.
   * @param childName - Name of the child node to append
   * @returns Child node (existing or newly created)
   */
  appendChild(childName: string): IPathNode {
    let childNode = this.childNodeByName.get(childName);
    if (!childNode) {
      const currentPath = this.parentPath ? this.parentPath + "." + this.name : this.name;
      childNode = new NodePath(currentPath, childName, this.level + 1);
      this.childNodeByName.set(childName, childNode);
    }
    return childNode;
  }
}

/**
 * Factory function to create the root node of the path tree.
 * @returns Root node with empty path and name at level 0
 */
export function createRootNode(): IPathNode {
  return new NodePath("", "", 0);
}

const cache = new Map<IPathNode, Map<string, IPathNode | null>>();
/**
 * Finds a path node by path string with caching.
 * @param rootNode - Root node to search from
 * @param path - Path string to find
 * @returns Found node or null if not found
 */
export function findPathNodeByPath(rootNode: IPathNode, path: string): IPathNode | null {
  let nodeCache = cache.get(rootNode);
  if (!nodeCache) {
    nodeCache = new Map<string, IPathNode>();
    cache.set(rootNode, nodeCache);
  }
  let cachedNode = nodeCache.get(path) ?? null;
  if (cachedNode) {
    return cachedNode;
  }
  const info = getStructuredPathInfo(path);
  cachedNode = rootNode.find(info.pathSegments);
  nodeCache.set(path, cachedNode);
  return cachedNode;
}

/**
 * Adds a path node to the tree, creating parent nodes if necessary.
 * @param rootNode - Root node of the tree
 * @param path - Path string to add
 * @returns Created or existing node at the path
 */
export function addPathNode(rootNode: IPathNode, path: string): IPathNode {
  const info = getStructuredPathInfo(path);
  if (info.parentPath === null) {
    return rootNode.appendChild(path);
  } else {
    let parentNode = findPathNodeByPath(rootNode, info.parentPath);
    if (parentNode === null) {
      parentNode = addPathNode(rootNode, info.parentPath);
    }
    return parentNode.appendChild(info.lastSegment);
  }
}
