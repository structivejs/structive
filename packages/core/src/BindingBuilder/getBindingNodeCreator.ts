import { createBindingNodeAttribute } from "../DataBinding/BindingNode/BindingNodeAttribute.js";
import { createBindingNodeCheckbox } from "../DataBinding/BindingNode/BindingNodeCheckbox.js";
import { createBindingNodeClassList } from "../DataBinding/BindingNode/BindingNodeClassList.js";
import { createBindingNodeClassName } from "../DataBinding/BindingNode/BindingNodeClassName.js";
import { createBindingNodeEvent } from "../DataBinding/BindingNode/BindingNodeEvent.js";
import { createBindingNodeIf } from "../DataBinding/BindingNode/BindingNodeIf.js";
import { createBindingNodeFor } from "../DataBinding/BindingNode/BindingNodeFor.js";
import { createBindingNodeProperty } from "../DataBinding/BindingNode/BindingNodeProperty.js";
import { createBindingNodeRadio } from "../DataBinding/BindingNode/BindingNodeRadio.js";
import { createBindingNodeStyle } from "../DataBinding/BindingNode/BindingNodeStyle.js";
import { CreateBindingNodeByNodeFn, CreateBindingNodeFn } from "../DataBinding/BindingNode/types";
import { raiseError } from "../utils.js";
import { IFilterText } from "./types";
import { createBindingNodeComponent } from "../DataBinding/BindingNode/BindingNodeComponent.js";

/**
 * Map of binding node creator functions keyed by property name
 */
type NodePropertyConstructorByName = { [key: string]: CreateBindingNodeFn };

/**
 * Two-level map with comment node flag (0=Element, 1=Comment) as key,
 * containing property name maps
 */
type NodePropertyConstructorByNameByIsComment = { [key: number]: NodePropertyConstructorByName };

/**
 * Map defining specific binding node creator functions by combination of
 * node type (Element/Comment) and property name
 * 
 * Index 0 (Element): Element-specific bindings
 *   - "class": classList manipulation (class attribute token list operations)
 *   - "checkbox": Checkbox checked state binding
 *   - "radio": Radio button checked state binding
 * 
 * Index 1 (Comment): Comment node-specific bindings
 *   - "if": Conditional binding (element show/hide)
 */
const nodePropertyConstructorByNameByIsComment: NodePropertyConstructorByNameByIsComment = {
  0: {
    "class"   : createBindingNodeClassList,
    "checkbox": createBindingNodeCheckbox,
    "radio"   : createBindingNodeRadio,
  },
  1: {
    "if" : createBindingNodeIf,
  },
};

/**
 * Map of binding node creator functions keyed by property name prefix
 */
type NodePropertyConstructorByFirstName = { [key: string]: CreateBindingNodeFn };

/**
 * Map of binding node creator functions determined by property name prefix
 * (first element before dot separator)
 * 
 * Supported patterns:
 *   - "class.xxx": className binding (set entire class attribute)
 *   - "attr.xxx": attribute binding (set arbitrary attribute)
 *   - "style.xxx": style binding (set inline style)
 *   - "state.xxx": component state binding (pass state to child component)
 * 
 * Examples:
 *   - "class.active" → BindingNodeClassName (set class attribute to "active")
 *   - "attr.src" → BindingNodeAttribute (set src attribute)
 *   - "style.color" → BindingNodeStyle (set color style)
 *   - "state.user" → BindingNodeComponent (pass value to child component's user state)
 */
const nodePropertyConstructorByFirstName: NodePropertyConstructorByFirstName = {
  "class": createBindingNodeClassName,
  "attr" : createBindingNodeAttribute,
  "style": createBindingNodeStyle,
  "state": createBindingNodeComponent,
//  "popover": PopoverTarget,      // For future extension
//  "commandfor": CommandForTarget, // For future extension
};

/**
 * Internal function that returns the appropriate binding node creator function
 * (CreateBindingNodeFn) based on target node type (Element/Comment) and property name.
 * 
 * Decision logic (in priority order):
 * 1. Exact match by node type and property name (nodePropertyConstructorByNameByIsComment)
 *    - Element: "class", "checkbox", "radio"
 *    - Comment: "if"
 * 
 * 2. Comment node with "for" → createBindingNodeFor
 * 
 * 3. Comment node with unknown property → Error
 * 
 * 4. Match by property name prefix (nodePropertyConstructorByFirstName)
 *    - "class.xxx", "attr.xxx", "style.xxx", "state.xxx"
 * 
 * 5. Element node starting with "on" → createBindingNodeEvent
 *    - Examples: "onclick", "onchange", "onkeydown"
 * 
 * 6. Others → createBindingNodeProperty (generic property binding)
 *    - Examples: "value", "textContent", "disabled", "innerHTML"
 * 
 * @param isComment - Whether it's a comment node
 * @param isElement - Whether it's an element node
 * @param propertyName - Binding property name
 * @returns Binding node creator function
 * @throws When property name is invalid
 */
