/**
 * loadSingleFileComponent.ts
 *
 * Utility function to fetch a Single File Component (SFC) from a specified path, parse it, and return as IUserComponentData.
 *
 * Main responsibilities:
 * - Fetches the SFC file from the specified path using fetch
 * - Loads as text and parses via createSingleFileComponent
 * - Returns the parsed result (IUserComponentData)
 *
 * Design points:
 * - Uses import.meta.resolve for flexible path resolution
 * - Supports dynamic component loading via asynchronous processing
 */
import { createSingleFileComponent } from "./createSingleFileComponent.js";
import { IUserComponentData } from "./types";

/**
 * Loads a Single File Component from the specified path.
 * 
 * Fetches the SFC file, reads its contents as text, and parses it to extract
 * the template, script, and style sections into a component data object.
 * 
 * @param {string} path - Path or alias to the SFC file (e.g., './components/button.sfc' or '@components/button')
 * @returns {Promise<IUserComponentData>} Parsed component data containing html, css, stateClass, and text
 * @throws {Error} If fetch fails or the file cannot be read
 * 
 * @example
 * // Load from relative path
 * const buttonData = await loadSingleFileComponent('./button.sfc');
 * 
 * @example
 * // Load from importmap alias
 * const chartData = await loadSingleFileComponent('@components/chart');
 */
export async function loadSingleFileComponent(path: string): Promise<IUserComponentData> {
  // Resolve path using import.meta.resolve if available
  // Fallback to raw path for SSR environments (Node/Vitest) where import.meta.resolve may not exist
  const resolved = (import.meta as any).resolve ? (import.meta as any).resolve(path) : path;
  
  // Fetch the SFC file from the resolved path
  const response = await fetch(resolved);
  
  // Read the response body as text
  const text = await response.text();
  
  // Parse the SFC text into component data (template, script, style)
  return createSingleFileComponent(path, text);
}
