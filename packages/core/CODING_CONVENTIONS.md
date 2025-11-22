# Coding Conventions

## Naming Conventions

This document defines the coding conventions and naming rules used in the Structive Core package.

### Private Fields

**Rule**: Use the `private _` prefix for private fields.

```typescript
class ComponentEngine {
  // ✅ Recommended: private _ prefix
  private _engine: IComponentEngine;
  private _updater: IUpdater;
  private _readonlyState: IReadonlyStateProxy | null = null;
  
  // ❌ Not recommended: # private fields
  // #engine: IComponentEngine;  // Difficult to test
}
```

**Reasons**:
- **Testability**: Allows verification of internal state and mock injection in unit tests
- **Debuggability**: Internal state can be inspected at runtime
- **TypeScript conventions**: Standard practice in the TypeScript community
- **Compatibility**: Consistency with existing test code

**Exception**: The `#` syntax can be used when true JavaScript privacy is required, but test strategies should be considered beforehand.

### Interfaces

**Rule**: Use the `I` prefix for interface names.

```typescript
// ✅ Recommended
export interface IRenderer { ... }
export interface IComponentEngine { ... }
export interface IStructuredPathInfo { ... }
export interface IBinding { ... }

// ❌ Not recommended
export interface Renderer { ... }
export interface ComponentEngine { ... }
```

**Reasons**:
- Clear distinction between classes and interfaces
- Avoids name collisions with implementation classes
- Improves code readability

### Constants

**Rule**: Use `UPPER_SNAKE_CASE` for constants.

```typescript
// ✅ Recommended
export const WILDCARD = "*";
export const MAX_WILDCARD_DEPTH = 32;
export const RESERVED_WORD_SET = new Set(["constructor", "prototype"]);
export const LAZY_LOAD_SUFFIX = "#lazy";

// ❌ Not recommended
const wildcard = "*";
const maxWildcardDepth = 32;
```

### Functions and Methods

**Rule**: Function names should start with a verb and use `camelCase`.

```typescript
// ✅ Recommended: Start with a verb
function createComponentClass(...) { ... }
function getStructuredPathInfo(...) { ... }
function registerTemplate(...) { ... }
function raiseError(...) { ... }
function isVoidElement(...) { ... }
function canHaveShadowRoot(...) { ... }

// ❌ Not recommended: Nouns only
function componentClass(...) { ... }
function pathInfo(...) { ... }
```

**Naming Patterns**:
- `create*`: Factory functions (generates new instances)
- `get*`: Accessor functions (retrieves existing values)
- `register*`: Registration functions (registers at global or module level)
- `is*` / `has*` / `can*`: Predicate functions returning boolean values
- `load*`: Asynchronous loading functions

### Type Aliases

**Rule**: Use `PascalCase` for type aliases.

```typescript
// ✅ Recommended
export type WildcardType = "none" | "context" | "partial" | "all";
export type Constructor<T> = new (...args: any[]) => T;
export type ReadonlyStateCallback = (...) => any;

// ❌ Not recommended
export type wildcardType = ...;
export type WILDCARD_TYPE = ...;
```

### Classes

**Rule**: Use `PascalCase` for class names.

```typescript
// ✅ Recommended
class ComponentEngine { ... }
class Renderer { ... }
class Updater { ... }
class StructuredPathInfo { ... }

// ❌ Not recommended
class componentEngine { ... }
class component_engine { ... }
```

### File Names

**Rule**: Use `camelCase` for file names.

```typescript
// ✅ Recommended
createComponentClass.ts
getStructuredPathInfo.ts
registerTemplate.ts
types.ts

// ❌ Not recommended
CreateComponentClass.ts
get-structured-path-info.ts
register_template.ts
```

**Exceptions**: 
- Documents like `README.md`, `CHANGELOG.md` can use uppercase
- Test files use the `.test.ts` suffix

### Variables

**Rule**: Use `camelCase` for variables.

```typescript
// ✅ Recommended
const pathSegments = pattern.split(".");
let wildcardCount = 0;
const cumulativePaths: string[] = [];

// ❌ Not recommended
const PathSegments = ...;
const path_segments = ...;
```

### Private Methods

**Rule**: Private methods should **not** use underscores (to distinguish from fields).

```typescript
class Example {
  // Fields: use private _
  private _state: any;
  
  // Methods: private only (no _)
  private calculateValue(): number {
    return this._state.value;
  }
  
  // ✅ Recommended
  private initialize() { ... }
  private cleanup() { ... }
  
  // ❌ Not recommended
  private _initialize() { ... }
  private _cleanup() { ... }
}
```

### Generics

**Rule**: Use uppercase letters for single-character type parameters.

