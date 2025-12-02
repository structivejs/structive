# Error Code Taxonomy (Draft v0.7)

Structive error codes follow a `PREFIX-NNN` format to make it easy to grasp "what happened, where, why, and how to fix it" at a glance.

- Format: `PREFIX-NNN`
- Example: `BIND-102 Node not found by nodePath`
- Numbers are three digits (expandable later). Use the bands below as a rule of thumb.

## Number Bands (Guidance)

- 0xx: Initialization / configuration / bootstrap issues
- 1xx: Not found / unregistered / duplicate (template, node, component, route)
- 2xx: Invalid values / formats / consistency errors (arguments, syntax, schema)
- 3xx: State / context mismatches (readonly mutation, loopContext null, dependency issues)
- 4xx: Runtime failures (render, mount, unmount, apply failures)
- 5xx: Async / loading failures (ImportMap, SFC)
- 6xx: Environment / compatibility / capability gaps (ShadowRoot unavailable, jsdom limitation)
- 8xx: Deprecation / compatibility warnings
- 9xx: Warnings / soft errors (execution may continue)

## Prefixes (Domains)

- TMP: Template
  - e.g., TMP-001 Template not found / TMP-102 SVG template conversion failed
- BIND: DataBinding / BindContent / BindingNode
  - e.g., BIND-101 Data-bind not registered / BIND-201 BindContent not initialized yet
- COMP: Component / WebComponents registration & definition
  - e.g., COMP-301 Connected callback failed / COMP-401 Custom element tag name not found
- IMP: ImportMap (loadFromImportMap, lazy-load alias)
  - e.g., IMP-201 Lazy component alias not found / IMP-202 Lazy component load failed
- PATH: PathManager / PathTree
  - e.g., PATH-101 Path node not found
- LIST: ListIndex / ListDiff
  - e.g., LIST-201 ListIndex not found / LIST-203 List indexes missing from cache entry
- STATE: StateClass / StateProperty / Ref
  - e.g., STATE-202 Failed to parse state / STATE-301 Readonly property mutation
- STC: StateClass internals (cache, getters, loop context scopes)
  - e.g., STC-001 Missing state property / STC-002 Ref stack empty during getter
- CSO: ComponentStateOutput (child ↔ parent state bridge)
  - e.g., CSO-101 Child path not found / CSO-102 Child binding not registered
- FLT: Filter (built-in / custom)
  - e.g., FLT-201 Filter not found / FLT-202 Filter argument invalid
- CSS: StyleSheet registration
  - e.g., CSS-001 Stylesheet not found
- UPD: Updater / Renderer
  - e.g., UPD-001 Engine not initialized

## Message Guidelines

- Line 1 must be short and specific: "issue + target" (no trailing period)
  - Example: `Node not found by nodePath`
- Recommended extra fields when developing:
  - `hint`: likely causes / fixes (1–2 items)
  - `context`: minimal breadcrumbs (component/tag, templateId/rootId, nodePath, bindText, statePath, alias, etc.)
  - `docsUrl`: pointer to supporting docs
  - `cause`: summarized lower-level exception (if available)

### Style Rules (Quick Reference)

- Prefer "not found" over "is not found" to avoid redundant verbs.
  - OK: `Template not found: 123` / NG: `Template is not found: 123`
- Use "target + not found: details" as the default shape.
  - Example: `ListIndex not found: items.*`
- Distinguish "is null" vs "is undefined" (they mean different things).
- Keep verbs present-tense and active (e.g., "Cannot set …", "Value must be …").
- Use "not initialized" (without the verb) for uninitialized states; add "yet" when needed.
  - Example: `bindContent not initialized yet`

### Locations (`context.where`)

- Put function/class/method identifiers in `context.where`, not in the message.
  - OK: `message: "Node not found: 0,1"`, `context: { where: 'BindContent.createBindings', templateId, nodePath }`
  - NG: `message: "BindContent.createBindings: Node not found: 0,1"`
