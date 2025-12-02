# EasyLoaders

Pre-configured bootstrap scripts for Structive.js. Provides the same functionality as AutoLoaders but uses different import paths.

## Features

- **Auto-initialization**: Automatically loads from Import Map with `config.autoLoadFromImportMap = true`
- **Pre-configured**: Configuration combinations identifiable by filename
- **Build-excluded**: Not compiled by TypeScript, copied as-is to dist/
- **Three Variations**: Supports three import path patterns (root, ESM, Minified)

## Differences from AutoLoaders

EasyLoaders differ in their internal import paths:

### AutoLoaders (Recommended)
```javascript
import { bootstrapStructive, config } from "structive";
```
- Imports by package name after deployment to dist/

### EasyLoaders (Root)
```javascript
import { bootstrapStructive, config } from "../structive.esm.js";
```
- Imports structive.esm.js using relative path from dist/EasyLoaders/

### EasyLoaders (esm/)
```javascript
import { bootstrapStructive, config } from "../../exports.js";
```
- Imports exports.js using relative path from dist/EasyLoaders/esm/

### EasyLoaders (min/)
```javascript
import { bootstrapStructive, config } from "../../structive.esm.min.js";
```
- Imports structive.esm.min.js using relative path from dist/EasyLoaders/min/

## Build and Deploy

Files in this folder are **excluded from TypeScript compilation**. During build, they are processed as follows:

```bash
npm run build
# 1. Compile TypeScript files with tsc
# 2. Bundle with rollup
# 3. Copy src/EasyLoaders/ to dist/EasyLoaders/ with node scripts/copy-loaders.js
```

The `copy-loaders.js` script copies files directly to dist/ as-is.

## Directory Structure

```
EasyLoaders/
├── default.js                    # Root-level files
├── debug.js
├── components.js
├── shadow-dom-mode-none.js
├── (28 other files)
├── esm/                          # ESM build
│   ├── default.js
│   ├── debug.js
│   ├── components.js
│   └── (28 other files)
└── min/                          # Minified build
  ├── default.js
  ├── debug.js
  ├── components.js
  └── (28 other files)
```

## Usage

### Root-level Files (relative path: ../structive.esm.js)

```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/default.js"></script>
```

### esm/ Folder Files (relative path: ../../exports.js)

```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/esm/default.js"></script>
```

### min/ Folder Files (relative path: ../../structive.esm.min.js)

```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/min/default.js"></script>
```

## File List and Configuration Flags

Each directory contains files with the same configuration settings.

### Root Level (32 files total)

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `default.js` | ✓ | ✓ | ✓ | "open" | - | ✗ |
| `debug.js` | ✓ | ✓ | ✓ | "open" | - | ✓ |
| `components.js` | ✓ | ✗ | ✗ | "open" | - | ✗ |
| `components--debug.js` | ✓ | ✗ | ✗ | "open" | - | ✓ |
| `shadow-dom-mode-none.js` | ✓ | ✓ | ✓ | "none" | - | ✗ |
| `shadow-dom-mode-none--debug.js` | ✓ | ✓ | ✓ | "none" | - | ✓ |
| `locale-ja.js` | ✓ | ✓ | ✓ | "open" | "ja" | ✗ |
| `locale-ja--debug.js` | ✓ | ✓ | ✓ | "open" | "ja" | ✓ |
| `locale-de.js` | ✓ | ✓ | ✓ | "open" | "de" | ✗ |
| `locale-de--debug.js` | ✓ | ✓ | ✓ | "open" | "de" | ✓ |
| `locale-es.js` | ✓ | ✓ | ✓ | "open" | "es" | ✗ |
| `locale-es--debug.js` | ✓ | ✓ | ✓ | "open" | "es" | ✓ |
| `components--locale-ja.js` | ✓ | ✗ | ✗ | "open" | "ja" | ✗ |
| `components--locale-ja--debug.js` | ✓ | ✗ | ✗ | "open" | "ja" | ✓ |
| `components--locale-de.js` | ✓ | ✗ | ✗ | "open" | "de" | ✗ |
| `components--locale-de--debug.js` | ✓ | ✗ | ✗ | "open" | "de" | ✓ |
| `components--locale-es.js` | ✓ | ✗ | ✗ | "open" | "es" | ✗ |
| `components--locale-es--debug.js` | ✓ | ✗ | ✗ | "open" | "es" | ✓ |
| `shadow-dom-mode-none--locale-ja.js` | ✓ | ✓ | ✓ | "none" | "ja" | ✗ |
| `shadow-dom-mode-none--locale-ja--debug.js` | ✓ | ✓ | ✓ | "none" | "ja" | ✓ |
| `shadow-dom-mode-none--locale-de.js` | ✓ | ✓ | ✓ | "none" | "de" | ✗ |
| `shadow-dom-mode-none--locale-de--debug.js` | ✓ | ✓ | ✓ | "none" | "de" | ✓ |
| `shadow-dom-mode-none--locale-es.js` | ✓ | ✓ | ✓ | "none" | "es" | ✗ |
| `shadow-dom-mode-none--locale-es--debug.js` | ✓ | ✓ | ✓ | "none" | "es" | ✓ |
| `components--shadow-dom-mode-none.js` | ✓ | ✗ | ✗ | "none" | - | ✗ |
| `components--shadow-dom-mode-none--debug.js` | ✓ | ✗ | ✗ | "none" | - | ✓ |
| `components--shadow-dom-mode-none--locale-ja.js` | ✓ | ✗ | ✗ | "none" | "ja" | ✗ |
| `components--shadow-dom-mode-none--locale-ja--debug.js` | ✓ | ✗ | ✗ | "none" | "ja" | ✓ |
| `components--shadow-dom-mode-none--locale-de.js` | ✓ | ✗ | ✗ | "none" | "de" | ✗ |
| `components--shadow-dom-mode-none--locale-de--debug.js` | ✓ | ✗ | ✗ | "none" | "de" | ✓ |
| `components--shadow-dom-mode-none--locale-es.js` | ✓ | ✗ | ✗ | "none" | "es" | ✗ |
| `components--shadow-dom-mode-none--locale-es--debug.js` | ✓ | ✗ | ✗ | "none" | "es" | ✓ |

