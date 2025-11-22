/**
 * getStructuredPathInfo.ts
 *
 * Utility for generating and caching detailed structured path information (IStructuredPathInfo)
 * from State property path strings.
 *
 * Main responsibilities:
 * - Splits path strings and analyzes segments, wildcard (*) positions, and parent-child relationships
 * - Structures information about path hierarchy and wildcard hierarchy (cumulativePaths/wildcardPaths/parentPath, etc.)
 * - Caches analysis results as IStructuredPathInfo for reusability and performance
 * - Ensures safety with reserved word checks
 *
 * Design points:
 * - Caches by path for fast retrieval on multiple accesses to the same path
 * - Strictly analyzes wildcards, parent-child relationships, and hierarchical structure, optimized for bindings and nested loops
 * - Raises exceptions via raiseError for reserved words or dangerous paths
 */
import { RESERVED_WORD_SET } from '../constants.js';
import { raiseError } from '../utils.js';
import { IStructuredPathInfo } from './types';

/**
 * Cache for structured path information.
 * Uses plain object instead of Map since reserved words and object property names
 * are not expected to be used as path patterns in practice.
 */
const _cache: { [key:string]: IStructuredPathInfo } = {};

/**
 * Class representing comprehensive structured information about a State property path.
 * Analyzes path hierarchy, wildcard positions, parent-child relationships, and provides
 * various access patterns for binding and dependency tracking.
 * 
 * @class StructuredPathInfo
 * @implements {IStructuredPathInfo}
 */
class StructuredPathInfo implements IStructuredPathInfo {
  static id : number = 0;
  readonly id = ++StructuredPathInfo.id;
  readonly sid = this.id.toString();
  readonly pattern;
  readonly pathSegments;
  readonly lastSegment;
  readonly cumulativePaths;
  readonly cumulativePathSet;
  readonly cumulativeInfos;
  readonly cumulativeInfoSet;
  readonly wildcardPaths;
  readonly wildcardPathSet;
  readonly wildcardInfos;
  readonly indexByWildcardPath;
  readonly wildcardInfoSet;
  readonly wildcardParentPaths;
  readonly wildcardParentPathSet;
  readonly wildcardParentInfos;
  readonly wildcardParentInfoSet;
  readonly lastWildcardPath;
  readonly lastWildcardInfo;
  readonly parentPath;
  readonly parentInfo;
  readonly wildcardCount;

