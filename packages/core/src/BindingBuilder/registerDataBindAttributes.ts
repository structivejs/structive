import { createDataBindAttributes } from "./createDataBindAttributes.js";
import { getNodesHavingDataBind } from "./getNodesHavingDataBind.js";
import { IDataBindAttributes } from "./types";

/**
 * Cache of binding attribute lists per template ID.
 * When a template is registered, stores all binding information within that template.
 */
const listDataBindAttributesById: { [key: number]: IDataBindAttributes[] } = {};

/**
 * Cache of "for" binding stateProperty sets per template ID.
 * Used to identify state paths related to loops (lists).
 * 
 * Example: "for:items" → "items" is added to listPathsSetById[id]
 */
const listPathsSetById: { [key: number]: Set<string> } = {};

/**
 * Cache of all binding stateProperty sets per template ID.
 * Tracks all state paths referenced within the template.
 * 
 * Example: "textContent:user.name", "value:email" → "user.name", "email" are added to pathsSetById[id]
 */
const pathsSetById: { [key: number]: Set<string> } = {};

/**
 * Internal utility function that extracts data-bind target nodes from template's DocumentFragment
 * and converts them to IDataBindAttributes array.
 * 
 * Processing flow:
 * 1. Extract nodes with bindings using getNodesHavingDataBind
 * 2. Convert each node to attribute information using createDataBindAttributes
 * 3. Return as IDataBindAttributes array
 * 
 * @param content - Template's DocumentFragment
 * @returns Array of binding attribute information
 */
function getDataBindAttributesFromTemplate(content: DocumentFragment): IDataBindAttributes[] {
  // Step 1: Get all nodes with bindings
  const nodes = getNodesHavingDataBind(content);
  
  // Step 2: Convert each node to attribute information
  return nodes.map(node => createDataBindAttributes(node));
}

/**
 * Parses and registers binding information (data-bind attributes and comments) within a template,
 * building and caching attribute lists and state path sets per template ID.
 *
 * Main features:
 * 1. Detects and converts all binding nodes within the template
 * 2. Registers all binding stateProperty values to pathsSetById
 * 3. Also registers "for" binding stateProperty values to listPathsSetById
 * 4. Caches parse results in listDataBindAttributesById
 * 
 * rootId parameter:
 * - When templates are nested, specify the root template's ID
 * - State path sets are managed collectively by root ID
 * - If omitted, id is used as rootId
 * 
 * Processing flow:
 * 1. Extract binding information using getDataBindAttributesFromTemplate
 * 2. Get paths and listPaths Sets corresponding to rootId (create new if first time)
 * 3. Traverse each binding attribute:
 *    a. Add each bindText's stateProperty to paths
 *    b. If nodeProperty is "for", also add to listPaths
 * 4. Save parse result to listDataBindAttributesById[id] and return
 * 
 * Usage example:e example:
 * ```typescript
 * // Template HTML:
 * // <div data-bind="textContent:user.name"></div>
 * // <ul>
 * //   <!-- @@:for:items -->
 * //   <li data-bind="textContent:name"></li>
 * //   <!-- @@:end -->
 * // </ul>
 * 
 * const template = document.getElementById('myTemplate');
 * const attributes = registerDataBindAttributes(1, template.content);
 * 
 * // Result:
 * // listDataBindAttributesById[1] = [
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "user.name", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "for", stateProperty: "items", ... }], ... },
 * //   { bindTexts: [{ nodeProperty: "textContent", stateProperty: "name", ... }], ... }
 * // ]
 * // pathsSetById[1] = Set { "user.name", "items", "name" }
 * // listPathsSetById[1] = Set { "items" }
 * ```
 * 
 * @param id - Template ID
 * @param content - Template's DocumentFragment
 * @param rootId - Root template ID (defaults to id if omitted)
 * @returns Parsed binding attribute list
 */
export function registerDataBindAttributes(
  id: number,
  content: DocumentFragment,
  rootId: number = id
): IDataBindAttributes[] {
  // Step 1: Extract all binding information from template
  const dataBindAttributes = getDataBindAttributesFromTemplate(content);
  
  // Step 2: Get state path sets corresponding to rootId (create new if first time)
  const paths = pathsSetById[rootId] ?? (pathsSetById[rootId] = new Set<string>());
  const listPaths = listPathsSetById[rootId] ?? (listPathsSetById[rootId] = new Set<string>());
  
  // Step 3: Traverse each binding attribute and register state paths
  for (let i = 0; i < dataBindAttributes.length; i++) {
    const attribute = dataBindAttributes[i];
    
    // Process stateProperty of each binding text
    for (let j = 0; j < attribute.bindTexts.length; j++) {
      const bindText = attribute.bindTexts[j];
      
      // Add stateProperty of all bindings to paths
      paths.add(bindText.stateProperty);
      
      // If "for" binding (loop), also add to listPaths
      if (bindText.nodeProperty === "for") {
        listPaths.add(bindText.stateProperty);
      }
    }
  }
  
  // Step 4: Save parse result to cache and return
  return listDataBindAttributesById[id] = dataBindAttributes;
}

/**
 * Gets registered binding attribute list from template ID.
 * 
 * Used to retrieve binding information of templates
 * registered with registerDataBindAttributes.
 * 
 * Usage example:
 * ```typescript
 * registerDataBindAttributes(1, template.content);
 * const attributes = getDataBindAttributesById(1);
 * // → [{ bindTexts: [...], nodeType: "Element", nodePath: [...], ... }]
 * ```
 * 
 * @param id - Template ID
 * @returns Binding attribute list
 */
export const getDataBindAttributesById = (id: number): IDataBindAttributes[] => {
  return listDataBindAttributesById[id];
}

/**
 * Gets "for" binding (loop) stateProperty set from template ID.
 * 
 * Used to identify state paths related to loops.
 * Returns empty array if not registered.
 * 
 * Usage example:
 * ```typescript
 * // Assuming template contains <!-- @@:for:items -->
 * registerDataBindAttributes(1, template.content);
 * const listPaths = getListPathsSetById(1);
 * // → Set { "items" }
 * 
 * // Monitor loop state changes
 * if (listPaths.has("items")) {
 *   // Process assuming items is an array
 * }
 * ```
 * 
 * @param id - Template ID
 * @returns State path set of "for" bindings (empty array if not registered)
 */
export const getListPathsSetById = (id: number): Set<string> => {
  return listPathsSetById[id] ?? [];
};

/**
 * Gets all binding stateProperty set from template ID.
 * 
 * Used to track all state paths referenced within the template.
 * Returns empty array if not registered.
 * 
 * Usage example:
 * ```typescript
 * // Assuming template has following bindings:
 * // - textContent:user.name
 * // - value:email
 * // - for:items
 * registerDataBindAttributes(1, template.content);
 * const allPaths = getPathsSetById(1);
 * // → Set { "user.name", "email", "items" }
 * 
 * // Monitor state changes
 * if (allPaths.has("user.name")) {
 *   // Process user.name change
 * }
 * ```
 * 
 * @param id - Template ID
 * @returns State path set of all bindings (empty array if not registered)
 */
export const getPathsSetById = (id: number): Set<string> => {
  return pathsSetById[id] ?? [];
};