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
  const mockFilters: FilterWithOptions = new Map();
  const mockFilterTexts: IFilterText[] = [{ name: 'test', args: [] }];
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
    const result1 = createBindingFilters(mockFilters, mockFilterTexts);
    
    // Second call with same references
    const result2 = createBindingFilters(mockFilters, mockFilterTexts);

    // Should be called only once due to caching
    // Note: Since module state persists, if previous test ran, it might be cached already?
    // But we use the same mock objects.
    // To be safe against test order, we should use unique objects for this test or rely on the fact that
    // we can't easily reset the module state without reloading the module.
    // However, createFilters mock is cleared in beforeEach.
    // If the cache is hit, createFilters won't be called.
    
    // If the previous test 'should create filters using createFilters' ran, the cache is already populated for mockFilters/mockFilterTexts.
    // So createFilters might not be called at all in this test if it runs after.
    // Let's check if createFilters was called.
    
    // Actually, to test caching properly in the presence of module-level state, 
    // we should use fresh objects for this specific test case to ensure we start with a clean slate (cache miss),
    // then call again to verify cache hit.
    
    const localFilters: FilterWithOptions = new Map();
    const localFilterTexts: IFilterText[] = [{ name: 'local', args: [] }];
    
    const res1 = createBindingFilters(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledWith(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledTimes(1);
    
    const res2 = createBindingFilters(localFilters, localFilterTexts);
    expect(createFilters).toHaveBeenCalledTimes(1); // Still 1
    expect(res1).toBe(res2);
  });

  it('should create new filters for different filterTexts', () => {
    const localFilters: FilterWithOptions = new Map();
    const text1: IFilterText[] = [{ name: '1', args: [] }];
    const text2: IFilterText[] = [{ name: '2', args: [] }];
    
    const res1 = createBindingFilters(localFilters, text1);
    const res2 = createBindingFilters(localFilters, text2);

    expect(createFilters).toHaveBeenCalledTimes(2);
    expect(res1).toBe(mockCreatedFilters);
    expect(res2).toBe(mockCreatedFilters);
  });

   it('should create new filters for different filters map', () => {
    const filters1: FilterWithOptions = new Map();
    const filters2: FilterWithOptions = new Map();
    const text: IFilterText[] = [{ name: 'text', args: [] }];

    const res1 = createBindingFilters(filters1, text);
    const res2 = createBindingFilters(filters2, text);

    expect(createFilters).toHaveBeenCalledTimes(2);
  });

  it('should handle empty inputs', () => {
    const emptyFilters: FilterWithOptions = new Map();
    const emptyTexts: IFilterText[] = [];
    
    createBindingFilters(emptyFilters, emptyTexts);
    expect(createFilters).toHaveBeenCalledWith(emptyFilters, emptyTexts);
  });
});
