import { getAbsoluteNodePath } from "./getAbsoluteNodePath.js";
import { getBindingNodeCreator } from "./getBindingNodeCreator.js";
import { getBindingStateCreator } from "./getBindingStateCreator.js";
import { getDataBindText } from "./getDataBindText.js";
import { getNodeType } from "./getNodeType.js";
import { parseBindText } from "./parseBindText.js";
import { removeDataBindAttribute } from "./removeDataBindAttribute.js";
import { replaceTextNodeFromComment } from "./replaceTextNodeFromComment.js";
import { IBindingCreator, IBindText, IDataBindAttributes, NodePath, NodeType } from "./types";

/**
 * DataBindAttributes class extracts and analyzes binding information from DOM nodes,
 * managing all necessary data (node type, path, bind texts, creators) for binding generation.
 *
 * Main processing flow:
 * 1. Determine node type (HTMLElement/SVGElement/Text/Template)
 * 2. Extract binding expression from data-bind attribute or comment
 * 3. Replace comment nodes with Text nodes (restore template preprocessing)
 * 4. Remove processed data-bind attributes (prevent duplicate processing)
 * 5. Calculate absolute node path (index array from parent)
 * 6. Parse binding expression into structured metadata (properties, filters, decorates)
 * 7. Generate factory function pairs for each bind text:
 *    - createBindingNode: Creates runtime BindingNode instance
 *    - createBindingState: Creates runtime BindingState instance
 *
 * This centralizes binding definition management in templates and streamlines
 * subsequent binding construction processes.
 */
class DataBindAttributes implements IDataBindAttributes {
  /** Node type classification */
  readonly nodeType: NodeType;
  
  /** Absolute path from template root (index array) */
  readonly nodePath: NodePath;
  
  /** Array of parsed binding expressions */
  readonly bindTexts: IBindText[];
  
  /** Map from bind text to factory function pairs */
  readonly creatorByText: Map<IBindText, IBindingCreator> = new Map();

  constructor(node: Node) {
    // Step 1: Determine node type
    this.nodeType = getNodeType(node);

    // Step 2: Extract binding expression from data-bind attribute or comment
    const text = getDataBindText(this.nodeType, node);

    // Step 3: Replace comment nodes with Text nodes
    // (Restores Text nodes that were converted to comments during template preprocessing)
    // Note: Directly modifies template.content
    node = replaceTextNodeFromComment(node, this.nodeType);

    // Step 4: Remove data-bind attribute (no longer needed after parsing, prevents duplicate processing)
    removeDataBindAttribute(node, this.nodeType);

    // Step 5: Calculate absolute node path (index array from parent nodes)
    this.nodePath = getAbsoluteNodePath(node);

    // Step 6: Parse binding expression into structured metadata
    // (Array of IBindText containing nodeProperty, stateProperty, filters, decorates)
    this.bindTexts = parseBindText(text);

    // Step 7: Create factory function pairs for runtime instance generation for each bind text
    for(let i = 0; i < this.bindTexts.length; i++) {
      const bindText = this.bindTexts[i];
      
      // Generate factory function pair:
      // - createBindingNode: Factory for BindingNode subclass (Attribute/Event/For/If, etc.)
      // - createBindingState: Factory for BindingState subclass (normal/Index/Component, etc.)
      const creator: IBindingCreator = {
        createBindingNode : getBindingNodeCreator(
          node, 
          bindText.nodeProperty,
          bindText.inputFilterTexts,
          bindText.decorates
        ),
        createBindingState: getBindingStateCreator(
          bindText.stateProperty,
          bindText.outputFilterTexts
        ),
      }
      
      // Associate bind text with factory function pair
      this.creatorByText.set(bindText, creator);
    }
  }

}

/**
 * Factory function that creates a DataBindAttributes instance from the specified node.
 * Called for each data-bind target node during template compilation.
 * 
 * @param node - DOM node to extract binding information from
 * @returns IDataBindAttributes object containing binding metadata
 */
export function createDataBindAttributes(node: Node): IDataBindAttributes {
  return new DataBindAttributes(node);
}