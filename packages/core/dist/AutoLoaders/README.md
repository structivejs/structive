# AutoLoaders

Pre-configured bootstrap scripts for Structive.js. Automatically loads components from Import Map and executes `bootstrapStructive()`.

## Features

- **Auto-initialization**: Automatically loads from Import Map with `config.autoLoadFromImportMap = true`
- **Pre-configured**: Configuration combinations identifiable by filename
- **Build-excluded**: Not compiled by TypeScript, copied as-is to dist/

## Build and Deploy

Files in this folder are **excluded from TypeScript compilation**. During build, they are processed as follows:

```bash
npm run build
# 1. Compile TypeScript files with tsc
# 2. Bundle with rollup
# 3. Copy src/AutoLoaders/ to dist/AutoLoaders/ with node scripts/copy-loaders.js
```

The `copy-loaders.js` script copies files directly to dist/ as-is.

## Usage

After deployment to the dist folder, import as follows:

```html
<!-- Default settings -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/default.js"></script>

<!-- Components only (MainWrapper/Router disabled) -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/components.js"></script>

<!-- Shadow DOM disabled -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/shadow-dom-mode-none.js"></script>

<!-- Japanese locale -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/locale-ja.js"></script>

<!-- Enable debug logging -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/debug.js"></script>
```

## File List and Configuration Flags

### Basic Patterns

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `default.js` | ✓ | ✓ | ✓ | "open" | - | ✗ |
| `debug.js` | ✓ | ✓ | ✓ | "open" | - | ✓ |
| `components.js` | ✓ | ✗ | ✗ | "open" | - | ✗ |
| `components--debug.js` | ✓ | ✗ | ✗ | "open" | - | ✓ |
| `shadow-dom-mode-none.js` | ✓ | ✓ | ✓ | "none" | - | ✗ |
| `shadow-dom-mode-none--debug.js` | ✓ | ✓ | ✓ | "none" | - | ✓ |

### Locale Settings

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `locale-ja.js` | ✓ | ✓ | ✓ | "open" | "ja" | ✗ |
| `locale-ja--debug.js` | ✓ | ✓ | ✓ | "open" | "ja" | ✓ |
| `locale-de.js` | ✓ | ✓ | ✓ | "open" | "de" | ✗ |
| `locale-de--debug.js` | ✓ | ✓ | ✓ | "open" | "de" | ✓ |
| `locale-es.js` | ✓ | ✓ | ✓ | "open" | "es" | ✗ |
| `locale-es--debug.js` | ✓ | ✓ | ✓ | "open" | "es" | ✓ |

### Compound Settings (Components)

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `components--locale-ja.js` | ✓ | ✗ | ✗ | "open" | "ja" | ✗ |
| `components--locale-ja--debug.js` | ✓ | ✗ | ✗ | "open" | "ja" | ✓ |
| `components--locale-de.js` | ✓ | ✗ | ✗ | "open" | "de" | ✗ |
| `components--locale-de--debug.js` | ✓ | ✗ | ✗ | "open" | "de" | ✓ |
| `components--locale-es.js` | ✓ | ✗ | ✗ | "open" | "es" | ✗ |
| `components--locale-es--debug.js` | ✓ | ✗ | ✗ | "open" | "es" | ✓ |

### Compound Settings (Shadow DOM Disabled)

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `shadow-dom-mode-none--locale-ja.js` | ✓ | ✓ | ✓ | "none" | "ja" | ✗ |
| `shadow-dom-mode-none--locale-ja--debug.js` | ✓ | ✓ | ✓ | "none" | "ja" | ✓ |
| `shadow-dom-mode-none--locale-de.js` | ✓ | ✓ | ✓ | "none" | "de" | ✗ |
| `shadow-dom-mode-none--locale-de--debug.js` | ✓ | ✓ | ✓ | "none" | "de" | ✓ |
| `shadow-dom-mode-none--locale-es.js` | ✓ | ✓ | ✓ | "none" | "es" | ✗ |
| `shadow-dom-mode-none--locale-es--debug.js` | ✓ | ✓ | ✓ | "none" | "es" | ✓ |

### Compound Settings (Components + Shadow DOM Disabled)

| Filename | autoLoad | enableMainWrapper | enableRouter | shadowDomMode | locale | debug |
|----------|----------|-------------------|--------------|---------------|--------|-------|
| `components--shadow-dom-mode-none.js` | ✓ | ✗ | ✗ | "none" | - | ✗ |
| `components--shadow-dom-mode-none--debug.js` | ✓ | ✗ | ✗ | "none" | - | ✓ |
| `components--shadow-dom-mode-none--locale-ja.js` | ✓ | ✗ | ✗ | "none" | "ja" | ✗ |
| `components--shadow-dom-mode-none--locale-ja--debug.js` | ✓ | ✗ | ✗ | "none" | "ja" | ✓ |
| `components--shadow-dom-mode-none--locale-de.js` | ✓ | ✗ | ✗ | "none" | "de" | ✗ |
| `components--shadow-dom-mode-none--locale-de--debug.js` | ✓ | ✗ | ✗ | "none" | "de" | ✓ |
| `components--shadow-dom-mode-none--locale-es.js` | ✓ | ✗ | ✗ | "none" | "es" | ✗ |
| `components--shadow-dom-mode-none--locale-es--debug.js` | ✓ | ✗ | ✗ | "none" | "es" | ✓ |

## File Naming Convention

Filenames are formed by concatenating configuration settings with `--`:

- `components`: MainWrapper/Router disabled
- `shadow-dom-mode-none`: Shadow DOM disabled
- `locale-XX`: Locale setting (ja, de, es)
- `--debug`: Appended to any filename to set `config.debug = true`

Example:
- `components--shadow-dom-mode-none--locale-ja.js`
  - Components only + Shadow DOM disabled + Japanese locale

## Import Statement

All files use the following import statement:

```javascript
import { bootstrapStructive, config } from "structive";
```

**Note**: This import statement is designed for when deployed to dist/.

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
- `--debug` variants: `true`
- Enables verbose logging/debug-only behaviors (e.g., template warnings)

## Examples

### Basic Usage
```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "structive": "./node_modules/structive/dist/structive.mjs",
      "app-root": "./components/app-root.st.html"
    }
  }
  </script>
  <script type="module" src="node_modules/structive/dist/AutoLoaders/default.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### Use as Component Library
```html
<!-- Use as pure component library without MainWrapper or Router -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/components.js"></script>
```

### Japanese Environment
```html
<!-- Use with Japanese locale settings -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/locale-ja.js"></script>
```

### Enable Debug Mode
```html
<!-- Turn on verbose Structive debug logging -->
<script type="module" src="node_modules/structive/dist/AutoLoaders/debug.js"></script>
```
