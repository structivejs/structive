# Filter Module Overview

Helpers for defining and applying value filters referenced in binding
expressions live here.

- `builtinFilters.ts`: Implementation of the default filter set (formatting,
  comparisons, predicates, etc.).
- `errorMessages.ts`: Centralised error strings used when filters fail to
  resolve or execute.
- `types.ts`: Type definitions for filter factories, metadata, and runtime
  usage.
