/**
 * types.ts
 *
 * Type definition file for StateProperty-related types.
 *
 * Main responsibilities:
 * - Defines types for State property path information, wildcard information, accessor functions, etc.
 * - IStructuredPathInfo: Detailed structured information including path hierarchy, wildcards, and parent-child relationships
 * - IResolvedPathInfo: Actual path strings, element arrays, wildcard types, and index information
 * - IAccessorFunctions: Types for dynamically generated getter/setter functions
 *
 * Design points:
 * - Strictly represents path hierarchical structure and wildcard hierarchy in types for type-safe binding and access
 * - Explicitly types wildcard types such as context/all/partial/none
 * - Type definitions for accessor functions support dynamic getter/setter generation
 */
export {};
