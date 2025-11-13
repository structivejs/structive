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
