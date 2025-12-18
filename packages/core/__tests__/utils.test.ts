import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { raiseError } from '../src/utils.js';
import { config } from '../src/WebComponents/getGlobalConfig';

describe('utils', () => {
  describe('raiseError', () => {
    const originalDebug = config.debug;
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    beforeEach(() => {
      config.debug = false;
      vi.clearAllMocks();
    });
  
    afterEach(() => {
      config.debug = originalDebug;
    });

    it('should throw an Error with the provided message', () => {
      const message = 'Test error message';
      
      expect(() => raiseError(message)).toThrow(Error);
      expect(() => raiseError(message)).toThrow(message);
    });

    it('should never return a value', () => {
      expect(() => {
        const result = raiseError('Test');
        // この行は実行されないはず
        expect(result).toBeUndefined();
      }).toThrow();
    });

    it('should throw with empty message', () => {
      expect(() => raiseError('')).toThrow('');
    });

    it('should attach structured fields when payload provided', () => {
      const payload = {
        code: 'TEST-001',
        message: 'Payload error',
        context: { foo: 'bar' },
        hint: 'Check config',
        docsUrl: 'https://example.com',
        severity: 'warn' as const,
        cause: new Error('root'),
      };

      try {
        raiseError(payload);
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Payload error');
        expect(err.code).toBe('TEST-001');
        expect(err.context).toEqual({ foo: 'bar' });
        expect(err.hint).toBe('Check config');
        expect(err.docsUrl).toBe('https://example.com');
        expect(err.severity).toBe('warn');
        expect(err.cause).toBeInstanceOf(Error);
      }
    });

    it('should not log to console when debug is false', () => {
      const payload = {
        code: 'TEST-002',
        message: 'Debug false error'
      };

      expect(() => raiseError(payload)).toThrow('Debug false error');
      expect(consoleGroupSpy).not.toHaveBeenCalled();
    });

    it('should log to console when debug is true', () => {
      config.debug = true;
      const payload = {
        code: 'TEST-003',
        message: 'Debug true error',
        context: { foo: 'bar' },
        hint: 'Try this',
        docsUrl: 'http://docs',
        cause: 'Reason'
      };

      expect(() => raiseError(payload)).toThrow('Debug true error');
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('[Structive Error] TEST-003: Debug true error');
      expect(consoleLogSpy).toHaveBeenCalledWith('Context:', { foo: 'bar' });
      expect(consoleLogSpy).toHaveBeenCalledWith('Hint:', 'Try this');
      expect(consoleLogSpy).toHaveBeenCalledWith('Docs:', 'http://docs');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cause:', 'Reason');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should skip optional fields when payload omits them', () => {
      const payload = {
        code: 'TEST-002',
        message: 'Minimal payload',
      };

      try {
        raiseError(payload);
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('TEST-002');
        expect('context' in err).toBe(false);
        expect('hint' in err).toBe(false);
        expect('docsUrl' in err).toBe(false);
        expect('severity' in err).toBe(false);
        expect('cause' in err).toBe(false);
      }
    });
  });
});