  /**
   * Constructs a StructuredPathInfo instance with comprehensive path analysis.
   * Parses the pattern into segments, identifies wildcards, builds cumulative and wildcard paths,
   * and establishes parent-child relationships for hierarchical navigation.
   * 
   * @param {string} pattern - The property path pattern (e.g., "items.*.name" or "user.profile")
   */
  constructor(pattern: string) {
    // Helper to get or create StructuredPathInfo instances, avoiding redundant creation for self-reference
    const getPattern = (_pattern: string): IStructuredPathInfo => {
      return (pattern === _pattern) ? this : getStructuredPathInfo(_pattern);
    };
    
    // Split the pattern into individual path segments (e.g., "items.*.name" → ["items", "*", "name"])
    const pathSegments = pattern.split(".");
    
    // Arrays to track all cumulative paths from root to each segment
    const cumulativePaths = [];
    const cumulativeInfos: IStructuredPathInfo[] = [];
    
    // Arrays to track wildcard-specific information
    const wildcardPaths = [];
    const indexByWildcardPath: Record<string, number> = {}; // Maps wildcard path to its index position
    const wildcardInfos = [];
    const wildcardParentPaths = []; // Paths of parent segments for each wildcard
    const wildcardParentInfos = [];
    
    let currentPatternPath = "", prevPatternPath = "";
    let wildcardCount = 0;
    
    // Iterate through each segment to build cumulative paths and identify wildcards
    for(let i = 0; i < pathSegments.length; i++) {
      currentPatternPath += pathSegments[i];
      
      // If this segment is a wildcard, track it with all wildcard-specific metadata
      if (pathSegments[i] === "*") {
        wildcardPaths.push(currentPatternPath);
        indexByWildcardPath[currentPatternPath] = wildcardCount; // Store wildcard's ordinal position
        wildcardInfos.push(getPattern(currentPatternPath));
        wildcardParentPaths.push(prevPatternPath); // Parent path is the previous cumulative path
        wildcardParentInfos.push(getPattern(prevPatternPath));
        wildcardCount++;
      }
      
      // Track all cumulative paths for hierarchical navigation (e.g., "items", "items.*", "items.*.name")
      cumulativePaths.push(currentPatternPath);
      cumulativeInfos.push(getPattern(currentPatternPath));
      
      // Save current path as previous for next iteration, then add separator
      prevPatternPath = currentPatternPath;
      currentPatternPath += ".";
    }
    
    // Determine the deepest (last) wildcard path and the parent path of the entire pattern
    const lastWildcardPath = wildcardPaths.length > 0 ? wildcardPaths[wildcardPaths.length - 1] : null;
    const parentPath = cumulativePaths.length > 1 ? cumulativePaths[cumulativePaths.length - 2] : null;
    
    // Assign all analyzed data to readonly properties
    this.pattern = pattern;
    this.pathSegments = pathSegments;
    this.lastSegment = pathSegments[pathSegments.length - 1];
    this.cumulativePaths = cumulativePaths;
    this.cumulativePathSet = new Set(cumulativePaths); // Set for fast lookup
    this.cumulativeInfos = cumulativeInfos;
    this.cumulativeInfoSet = new Set(cumulativeInfos);
    this.wildcardPaths = wildcardPaths;
    this.wildcardPathSet = new Set(wildcardPaths);
    this.indexByWildcardPath = indexByWildcardPath;
    this.wildcardInfos = wildcardInfos;
    this.wildcardInfoSet = new Set(wildcardInfos);
    this.wildcardParentPaths = wildcardParentPaths;
    this.wildcardParentPathSet = new Set(wildcardParentPaths);
    this.wildcardParentInfos = wildcardParentInfos;
    this.wildcardParentInfoSet = new Set(wildcardParentInfos);
    this.lastWildcardPath = lastWildcardPath;
    this.lastWildcardInfo = lastWildcardPath ? getPattern(lastWildcardPath) : null;
    this.parentPath = parentPath;
    this.parentInfo = parentPath ? getPattern(parentPath) : null;
    this.wildcardCount = wildcardCount;
  }
}

/**
 * Retrieves or creates a StructuredPathInfo instance for the given path pattern.
 * Uses caching to avoid redundant parsing of the same path patterns.
 * Validates that the path is not a reserved word before processing.
 * 
 * @param {string} structuredPath - The property path pattern to analyze (e.g., "items.*.name")
 * @returns {IStructuredPathInfo} Comprehensive structured information about the path
 * @throws {Error} Throws STATE-202 error if the path is a reserved word
 * 
 * @example
 * const info = getStructuredPathInfo("items.*.name");
 * console.log(info.wildcardCount); // 1
 * console.log(info.cumulativePaths); // ["items", "items.*", "items.*.name"]
 */
export function getStructuredPathInfo(structuredPath: string): IStructuredPathInfo {
  // Validate that the path is not a reserved word to prevent conflicts
  if (RESERVED_WORD_SET.has(structuredPath)) {
    raiseError({
      code: 'STATE-202',
      message: `Pattern is reserved word: ${structuredPath}`,
      context: { where: 'getStructuredPathInfo', structuredPath },
      docsUrl: './docs/error-codes.md#state',
    });
  }
  
  // Return cached result if available
  const info = _cache[structuredPath];
  if (typeof info !== "undefined") {
    return info;
  }
  
  // Create new StructuredPathInfo and cache it for future use
  return (_cache[structuredPath] = new StructuredPathInfo(structuredPath));
}
