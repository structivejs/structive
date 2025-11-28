/**
 * createSingleFileComponent.ts
 *
 * Utility for parsing Structive Single File Components (SFC) and extracting/generating each element (HTML, CSS, StateClass).
 *
 * Main responsibilities:
 * - Extracts and separates <template>, <script type="module">, and <style> from text
 * - Dynamically imports <script type="module"> via Base64 encoding and uses it as StateClass
 * - Temporarily converts {{...}} embedded expressions to comment nodes to prevent loss during HTML parsing, then restores them
 * - Returns each element (html, css, stateClass, text) as IUserComponentData
 *
 * Design points:
 * - Achieves safe parsing of Mustache syntax via escapeEmbed/unescapeEmbed
 * - Safely dynamically imports scripts via data: URL
 * - Design that allows flexible separation and management of template, script, and style
 */
import { IStructiveState } from "../StateClass/types";
import { IUserComponentData } from "./types";

type ScriptModule = { default?: unknown };

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
function escapeEmbed(html: string): string {
  return html.replaceAll(/\{\{([^}]+)\}\}/g, (match, expr) => {
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
function unescapeEmbed(html:string):string {
  return html.replaceAll(/<!--\{\{([^}]+)}}-->/g, (match, expr) => {
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
export async function createSingleFileComponent(path: string, text: string): Promise<IUserComponentData> {
  // Create a temporary template element for safe HTML parsing
  const template = document.createElement("template");
  // Escape Mustache expressions to prevent parsing issues
  template.innerHTML = escapeEmbed(text);

  // Extract and remove the <template> section
  const html = template.content.querySelector<HTMLTemplateElement>("template");
  html?.remove();

  // Extract and remove the <script type="module"> section
  const script = template.content.querySelector<HTMLScriptElement>("script[type=module]");
  let scriptModule: ScriptModule = {};
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
        scriptModule = await import(url) as ScriptModule;
      } finally {
        // Clean up blob URL to prevent memory leak
        URL.revokeObjectURL(url);
      }
    } else {
      // Fallback: Base64 encoding method (for test environment)
      // Convert script to Base64 and import via data: URL
      const b64 = btoa(String.fromCodePoint(...new TextEncoder().encode(script.text + uniq_comment)));
      scriptModule = await import(`data:application/javascript;base64,${b64}`) as ScriptModule;
    }
  }
  script?.remove();

  // Extract and remove the <style> section
  const style = template.content.querySelector<HTMLStyleElement>("style");
  style?.remove();

  // Use default export as state class, or empty class if not provided
  const stateClass = (scriptModule.default ?? class {}) as IStructiveState;
  
  // Return parsed component data
  return {
    text,
    // Restore Mustache expressions and trim whitespace from template
    html      : unescapeEmbed(html?.innerHTML ?? "").trim(),
    // Extract CSS text content or use empty string
    css       : style?.textContent ?? "",
    stateClass,
  }
}