# ComponentEngine Module Overview

This folder holds the glue that connects Structive components to DOM nodes and
shadow roots at runtime.

- `ComponentEngine.ts`: Orchestrates renderer integration, component registry
  updates, and state binding lifecycle.
- `attachShadow.ts`: Applies the runtime rules for creating shadow roots and
  copying template content.
- `canHaveShadowRoot.ts`: Guards whether a given element can safely host a
  shadow root.
- `isVoidElement.ts`: Detects empty HTML elements to avoid adding child
  bindings.
- `types.ts`: Shared interfaces that describe the engine contract.