- Keep messages short: "target + issue" (title case, no period).
- You can reuse the same message for multiple call sites; `context.where` disambiguates.

## Representative Codes (Initial Set)

- TMP-001 Template not found
- TMP-102 Template conversion failed
- BIND-101 Data-bind not registered
- BIND-201 BindContent not initialized yet
- COMP-301 Connected callback failed
- COMP-401 Custom element tag name not found
- IMP-201 Lazy component alias not found
- PATH-101 PathNode not found
- LIST-201 ListIndex not found
- STATE-101 State class not registered
- STATE-301 Readonly property mutation
- STC-001 State property missing / not an array
- CSO-101 Child path not found
- FLT-201 Filter not found
- CSS-001 Stylesheet not found
- UPD-003 Dependency path missing during collection

## Implementation Guidelines

- Define `StructiveError` (`code`, `message`, `context`, `hint`, `docsUrl`, `severity`, `cause`).
- Standardize on `raiseError({ code, message, context?, hint?, docsUrl?, cause?, severity? })`.
- When `config.debug = true`, expand context / hint / docs via `console.groupCollapsed`.
- Start applying this structure to existing `raiseError` calls around BindContent, BindingBuilder, Template, ImportMap, and component registration.

## TMP — Template

Template issues such as missing registrations or conversion failures.

### TMP-001 Template not found
- Where: Template.registerTemplate, ComponentEngine initialization, Template.resolve
- Condition: No template registered for the requested `templateId`
- Message: `Template not found: ${templateId}`
- Context example: `{ where: 'Template.registerTemplate|getTemplate', templateId }`
- Hint: Verify `registerTemplate` order, spelling, and build-time ingestion.

### TMP-101 Layout fetch failed
- Where: `MainWrapper.loadLayout`
- Condition: Fetching the configured `layoutPath` returns a non-OK HTTP response
- Message: `Failed to load layout from ${layoutPath}`
- Context example: `{ where: 'MainWrapper.loadLayout', layoutPath }`
- Hint: Ensure `config.layoutPath` points to a reachable HTML file and that the server responds with a 2xx status before the MainWrapper mounts.

### TMP-102 Template conversion failed / invalid Mustache structure
- Where: SVG → DOM conversion (`registerHtml`, `replaceTemplateTagWithComment`), Mustache preprocessing (`Template.replaceMustacheWithTemplateTag`)
- Conditions:
  - Invalid SVG or missing root prevents DOM construction
  - Mustache control structures (`if/for/elseif/else`) are unbalanced or mis-nested (e.g., `endif` without `if`)
- Messages include:
  - `SVG template conversion failed`
  - `Endif without if`
  - `Endfor without for`
  - `Elseif without if`
  - `Else without if`
- Context examples: `{ where: 'Template.registerHtml', templateId }`, `{ where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth }`
- Hint: Verify SVG fragments have a single valid root and ensure Mustache syntax is properly nested before running the converter.

## BIND — DataBinding / BindContent / BindingNode

### BIND-101 Data-bind not registered
- Where: `BindingBuilder.registerDataBindAttributes`, `ComponentEngine.setup`
- Condition: `data-bind` references an unregistered binding name
- Message: `Data-bind not registered: ${bindName}`
- Context example: `{ where: 'registerDataBindAttributes', bindName, nodePath }`
- Hint: Confirm registration and check for typos or naming mismatches.

### BIND-102 Node not found by nodePath
- Where: `BindContent.createBindings`, `replaceTextNodeFromComment`, `getAbsoluteNodePath`
- Condition: Stored `nodePath` no longer resolves in the DOM
- Message: `Node not found by nodePath: ${nodePath}`
- Context example: `{ where: 'BindContent.createBindings', templateId, nodePath }`
- Hint: Ensure templates aren’t mutated post-registration and revisit nodePath persistence order.

