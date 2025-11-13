# Classes Handling External Access

## File Guide

- `createComponentStateInput.ts`: Builds the input proxy that exposes state
	properties to external consumers while enforcing Structive's reactivity
	rules.
- `symbols.ts`: Declares shared symbols used to tag the input proxy with
	internal metadata.
- `types.ts`: Type definitions for the component state input contract.

## Direct access from a parent component

```javascript
const subComponent = document.querySelector("sub-component");
subComponent.state.name = "Alice";
```

## Passing initial state via the `data-state-json` attribute (during routing)

```html
<sub-component data-state-json="{ name: 'Alice' }"></sub-component>
```

## Binding between parent and child components

Parent component markup:

```html
<sub-component data-bind="state.name:user.name"></sub-component>
```

Parent component state:

```javascript
const user = { name: "Alice" };
```

By basing the implementation on proxies we can support assignments such as:

```javascript
subComponent.state.name = "Alice";
```

We intentionally avoid patterns like the following, which overwrite the entire
state object:

```javascript
subComponent.state = user;
```