### esm/ Directory (32 files total)

Contains the same configuration files. Filenames are identical to the root level.

### min/ Directory (32 files total)

Contains the same configuration files. Filenames are identical to the root level.

## File Naming Convention

Filenames are formed by concatenating configuration settings with `--`:

- `components`: MainWrapper/Router disabled
- `shadow-dom-mode-none`: Shadow DOM disabled
- `locale-XX`: Locale setting (ja, de, es)
- `debug`: Sets `config.debug = true`

Example:
- `components--shadow-dom-mode-none--locale-ja.js`
  - Components only + Shadow DOM disabled + Japanese locale

## Configuration Flags Explained

### autoLoadFromImportMap
- `true` in all files
- Automatically loads components from Import Map

### enableMainWrapper
- `default.js` variants: `true` (uses default value)
- `components` variants: `false`
- Enable/disable MainWrapper component

### enableRouter
- `default.js` variants: `true` (uses default value)
- `components` variants: `false`
- Enable/disable Router component

### shadowDomMode
- Default: `"open"` (when not explicitly set)
- `shadow-dom-mode-none` variants: `"none"`
- Shadow DOM usage mode

### locale
- Default: not set
- `locale-XX` variants: `"ja"`, `"de"`, `"es"`
- Locale for date/number formatting

### debug
- Default: `false`
- `debug.js` variants: `true`
- Enables verbose logging/debug features during bootstrap
- Append `--debug` to any filename to turn on debug mode for that configuration

## Examples

### Basic Usage (Root)
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="node_modules/structive/dist/EasyLoaders/default.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### Enable Debug Mode
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/debug.js"></script>
```

### Components Only + Debug (Minified)
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/min/components--debug.js"></script>
```

### Using ESM Build
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/esm/default.js"></script>
```

### Using Minified Build
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/min/default.js"></script>
```

### Use as Component Library (Minified)
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/min/components.js"></script>
```

### Japanese Environment (ESM)
```html
<script type="module" src="node_modules/structive/dist/EasyLoaders/esm/locale-ja.js"></script>
```

## Choosing Between AutoLoaders and EasyLoaders

### Use AutoLoaders when:
- You want to import by package name (`"structive"`)
- You prefer standard npm package usage patterns
- You are using Import Maps

### Use EasyLoaders when:
- You want to reference build artifacts directly with relative paths
- You are not using Import Maps
- You want to explicitly specify build artifacts (structive.esm.js / exports.js / structive.esm.min.js)

**Recommendation**: Use **AutoLoaders** in most cases.
