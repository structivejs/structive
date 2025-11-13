# StateClass Traps Overview

Proxy traps that implement Structive's reactive semantics for state objects.

- `get.ts`: Handles property reads, dependency tracking, and proxy chaining.
- `indexByIndexName.ts`: Supports array-like access via named indexes.
- `set.ts`: Applies writes while triggering dependency invalidation.
