import { createBindingState } from "../DataBinding/BindingState/BindingState.js";
import { createBindingStateIndex } from "../DataBinding/BindingState/BindingStateIndex.js";
import { CreateBindingStateByStateFn } from "../DataBinding/BindingState/types";
import { IFilterText } from "./types";

/**
 * Regular expression to identify index references within loop context
 * Pattern: "$" + digit (e.g., "$1", "$2", "$3")
 * 
 * Hierarchy structure (1-based, from outer to inner):
 * - "$1": Index of outermost loop
 * - "$2": Index of one level inner loop
 * - "$3": Index of further inner loop
 * 
 * Usage example (nested loops):
 * ```
 * <ul data-bind="for:categories">              ← $1
 *   <li>
 *     <ul data-bind="for:categories.*.items">  ← $2 (child list is property of parent list element)
 *       <li data-bind="text:$1">...            ← categories index
 *       <li data-bind="text:$2">...            ← items index
 *     </ul>
 *   </li>
 * </ul>
 * ```
 * 
 * Note: In nested loops, child list must be defined as property of parent list element
 * (e.g., categories.*.items means categories[i].items)
 */
const ereg = new RegExp(/^\$\d+$/);

/**
 * Factory function that returns the appropriate binding state creator function
 * (CreateBindingStateByStateFn) from target state property name and filter information.
 *
 * Decision logic:
 * 1. Check if property name matches "$digit" pattern with regex
 *    - If matches: Use createBindingStateIndex
 *      Loop index binding (e.g., $1, $2 inside for statement)
 *    - If not matches: Use createBindingState
 *      Normal state property binding (e.g., user.name)
 * 
 * 2. Execute creator function with filter information
 * 
 * 3. Return function that creates actual binding state instance
 * 
 * Usage examples:
 * ```typescript
 * // Normal property binding
 * const creator1 = getBindingStateCreator('user.name', []);
 * // creator1 generates normal BindingState
 * 
 * // Outermost loop index binding
 * const creator2 = getBindingStateCreator('$1', []);
 * // creator2 generates BindingStateIndex (accesses outermost loop index value)
 * 
 * // Inner loop index in nested loops
 * const creator3 = getBindingStateCreator('$2', []);
 * // creator3 accesses index of one level inner loop
 * ```
 * 
 * @param name - Target state property name (e.g., "user.name", "$1", "$2")
 * @param filterTexts - Array of output filter metadata (node→state direction)
 * @returns Function that creates actual binding state instance
 */
export function getBindingStateCreator(
  name       : string, 
  filterTexts: IFilterText[]
): CreateBindingStateByStateFn {
  // Check if property name matches "$digit" pattern
  if (ereg.test(name)) {
    // Return creator function for loop index binding
    // "$1" → Outermost loop index (1-based)
    // "$2" → One level inner loop index
    // "$3" → Further inner loop index
    // ...and so on, proceeding inward
    return createBindingStateIndex(name, filterTexts);
  } else {
    // Return standard binding state creator function for normal property names
    // Examples: "user.name", "items", "isVisible"
    return createBindingState(name, filterTexts);
  }
}