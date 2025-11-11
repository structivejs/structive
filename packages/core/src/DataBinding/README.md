
# Structure of Binding

IBinding
  parentBindContent: IBindContent
　bindingNode      : IBindingNode
  bindingState     : BindingState
  bindContents     : BindContent[] ... having if or for blocks
  
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