### BIND-103 Creator not found for bindText
- Where: `BindingBuilder.getBindingNodeCreator`, `parseBindText`
- Condition: No BindingNode creator for the parsed `bindText`
- Message: `Creator not found for bindText: ${bindText}`
- Context example: `{ where: 'getBindingNodeCreator', bindText }`
- Hint: Make sure the corresponding BindingNode implementation is exported/registered.

### BIND-104 Child bindContent not found
- Where: `BindContent.getLastNode`
- Condition: Walking through nested bindings to find the trailing DOM node fails because the expected child BindContent is missing
- Message: `Child bindContent not found`
- Context example: `{ where: 'BindContent.getLastNode', templateId }`
- Hint: Keep parent/child BindContent arrays synchronized and avoid removing children before `getLastNode` finishes its traversal.

### BIND-201 BindContent not initialized yet / Block parent node not set
- Where: `ComponentEngine.bindContent` getter / `ComponentEngine.connectedCallback` (block mode), `StateClass.getAll`
- Conditions: Accessing `bindContent` before `setup`, `_blockParentNode` is missing, or wildcard metadata is absent while resolving state paths
- Messages:
  - `BindContent not initialized yet`
  - `Block parent node not set`
  - `Wildcard info is missing`
- Context examples: `{ where: 'ComponentEngine.bindContent.get', componentId }`, `{ where: 'ComponentEngine.connectedCallback', mode: 'block' }`, `{ where: 'StateClass.getAll', pattern, wildcardIndex }`
- Hint: Confirm `setup` is called prior to usage, block/inline parents resolve correctly, and wildcard path metadata remains available when iterating via `getAll`.

### BIND-301 Binding method not implemented
- Where: `BindingNode.assignValue`, `BindingNode.updateElements`, `BindingStateIndex.pattern|info|assignValue`
- Condition: Base Binding classes throw when subclass overrides are missing or read-only state attempts to assign values
- Messages:
  - `Binding assignValue not implemented`
  - `Binding updateElements not implemented`
  - `Binding pattern not implemented`
  - `Binding info not implemented`
- Context example: `{ where: 'BindingNode.assignValue', name }`
- Hint: Override the relevant methods in binding subclasses or avoid calling write APIs on read-only bindings like `$1` index helpers.

### BIND-202 Invalid binding input / rejected handler
- Where: `BindingNodeEvent.handler`, `BindingNodeFor.setPoolLength`, `BindingStateIndex.constructor`
- Conditions:
  - Async event handler rejects and the promise error needs to surface through Structive
  - Requested BindContent pool length is negative
  - Loop index binding pattern (e.g., `$x`) cannot be parsed into a numeric index
- Messages:
  - `Event handler rejected`
  - `BindContent pool length is negative`
  - `Pattern is not a number`
- Context examples: `{ where: 'BindingNodeEvent.handler', bindName, eventName }`, `{ where: 'BindingNodeFor.setPoolLength', bindName, requestedLength }`, `{ where: 'BindingStateIndex.constructor', pattern }`
- Hint: Handle async errors inside event handlers, guard pool length mutations, and only declare numeric loop indexes like `$1`, `$2`.

### BIND-105 Node type not supported
- Where: `BindingBuilder.getNodeType`
- Condition: DOM node does not match the supported categories (binding comments, HTMLElement, SVGElement)
- Message: `Node type not supported: ${nodeType}`
- Context example: `{ where: 'BindingBuilder.getNodeType', nodeType, nodeName, nodeConstructor }`
- Hint: Ensure templates only contain DOM node kinds that Structive knows how to bind (HTML, SVG, or Structive comment markers).

### BIND-106 Comment binding property not supported
- Where: `BindingBuilder.getBindingNodeCreator`
- Condition: Comment bindings declare properties other than `if` or `for`
- Message: `Comment binding property not supported: ${propertyName}`
- Context example: `{ where: 'BindingBuilder.getBindingNodeCreator', propertyName, nodeType: 'Comment' }`
- Hint: Restrict comment bindings to `if` or `for`, or convert the binding to an element-based binding (e.g., `state.*`, `attr.*`).

