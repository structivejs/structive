# StateClass APIs Overview

Lifecycle-facing helpers exposed by the state class layer.

- `connectedCallback.ts` / `disconnectedCallback.ts`: Bridge component lifecycle
  events with state tracking.
- `getAll.ts`: Returns all registered state classes.
- `hasUpdateCallback.ts`: Checks whether a state class implements update
  callbacks.
- `resolve.ts`: Resolves a registered state class by name.
- `trackDependency.ts`: Registers dependencies discovered during render.
- `updatedCallback.ts`: Invokes user-defined update handlers after state
  changes.
