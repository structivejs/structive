/**
 * hasUpdatedCallback.test.ts
 * 
 * hasUpdatedCallback関数のテストスイート
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { hasUpdatedCallback } from '../../../src/StateClass/apis/hasUpdateCallback.js';
import { IStateHandler, IStateProxy } from '../../../src/StateClass/types.js';

// モックオブジェクトの作成
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

describe('hasUpdatedCallback', () => {
  let mockTarget: any;
  let mockHandler: IStateHandler;
  let mockReceiver: IStateProxy;

  beforeEach(() => {
    mockHandler = createMockHandler();
    mockReceiver = createMockReceiver();
  });

  describe('when target has $updatedCallback property', () => {
    it('should return true when $updatedCallback is a function', () => {
      mockTarget = {
        $updatedCallback: () => { /* mock function */ }
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should return true when $updatedCallback is a function (arrow function)', () => {
      mockTarget = {
        $updatedCallback: () => console.log('test')
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should return true when $updatedCallback is a named function', () => {
      mockTarget = {
        $updatedCallback: function namedFunction() { return 'test'; }
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should return false when $updatedCallback is not a function (string)', () => {
      mockTarget = {
        $updatedCallback: 'not a function'
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when $updatedCallback is not a function (number)', () => {
      mockTarget = {
        $updatedCallback: 123
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when $updatedCallback is not a function (object)', () => {
      mockTarget = {
        $updatedCallback: { notAFunction: true }
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when $updatedCallback is not a function (array)', () => {
      mockTarget = {
        $updatedCallback: [1, 2, 3]
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when $updatedCallback is null', () => {
      mockTarget = {
        $updatedCallback: null
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when $updatedCallback is undefined', () => {
      mockTarget = {
        $updatedCallback: undefined
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });
  });

  describe('when target does not have $updatedCallback property', () => {
    it('should return false when target is an empty object', () => {
      mockTarget = {};

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should return false when target has other properties but not $updatedCallback', () => {
      mockTarget = {
        someOtherProperty: 'value',
        anotherProperty: 42
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(false);
    });

    it('should throw error when target is null', () => {
      mockTarget = null;

      expect(() => {
        hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);
      }).toThrow('Reflect.get called on non-object');
    });

    it('should throw error when target is undefined', () => {
      mockTarget = undefined;

      expect(() => {
        hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);
      }).toThrow('Reflect.get called on non-object');
    });
  });

  describe('edge cases', () => {
    it('should handle target with getter for $updatedCallback', () => {
      let callCount = 0;
      mockTarget = {
        get $updatedCallback() {
          callCount++;
          return () => 'getter function';
        }
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
      expect(callCount).toBe(1); // getterが1回呼ばれることを確認
    });

    it('should handle target with setter for $updatedCallback', () => {
      let storedValue: any = () => 'test function';
      mockTarget = {
        get $updatedCallback() {
          return storedValue;
        },
        set $updatedCallback(value: any) {
          storedValue = value;
        }
      };

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should handle prototype chain correctly', () => {
      const parent = {
        $updatedCallback: () => 'parent function'
      };
      mockTarget = Object.create(parent);

      const result = hasUpdatedCallback(mockTarget, 'prop', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should work with different property keys (string prop)', () => {
      mockTarget = {
        $updatedCallback: () => 'test'
      };

      const result = hasUpdatedCallback(mockTarget, 'someProperty', mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should work with different property keys (symbol prop)', () => {
      mockTarget = {
        $updatedCallback: () => 'test'
      };

      const symbolProp = Symbol('testSymbol');
      const result = hasUpdatedCallback(mockTarget, symbolProp, mockReceiver, mockHandler);

      expect(result).toBe(true);
    });

    it('should work with different property keys (number prop)', () => {
      mockTarget = {
        $updatedCallback: () => 'test'
      };

      const result = hasUpdatedCallback(mockTarget, 123, mockReceiver, mockHandler);

      expect(result).toBe(true);
    });
  });
});