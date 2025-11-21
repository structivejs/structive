import { raiseError } from "../utils.js";
import { IComponentConfig } from "../WebComponents/types";
import { canHaveShadowRoot } from "./canHaveShadowRoot.js";

/**
 * Traverses up the DOM tree to find the nearest parent ShadowRoot.
 * Returns undefined if no ShadowRoot is found in the ancestor chain.
 *
 * @param parentNode - The starting node to traverse from
 * @returns The nearest parent ShadowRoot, or undefined if none exists
 */
function getParentShadowRoot(parentNode: Node | null): ShadowRoot|undefined{
  let node: Node | null = parentNode;
  while(node) {
    if (node instanceof ShadowRoot) {
      return node;
    }
    node = node.parentNode;
  }
}

/**
 * Light DOM mode: Adds styles to the parent ShadowRoot or document without using Shadow DOM.
 * Prevents duplicate stylesheet additions.
 *
 * @param element    - Target HTMLElement
 * @param styleSheet - CSSStyleSheet to apply
 */
function attachStyleInLightMode(element: HTMLElement, styleSheet: CSSStyleSheet): void {
  const shadowRootOrDocument = getParentShadowRoot(element.parentNode) || document;
  const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
  if (!styleSheets.includes(styleSheet)) {
    shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, styleSheet];
  }
}

/**
 * Creates a ShadowRoot and applies the stylesheet.
 * Skips creation if a ShadowRoot already exists.
 *
 * @param element    - Target HTMLElement
 * @param styleSheet - CSSStyleSheet to apply
 */
function createShadowRootWithStyle(element: HTMLElement, styleSheet: CSSStyleSheet): void {
  if (!element.shadowRoot) {
    const shadowRoot = element.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [styleSheet];
  }
}

/**
 * Utility function to attach Shadow DOM to the specified HTMLElement and apply a stylesheet.
 *
 * - config.shadowDomMode="auto": Creates ShadowRoot only for elements that support Shadow DOM, falls back to Light DOM for unsupported elements
 *   - Autonomous custom elements: Always creates ShadowRoot
 *   - Built-in element extensions: Determined by canHaveShadowRoot; creates ShadowRoot if supported, falls back to Light DOM otherwise
 * - config.shadowDomMode="force": Forcefully creates ShadowRoot without validation (throws exception if unsupported)
 * - config.shadowDomMode="none": Does not use Shadow DOM; adds styles to parent ShadowRoot or document
 * - Prevents duplicate additions if the same stylesheet is already included
 *
 * @param element    - Target HTMLElement
 * @param config     - Component configuration
 * @param styleSheet - CSSStyleSheet to apply
 */
export function attachShadow(element: HTMLElement, config: IComponentConfig, styleSheet: CSSStyleSheet): void {
  if (config.shadowDomMode === "none") {
    attachStyleInLightMode(element, styleSheet);
  } else if (config.shadowDomMode === "force") {
    createShadowRootWithStyle(element, styleSheet);
  } else {
    // Auto mode: Creates ShadowRoot only for elements that support Shadow DOM, falls back to Light DOM for unsupported elements
    if (config.extends === null || canHaveShadowRoot(config.extends)) {
      // Autonomous custom element or Shadow DOM-supported built-in element extension
      createShadowRootWithStyle(element, styleSheet);
    } else {
      // Shadow DOM-unsupported built-in element extension → Falls back to Light DOM
      attachStyleInLightMode(element, styleSheet);
    }
  }
}