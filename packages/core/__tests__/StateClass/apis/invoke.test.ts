import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '../../../src/StateClass/apis/invoke';
import { raiseError } from '../../../src/utils';
import { IStateHandler, IStateProxy } from '../../../src/StateClass/types';

vi.mock('../../../src/utils');

describe('invoke', () => {
  let mockHandler: IStateHandler;
  let mockReceiver: IStateProxy;
  let mockUpdaterInvoke: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReceiver = {} as any;

    // Create mock updater with invoke method
    mockUpdaterInvoke = vi.fn((callback: () => any) => {
      return callback();
    });

    mockHandler = {
      updater: {
        invoke: mockUpdaterInvoke,
      }
    } as any;
  });

  it('should execute the callback and return the result', () => {
    const callback = vi.fn().mockReturnValue('success');
    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    const result = invokeFn(callback);
    
    expect(result).toBe('success');
    expect(callback).toHaveBeenCalled();
    // Verify callback was called with correct this context (mockReceiver)
    expect(callback.mock.instances[0]).toBe(mockReceiver);
    // Verify updater.invoke was called
    expect(mockUpdaterInvoke).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should raise STATE-203 if callback is not a function', () => {
    // Make raiseError throw to stop execution (as real raiseError would)
    vi.mocked(raiseError).mockImplementationOnce(() => {
      throw new Error('STATE-203');
    });

    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    // @ts-ignore
    expect(() => invokeFn('not a function')).toThrow('STATE-203');
    
    expect(raiseError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'STATE-203',
      message: 'Callback is not a function'
    }));
  });

  it('should handle promise rejection from callback', async () => {
    const error = new Error('Async error');
    const callback = vi.fn().mockRejectedValue(error);
    
    // Mock invoke to return the rejected promise
    mockUpdaterInvoke.mockImplementation((cb: () => any) => cb());
    
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

  it('should wrap non-Error rejection in Error object', async () => {
    const nonErrorValue = 'string error';
    const callback = vi.fn().mockRejectedValue(nonErrorValue);
    
    // Mock invoke to return the rejected promise
    mockUpdaterInvoke.mockImplementation((cb: () => any) => cb());
    
    const invokeFn = invoke({}, 'prop', mockReceiver, mockHandler);
    
    const resultPromise = invokeFn(callback) as Promise<any>;
    
    // Expect the promise to reject
    await expect(resultPromise).rejects.toBe(nonErrorValue);
    
    // Wait for the catch block in invoke to execute
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(raiseError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'STATE-204',
      message: 'Invoke callback rejected',
      cause: expect.objectContaining({
        message: 'string error'
      })
    }));
  });
});
