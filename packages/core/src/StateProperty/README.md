# StateProperty Module Overview

These helpers parse property strings and produce structures used to resolve
state segments at runtime.

- `createAccessorFunctions.ts`: Builds getter/setter helpers for traversing
  nested state paths.
- `getResolvedPathInfo.ts`: Resolves structured path information against actual
  state instances.
- `getStructuredPathInfo.ts`: Tokenises property strings into a structured
  representation.
- `types.ts`: Type definitions for path info and accessor contracts.
