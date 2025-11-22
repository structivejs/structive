/**
 * Escapes Mustache template expressions by converting them to HTML comments.
 * This prevents the browser's HTML parser from interpreting {{}} as invalid syntax.
 *
 * @param {string} html - HTML string containing Mustache expressions
 * @returns {string} HTML with {{...}} converted to <!--{{...}}-->
 *
 * @example
 * escapeEmbed('{{name}}') // Returns '<!--{{name}}-->'
 */
function escapeEmbed(html) {
    return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
        return `<!--{{${expr}}}-->`;
    });
}
/**
 * Restores escaped Mustache expressions from HTML comments back to original form.
 * This reverses the escapeEmbed operation after safe HTML parsing.
 *
 * @param {string} html - HTML string with escaped Mustache expressions
 * @returns {string} HTML with <!--{{...}}--> converted back to {{...}}
 *
 * @example
 * unescapeEmbed('<!--{{name}}-->') // Returns '{{name}}'
 */
function unescapeEmbed(html) {
    return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
        return `{{${expr}}}`;
    });
}
/** Counter for generating unique IDs for dynamically imported scripts */
let id = 0;
/**
 * Parses a Single File Component (SFC) and extracts its template, script, and style sections.
 *
 * The SFC format consists of:
 * - <template>: HTML template with Mustache syntax
 * - <script type="module">: JavaScript module exporting the state class
 * - <style>: CSS styles for the component
 *
 * @param {string} path - File path or identifier for source mapping in error messages
 * @param {string} text - Raw SFC text content to parse
 * @returns {Promise<IUserComponentData>} Parsed component data including html, css, and stateClass
 *
 * @example
 * const componentData = await createSingleFileComponent('MyComponent.sfc', `
 *   <template><div>{{message}}</div></template>
 *   <script type="module">
 *     export default class { message = 'Hello'; }
 *   </script>
 *   <style>div { color: blue; }</style>
 * `);
 */
export async function createSingleFileComponent(path, text) {
    // Create a temporary template element for safe HTML parsing
    const template = document.createElement("template");
    // Escape Mustache expressions to prevent parsing issues
    template.innerHTML = escapeEmbed(text);
    // Extract and remove the <template> section
    const html = template.content.querySelector("template");
    html?.remove();
    // Extract and remove the <script type="module"> section
    const script = template.content.querySelector("script[type=module]");
    let scriptModule = {};
    if (script) {
        // Add unique comment for debugging and source mapping
        const uniq_comment = `\n// uniq id: ${id++}\n//# sourceURL=${path}\n`;
        // Use blob URL (browser environment)
        // Fallback for test environment (jsdom) where URL.createObjectURL doesn't exist
        if (typeof URL.createObjectURL === 'function') {
            // Create a blob URL for the script and dynamically import it
            const blob = new Blob([script.text + uniq_comment], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            try {
                scriptModule = await import(url);
            }
            finally {
                // Clean up blob URL to prevent memory leak
                URL.revokeObjectURL(url);
            }
        }
        else {
            // Fallback: Base64 encoding method (for test environment)
            // Convert script to Base64 and import via data: URL
            const b64 = btoa(String.fromCodePoint(...new TextEncoder().encode(script.text + uniq_comment)));
            scriptModule = await import("data:application/javascript;base64," + b64);
        }
    }
    script?.remove();
    // Extract and remove the <style> section
    const style = template.content.querySelector("style");
    style?.remove();
    // Use default export as state class, or empty class if not provided
    const stateClass = (scriptModule.default ?? class {
    });
    // Return parsed component data
    return {
        text,
        // Restore Mustache expressions and trim whitespace from template
        html: unescapeEmbed(html?.innerHTML ?? "").trim(),
        // Extract CSS text content or use empty string
        css: style?.textContent ?? "",
        stateClass,
    };
}
