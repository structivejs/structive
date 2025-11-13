# Exposing Child Component State Externally

## File Guide

- `createComponentStateOutput.ts`: Builds the proxy exposed to parent
  components, enforcing path restrictions and delegating reads/writes to child
  state.
- `types.ts`: Shared type declarations for the state output contract.

When parent/child component binding is active, the state output exposes
helpers that determine whether a path is accessible from the parent and forward
get/set operations accordingly.

```typescript
if (stateOutput.startsWith(path)) {
  return stateOutput.get(path);
}

if (stateOutput.startsWith(path)) {
  return stateOutput.set(path, value);
}
```