## FLT — Filter

### FLT-201 Filter not found
- Where: `createFilters.textToFilter`, `builtinFilterFn`
- Condition: Filter registry does not contain the requested filter name
- Message: `Filter not found: ${name}`
- Context example: `{ where: 'createFilters.textToFilter', name }`
- Hint: Register the filter in the appropriate registry (input/output) before referencing it inside bindings.

### FLT-202 Filter options or value invalid
- Where: `Filter.optionsRequired`, `Filter.optionMustBeNumber`, `Filter.valueMustBeNumber`, `Filter.valueMustBeString`, `Filter.valueMustBeBoolean`, `Filter.valueMustBeDate`
- Conditions:
  - Filter requires at least one option but none were provided
  - Option must be numeric but received a non-number
  - Target value must be a specific type (number/string/boolean/date) but validation failed
- Messages:
  - `${fnName} requires at least one option`
  - `${fnName} requires a number as option`
  - `${fnName} requires a number value`
  - `${fnName} requires a string value`
  - `${fnName} requires a boolean value`
  - `${fnName} requires a date value`
- Context example: `{ where: 'Filter.valueMustBeNumber', fnName }`
- Hint: Pass the expected options/value types to each filter or author custom guards before invoking filter helpers.

## COMP — Component / WebComponents

### COMP-301 Connected callback failed
- Where: `ComponentEngine.connectedCallback`
- Condition: State class `ConnectedCallbackSymbol` throws or rejects inside the engine’s updater
- Message: `Connected callback failed`
- Context example: `{ where: 'ComponentEngine.connectedCallback' }`
- Hint: Inspect the component state’s `connectedCallback` implementation and ensure it handles async errors.

### COMP-302 Disconnected callback failed
- Where: `ComponentEngine.disconnectedCallback`
- Condition: State class `DisconnectedCallbackSymbol` throws while the engine tears down
- Message: `Disconnected callback failed`
- Context example: `{ where: 'ComponentEngine.disconnectedCallback' }`
- Hint: Guard cleanup code in `disconnectedCallback` and allow the engine to finish unregistering/inactivating even when custom logic fails.

### COMP-401 Custom element tag name not found
- Where: `BindingNodeComponent.constructor`, `WebComponents.getCustomTagName`
- Condition: A component binding or helper attempts to resolve a custom element whose `tagName` and `is` attribute both lack the required hyphen (not a valid custom element)
- Message: `Custom element tag name not found`
- Context examples: `{ where: 'BindingNodeComponent.constructor' }`, `{ where: 'WebComponents.getCustomTagName', tagName, isAttribute }`
- Hint: Use valid custom element tags (must contain a hyphen) or set the `is` attribute to an already-defined custom element name before invoking helpers like `getCustomTagName`.

### COMP-402 Custom element definition failed
- Where: `BindingNodeComponent._notifyRedraw` / `BindingNodeComponent.activate`
- Condition: `customElements.whenDefined(tagName)` rejects, meaning the child component failed to register
- Message: `Custom element definition failed: ${tagName}`
- Context example: `{ where: 'BindingNodeComponent.activate', tagName }`
- Hint: Ensure the child component is defined via `customElements.define` before it is instantiated; inspect the chained `cause` for the underlying registration error.

## UPD — Updater / Renderer

### UPD-001 Engine not initialized
- Where: `Renderer.engine` getter
- Condition: Renderer lacks an engine reference
- Message: `Engine not initialized`
- Context example: `{ where: 'Renderer.engine' }`
- Hint: Always supply `IComponentEngine` when instantiating `Renderer`.

