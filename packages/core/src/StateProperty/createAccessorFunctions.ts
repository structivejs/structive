/**
 * createAccessorFunctions.ts
 *
 * Utility for generating dynamic getter/setter functions from State property path information (IStructuredPathInfo).
 *
 * Main responsibilities:
 * - Dynamically generates optimal accessor functions (get/set) from path information and getter sets
 * - Supports wildcards (*) and nested property paths
 * - Validates paths and segments
 *
 * Design points:
 * - Searches for the longest matching getter path from matchPaths and constructs accessors from the relative path
 * - If no path matches, generates accessors directly from info.pathSegments
 * - Uses new Function to dynamically generate high-performance getter/setter
 * - Strictly validates path and segment names with regular expressions to ensure safety
 */
import { getStructuredPathInfo } from "./getStructuredPathInfo";
import { raiseError } from "../utils";
import { IAccessorFunctions, IStructuredPathInfo } from "./types";

// Regular expression to validate segment names (must start with letter/underscore/$, followed by alphanumeric/underscore/$)
const checkSegmentRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
// Regular expression to validate full property paths (segments separated by dots, wildcards allowed)
const checkPathRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*(\.[a-zA-Z_$][0-9a-zA-Z_$]*|\.\*)*$/;

/**
 * Creates dynamic getter and setter functions for a property path.
 * 
 * This function generates optimized accessor functions by:
 * 1. Finding the longest matching getter path from the cumulative paths
 * 2. Building accessors relative to that getter (or from root if no match)
 * 3. Handling wildcards by mapping them to $1, $2, etc.
 * 4. Validating all path segments for safety
 * 
 * @param info - Structured path information containing segments and wildcards
 * @param getters - Set of getter paths available in the state
 * @returns Object containing dynamically generated get and set functions
 * @throws {Error} STATE-202 - When path or segment name is invalid
 */
export function createAccessorFunctions(info: IStructuredPathInfo, getters: Set<string>): IAccessorFunctions {
  // Find all cumulative paths that match available getters
  const matchPaths = new Set(info.cumulativePaths).intersection(getters);
  let len = -1;
  let matchPath = '';
  // Find the longest matching path to use as base for accessor generation
  for(const curPath of matchPaths) {
    const pathSegments = curPath.split('.');
    // Skip single-segment paths (not useful as base paths)
    if (pathSegments.length === 1) {
      continue;
    }
    if (pathSegments.length > len) {
      len = pathSegments.length;
      matchPath = curPath;
    }
  }
  // Case 1: Found a matching getter path - build accessor relative to it
  if (matchPath.length > 0) {
    // Validate the matched path format
    if (!checkPathRegexp.test(matchPath)) {
      raiseError({
        code: "STATE-202",
        message: `Invalid path: ${matchPath}`,
        context: { matchPath },
        docsUrl: "./docs/error-codes.md#state",
      });
    }
    // Get structured info for the matched getter path
    const matchInfo = getStructuredPathInfo(matchPath);
    const segments = [];
    let count = matchInfo.wildcardCount;
    // Build accessor path from the remaining segments after the match
    for(let i = matchInfo.pathSegments.length; i < info.pathSegments.length; i++) {
      const segment = info.pathSegments[i];
      if (segment === '*') {
        // Wildcard: map to $1, $2, etc. based on wildcard position
        segments.push(`[this.$${  count + 1  }]`);
        count++;
      } else {
        // Regular segment: validate and add as property access
        if (!checkSegmentRegexp.test(segment)) {
          raiseError({
            code: "STATE-202",
            message: `Invalid segment name: ${segment}`,
            context: { segment, matchPath },
            docsUrl: "./docs/error-codes.md#state",
          });
        }
        segments.push(`.${  segment}`);
      }
    }
    // Build final path string and generate getter/setter functions
    const path = segments.join('');
    const getterFuncText = `return this["${matchPath}"]${path};`;
    const setterFuncText = `this["${matchPath}"]${path} = value;`;
    //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
    return {
      get : new Function('', getterFuncText) as ()=> any,
      set : new Function('value', setterFuncText) as (value: any) => void,
    }
  } else {
    // Case 2: No matching getter path - build accessor from root
    const segments = [];
    let count = 0;
    for(let i = 0; i < info.pathSegments.length; i++) {
      const segment = info.pathSegments[i];
      if (segment === '*') {
        // Wildcard: map to $1, $2, etc.
        segments.push(`[this.$${  count + 1  }]`);
        count++;
      } else {
        // Regular segment: validate and add
        if (!checkSegmentRegexp.test(segment)) {
          raiseError({
            code: "STATE-202",
            message: `Invalid segment name: ${segment}`,
            context: { segment },
            docsUrl: "./docs/error-codes.md#state",
          });
        }
        segments.push((segments.length > 0 ? "." : "") + segment);
      }
    }
    // Build final path and generate getter/setter functions from root
    const path = segments.join('');
    const getterFuncText = `return this.${path};`;
    const setterFuncText = `this.${path} = value;`;
    //console.log('path/getter/setter:', info.pattern, getterFuncText, setterFuncText);
    return {
      get : new Function('', getterFuncText) as ()=> any,
      set : new Function('value', setterFuncText) as (value: any) => void,
    }
  }

}
