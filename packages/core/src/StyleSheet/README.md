# StyleSheet Module Overview

Stylesheet utilities register and load CSS resources referenced by components.

- `registerStyleSheet.ts`: Adds styles to the global registry and ensures they
  are injected once.
- `regsiterCss.ts`: Legacy helper that resolves paths and delegates to the
  registry (typo kept for compatibility).