### UPD-002 Readonly state handler not initialized
- Where: `Renderer.readonlyState`, `Renderer.readonlyHandler`
- Condition: Accessing the read-only view or handler outside a `render()` / `createReadonlyState` scope
- Messages:
  - `ReadonlyState not initialized`
  - `ReadonlyHandler not initialized`
- Context examples: `{ where: 'Updater.Renderer.readonlyState' }`, `{ where: 'Updater.Renderer.readonlyHandler' }`
- Hint: Only touch the read-only state/handler within the callback passed to `createReadonlyState`/`render`.

### UPD-003 Dependency path missing during collection
- Where: `Updater.collectMaybeUpdates`
- Condition: `findPathNodeByPath` cannot resolve the path that triggered dependency collection
- Message: `Path node not found for pattern: ${path}`
- Context example: `{ where: 'Updater.collectMaybeUpdates', path }`
- Hint: Register every binding path in the PathTree before attempting to enqueue refs for it.

### UPD-004 Parent ref missing / dependent path missing
- Where: `Renderer.render`, `Updater.recursiveCollectMaybeUpdates`
- Conditions:
  - A: A list element ref lacks a `parentRef` when grouping updates
  - B: A dynamic dependency path does not exist in the PathTree
- Messages:
  - `ParentInfo is null for ref: ${ref.key}`
  - `Path node not found for pattern: ${depPath}`
- Context examples: `{ where: 'Updater.Renderer.render', refKey, pattern }`, `{ where: 'Updater.recursiveCollectMaybeUpdates', depPath }`
- Hint: Ensure list element refs maintain their parent links and that every dynamic dependency path is registered.

### UPD-005 Async updated callback failed
- Where: `Updater.update` (updated-callback microtask)
- Condition: The promise returned by an updated callback rejects
- Message: `An error occurred during asynchronous state update.`
- Context example: `{ where: 'Updater.update.updatedCallback' }`
- Hint: Wrap updated callbacks in try/catch or return resolved promises; surface meaningful errors before they reach the Updater.

## PATH — PathManager / PathTree

### PATH-101 PathNode not found
- Where: `Renderer.reorderList`, `Renderer.render`, dynamic dependencies
- Condition: `findPathNodeByPath` cannot resolve the pattern
- Message: `PathNode not found: ${pattern}`
- Context example: `{ pattern }`
- Hint: Register patterns ahead of time and ensure parent wildcards exist.

## LIST — ListIndex / ListDiff

### LIST-201 ListIndex not found
- Where: `ComponentStateInput.notifyRedraw`, `Renderer.reorderList`, `LoopContext.listIndex`, `StateClass.getAll`, `StatePropertyRef.listIndex`
- Condition: A binding references a wildcard position but the corresponding `ListIndex` information is missing from the parent reference, a `LoopContext` resolves a ref whose `listIndex` has been cleared, `getAll` cannot locate the requested wildcard indexes, or a `StatePropertyRef` lost its WeakRef to the original list index
- Messages:
  - `ListIndex not found for parent ref: ${parentPattern}`
  - `listIndex is required`
  - `ListIndex not found: ${pattern}`
  - `listIndex is null`
- Context examples: `{ where: 'ComponentStateInput.notifyRedraw', parentPattern, childPattern }`, `{ where: 'LoopContext.listIndex', path }`, `{ where: 'StateClass.getAll', pattern, index }`, `{ where: 'StatePropertyRef.get listIndex', sid, key }`
- Hint: Make sure list bindings save their `ListIndex` data (e.g., via `saveListAndListIndexes`) before notifying updates, keep loop contexts in sync when clearing refs, pass stable indexes into helpers like `getAll`, and retain references to list indexes when storing `StatePropertyRef` objects that still need them.

### LIST-202 List cache entry not found
- Where: `StateClass.getListIndexesByRef`
- Condition: Cache lookup after a `getByRef` refresh does not return an entry for the requested list path
- Message: `List cache entry not found: ${pattern}`
- Context example: `{ where: 'StateClass.getListIndexesByRef', pattern }`
- Hint: Ensure `getByRef` is invoked with the same ref prior to requesting indexes and that the path is registered as a list.

