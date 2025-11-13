# StateClass Module Overview

The state class layer turns plain objects into reactive proxies tracked by the
binding system.

- `createReadonlyStateProxy.ts` / `useWritableStateProxy.ts`: Build proxy
  wrappers exposing read-only or writable state surfaces.
- `registerStateClass.ts`: Registers concrete state classes by name for later
  lookup.
- `symbols.ts`: Shared symbols that link state proxies with internal metadata.
- `types.ts`: Type declarations for all state class constructs.

Subdirectories:

- `apis/`: Lifecycle APIs (connected/disconnected callbacks, dependency
  tracking, and state resolution helpers).
- `methods/`: Low-level state manipulation helpers such as ref lookup,
  dependency checks, and list index management.
- `traps/`: Proxy traps that implement Structive's reactivity semantics.
