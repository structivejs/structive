# WebComponents Module Overview

This directory provides the runtime used to register and manage Structive web
components.

- `createComponentClass.ts`: Wraps user-defined components with Structive's
  state and rendering lifecycle.
- `createSingleFileComponent.ts`: Builds component classes from single-file
  component manifests.
- `findStructiveParent.ts`: Locates parent Structive components for context
  propagation.
- `getBaseClass.ts`: Resolves the base class used for generated components.
- `getComponentConfig.ts` / `getGlobalConfig.ts`: Load configuration data for
  components and the runtime.
- `loadFromImportMap.ts` / `loadImportmap.ts`: Utilities for resolving component
  modules via import maps.
- `loadSingleFileComponent.ts`: Loads and registers single-file components at
  runtime.
- `registerComponentClass.ts` / `registerComponentClasses.ts`: Register compiled
  component classes globally.
- `registerSingleFileComponent.ts` / `registerSingleFIleComponents.ts`: Register
  single-file components individually or in batches.
- `types.ts`: Shared type definitions for component manifests and runtime
  contracts.