### LIST-203 List indexes missing from cache entry
- Where: `StateClass.getListIndexesByRef`
- Condition: Cache entry exists but its `listIndexes` payload is null
- Message: `List indexes not found in cache entry: ${pattern}`
- Context example: `{ where: 'StateClass.getListIndexesByRef', pattern }`
- Hint: Inspect list-managing getters to confirm they return arrays and that cache entries are populated with the computed list indexes.

## CSS — StyleSheet

### CSS-001 Stylesheet not found
- Where: `StyleSheet.getStyleSheetById`
- Condition: Requested stylesheet ID has not been registered in the global registry (or was cleared)
- Message: `Stylesheet not found: ${id}`
- Context example: `{ where: 'StyleSheet.getStyleSheetById', styleSheetId: id }`
- Hint: Ensure `registerStyleSheet(id, sheet)` runs before attempting to adopt the stylesheet, and keep IDs consistent across registration and lookup.

## STATE — StateClass / StateProperty / Ref

Examples:

- `STATE-202 Failed to parse state from dataset`
  - Context: `{ where: 'ComponentEngine.connectedCallback', datasetState }`
- `STATE-202 Cannot set property ${prop} of readonly state`
  - Context: `{ where: 'createReadonlyStateProxy.set', prop }`
- `STATE-202 propRef.stateProp.parentInfo is undefined`
  - Context: `{ where: 'getByRefReadonly|getByRefWritable|setByRef', refPath }`
- `STATE-202 lastWildcardPath is null / wildcardParentPattern is null / wildcardIndex is null`
  - Context: `{ where: 'getListIndex', pattern, index }`
- `STATE-202 ref is null`
  - Context: `{ where: 'LoopContext.ref', path }`
- `STATE-202 Invalid path / segment name`
  - Context: `{ where: 'StateProperty.createAccessorFunctions', pattern, segment }`
- `STATE-202 Pattern is reserved word`
  - Context: `{ where: 'StateProperty.getStructuredPathInfo', structuredPath }`

### STATE-101 State class not registered
- Where: `StateClass.getStateClassById`
- Condition: Attempting to retrieve a StateClass ID that has not been registered via `registerStateClass`
- Message: `StateClass not found: ${id}`
- Context example: `{ where: 'StateClass.getStateClassById', stateClassId: id }`
- Hint: Call `registerStateClass` before `getStateClassById`, keep IDs unique per StateClass instance, and ensure teardown paths clear stale IDs when components unmount.

### STATE-204 ComponentStateInput property not supported
- Where: `ComponentStateInput.get` / `ComponentStateInput.set`
- Condition: Accessing or setting a property name that is not mapped through ComponentStateInput
- Message: `ComponentStateInput property not supported: ${prop}`
- Context example: `{ where: 'ComponentStateInput.get', prop }`
- Hint: Only access declared state paths or use the dedicated symbols (`AssignStateSymbol`, `NotifyRedrawSymbol`).

### STATE-302 ComponentStateBinding path resolution failed
- Where: `ComponentStateBinding.toParentPathFromChildPath` / `ComponentStateBinding.toChildPathFromParentPath`
- Condition: No registered mapping exists for the requested parent/child path, or the stored mapping cannot be retrieved during conversion
- Messages:
  - `No parent path found for child path "${childPath}"`
  - `No child path found for parent path "${parentPath}"`
- Context examples: `{ where: 'ComponentStateBinding.toParentPathFromChildPath', childPath }`, `{ where: 'ComponentStateBinding.toChildPathFromParentPath', parentPath }`
- Hint: Ensure parent components register bindings for every child path before conversion and verify paths use the same dotted notation on both sides.

