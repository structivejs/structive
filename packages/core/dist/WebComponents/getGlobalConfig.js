/**
 * Global configuration object with default values for all Structive components.
 * This object can be modified directly to change application-wide behavior.
 */
const globalConfig = {
    /** Enable debug mode for verbose logging */
    "debug": false,
    /** Locale for internationalization (e.g., "en-US", "ja-JP") */
    "locale": "en-US",
    /** Shadow DOM mode: "auto" (default) uses Shadow DOM when supported, "none" disables it, "force" requires it */
    "shadowDomMode": "auto",
    /** Enable the main wrapper component */
    "enableMainWrapper": true,
    /** Enable the router component */
    "enableRouter": true,
    /** Automatically insert the main wrapper into the document */
    "autoInsertMainWrapper": false,
    /** Automatically initialize components on page load */
    "autoInit": true,
    /** Custom tag name for the main wrapper element */
    "mainTagName": "app-main",
    /** Custom tag name for the router element */
    "routerTagName": "view-router",
    /** Path to the layout template file */
    "layoutPath": "",
    /** Automatically load components referenced in import maps */
    "autoLoadFromImportMap": false,
};
/**
 * Retrieves the global configuration object.
 * Returns a reference to the live configuration object, so modifications
 * will affect all components.
 *
 * @returns {IConfig} The global configuration object
 *
 * @example
 * const config = getGlobalConfig();
 * config.debug = true; // Enable debug mode
 * config.shadowDomMode = 'none'; // Disable Shadow DOM
 */
export function getGlobalConfig() {
    return globalConfig;
}
/**
 * Pre-initialized global configuration for convenient access.
 * This is a direct reference to the result of getGlobalConfig().
 *
 * @example
 * import { config } from './getGlobalConfig';
 * console.log(config.locale); // 'en-US'
 */
export const config = getGlobalConfig();
