/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { getConfiguration } from './hsk';

describe('HSK Configuration Parser', () => {
  describe('getConfiguration', () => {
    it('should return null for undefined input', () => {
      expect(getConfiguration(undefined)).toBeNull();
    });

    it('should return null for null input', () => {
      expect(getConfiguration(null as any)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getConfiguration('')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(getConfiguration(123 as any)).toBeNull();
    });

    it('should parse basic HSK URL without parameters', () => {
      const config = getConfiguration('hsk://sonos/toggleSurround');

      expect(config).toEqual({
        script: 'sonos',
        command: 'toggleSurround',
        result: 'sonos.toggleSurround.Result',
        params: {},
      });
    });

    it('should parse HSK URL with parameters', () => {
      const config = getConfiguration(
        'hsk://sonos/toggleSurround?ip=192.168.1.100&volume=50'
      );

      expect(config).toEqual({
        script: 'sonos',
        command: 'toggleSurround',
        result: 'sonos.toggleSurround.Result',
        params: {
          ip: '192.168.1.100',
          volume: '50',
        },
      });
    });

    it('should parse HSK URL with custom result path', () => {
      const config = getConfiguration('hsk://lights/dim/success?brightness=75');

      expect(config).toEqual({
        script: 'lights',
        command: 'dim',
        result: 'lights.success.Result',
        params: {
          brightness: '75',
        },
      });
    });

    it('should handle URL-encoded parameters', () => {
      const config = getConfiguration(
        'hsk://test/command?name=John%20Doe&message=Hello%20World'
      );

      expect(config).toEqual({
        script: 'test',
        command: 'command',
        result: 'test.command.Result',
        params: {
          name: 'John Doe',
          message: 'Hello World',
        },
      });
    });

    it('should return null for invalid URL format', () => {
      expect(getConfiguration('invalid://url')).toBeNull();
      expect(getConfiguration('hsk://')).toBeNull();
      expect(getConfiguration('hsk://script')).toBeNull();
      expect(getConfiguration('not-a-url')).toBeNull();
    });

    it('should handle empty script or command names', () => {
      expect(getConfiguration('hsk:///command')).toBeNull();
      expect(getConfiguration('hsk://script/')).toBeNull();
    });

    it('should handle complex parameter values', () => {
      const config = getConfiguration(
        'hsk://api/call?endpoint=https://api.example.com/v1/users&token=abc123'
      );

      expect(config).toEqual({
        script: 'api',
        command: 'call',
        result: 'api.call.Result',
        params: {
          endpoint: 'https://api.example.com/v1/users',
          token: 'abc123',
        },
      });
    });
  });
});

describe('HSK URL Pattern Validation', () => {
  it('should validate correct HSK URL patterns', () => {
    const validUrls = [
      'hsk://script/command',
      'hsk://script/command?param=value',
      'hsk://script/command/result',
      'hsk://script/command/result?param=value',
      'hsk://my-script/my-command',
      'hsk://script123/command456',
    ];

    validUrls.forEach((url) => {
      expect(getConfiguration(url)).not.toBeNull();
    });
  });

  it('should reject invalid HSK URL patterns', () => {
    const invalidUrls = [
      'http://script/command',
      'hsk://script',
      'hsk:///command',
      'hsk://script/',
      'hsk://',
      'script/command',
      'hsk://script/command/',
      'hsk://script//command',
    ];

    invalidUrls.forEach((url) => {
      expect(getConfiguration(url)).toBeNull();
    });
  });
});
