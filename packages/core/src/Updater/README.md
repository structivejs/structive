# Updater Module Overview

The updater coordinates change detection and invokes binding updates.

- `Updater.ts`: Manages the queue of pending updates and schedules renderer
  passes.
- `Renderer.ts`: Walks bindings and applies state changes to the DOM.
- `types.ts`: Shared types for renderers, update tokens, and related contracts.
