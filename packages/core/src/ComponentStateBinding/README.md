# ComponentStateBinding Module Overview

Creates the structures that connect component state outputs to bindings and
loop contexts.

## File Guide

- `createComponentStateBinding.ts`: Factory that builds binding proxies for
	component instances, wiring state refs, loop contexts, and notifier hooks.
- `types.ts`: Shared interfaces used by the state binding layer.
