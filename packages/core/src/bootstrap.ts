/**
 * bootstrap.ts
 *
 * Entry point for initializing a Structive application.
 *
 * Main responsibilities:
 * - Registers and initializes necessary components, router, and main wrapper according to global configuration (config)
 * - Dynamically loads routes and components from importmap if autoLoadFromImportMap is enabled
 * - Registers Router component as a custom element if enableRouter is enabled
 * - Registers MainWrapper as a custom element if enableMainWrapper is enabled, and automatically inserts it into body if autoInsertMainWrapper is enabled
 *
 * Design points:
 * - Flexibly controls initialization processing according to configuration values
 * - Centralizes all processing necessary for Structive startup, including importmap, custom element registration, and automatic DOM insertion
 */
import { MainWrapper } from "./MainWrapper/MainWrapper.js";
import { Router } from "./Router/Router.js";
import { config } from "./WebComponents/getGlobalConfig.js";
import { loadFromImportMap } from "./WebComponents/loadFromImportMap.js";

/**
 * Bootstraps the Structive application with configured features.
 * 
 * This function initializes the application by:
 * 1. Loading components from importmap (if enabled)
 * 2. Registering the router component (if enabled)
 * 3. Registering the main wrapper and optionally inserting it into DOM (if enabled)
 * 
 * Call this function once during application startup, typically after DOM is ready.
 * 
 * @returns {Promise<void>} Resolves when bootstrap is complete
 * @throws {Error} If importmap loading fails or component registration encounters errors
 * @throws {DOMException} If custom element names are invalid or already registered
 * 
 * @example
 * // Basic usage
 * await bootstrap();
 * 
 * @example
 * // With configuration
 * import { config } from './WebComponents/getGlobalConfig';
 * config.enableRouter = true;
 * config.autoLoadFromImportMap = true;
 * await bootstrap();
 */
export async function bootstrap(): Promise<void> {
  // Phase 1: Load components and routes from importmap if configured
  if (config.autoLoadFromImportMap) {
    // Scans <script type="importmap"> tags and registers @routes/* and @components/*
    await loadFromImportMap();
  }

  // Phase 2: Register router component if routing is enabled
  if (config.enableRouter) {
    // Registers the Router component with the configured tag name (default: 'view-router')
    customElements.define(config.routerTagName, Router);
  }

  // Phase 3: Register and optionally insert main wrapper
  if (config.enableMainWrapper) {
    // Register MainWrapper component with the configured tag name (default: 'app-main')
    customElements.define(config.mainTagName, MainWrapper);
    
    // Automatically insert main wrapper into document body if configured
    if (config.autoInsertMainWrapper) {
      const mainWrapper = document.createElement(config.mainTagName);
      document.body.appendChild(mainWrapper);
    }
  }
}