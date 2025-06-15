import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import type { NormalizedOperationResults } from '../../util/handleOperationResults';
import { handler as pushHandler } from './index';
import { pushCommand } from './util';

vi.mock('./util');

describe('pushHandler', () => {
  const mockEvent: CommandEvent = {
    args: ['test-script'],
  };

  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('supports pushing a single script', async () => {
    const mockResult: NormalizedOperationResults = {
      results: [
        {
          script: {
            id: 'test-id',
            name: 'test-script',
            code: 'test code',
            version: '1.0.0',
          },
          status: 'fulfilled',
        },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    };
    vi.mocked(pushCommand).mockResolvedValueOnce(mockResult);

    const result = await pushHandler({ event: mockEvent, client: mockClient });

    expect(pushCommand).toHaveBeenCalledWith({
      client: mockClient,
      scriptName: 'test-script',
    });
    expect(result).toEqual(mockResult);
  });

  it('supports pushing all scripts', async () => {
    const eventWithoutScript: CommandEvent = { args: [] };
    const mockResult: NormalizedOperationResults = {
      results: [
        {
          script: {
            id: 'test-id-1',
            name: 'script1',
            code: 'test code 1',
            version: '1.0.0',
          },
          status: 'fulfilled',
        },
        {
          script: {
            id: 'test-id-2',
            name: 'script2',
            code: 'test code 2',
            version: '1.0.0',
          },
          status: 'fulfilled',
        },
      ],
      summary: {
        successful: 2,
        failed: 0,
      },
    };
    vi.mocked(pushCommand).mockResolvedValueOnce(mockResult);

    const result = await pushHandler({
      event: eventWithoutScript,
      client: mockClient,
    });

    expect(pushCommand).toHaveBeenCalledWith({
      client: mockClient,
      scriptName: undefined,
      dir: undefined,
    });
    expect(result).toEqual(mockResult);
  });

  it('supports custom directory via flags', async () => {
    const eventWithCustomDir: CommandEvent = {
      args: [],
      flags: { dir: 'custom/scripts' },
    };
    const mockResult: NormalizedOperationResults = {
      results: [
        {
          script: {
            id: 'test-id',
            name: 'script1',
            code: 'test code',
            version: '1.0.0',
          },
          status: 'fulfilled',
        },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    };
    vi.mocked(pushCommand).mockResolvedValueOnce(mockResult);

    const result = await pushHandler({
      event: eventWithCustomDir,
      client: mockClient,
    });

    expect(pushCommand).toHaveBeenCalledWith({
      client: mockClient,
      scriptName: undefined,
      dir: 'custom/scripts',
    });
    expect(result).toEqual(mockResult);
  });

  it('should handle push command errors', async () => {
    const error = new Error('Push failed');
    vi.mocked(pushCommand).mockRejectedValueOnce(error);

    await expect(
      pushHandler({ event: mockEvent, client: mockClient })
    ).rejects.toThrow('Push failed');
    expect(pushCommand).toHaveBeenCalledWith({
      client: mockClient,
      scriptName: 'test-script',
    });
  });

  it('should handle non-Error objects in error cases', async () => {
    const nonError = { message: 'Custom error' };
    vi.mocked(pushCommand).mockRejectedValueOnce(nonError);

    await expect(
      pushHandler({ event: mockEvent, client: mockClient })
    ).rejects.toEqual(nonError);
  });
});
