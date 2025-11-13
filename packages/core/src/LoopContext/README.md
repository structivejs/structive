# LoopContext Module Overview

Loop context utilities expose contextual values (e.g., parent item, index) to
bindings nested inside repeaters.

- `createLoopContext.ts`: Factory for composing loop context objects and wiring
  them to bindings.
- `types.ts`: Definitions for loop context structures and the API the runtime
  expects.
