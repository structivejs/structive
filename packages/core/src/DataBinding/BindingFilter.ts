/**
 * Creates and caches filter functions for data binding.
 * 
 * This module provides a caching mechanism for filter creation to avoid
 * recreating filter chains for the same filter definitions and text patterns.
 */
import { createFilters } from "../BindingBuilder/createFilters";
import { IFilterText } from "../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../Filter/types";

// Cache storage: Map<FilterDefinitions, Map<FilterTextPatterns, CreatedFilters>>
const filtersByFilterTextsByFilters: Map<FilterWithOptions, Map<IFilterText[], Filters>> = new Map();

/**
 * Creates a list of filter functions based on the provided definitions and text patterns.
 * Results are cached to improve performance when the same filters are requested multiple times.
 * 
 * @param filters - The available filter definitions (map of filter names to functions/options).
 * @param filterTexts - The parsed filter text patterns from the binding string.
 * @returns An array of executable filter functions.
 */
export function createBindingFilters(filters: FilterWithOptions, filterTexts: IFilterText[]): Filters {
  let filtersByFilterTexts = filtersByFilterTextsByFilters.get(filters);
  if (!filtersByFilterTexts) {
    filtersByFilterTexts = new Map();
    filtersByFilterTextsByFilters.set(filters, filtersByFilterTexts);
  }
  let filterFns = filtersByFilterTexts.get(filterTexts);
  if (!filterFns) {
    filterFns = createFilters(filters, filterTexts);
    filtersByFilterTexts.set(filterTexts, filterFns);
  }
  return filterFns;
}