### STATE-303 ComponentStateBinding mapping conflict
- Where: `ComponentStateBinding.addBinding`
- Condition: Attempting to register a parent path that already maps to a child path, or a child path that already maps to some parent path
- Messages:
  - `Parent path "${parentPath}" already has a child path`
  - `Child path "${childPath}" already has a parent path`
- Context examples: `{ where: 'ComponentStateBinding.addBinding', parentPath, existingChildPath }`, `{ where: 'ComponentStateBinding.addBinding', childPath, existingParentPath }`
- Hint: Remove the previous binding or choose unique parent/child combinations; ComponentStateBinding enforces a strict 1:1 mapping.

## STC — StateClass internals

### STC-001 State property missing / not an array
- Where: `StateClass.getByRef`
- Conditions: Requested property does not exist on the backing state object, or the value is not an array even though the path participates in list management
- Messages:
  - `Property "${pattern}" does not exist in state.`
  - `Property "${pattern}" is expected to be an array for list management.`
- Context example: `{ where: 'StateClass.getByRef', pattern }`
- Hint: Ensure the state shape matches the registered paths and that list-aware bindings always return arrays so cache/list index bookkeeping can proceed.

### STC-002 Ref stack empty during getter
- Where: `StateClass.getByRef`
- Condition: A getter-backed state path is accessed while `handler.refStack` is empty, preventing dependency tracking
- Message: `handler.refStack is empty in getByRef`
- Context example: `{ where: 'StateClass.getByRef', pattern }`
- Hint: Invoke getters through the StateClass proxy (which seeds `refStack`) or ensure `setLoopContext`/tracking helpers run before interacting with getter-based paths.

## CSO — ComponentStateOutput

Bridges child component state reads/writes to the parent component via ComponentStateBinding mappings.

### CSO-101 Child path not found
- Where: `ComponentStateOutput.get` / `set` / `getListIndexes`
- Condition: A child ref pattern does not match any registered ComponentStateBinding entry
- Message: `Child path not found: ${path}`
- Context example: `{ where: 'ComponentStateOutput.get', path }`
- Hint: Ensure the child component declares a binding for every state path it exposes to the parent.

### CSO-102 Child binding not registered
- Where: `ComponentStateOutput.get` / `set` / `getListIndexes`
- Condition: A child pattern matched, but the lookup in `bindingByChildPath` failed (stale or missing binding)
- Message: `Child binding not registered: ${childPath}`
- Context example: `{ where: 'ComponentStateOutput.set', childPath }`
- Hint: Keep ComponentStateBinding registrations in sync with the child component’s state paths and avoid mutating the binding map after setup.

## IMP — ImportMap / Lazy Load

Invalid aliases, missing lazy-load bindings, etc.

### IMP-201 Lazy component alias not found
- Where: `WebComponents.loadFromImportMap.loadLazyLoadComponent`
- Condition: Lazy-load request references an alias that was never registered or already consumed
- Message: `Alias not found for tagName: ${tagName}`
- Context example: `{ where: 'WebComponents.loadFromImportMap.loadLazyLoadComponent', tagName }`
- Hint: Ensure the tag is declared in the importmap with the `#lazy` suffix and only invoke `loadLazyLoadComponent` once per tag.

### IMP-202 Component load failed
- Where: `WebComponents.loadFromImportMap.loadLazyLoadComponent`, `WebComponents.loadSingleFileComponent`
- Condition: Fetching or parsing an SFC (lazy or direct) fails because of network errors, non-2xx HTTP responses, or invalid component contents
- Message examples:
  - `Failed to load component from ${path}`
  - `Failed to load lazy component for tagName: ${tagName}`
- Context example: `{ where: 'WebComponents.loadSingleFileComponent', path, resolved, status }`
- Hint: Inspect the underlying `cause`/response metadata, confirm the import map alias or direct path resolves to a reachable SFC, and verify the server returns a valid file.

## FLT — Filter

Unregistered filters, type mismatches, missing options, and similar issues.
