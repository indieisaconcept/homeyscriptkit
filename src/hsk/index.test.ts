/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import hsk from '.';

describe('HSK Command Execution', () => {
  // Mock the global args and tag function
  const mockTag = vi.fn();
  const mockArgs = ['hsk://test/command?param=value'];
  const originalArgs = (global as any).args;
  const originalTag = (global as any).tag;

  beforeEach(() => {
    (global as any).args = mockArgs;
    (global as any).tag = mockTag;
    vi.resetAllMocks();
  });

  afterEach(() => {
    (global as any).args = originalArgs;
    (global as any).tag = originalTag;
  });

  it('should execute command with correct configuration', async () => {
    const mockFn = vi.fn().mockResolvedValue({ success: true });

    await hsk(mockFn);

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        script: 'test',
        command: 'command',
        result: 'test.command.Result',
        params: { param: 'value' },
      }),
      expect.objectContaining({
        filename: 'test',
        scriptId: 'test.command',
      })
    );
  });

  it('should handle command execution errors', async () => {
    const error = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(hsk(mockFn)).rejects.toThrow('Test error');
    expect(mockTag).toHaveBeenCalledWith(
      'script.error.Result',
      'Error: Test error'
    );
  });

  it('should handle invalid configuration', async () => {
    (global as any).args = ['invalid-url'];
    const mockFn = vi.fn();

    await expect(hsk(mockFn)).rejects.toThrow(
      'Invalid configuration: missing or invalid script/command'
    );
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should handle typed parameters correctly', async () => {
    interface TestParams extends Record<string, string> {
      param: string;
    }
    const mockFn = vi.fn().mockResolvedValue({ success: true });

    await hsk<'command', TestParams>(mockFn);

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { param: 'value' },
      }),
      expect.any(Object)
    );
  });

  it('should handle custom result paths', async () => {
    (global as any).args = ['hsk://test/command/custom?param=value'];
    const mockFn = vi.fn().mockResolvedValue({ success: true });

    await hsk(mockFn);

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'test.custom.Result',
      }),
      expect.any(Object)
    );
  });
});
