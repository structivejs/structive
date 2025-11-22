/**
 * getComponentConfig.ts
 *
 * Utility function to merge user configuration (IUserConfig) with global configuration and generate component configuration (IComponentConfig).
 *
 * Main responsibilities:
 * - Retrieves global configuration via getGlobalConfig
 * - User configuration takes priority, with global configuration values used for unspecified settings
 * - Centrally returns configuration values such as shadowDomMode and extends
 *
 * Design points:
 * - Flexibly merges individual user settings with overall default settings
 * - Design that considers default configuration values and extensibility
 */
import { getGlobalConfig } from "./getGlobalConfig.js";
/**
 * Generates component configuration by merging user-specific settings with global defaults.
 *
 * User-provided values take precedence over global configuration. If a setting is not
 * specified in userConfig, the global default is used instead.
 *
 * @param {IUserConfig} userConfig - User-specific configuration for the component
 * @returns {IComponentConfig} Merged configuration with all required settings
 *
 * @example
 * const config = getComponentConfig({
 *   shadowDomMode: 'open',
 *   extends: 'button'
 * });
 * // Returns: { enableWebComponents: true, shadowDomMode: 'open', extends: 'button' }
 *
 * @example
 * // Using global defaults
 * const config = getComponentConfig({});
 * // Returns configuration with global shadowDomMode and null for extends
 */
export function getComponentConfig(userConfig) {
    // Retrieve global configuration as fallback
    const globalConfig = getGlobalConfig();
    return {
        // Default to true if not explicitly set to false
        enableWebComponents: typeof userConfig.enableWebComponents === "undefined" ? true : userConfig.enableWebComponents,
        // Use user's shadowDomMode if specified, otherwise fall back to global setting
        shadowDomMode: userConfig.shadowDomMode ?? globalConfig.shadowDomMode,
        // Use user's extends value if specified, otherwise null (standard custom element)
        extends: userConfig.extends ?? null,
    };
}
