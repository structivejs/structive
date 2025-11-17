# BindingState Module Overview

Binding state implementations store the state-side metadata needed by binding
nodes.

- `BindingState.ts`: Base class providing common state accessor helpers.
- `BindingStateIndex.ts`: Manages list index tracking for repeat bindings.
- `types.ts`: Interfaces describing binding state objects and factories.

## Architecture

### File Structure (4 files)

1. **types.ts** - Type definitions
2. **BindingState.ts** - Base implementation (127 lines)
3. **BindingStateIndex.ts** - Loop index implementation (159 lines)
4. **README.md** - This file

### Type Definitions (types.ts)

**IBindingState Interface**

Properties:
- `pattern`: State path pattern string
- `info`: Structured path information
- `listIndex`: List index (for loops)
- `ref`: State property reference
- `filters`: Filter array
- `isLoopIndex`: Loop index flag

Methods:
- `getValue()`: Retrieve current value
- `getFilteredValue()`: Retrieve filtered value
- `assignValue()`: Write value to state
- `activate()`, `inactivate()`: Lifecycle management

**Factory Types**
- `CreateBindingStateFn`: (name, filterTexts) => (binding, filters) => IBindingState
- `CreateBindingStateByStateFn`: (binding, filters) => IBindingState

### Implementation 1: BindingState (Base Class)

**Primary Responsibilities**:
- State property access and updates
- Wildcard path support (array bindings)
- Loop context management
- Filter application

**Private Fields**:
- `#nullRef`: Reference for non-wildcard paths (optimization)
- `#ref`: Reference for wildcard paths (lazy resolution)
- `#loopContext`: Loop context

**Key Features**:

1. **ref Property (getter)**:
   - Non-wildcard (#nullRef): Resolved immediately in constructor
   - Wildcard (#ref): Resolved during activate from loop context

2. **getValue / getFilteredValue**:
   - Uses `getByRef()` to retrieve value from state
   - Applies filter array sequentially

3. **assignValue**:
   - Uses `setByRef()` to write value to state
   - Supports bidirectional binding

4. **activate / inactivate**:
   - activate: Resolves loop context, registers binding with engine
   - inactivate: Clears references, unregisters from engine

**Error Codes**:
- BIND-201: LoopContext/ref is null

**Factory Function**: `createBindingState`

### Implementation 2: BindingStateIndex (Index Specialized)

**Primary Responsibilities**:
- Binding for loop index values ($1, $2, ...)
- Index number extraction and retrieval from loop context
- Registration to bindingsByListIndex

**Key Features**:

1. **Pattern Analysis**:
   - "$1" → indexNumber = 1
   - Throws BIND-202 if not numeric

2. **getValue / getFilteredValue**:
   - Returns `listIndex.index` directly
   - Filter application supported

3. **activate**:
   - Retrieves corresponding index from loop context hierarchy (indexNumber - 1)
   - Registers to parent for-binding's `bindingsByListIndex`

4. **assignValue**:
   - Not implemented (index is read-only)
   - Throws BIND-301

5. **pattern / info Properties**:
   - Not implemented (throws BIND-301)
   - Not needed for index bindings

**Error Codes**:
- BIND-201: LoopContext is null, loop context inconsistency
- BIND-202: Pattern is not numeric
- BIND-301: Not implemented (pattern, info, assignValue)
- LIST-201: listIndex is null
- STATE-202: ref is null

**Factory Function**: `createBindingStateIndex`

## Design Patterns

### 1. Lazy Initialization
- Wildcard paths resolved during activate
- Performance optimization for dynamic paths

### 2. Factory Pattern
- `createBindingState` / `createBindingStateIndex`
- Creates instances with filters pre-applied

### 3. Strategy Pattern
- BindingState: Regular properties
- BindingStateIndex: Loop indices
- Unified interface (IBindingState) with different implementations

## Key Features

### Wildcard Path Support
- Detected via `info.wildcardCount > 0`
- Searches loop context from `lastWildcardPath`
- Enables dynamic array binding

### List Index Management
- BindingStateIndex registers to `bindingsByListIndex`
- Efficient re-rendering on index changes
- Supports nested loop hierarchies

### State Access Optimization
- Fast access via `getByRef` / `setByRef`
- Leverages engine's binding map
- Minimizes state traversal overhead

### Filter Chain
- Unified filter application in both implementations
- Functions as input filters
- Transforms values before node assignment

### Loop Context Resolution
- Hierarchical context serialization
- Index-based context lookup (e.g., $1 → contexts[0])
- Supports nested loops with multiple indices

## Usage Patterns

### Regular State Binding
```typescript
// Binding: "textContent:user.name"
// Creates BindingState with pattern="user.name"
// getValue() → returns state.user.name
```

### Wildcard State Binding
```typescript
// Binding: "textContent:items.*.title"
// Creates BindingState with wildcardCount=1
// Resolves context during activate()
// getValue() → returns state.items[currentIndex].title
```

### Loop Index Binding
```typescript
// Binding: "textContent:$1"
// Creates BindingStateIndex with indexNumber=1
// getValue() → returns loopContext[0].listIndex.index
```

### Nested Loop Indices
```typescript
// Outer loop: categories.*
// Inner loop: categories.*.items.*
// "$1" → category index
// "$2" → item index within category
```
