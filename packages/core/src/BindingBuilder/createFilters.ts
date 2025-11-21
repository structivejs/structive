import { FilterFn, Filters, FilterWithOptions } from "../Filter/types";
import { raiseError } from "../utils.js";
import { IFilterText } from "./types";

/**
 * Generates an executable filter function (FilterFn) from filter text metadata
 * (containing name and options).
 * 
 * Processing flow:
 * 1. Look up filter function from registry by filter name
 * 2. Raise error if not found
 * 3. Apply options array and return customized filter function
 * 
 * @param filters - Filter registry (name -> factory function map)
 * @param text - Filter metadata (name and options array)
 * @returns Customized filter function
 * @throws When filter is not found
 */
function textToFilter(filters: FilterWithOptions, text: IFilterText): FilterFn {
  // Look up filter from registry by name
  const filter = filters[text.name];
  
  if (!filter) {
    // Raise error when filter is not found
    raiseError({
      code: 'FLT-201',
      message: `Filter not found: ${text.name}`,
      context: { where: 'createFilters.textToFilter', name: text.name },
      docsUrl: './docs/error-codes.md#flt',
    });
  }
  
  // Pass options array to filter factory to generate executable function
  // Example: filters['currency'](['USD', '2']) => (value) => formatCurrency(value, 'USD', 2)
  return filter(text.options);
}

/**
 * Cache for filter text arrays
 * When the same filter array is used multiple times, return from cache instead of regenerating
 */
const cache: Map<IFilterText[], Filters> = new Map();

/**
 * Generates an array of executable filter functions from filter text array (metadata).
 * Uses cache for the same texts array to optimize performance.
 * 
 * Processing flow:
 * 1. Check cache (has this texts array been processed before?)
 * 2. On cache hit, return cached result
 * 3. On cache miss, transform each filter text via textToFilter
 * 4. Store generated function array in cache
 * 5. Return filter function array
 * 
 * Usage example:
 * ```typescript
 * const filterTexts = [
 *   { name: 'trim', options: [] },
 *   { name: 'uppercase', options: [] }
 * ];
 * const filterFns = createFilters(registry, filterTexts);
 * // filterFns[0](value) -> trim(value)
 * // filterFns[1](value) -> uppercase(value)
 * ```
 * 
 * @param filters - Filter registry (name -> factory function map)
 * @param texts - Array of filter metadata
 * @returns Array of executable filter functions
 */
export function createFilters(filters: FilterWithOptions, texts: IFilterText[]): Filters {
  // Check cache
  let result = cache.get(texts);
  
  if (typeof result === "undefined") {
    // Cache miss: generate new
    result = [];
    
    // Transform each filter text into executable function
    for (let i = 0; i < texts.length; i++) {
      result.push(textToFilter(filters, texts[i]));
    }
    
    // Store generated function array in cache (reuse in subsequent calls)
    cache.set(texts, result);
  }
  
  // Return cached or newly generated result
  return result;
}
