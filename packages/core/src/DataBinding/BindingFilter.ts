import { createFilters } from "../BindingBuilder/createFilters";
import { IFilterText } from "../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../Filter/types";

const filtersByFilterTextsByFilters: Map<FilterWithOptions, Map<IFilterText[], Filters>> = new Map();

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