import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import type { NormalizedOperationResults } from '../../util/handleOperationResults';
import { handler as pullHandler } from './index';
import { pullCommand } from './util';

vi.mock('./util');

describe('pullHandler', () => {
  const mockEvent: CommandEvent = {
    args: ['test-dir'],
  };

  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should pull all scripts when no arguments are provided', async () => {
    const eventWithoutArgs: CommandEvent = { args: [] };
    await pullHandler({ event: eventWithoutArgs, client: mockClient });

    expect(pullCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'packages',
    });
  });

  it('should pull to custom directory when provided', async () => {
    await pullHandler({ event: mockEvent, client: mockClient });

    expect(pullCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'test-dir',
    });
  });

  it('should return the result of pullCommand on success', async () => {
    const mockResult: NormalizedOperationResults = {
      results: [
        {
          script: { id: '1', name: 'script1', code: 'test1', version: '1' },
          status: 'fulfilled',
        },
        {
          script: { id: '2', name: 'script2', code: 'test2', version: '1' },
          status: 'fulfilled',
        },
      ],
      summary: {
        successful: 2,
        failed: 0,
      },
    };
    vi.mocked(pullCommand).mockResolvedValueOnce(mockResult);

    const result = await pullHandler({ event: mockEvent, client: mockClient });

    expect(result).toBe(mockResult);
    expect(pullCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'test-dir',
    });
  });

  it('should handle pull command errors', async () => {
    const originalError = new Error('Pull failed');
    vi.mocked(pullCommand).mockRejectedValueOnce(originalError);

    await expect(
      pullHandler({ event: mockEvent, client: mockClient })
    ).rejects.toThrow(originalError);

    expect(pullCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'test-dir',
    });
  });
});
