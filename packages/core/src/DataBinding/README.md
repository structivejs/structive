# DataBinding Module Overview

The DataBinding layer connects parsed binding metadata with DOM nodes and state
proxies. It coordinates three main concepts:

- **Binding** – glue object that couples a binding node and a binding state.
- **BindingNode** – DOM-facing logic that reads/writes values on nodes.
- **BindingState** – state-facing logic that resolves values from proxies and
  tracks list indexes.
- **BindContent** – wrapper for nested template fragments (`if`, `for`, etc.).

## File Guide

- `Binding.ts`: Implements the `Binding` class responsible for activation,
  change application, and redraw coordination between node and state.
- `BindingFilter.ts`: Provides caching and creation logic for binding filters,
  optimizing filter chain instantiation.
- `BindContent.ts`: Manages nested bindable content, loop contexts, and child
  bindings created inside structural directives.
- `types.ts`: Shared interfaces (`IBinding`, `IBindContent`, `IBindingNode`,
  `IBindingState`, etc.) that formalise contracts across modules.
- `BindingNode/`: Concrete binding node implementations per DOM pattern. See
  `BindingNode/README.md` for details.
- `BindingState/`: Binding state implementations and list index helpers. See
  `BindingState/README.md` for details.

## Conceptual Structure

```
IBinding
  parentBindContent: IBindContent
  bindingNode      : IBindingNode
  bindingState     : IBindingState
  bindContents     : IBindContent[]  // nested blocks (if/for)

IBindingNode
  node: Node

IBindingState
  ref: IStatePropertyRef
      info     : IStructurePathInfo
      listIndex: IListIndex

IBindContent
  parentBinding: IBinding
  loopContext  : ILoopContext
    listIndex  : IListIndex
  bindings     : IBinding[]
```

## Module Architecture

### Top-Level Files (4 files)

1. **types.ts** - Core type definitions
   - `IBinding`: Interface coupling node and state bindings
   - `IBindContent`: Interface managing template fragments and nested bindings
   - `IRenderBinding`: Interface for change application and activation lifecycle
   - `StateBindSummary`: Map type linking state properties to loop contexts

2. **Binding.ts** - Binding management class
   - Couples DOM nodes with state properties
   - Manages binding lifecycle (init, render, update)
   - Version control to prevent unnecessary re-renders
   - Bidirectional binding support via `updateStateValue`

3. **BindContent.ts** - DOM fragment management
   - Generates DOM fragments from template IDs
   - Controls DOM insertion/removal (mount/unmount operations)
   - Supports loop contexts and list index management
   - Recursive last node retrieval for complex structures
   - Change propagation to child bindings

4. **README.md** - This file

### BindingNode/ Subdirectory (15 files)

**Base Implementation:**
- `BindingNode.ts` - Base class for all binding node implementations

**Specialized Implementations (12 types):**
- `BindingNodeAttribute.ts` - Standard attribute bindings
- `BindingNodeBlock.ts` - Block-level template insertion/removal
- `BindingNodeCheckbox.ts` - Checkbox input synchronization
- `BindingNodeClassList.ts` - Class list manipulation
- `BindingNodeClassName.ts` - Bulk className property updates
- `BindingNodeComponent.ts` - Embedded component coordination
- `BindingNodeEvent.ts` - Event handler registration
- `BindingNodeFor.ts` - Array-based repeater implementation
- `BindingNodeIf.ts` - Conditional template fragment toggling
- `BindingNodeProperty.ts` - Property assignment to elements
- `BindingNodeRadio.ts` - Radio button group synchronization
- `BindingNodeStyle.ts` - Inline style updates

**Documentation:**
- `README.md` - BindingNode module overview
- `types.ts` - Type definitions and contracts

### BindingState/ Subdirectory (4 files)

**Base Implementation:**
- `BindingState.ts` - Base class with state accessor helpers

**Specialized Implementation:**
- `BindingStateIndex.ts` - List index tracking for repeaters

**Documentation:**
- `README.md` - BindingState module overview
- `types.ts` - Interface definitions for state binding objects

## Key Features

### DOM Operations
- **mount()** - Append child nodes to parent
- **mountBefore()** - Insert child nodes before specified node
- **mountAfter()** - Insert child nodes after specified node
- **unmount()** - Remove child nodes from parent

### Change Application
- **applyChange(renderer)** - Entry point called by Renderer
- Delegates to individual bindings
- Prevents duplicate updates via `renderer.updatedBindings`

### Loop Support
- **LoopContext** - Manages loop iteration context
- **ListIndex** - Tracks position within repeated items
- **assignListIndex()** - Reassigns indices during list updates

### Bidirectional Binding
- **updateStateValue()** - Reflects node values back to state
- Used for form inputs and interactive elements

### Render Optimization
- Version management to skip unchanged bindings
- Duplicate update prevention
- Dynamic dependency tracking
