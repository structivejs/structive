# BindingNode Module Overview

Binding node implementations apply binding instructions to specific DOM node
shapes.

- `BindingNode.ts`: Base class shared by all binding node implementations.
- `BindingNodeAttribute.ts`: Handles attribute bindings on standard elements.
- `BindingNodeBlock.ts`: Manages block bindings that insert/remove template
  fragments.
- `BindingNodeCheckbox.ts`: Specialised binding for checkbox inputs.
- `BindingNodeClassList.ts`: Synchronises state with element class lists.
- `BindingNodeClassName.ts`: Writes className properties in bulk.
- `BindingNodeComponent.ts`: Coordinates embedded Structive components.
- `BindingNodeEvent.ts`: Registers event handlers from binding expressions.
- `BindingNodeFor.ts`: Implements repeaters for array-like data.
- `BindingNodeIf.ts`: Toggles template fragments based on boolean state.
- `BindingNodeProperty.ts`: Applies property assignments to elements.
- `BindingNodeRadio.ts`: Synchronises radio button groups.
- `BindingNodeStyle.ts`: Updates inline styles based on state values.
- `types.ts`: Shared type definitions for binding node contracts.
