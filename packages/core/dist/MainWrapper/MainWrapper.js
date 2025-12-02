/**
 * MainWrapper.ts
 *
 * Implementation of MainWrapper custom element that manages application-wide layout and routing.
 *
 * Main responsibilities:
 * - Enables Shadow DOM and dynamically loads layout templates
 * - Applies layout templates and styles
 * - Dynamically adds router element (routerTagName)
 *
 * Design points:
 * - Toggles Shadow DOM enable/disable via config.shadowDomMode
 * - If config.layoutPath is specified, fetches layout HTML and applies template and styles
 * - Applies styles to ShadowRoot or document using adoptedStyleSheets
 * - Inserts default slot if no layout is specified
 * - Adds router element to slot if config.enableRouter is enabled
 */
import { raiseError } from "../utils";
import { config } from "../WebComponents/getGlobalConfig";
const SLOT_KEY = "router";
const DEFAULT_LAYOUT = `<slot name="${SLOT_KEY}"></slot>`;
/**
 * MainWrapper custom element for managing application layout and routing.
 * Extends HTMLElement to provide layout template loading and router integration.
 */
export class MainWrapper extends HTMLElement {
    /**
     * Creates a new MainWrapper instance and initializes Shadow DOM if configured.
     */
    constructor() {
        super();
        if (config.shadowDomMode !== "none") {
            this.attachShadow({ mode: 'open' });
        }
    }
    /**
     * Web Component lifecycle callback invoked when element is connected to DOM.
     * Loads layout and renders the component.
     */
    async connectedCallback() {
        await this.loadLayout();
        this.render();
    }
    /**
     * Gets the root element for content insertion (ShadowRoot or this element).
     * @returns ShadowRoot if Shadow DOM is enabled, otherwise the element itself
     */
    get root() {
        return this.shadowRoot ?? this;
    }
    /**
     * Loads layout template from configured path or uses default layout.
     * Fetches HTML, extracts template and styles, and applies them to root.
     * @throws TMP-101 If layout fetch fails
     */
    async loadLayout() {
        if (config.layoutPath) {
            const response = await fetch(config.layoutPath);
            if (response.ok) {
                const layoutText = await response.text();
                const workTemplate = document.createElement("template");
                workTemplate.innerHTML = layoutText;
                const template = workTemplate.content.querySelector("template");
                const style = workTemplate.content.querySelector("style");
                this.root.appendChild(template?.content ?? document.createDocumentFragment());
                if (style) {
                    const shadowRootOrDocument = this.shadowRoot ?? document;
                    const styleSheets = shadowRootOrDocument.adoptedStyleSheets;
                    if (!styleSheets.includes(style)) {
                        shadowRootOrDocument.adoptedStyleSheets = [...styleSheets, style];
                    }
                }
            }
            else {
                raiseError({
                    code: 'TMP-101',
                    message: `Failed to load layout from ${config.layoutPath}`,
                    context: { where: 'MainWrapper.loadLayout', layoutPath: config.layoutPath },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
        }
        else {
            this.root.innerHTML = DEFAULT_LAYOUT;
        }
    }
    /**
     * Renders the component by adding router element if enabled.
     */
    render() {
        if (config.enableRouter) {
            const router = document.createElement(config.routerTagName);
            router.setAttribute('slot', SLOT_KEY);
            this.root.appendChild(router);
        }
    }
}
