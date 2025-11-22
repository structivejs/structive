/**
 * exports.ts
 *
 * Module for publicly exposing Structive's primary entry points and APIs.
 *
 * Main responsibilities:
 * - Exports main APIs such as registerSingleFileComponents, bootstrap, and config
 * - defineComponents: Registers a group of SFCs and automatically initializes if autoInit is enabled
 * - bootstrapStructive: Executes initialization processing only once
 *
 * Design points:
 * - Makes global configuration (config) accessible and modifiable from external code
 * - Prevents multiple executions of initialization processing, ensuring safe startup
 */
import { registerSingleFileComponents } from "./WebComponents/registerSingleFIleComponents.js";
import { bootstrap } from "./bootstrap.js";
import { config as _config } from "./WebComponents/getGlobalConfig.js";
import { IConfig, ShadowDomMode } from "./WebComponents/types";

export const config: IConfig = _config;
export type { ShadowDomMode };

/** Flag to prevent multiple initialization */
let initialized = false;

/**
 * Defines and registers multiple Single File Components.
 * 
 * This is the primary API for declaring components in a Structive application.
 * If config.autoInit is true, this function also automatically calls bootstrapStructive()
 * to initialize the application framework (router, main wrapper, etc.).
 * 
 * @param {Record<string, string>} singleFileComponents - Object mapping tag names to SFC file paths
 * @returns {Promise<void>} Resolves when all components are registered (and bootstrap is complete if autoInit is true)
 * @throws {Error} If component loading, registration, or bootstrap fails
 * 
 * @example
 * // Define components with auto-initialization
 * await defineComponents({
 *   'my-button': './components/button.sfc',
 *   'user-card': '@components/user-card',
 *   'home-page': '@routes/home'
 * });
 * 
 * @example
 * // Define components without auto-initialization
 * config.autoInit = false;
 * await defineComponents({
 *   'my-component': './component.sfc'
 * });
 * await bootstrapStructive(); // Manually bootstrap later
 */
export async function defineComponents(singleFileComponents: Record<string, string>):Promise<void> {
  // Register all provided SFC components
  await registerSingleFileComponents(singleFileComponents);
  
  // Automatically bootstrap if configured
  if (config.autoInit) {
    await bootstrapStructive();
  }
}

/**
 * Bootstraps the Structive application framework.
 * 
 * This function initializes core features like the router and main wrapper based
 * on the global configuration. It ensures bootstrap only runs once, even if called
 * multiple times, making it safe to call from multiple places.
 * 
 * Typically called automatically by defineComponents() if config.autoInit is true,
 * but can be manually invoked for more control over initialization timing.
 * 
 * @returns {Promise<void>} Resolves when bootstrap is complete
 * @throws {Error} If bootstrap initialization fails
 * 
 * @example
 * // Manual bootstrap
 * config.autoInit = false;
 * await defineComponents({ 'my-app': './app.sfc' });
 * await bootstrapStructive(); // Explicitly initialize framework
 * 
 * @example
 * // Safe to call multiple times (only runs once)
 * await bootstrapStructive();
 * await bootstrapStructive(); // No-op, already initialized
 */
export async function bootstrapStructive():Promise<void> {
  // Guard against multiple initialization
  if (!initialized) {
    // Execute core bootstrap process
    await bootstrap();
    // Mark as initialized to prevent re-execution
    initialized = true;
  }
}