```typescript
// ✅ Recommended
function create<T>(value: T): T { ... }
class Container<T, K extends string> { ... }
type Constructor<T> = new (...args: any[]) => T;

// Meaningful names are also acceptable
function transform<TInput, TOutput>(input: TInput): TOutput { ... }
```

### Boolean Values

**Rule**: Boolean values should start with `is*`, `has*`, `can*`, or `should*`.

```typescript
// ✅ Recommended
readonly isActive: boolean;
readonly hasConnectedCallback: boolean;
readonly canHaveShadowRoot: boolean;
readonly shouldRender: boolean;

// ❌ Not recommended
readonly active: boolean;
readonly connected: boolean;
```

### Comments

**Rule**: JSDoc comments are required and should be written in English.

```typescript
/**
 * Creates a new component class with the given configuration.
 * 
 * @param {IComponentConfig} config - Component configuration object
 * @returns {Constructor<StructiveComponent>} Component class constructor
 * @throws {Error} Throws STATE-101 if configuration is invalid
 * 
 * @example
 * const MyComponent = createComponentClass({
 *   tag: 'my-component',
 *   state: { count: 0 }
 * });
 */
export function createComponentClass(config: IComponentConfig) {
  // Implementation...
}
```

**Inline Comments**: Add explanations in English or Japanese for complex logic.

```typescript
// Phase 1: Collect all wildcard dependencies
for (const path of wildcardPaths) {
  // Recursively collect dependencies
  collectDependencies(path, visited);
}
```

### Error Codes

**Rule**: Error codes use module prefix + numeric identifier.

```typescript
// ✅ Recommended
raiseError({
  code: "UPD-001",     // Updater module
  code: "STATE-202",   // StateProperty module
  code: "BIND-101",    // Binding module
  code: "PATH-101",    // PathManager module
  code: "TMP-001",     // Template module
  code: "CSS-001",     // StyleSheet module
});
```

**Naming Patterns**:
- `UPD-*`: Updater
- `STATE-*`: StateProperty
- `BIND-*`: DataBinding
- `PATH-*`: PathManager/PathTree
- `TMP-*`: Template
- `CSS-*`: StyleSheet
- `CE-*`: ComponentEngine
- `IMP-*`: Importmap/WebComponents

### Test Files

**Rule**: Test files use the `*.test.ts` suffix and follow the same structure as their corresponding source files.

```
src/
  Updater/
    Renderer.ts
  StateProperty/
    getStructuredPathInfo.ts
    
__tests__/
  Updater/
    Renderer.test.ts
  StateProperty/
    getStructuredPathInfo.test.ts
```

### Module Exports

**Rule**: Each module defines interfaces in a dedicated `types.ts` file.

```typescript
// types.ts
export interface IRenderer { ... }
export interface IUpdater { ... }
export type RendererCallback = (...) => void;

// Renderer.ts
import { IRenderer } from './types';
export class Renderer implements IRenderer { ... }
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --save-dev eslint @eslint/js typescript-eslint globals
```

### 2. Run ESLint

**Check for errors:**
```bash
npm run lint
```

**Auto-fix errors:**
```bash
npm run lint:fix
```

### 3. IDE Integration

**VS Code:**
1. Install the "ESLint" extension
2. Add to `.vscode/settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}
```

**WebStorm/IntelliJ:**
1. Go to Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Select "Automatic ESLint configuration"
3. Check "Run eslint --fix on save"

### 4. Git Hooks (Optional)

Install husky and lint-staged for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

---

## ESLint Configuration

Recommended ESLint rules:

```json
{
  "rules": {
    "no-underscore-dangle": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "memberLike",
        "modifiers": ["private"],
        "format": ["camelCase"],
        "leadingUnderscore": "require",
        "filter": {
          "regex": "^(constructor)$",
          "match": false
        }
      },
      {
        "selector": "variable",
        "modifiers": ["const"],
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

---

## Summary

| Element | Rule | Example |
|---------|------|---------|
| Private Fields | `private _` | `private _engine: IEngine` |
| Interfaces | `I` prefix + PascalCase | `IRenderer`, `IComponentEngine` |
| Constants | UPPER_SNAKE_CASE | `WILDCARD`, `MAX_DEPTH` |
| Functions/Methods | camelCase + verb | `createClass()`, `getValue()` |
| Classes | PascalCase | `ComponentEngine`, `Renderer` |
| Type Aliases | PascalCase | `WildcardType`, `Constructor<T>` |
| Variables | camelCase | `pathSegments`, `wildcardCount` |
| File Names | camelCase | `getStructuredPathInfo.ts` |
| Error Codes | PREFIX-NNN | `UPD-001`, `STATE-202` |

Following these rules improves consistency and maintainability across the entire codebase.
