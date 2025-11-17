# BindingBuilder Module Overview

This directory houses the parsing and lookup helpers that discover
`data-bind` declarations in template DOM fragments and translate them into the
runtime instructions consumed by `src/DataBinding`. Each file provides a small
piece of the binding compilation pipeline.

## Module Architecture

BindingBuilder is the compilation pipeline that transforms template DOM with `data-bind` declarations into structured runtime instructions. It consists of 15 specialized files working together:

### Entry Points
- **registerDataBindAttributes.ts**: Public entry point that registers and caches binding information per template ID. Manages path sets for efficient lookup.
- **createDataBindAttributes.ts**: Core factory that extracts binding information from each node and generates `IDataBindAttributes` objects containing all necessary metadata.

### Parsers & Analyzers
- **parseBindText.ts**: Tokenizes binding expressions (e.g., `"value:user.name|trim"`) into structured metadata including filters, arguments, and modifiers.
- **getDataBindText.ts**: Extracts raw binding expressions from `data-bind` attributes or mustache syntax.
- **createFilters.ts**: Parses filter text fragments and produces executable filter pipelines with proper option handling.

### Node Classification & Discovery
- **getNodeType.ts**: Classifies DOM nodes into template-aware categories (HTMLElement, SVGElement, Text, Template).
- **getNodesHavingDataBind.ts**: Traverses a template fragment and collects all nodes that contain `data-bind` declarations.

### Path Management
- **getAbsoluteNodePath.ts**: Builds fully-qualified DOM paths (index arrays from root) to correlate template nodes with runtime structures.
- **resolveNodeFromPath.ts**: Walks a template tree using a stored path to locate the original node during runtime binding.

### Factory Selectors
- **getBindingNodeCreator.ts**: Maps node descriptors (property name, filters, decorates) to the appropriate `BindingNode` constructor (e.g., BindingNodeAttribute, BindingNodeEvent, BindingNodeFor).
- **getBindingStateCreator.ts**: Chooses the `BindingState` constructor that will manage state access and updates for a specific binding.

### Node Transformation & Cleanup
- **replaceTextNodeFromComment.ts**: Restores text nodes from placeholder comments emitted during template preprocessing.
- **removeDataBindAttribute.ts**: Strips processed `data-bind` attributes from nodes to avoid duplicate handling.

### Type Definitions
- **types.ts**: Shared typings for the entire module including `IDataBindAttributes`, `IBindText`, `IFilterText`, `IBindingCreator`, `NodeType`, and `NodePath`.

## Processing Flow

The compilation pipeline follows this sequence:

1. **Discovery Phase**
   - `getNodesHavingDataBind()` → Collects all nodes with data-bind declarations
   
2. **Analysis Phase** (per node)
   - `getNodeType()` → Classify node type
   - `getDataBindText()` → Extract raw binding expression
   - `parseBindText()` → Tokenize expression into structured metadata
   - `getBindingNodeCreator()` / `getBindingStateCreator()` → Select appropriate factory functions
   - `createDataBindAttributes()` → Package all metadata into `IDataBindAttributes`
   
3. **Registration Phase**
   - `registerDataBindAttributes()` → Cache results by template ID
   - Build path sets for efficient dependency tracking

4. **Runtime Resolution**
   - `resolveNodeFromPath()` → Locate nodes during binding instantiation
   - Factory functions create actual `BindingNode` and `BindingState` instances

## Key Data Structures

### IDataBindAttributes
Contains complete binding metadata for a single node:
- `nodeType`: Classification of the DOM node
- `nodePath`: Absolute path from template root
- `bindTexts`: Array of parsed binding expressions
- `creatorByText`: Map from bind text to factory functions

### IBindText
Structured representation of a single binding expression:
- `nodeProperty`: Target property on the node (e.g., "value", "textContent")
- `stateProperty`: Source property path in state (e.g., "user.name")
- `inputFilterTexts`: Filters applied when reading from state
- `outputFilterTexts`: Filters applied when writing to state
- `decorates`: Additional modifiers (e.g., "required", "trim")

### IBindingCreator
Factory function pair for creating runtime objects:
- `createBindingNode()`: Constructs the appropriate BindingNode subclass
- `createBindingState()`: Constructs the appropriate BindingState subclass

## Integration Points

- **Template Module**: Provides preprocessed DOM fragments with `data-bind` attributes
- **DataBinding Module**: Consumes `IDataBindAttributes` to instantiate runtime bindings
- **Filter Module**: Provides filter implementations referenced in binding expressions
- **ComponentEngine**: Requests binding registration during component initialization

Together these helpers ensure declarative binding syntax is fully parsed and
validated before runtime binding objects are instantiated, enabling efficient
template compilation and runtime performance.
