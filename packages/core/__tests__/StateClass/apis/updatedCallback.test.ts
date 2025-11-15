/**
 * updatedCallback.test.ts
 * 
 * updatedCallback関数のチE��トスイーチE
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updatedCallback } from '../../../src/StateClass/apis/updatedCallback.js';
import { IStateHandler, IStateProxy } from '../../../src/StateClass/types.js';
import { IStatePropertyRef } from '../../../src/StatePropertyRef/types.js';
import { UPDATED_CALLBACK_FUNC_NAME } from '../../../src/constants.js';

// モチE��オブジェクト�E作�E
const createMockHandler = (): IStateHandler => ({
  engine: null as any,
  updater: null as any,
  renderer: null,
  refStack: [],
  refIndex: 0,
  lastRefStack: null,
  loopContext: null,
  symbols: new Set(),
  apis: new Set(),
  get: () => null as any,
  set: () => true,
});

const createMockReceiver = (): IStateProxy => ({} as IStateProxy);

const createMockRef = (pattern: string, wildcardCount: number = 0, index?: number): IStatePropertyRef => ({
  info: {
    id: 1,
    sid: 'test-1',
    pathSegments: pattern.split('.'),
    lastSegment: pattern.split('.').pop() || '',
    cumulativePaths: [pattern],
    cumulativePathSet: new Set([pattern]),
    cumulativeInfos: [],
    cumulativeInfoSet: new Set(),
    parentPath: null,
    parentInfo: null,
    wildcardPaths: [],
    wildcardPathSet: new Set(),
    indexByWildcardPath: {},
    wildcardInfos: [],
    wildcardInfoSet: new Set(),
    wildcardParentPaths: [],
    wildcardParentPathSet: new Set(),
    wildcardParentInfos: [],
    wildcardParentInfoSet: new Set(),
    lastWildcardPath: null,
    lastWildcardInfo: null,
    pattern,
    wildcardCount,
    children: {}
  },
  listIndex: wildcardCount > 0 ? {
    parentListIndex: null,
    id: 1,
    sid: 'list-1',
    position: 0,
    length: 1,
    index: index ?? 0,
    version: 1,
    dirty: false,
    indexes: [index ?? 0],
    listIndexes: [],
    varName: '$1',
    at: () => null
  } : null,
  key: pattern,
  parentRef: null
});

describe('updatedCallback', () => {
  let mockTarget: any;
  let mockHandler: IStateHandler;
  let mockReceiver: IStateProxy;

  beforeEach(() => {
    mockHandler = createMockHandler();
    mockReceiver = createMockReceiver();
    vi.clearAllMocks();
  });

  describe('when target has $updatedCallback property', () => {
    it('should call $updatedCallback function with empty arrays when refs is empty', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      await updatedCallback(mockTarget, [], mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith([], {});
      expect(mockCallback.mock.instances[0]).toBe(mockReceiver);
    });

    it('should call $updatedCallback with simple paths when refs have no wildcards', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('user.name'),
        createMockRef('user.email'),
        createMockRef('config.settings')
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['user.name', 'user.email', 'config.settings'], 
        {}
      );
    });

    it('should handle refs with wildcards and collect indexes', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('users.*.name', 1, 0),
        createMockRef('users.*.email', 1, 1),
        createMockRef('users.*.name', 1, 2)
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['users.*.name', 'users.*.email'], 
        {
          'users.*.name': [0, 2],
          'users.*.email': [1]
        }
      );
    });

    it('should handle mixed refs with and without wildcards', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('config.title'), // no wildcard
        createMockRef('users.*.name', 1, 0), // with wildcard
        createMockRef('config.description'), // no wildcard
        createMockRef('users.*.email', 1, 1) // with wildcard
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['config.title', 'users.*.name', 'config.description', 'users.*.email'], 
        {
          'users.*.name': [0],
          'users.*.email': [1]
        }
      );
    });

    it('should deduplicate paths while maintaining index arrays', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('items.*.value', 1, 0),
        createMockRef('items.*.value', 1, 1),
        createMockRef('items.*.value', 1, 2),
        createMockRef('config.setting'),
        createMockRef('config.setting'), // duplicate
        createMockRef('items.*.value', 1, 3)
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['items.*.value', 'config.setting'], 
        {
          'items.*.value': [0, 1, 2, 3]
        }
      );
    });

    it('should handle multiple wildcard patterns with different indexes', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('users.*.profile', 1, 5),
        createMockRef('posts.*.title', 1, 10),
        createMockRef('users.*.profile', 1, 6),
        createMockRef('comments.*.text', 1, 15),
        createMockRef('posts.*.title', 1, 11)
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['users.*.profile', 'posts.*.title', 'comments.*.text'], 
        {
          'users.*.profile': [5, 6],
          'posts.*.title': [10, 11],
          'comments.*.text': [15]
        }
      );
    });

    it('should await asynchronous callback functions', async () => {
      let callbackResolved = false;
      const mockCallback = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        callbackResolved = true;
      });
      
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [createMockRef('test.value')];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(callbackResolved).toBe(true);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call synchronous callback functions', () => {
      const mockCallback = vi.fn().mockReturnValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [createMockRef('sync.value')];

      const result = updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(['sync.value'], {});
      expect(result).toBeUndefined();
    });

    it('should handle edge case where wildcard ref has zero index', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [
        createMockRef('array.*.item', 1, 0)
      ];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        ['array.*.item'], 
        {
          'array.*.item': [0]
        }
      );
    });
  });

  describe('when target does not have $updatedCallback property', () => {
    it('should do nothing when target is empty object', () => {
      mockTarget = {};

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      // No exceptions should be thrown and function should complete
      expect(result).toBeUndefined();
    });

    it('should do nothing when target has other properties but not $updatedCallback', () => {
      mockTarget = {
        someOtherProperty: 'value',
        anotherMethod: () => 'test'
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });

    it('should do nothing when $updatedCallback is not a function (string)', () => {
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: 'not a function'
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });

    it('should do nothing when $updatedCallback is not a function (number)', () => {
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: 123
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });

    it('should do nothing when $updatedCallback is not a function (object)', () => {
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: { notAFunction: true }
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });

    it('should do nothing when $updatedCallback is null', () => {
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: null
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });

    it('should do nothing when $updatedCallback is undefined', () => {
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: undefined
      };

      const result = updatedCallback(mockTarget, [createMockRef('test.value')], mockReceiver, mockHandler);

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle target with getter for $updatedCallback', async () => {
      let getterCallCount = 0;
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        get $updatedCallback() {
          getterCallCount++;
          return mockCallback;
        }
      };

      const refs = [createMockRef('test.value')];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(getterCallCount).toBe(1);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle prototype chain correctly', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      const parent = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };
      mockTarget = Object.create(parent);

      const refs = [createMockRef('inherited.value')];

      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle error thrown by callback function', async () => {
      const error = new Error('Callback error');
      const mockCallback = vi.fn().mockRejectedValue(error);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      const refs = [createMockRef('error.test')];

      await expect(
        updatedCallback(mockTarget, refs, mockReceiver, mockHandler)
      ).rejects.toThrow('Callback error');
    });

    it('should handle very large number of refs efficiently', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      mockTarget = {
        [UPDATED_CALLBACK_FUNC_NAME]: mockCallback
      };

      // Create 1000 refs with various patterns
      const refs: IStatePropertyRef[] = [];
      for (let i = 0; i < 1000; i++) {
        if (i % 3 === 0) {
          refs.push(createMockRef(`items.*.value`, 1, i));
        } else if (i % 3 === 1) {
          refs.push(createMockRef(`config.setting${i}`));
        } else {
          refs.push(createMockRef(`users.*.name`, 1, i));
        }
      }

      const startTime = Date.now();
      await updatedCallback(mockTarget, refs, mockReceiver, mockHandler);
      const endTime = Date.now();

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