function _getBindingNodeCreator(isComment: boolean, isElement: boolean, propertyName: string): CreateBindingNodeFn {
  // Step 1: Get dedicated creator function by exact match of node type and property name
  const bindingNodeCreatorByName = nodePropertyConstructorByNameByIsComment[isComment ? 1 : 0][propertyName];
  if (typeof bindingNodeCreatorByName !== "undefined") {
    return bindingNodeCreatorByName;
  }

  // Step 2: For comment node with "for", use dedicated loop binding
  if (isComment && propertyName === "for") {
    return createBindingNodeFor;
  }

  // Step 3: Error for unsupported properties on comment node
  // (Only "if" and "for" are allowed on comment nodes)
  if (isComment) {
    raiseError(`getBindingNodeCreator: unknown node property ${propertyName}`);
  }

  // Step 4: Determine by property name prefix (first part before dot)
  // Example: "attr.src" → nameElements[0] = "attr"
  const nameElements = propertyName.split(".");
  const bindingNodeCreatorByFirstName = nodePropertyConstructorByFirstName[nameElements[0]];
  if (typeof bindingNodeCreatorByFirstName !== "undefined") {
    return bindingNodeCreatorByFirstName;
  }

  // Step 5: For element node starting with "on", use event binding
  // Examples: "onclick", "onchange", "onsubmit"
  if (isElement) {
    if (propertyName.startsWith("on")) {
      return createBindingNodeEvent;
    } else {
      // Step 6a: Other element properties use generic property binding
      // Examples: "value", "textContent", "disabled"
      return createBindingNodeProperty;
    }
  } else {
    // Step 6b: For nodes that are neither element nor comment (Text nodes, etc.), use generic binding
    return createBindingNodeProperty;
  }
}

/**
 * Cache for binding node creator functions
 * Key format: "{isComment}\t{isElement}\t{propertyName}"
 * 
 * When the same combination of node type and property name is used multiple times,
 * retrieve from cache instead of re-executing decision logic to improve performance
 */
const _cache: { [key: string]: CreateBindingNodeFn } = {};

/**
 * Factory function that retrieves the appropriate binding node creator function
 * from node, property name, filter, and decorator information.
 * 
 * Processing flow:
 * 1. Determine node type (Comment/Element)
 * 2. Generate cache key ("{isComment}\t{isElement}\t{propertyName}")
 * 3. Check cache, if not exists, get via _getBindingNodeCreator and cache it
 * 4. Execute obtained creator function with property name, filters, and decorates
 * 5. Return actual binding node creator function (CreateBindingNodeByNodeFn)
 * 
 * Usage example:
 * ```typescript
 * const node = document.querySelector('input');
 * const creator = getBindingNodeCreator(
 *   node,
 *   'value',
 *   [{ name: 'trim', options: [] }],
 *   ['required']
 * );
 * // creator is a function like (binding, node, filters) => BindingNodeProperty
 * ```
 * 
 * @param node - Target DOM node for binding
 * @param propertyName - Binding property name (e.g., "value", "onclick", "attr.src")
 * @param filterTexts - Array of input filter metadata
 * @param decorates - Array of decorators (e.g., ["required", "trim"])
 * @returns Function that creates actual binding node instance
 */
export function getBindingNodeCreator(
  node        : Node, 
  propertyName: string,
  filterTexts : IFilterText[],
  decorates   : string[]
): CreateBindingNodeByNodeFn {
  // Determine node type
  const isComment = node instanceof Comment;
  const isElement = node instanceof Element;
  
  // Generate cache key (concatenate with tab separator)
  const key = isComment + "\t" + isElement + "\t" + propertyName;
  
  // Get from cache, if not exists, determine and save to cache
  const fn = _cache[key] ?? (_cache[key] = _getBindingNodeCreator(isComment, isElement, propertyName));
  
  // Execute obtained creator function with property name, filters, and decorates
  return fn(propertyName, filterTexts, decorates);
}
