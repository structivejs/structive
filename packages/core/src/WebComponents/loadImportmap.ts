/**
 * loadImportmap.ts
 *
 * Utility function to retrieve and merge importmap information from <script type="importmap"> tags in HTML.
 *
 * Main responsibilities:
 * - Scans multiple importmap script tags and merges all imports, returning as IImportMap type
 *
 * Design points:
 * - Parses script tag innerHTML via JSON.parse and consolidates imports properties
 * - Merges multiple importmap.imports using Object.assign
 * - Conforms to importmap specification, enabling flexible import alias management
 */
import { IImportMap } from "./types";

/**
 * Loads and merges all importmaps from the document.
 * 
 * Searches for all <script type="importmap"> elements in the document and combines
 * their imports into a single IImportMap object. If multiple importmap tags exist,
 * their imports are merged with later entries overwriting earlier ones.
 * 
 * @returns {IImportMap} Merged importmap containing all imports from all script tags
 * 
 * @example
 * // HTML:
 * // <script type="importmap">
 * //   { "imports": { "@components/button": "./button.sfc" } }
 * // </script>
 * // <script type="importmap">
 * //   { "imports": { "@routes/home": "./home.sfc" } }
 * // </script>
 * 
 * const importmap = loadImportmap();
 * // Returns: { imports: { "@components/button": "./button.sfc", "@routes/home": "./home.sfc" } }
 */
export function loadImportmap():IImportMap {
  // Initialize empty importmap object
  const importmap: IImportMap = {};
  
  // Find all importmap script tags in the document
  document.querySelectorAll("script[type='importmap']").forEach(script => {
    // Parse the JSON content of each script tag
    const scriptImportmap = JSON.parse(script.innerHTML);
    
    // Merge imports if they exist in this script
    if (scriptImportmap.imports) {
      // Merge with existing imports (later entries override earlier ones)
      importmap.imports = Object.assign(importmap.imports || {}, scriptImportmap.imports);
    }
  });
  
  return importmap;
}

