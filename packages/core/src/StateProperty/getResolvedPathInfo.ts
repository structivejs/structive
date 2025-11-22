/**
 * getResolvedPathInfo.ts
 *
 * Utility for parsing and generating detailed path information (IResolvedPathInfo)
 * from State property names (path strings), including wildcard and index information.
 *
 * Main responsibilities:
 * - Breaks down property names to determine presence and type of wildcards and indexes
 * - Automatically determines wildcard type: context/all/partial/none
 * - Caches by path for reusability and performance
 * - Retrieves structured path information via getStructuredPathInfo
 *
 * Design points:
 * - Caches using Map to handle reserved words like "constructor" and "toString"
 * - Flexibly determines wildcards (*) and numeric indexes, storing them in wildcardIndexes
 * - context type indicates unresolved indexes, all type indicates all resolved indexes, partial type indicates mixed
 * - ResolvedPathInfo class centralizes path parsing and information management
 */
import { IResolvedPathInfo, WildcardType } from './types';
import { getStructuredPathInfo } from './getStructuredPathInfo.js';

/**
 * Cache for resolved path information.
 * Uses Map to safely handle property names including reserved words like "constructor" and "toString".
 */
const _cache: Map<string, IResolvedPathInfo> = new Map();

/**
 * Class that parses and stores resolved path information.
 * 
 * Analyzes property path strings to extract:
 * - Path segments and their hierarchy
 * - Wildcard locations and types
 * - Numeric indexes vs unresolved wildcards
 * - Wildcard type classification (none/context/all/partial)
 */
class ResolvedPathInfo implements IResolvedPathInfo {
  static id : number = 0;
  readonly id = ++ResolvedPathInfo.id;
  readonly name;
  readonly elements;
  readonly paths;
  readonly wildcardCount;
  readonly wildcardType;
  readonly wildcardIndexes;
  readonly info;
  
  /**
   * Constructs resolved path information from a property path string.
   * 
   * Parses the path to identify wildcards (*) and numeric indexes,
   * classifies the wildcard type, and generates structured path information.
   * 
   * @param name - Property path string (e.g., "items.*.name" or "data.0.value")
   */
  constructor(name: string) {
    // Split path into individual segments
    const elements = name.split(".");
    const tmpPatternElements = elements.slice();
    const paths = [];
    let incompleteCount = 0; // Count of unresolved wildcards (*)
    let completeCount = 0;   // Count of resolved wildcards (numeric indexes)
    let lastPath = "";
    let wildcardCount = 0;
    let wildcardType: WildcardType = "none";
    const wildcardIndexes: (number | null)[] = [];
    
    // Process each segment to identify wildcards and indexes
    for(let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element === "*") {
        // Unresolved wildcard
        tmpPatternElements[i] = "*";
        wildcardIndexes.push(null);
        incompleteCount++;
        wildcardCount++;
      } else {
        const number = Number(element);
        if (!Number.isNaN(number)) {
          // Numeric index - treat as resolved wildcard
          tmpPatternElements[i] = "*";
          wildcardIndexes.push(number);
          completeCount++;
          wildcardCount++;
        }
      }
      // Build cumulative path array
      lastPath += element;
      paths.push(lastPath);
      lastPath += (i < elements.length - 1 ? "." : "");
    }
    // Generate pattern string with wildcards normalized
    const pattern = tmpPatternElements.join(".");
    const info = getStructuredPathInfo(pattern);
    
    // Classify wildcard type based on resolved vs unresolved counts
    if (incompleteCount > 0 || completeCount > 0) {
      if (incompleteCount === wildcardCount) {
        // All wildcards are unresolved - need context to resolve
        wildcardType = "context";
      } else if (completeCount === wildcardCount) {
        // All wildcards are resolved with numeric indexes
        wildcardType = "all";
      } else {
        // Mix of resolved and unresolved wildcards
        wildcardType = "partial";
      }
    }
    this.name = name;
    this.elements = elements;
    this.paths = paths;
    this.wildcardCount = wildcardCount;
    this.wildcardType = wildcardType;
    this.wildcardIndexes = wildcardIndexes;
    this.info = info;
  }
}

/**
 * Retrieves or creates resolved path information for a property path.
 * 
 * This function caches resolved path information for performance.
 * On first access, it parses the path and creates a ResolvedPathInfo instance.
 * Subsequent accesses return the cached result.
 * 
 * @param name - Property path string (e.g., "items.*.name", "data.0.value")
 * @returns Resolved path information containing segments, wildcards, and type classification
 */
export function getResolvedPathInfo(name:string):IResolvedPathInfo {
  let nameInfo: IResolvedPathInfo | undefined;
  // Return cached value or create, cache, and return new instance
  return _cache.get(name) ?? (_cache.set(name, nameInfo = new ResolvedPathInfo(name)), nameInfo);
}