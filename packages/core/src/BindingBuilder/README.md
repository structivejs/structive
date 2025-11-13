# BindingBuilder Module Overview

This directory houses the parsing and lookup helpers that discover
`data-bind` declarations in template DOM fragments and translate them into the
runtime instructions consumed by `src/DataBinding`. Each file provides a small
piece of the binding compilation pipeline:

- `createDataBindAttributes.ts`: Registers core attribute handlers and resolves
the binding-node factory for each attribute.
- `registerDataBindAttributes.ts`: Public entry point that wires default
attribute bindings into a registry.
- `removeDataBindAttribute.ts`: Strips processed `data-bind` attributes from a
node to avoid duplicate handling.
- `createFilters.ts`: Parses filter text fragments and produces executable
filter pipelines.
- `types.ts`: Shared typings for attribute registries, filter metadata, and
builder helper contracts.
- `getBindingNodeCreator.ts`: Maps node descriptors to the appropriate
`BindingNode` constructor.
- `getBindingStateCreator.ts`: Chooses the `BindingState` constructor that will
manage state access for a binding.
- `getNodeType.ts`: Classifies DOM nodes into template-aware categories (text,
element, comment, etc.).
- `getAbsoluteNodePath.ts`: Builds fully-qualified DOM paths used to correlate
template nodes with runtime structures.
- `resolveNodeFromPath.ts`: Walks a template tree using a stored path to locate
the original node.
- `replaceTextNodeFromComment.ts`: Restores text nodes from placeholder
comments emitted during preprocessing.
- `getDataBindText.ts`: Extracts raw binding expressions from attributes or
mustache syntax.
- `parseBindText.ts`: Tokenises binding expressions into structured metadata
including filters, arguments, and modifiers.
- `getNodesHavingDataBind.ts`: Traverses a template fragment and collects nodes
that contain `data-bind` declarations.

Together these helpers ensure declarative binding syntax is fully described
before runtime binding objects are instantiated.
