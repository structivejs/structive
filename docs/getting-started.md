# Getting Started (CDN + EasyLoader)

If you want to try Structive without setting up npm or a bundler, the quickest route is to load the core runtime plus an EasyLoader directly from a CDN. EasyLoader takes care of:

- Loading the Structive core (`structive.esm.js` or its minified variant)
- Applying a preconfigured set of global `config` values
- Watching the Import Map and auto-registering SFCs (`config.autoLoadFromImportMap = true`)

This guide walks through the minimal setup using jsDelivr as the CDN and the `components.js` EasyLoader preset.

## Prerequisites
- A modern browser that supports Web Components and ES Modules
- Any static hosting solution that can serve `index.html` and `.sfc.html` files
- A place to host your SFCs (e.g., `/components/hello.sfc.html`)

### Recommended: VS Code Live Server
The simplest way to run the example locally is the **Live Server** extension for VS Code.

1. Open the Extensions panel in VS Code and install “Live Server”.
2. Open the project root (`my-structive-app/`) in VS Code.
3. Open `index.html` and click **Go Live** in the bottom-right corner of the editor.
4. Your browser should open automatically (usually `http://127.0.0.1:5500`).

Because the SFC file is hosted under the same root, you can use the Import Map paths exactly as shown below.

## 1. Project Layout
```
my-structive-app/
├─ components/
│  └─ hello.sfc.html
└─ index.html
```

`components/hello.sfc.html`
```html
<template>
  <section>
    <h1>Hello {{name}}!</h1>
    <button data-bind="onclick:toggle">Toggle</button>
    <p data-bind="textContent:message"></p>
  </section>
</template>

<script type="module">
export default class {
  name = "Structive";
  message = "Welcome!";

  toggle() {
    this.message = this.message === "Welcome!" ? "Enjoy Structive" : "Welcome!";
  }
}
</script>

<style>
section { font-family: system-ui; padding: 1rem; }
button { margin-top: 0.5rem; }
</style>
```

## 2. Add an Import Map and EasyLoader
`index.html`
```html
<!doctype html>
<html lang="ja">
	<head>
		<meta charset="utf-8" />
		<title>Structive + EasyLoader</title>

		<!-- Register the SFC via Import Map -->
		<script type="importmap">
			{
				"imports": {
					"@components/hello-world": "/components/hello.sfc.html"
				}
			}
		</script>

		<!-- EasyLoader: loads the core, applies config presets, auto-registers components -->
		<script
			type="module"
			src="https://cdn.jsdelivr.net/gh/structivejs/structive@latest/packages/core/dist/EasyLoaders/components.js"
		></script>
	</head>
	<body>
		<hello-world></hello-world>
	</body>
</html>
```

Key points:
- When you use the `@components/<tag-name>` convention in your Import Map, EasyLoader will automatically register a Web Component with that tag.
- `components.js` disables both the MainWrapper and Router, so your component renders directly into the existing DOM.
- The same CDN path also exposes other presets such as `default.js` (Router/MainWrapper enabled) or `locale-ja.js`.
- Always mark EasyLoader (or any Structive loader) `<script>` tags with `type="module"`, since Structive ships as ES Modules.
- Inside templates you can reference state directly (`{{name}}`, `{{message}}`), and event handlers can point to class methods like `toggle` without wrapping them in an `actions` object.
- Event names in `data-bind` must include the `on` prefix (e.g., `data-bind="onclick:toggle"`, `oninput`, etc.).

## 3. Use the Minified Variant
For production environments, use the minified EasyLoader to save bandwidth.
```html
<script
	type="module"
	src="https://cdn.jsdelivr.net/gh/structivejs/structive@v1.5.1/packages/core/dist/EasyLoaders/min/components.js"
></script>
```
Every file under `min/` loads `structive.esm.min.js` internally.

## 4. Enable Router or Shadow DOM Variants
EasyLoader ships with 16 presets, each toggling a specific set of flags. Switch the filename in your `<script>` tag to change the behavior.

| Example | Description |
| --- | --- |
| `default.js` | Router and MainWrapper enabled (keeps `config.enableRouter = true`, etc.). |
| `shadow-dom-mode-none.js` | Completely disables Shadow DOM. |
| `locale-ja.js` | Sets `config.locale = "ja"`. |
| `components--shadow-dom-mode-none.js` | Router/MainWrapper disabled plus Shadow DOM disabled. |

## 5. Customize Further
EasyLoader files are plain ES modules. You can copy one (e.g., `components.js`), tweak the `config`, and serve it yourself.

```js
// custom-easy-loader.js (adjust the relative path to structive.esm.js as needed)
import { bootstrapStructive, config } from "../structive.esm.js";

config.autoLoadFromImportMap = true;
config.enableRouter = true;
config.shadowDomMode = "none";

bootstrapStructive();
```

## 6. Hosting Your Components
- The URLs declared in the Import Map must be fetchable (enable CORS if you serve them from another origin).
- In the example above, `@components/hello-world` resolves to `/components/hello.sfc.html`. Point it to any reachable URL—including remote CDNs—and EasyLoader will fetch it for you.

## 7. Troubleshooting
- Nothing renders: double-check that the Import Map key matches the `<hello-world>` tag name.
- Template not picked up: ensure each `.sfc.html` file wraps markup in a single `<template>` root and that the tag is spelled in lowercase (browsers treat `<Template>` as invalid).
- Script errors: confirm every `<script>` that loads Structive (EasyLoader, SFC logic, custom loaders) includes `type="module"`; omitting it makes browsers treat the code as classic scripts and prevents ES module execution.
- CORS errors: ensure the server hosting your SFCs sets `Access-Control-Allow-Origin` appropriately.
- Router/MainWrapper presets: when using files like `default.js`, make sure elements such as `<app-main>` or `<view-router>` exist in the DOM, or review `config.autoInsertMainWrapper`.

That’s it! With CDN + EasyLoader you can bootstrap Structive in seconds. Just keep adding aliases to the Import Map to introduce more components or routes as your app grows.
