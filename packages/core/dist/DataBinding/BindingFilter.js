import { createFilters } from "../BindingBuilder/createFilters";
const filtersByFilterTextsByFilters = new Map();
export function createBindingFilters(filters, filterTexts) {
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
