import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBindingFilters } from '../../src/DataBinding/BindingFilter';
import { createFilters } from '../../src/BindingBuilder/createFilters';
import { IFilterText } from '../../src/BindingBuilder/types';
import { Filters, FilterWithOptions } from '../../src/Filter/types';

// Mock createFilters
vi.mock('../../src/BindingBuilder/createFilters', () => ({
  createFilters: vi.fn(),
}));

describe('createBindingFilters', () => {
  const mockFilters: FilterWithOptions = {};
  const mockFilterTexts: IFilterText[] = [{ name: 'test', options: [] }];
  const mockCreatedFilters: Filters = [() => 'result'];

  beforeEach(() => {
    vi.clearAllMocks();
    (createFilters as any).mockReturnValue(mockCreatedFilters);
  });

  it('should create filters using createFilters', () => {
    const result = createBindingFilters(mockFilters, mockFilterTexts);
    expect(createFilters).toHaveBeenCalledWith(mockFilters, mockFilterTexts);
    expect(result).toBe(mockCreatedFilters);
  });

  it('should cache the result for the same filters and filterTexts', () => {
    // First call
    const localFilters: FilterWithOptions = {};
    const localFilterTexts: IFilterText[] = [{ name: 'local', options: [] }];
    
    const res1 = createBindingFilters(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledWith(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledTimes(1);
    
    // Second call with same references
    const res2 = createBindingFilters(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledTimes(1); // Still 1
    expect(res1).toBe(res2);
  });

  it('should create new filters for different filterTexts', () => {
    const localFilters: FilterWithOptions = {};
    const text1: IFilterText[] = [{ name: '1', options: [] }];
    const text2: IFilterText[] = [{ name: '2', options: [] }];
    
    const res1 = createBindingFilters(localFilters, text1);
    const res2 = createBindingFilters(localFilters, text2);

    expect(createFilters).toHaveBeenCalledTimes(2);
    expect(res1).toBe(mockCreatedFilters);
    expect(res2).toBe(mockCreatedFilters);
  });

   it('should create new filters for different filters map', () => {
    const filters1: FilterWithOptions = {};
    const filters2: FilterWithOptions = {};
    const text: IFilterText[] = [{ name: 'text', options: [] }];

    const res1 = createBindingFilters(filters1, text);
    const res2 = createBindingFilters(filters2, text);

    expect(createFilters).toHaveBeenCalledTimes(2);
  });

  it('should handle empty inputs', () => {
    const emptyFilters: FilterWithOptions = {};
    const emptyTexts: IFilterText[] = [];
    
    createBindingFilters(emptyFilters, emptyTexts);
    expect(createFilters).toHaveBeenCalledWith(emptyFilters, emptyTexts);
  });
});
