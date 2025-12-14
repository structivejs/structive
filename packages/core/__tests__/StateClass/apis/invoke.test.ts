import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '../../../src/StateClass/apis/invoke';
import { createUpdater } from '../../../src/Updater/Updater';
import { raiseError } from '../../../src/utils';
import { IStateHandler, IStateProxy } from '../../../src/StateClass/types';
import { IComponentEngine } from '../../../src/ComponentEngine/types';

vi.mock('../../../src/Updater/Updater');
vi.mock('../../../src/utils');

describe('invoke', () => {
  let mockHandler: IStateHandler;
  let mockEngine: IComponentEngine;
  let mockReceiver: IStateProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEngine = {} as any;
    mockHandler = { engine: mockEngine } as any;
    mockReceiver = {} as any;

    // Mock createUpdater to simply execute the callback with a mock updater
    (createUpdater as any).mockImplementation((engine: any, fn: any) => {
      const mockUpdater = {
        update: (loopContext: any, updateFn: any) => {
          // Execute the update function immediately
          // updateFn expects (state, handler)
          // We pass mockReceiver as state
          return updateFn(mockReceiver, mockHandler);
        }
      };
      return fn(mockUpdater);
    });
  });

  it('should execute the callback and return the result', () => {
    const callback = vi.fn().mockReturnValue('success');
    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    const result = invokeFn(callback);
    
    expect(result).toBe('success');
    expect(callback).toHaveBeenCalled();
    // Verify callback was called with correct this context (mockReceiver)
    // Reflect.apply(callback, state, [])
    expect(callback.mock.instances[0]).toBe(mockReceiver);
    expect(createUpdater).toHaveBeenCalledWith(mockEngine, expect.any(Function));
  });

  it('should raise STATE-203 if callback is not a function', () => {
    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    // @ts-ignore
    invokeFn('not a function');
    
    expect(raiseError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'STATE-203',
      message: 'Callback is not a function'
    }));
  });

  it('should handle promise rejection from callback', async () => {
    const error = new Error('Async error');
    const callback = vi.fn().mockRejectedValue(error);
    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    const resultPromise = invokeFn(callback) as Promise<any>;
    
    // Expect the promise to reject
    await expect(resultPromise).rejects.toThrow('Async error');
    
    // Wait for the catch block in invoke to execute
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(raiseError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'STATE-204',
      message: 'Invoke callback rejected',
      cause: error
    }));
  });
});
