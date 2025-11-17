# BindingNode Module Overview

Binding node implementations apply binding instructions to specific DOM node
shapes.

- `BindingNode.ts`: Base class shared by all binding node implementations.
- `BindingNodeAttribute.ts`: Handles attribute bindings on standard elements.
- `BindingNodeBlock.ts`: Manages block bindings that insert/remove template
  fragments.
- `BindingNodeCheckbox.ts`: Specialised binding for checkbox inputs.
- `BindingNodeClassList.ts`: Synchronises state with element class lists.
- `BindingNodeClassName.ts`: Writes className properties in bulk.
- `BindingNodeComponent.ts`: Coordinates embedded Structive components.
- `BindingNodeEvent.ts`: Registers event handlers from binding expressions.
- `BindingNodeFor.ts`: Implements repeaters for array-like data.
- `BindingNodeIf.ts`: Toggles template fragments based on boolean state.
- `BindingNodeProperty.ts`: Applies property assignments to elements.
- `BindingNodeRadio.ts`: Synchronises radio button groups.
- `BindingNodeStyle.ts`: Updates inline styles based on state values.
- `types.ts`: Shared type definitions for binding node contracts.

## Architecture

### Base Class (1 file)

**BindingNode.ts** - Foundation for all implementations
- **Private fields**: `#binding`, `#node`, `#name`, `#filters`, `#decorates`, `#bindContents`
- **Abstract methods**: `assignValue`, `updateElements` (must be implemented by subclasses)
- **Common functionality**: `applyChange`, `activate`, `inactivate`, `notifyRedraw`
- **Error codes**: BIND-301 (unimplemented method invocation)

### Specialized Implementations (12 types)

#### 1. DOM Attributes & Properties (4 types)

**BindingNodeAttribute** - Attribute bindings (`attr.src`, etc.)
- Extracts `subName` from binding name ("attr.src" → "src")
- Converts null/undefined/NaN to empty string
- Uses `setAttribute` for value assignment

**BindingNodeProperty** - Property bindings (`value`, `checked`, etc.)
- Bidirectional binding support
- Default events: `value` → "input", `checked` → "change"
- Element type-specific property detection
- Two-way binding configuration per element type

**BindingNodeClassList** - Class array bindings
- Joins array values with space separator
- Throws BIND-201 for non-array values

**BindingNodeClassName** - Bulk className assignment
- Directly sets className string property

#### 2. Styles (1 type)

**BindingNodeStyle** - Inline style bindings
- Expands object properties to CSSStyleDeclaration
- Supports individual style property updates

#### 3. Form Inputs (2 types)

**BindingNodeCheckbox** - Checkbox input synchronization
- Checks if value exists in bound array → controls `checked` state
- Bidirectional binding (input/change events)
- Decorator-based event name customization
- Throws BIND-201 for non-array values

**BindingNodeRadio** - Radio button group synchronization
- Value equality check → controls `checked` state
- Bidirectional binding support
- Converts null/undefined to empty string

#### 4. Events (1 type)

**BindingNodeEvent** - Event handler registration (`onClick`, etc.)
- Extracts event name from "on~" prefix
- Decorators: `preventDefault`, `stopPropagation`
- Expands loop context and indices as arguments
- Asynchronous state updates via Updater
- No state change handling in `applyChange`

#### 5. Structural Control (3 types)

**BindingNodeBlock** - Block binding base class
- Common functionality for template expansion
- Parent class for structural directives

**BindingNodeFor** - Array-based repeaters (372 lines)
- Differential detection algorithm (add/remove/move/overwrite)
- BindContent pool mechanism for reuse
- DOM movement optimization (USE_ALL_APPEND flag)
- List index management
- Efficient GC and DOM operation minimization
- Error codes: BIND-201 (inconsistency), BIND-202 (pool length anomaly)

**BindingNodeIf** - Conditional branching
- Controls mount/unmount based on boolean value
- Maintains `#trueBindContents` / `#falseBindContents`
- Throws BIND-201 for non-boolean values
- Parent node validation during updates

#### 6. Components (1 type)

**BindingNodeComponent** - Embedded component coordination
- Integrates with Structive component lifecycle
- Manages nested component bindings

## Type Definitions (types.ts)

**IBindingNode** - Common interface
- Properties: `name`, `subName`, `decorates`, `filters`, `bindContents`, `value`, `filteredValue`
- Methods: `init`, `assignValue`, `updateElements`, `notifyRedraw`, `applyChange`

**CreateBindingNodeFn** - Factory function type
- Signature: `(name, filterTexts, decorates) => (binding, node, filters) => IBindingNode`

## Design Patterns

1. **Factory Pattern**
   - Each implementation provides `createBindingNode~` factory function
   - Enables filter and decorator composition

2. **Template Method Pattern**
   - Common flow: `applyChange` → `getFilteredValue` → `assignValue`
   - Subclasses customize `assignValue` behavior

3. **Object Pool Pattern**
   - BindingNodeFor maintains BindContent pool
   - Reduces GC pressure and improves performance

4. **Observer Pattern**
   - Bidirectional bindings register event listeners
   - State updates trigger via Updater coordination

## Key Features

### Bidirectional Binding
- Form inputs (checkbox, radio, property) support two-way data flow
- Event listeners update state via Updater
- Configurable event names through decorators

### Filter Application
- All nodes support input/output filter chains
- Filters transform values before assignment
- `filteredValue` property for transformed values

### Decorator Support
- Event control: `preventDefault`, `stopPropagation`
- Binding behavior: `readonly`, `ro`
- Custom event names: `@onChange`, `@onInput`

### Performance Optimization
- BindContent pooling in `BindingNodeFor`
- Differential rendering for list updates
- Minimal DOM operations via reordering
- Lazy initialization where applicable
