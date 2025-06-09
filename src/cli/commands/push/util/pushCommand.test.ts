import type { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../../util/client';
import { pushCommand } from './pushCommand';
import { pushScripts } from './pushScripts';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('./pushScripts');

describe('pushCommand', () => {
  const mockClient = {} as HomeyScriptClient;
  const mockScripts = ['script1.js', 'script2.js'];
  const defaultDir = 'dist';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(readdir).mockResolvedValue(
      mockScripts as unknown as Dirent<Buffer<ArrayBufferLike>>[]
    );
  });

  it('should push all scripts when no scriptName is provided', async () => {
    await pushCommand({ client: mockClient });

    expect(readdir).toHaveBeenCalledWith(defaultDir);
    expect(pushScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: mockScripts.map((file) => path.join(defaultDir, file)),
    });
  });

  it('should push specific script when scriptName is provided', async () => {
    const scriptName = 'testScript';
    await pushCommand({ client: mockClient, scriptName });

    expect(readdir).not.toHaveBeenCalled();
    expect(pushScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: [path.join(defaultDir, `${scriptName}.js`)],
    });
  });

  it('should use custom directory when provided', async () => {
    const customDir = 'custom/scripts';
    await pushCommand({ client: mockClient, dir: customDir });

    expect(readdir).toHaveBeenCalledWith(customDir);
    expect(pushScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: mockScripts.map((file) => path.join(customDir, file)),
    });
  });

  it('should use custom directory with specific script', async () => {
    const customDir = 'custom/scripts';
    const scriptName = 'testScript';
    await pushCommand({ client: mockClient, scriptName, dir: customDir });

    expect(readdir).not.toHaveBeenCalled();
    expect(pushScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: [path.join(customDir, `${scriptName}.js`)],
    });
  });

  it('should handle empty scripts directory', async () => {
    vi.mocked(readdir).mockResolvedValue([]);

    await pushCommand({ client: mockClient });

    expect(readdir).toHaveBeenCalledWith(defaultDir);
    expect(pushScripts).not.toHaveBeenCalled();
  });

  it('should handle readdir errors', async () => {
    const error = new Error('Failed to read directory');
    vi.mocked(readdir).mockRejectedValue(error);

    await expect(pushCommand({ client: mockClient })).rejects.toThrow(
      new Error('Error pushing HomeyScripts', { cause: error })
    );
    expect(pushScripts).not.toHaveBeenCalled();
  });

  it('should handle pushScripts errors', async () => {
    const error = new Error('Failed to push scripts');
    const mockResults = {
      added: 0,
      updated: 0,
      failed: 1,
      results: [
        {
          script: {
            id: 'script1.js',
            name: 'script1.js',
          },
          status: 'rejected' as const,
          reason: error,
        },
      ],
    };
    vi.mocked(pushScripts).mockResolvedValue(mockResults);

    const result = await pushCommand({ client: mockClient });

    expect(result).toEqual(mockResults);
    expect(readdir).toHaveBeenCalledWith(defaultDir);

    expect(pushScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: mockScripts.map((file) => path.join(defaultDir, file)),
    });
  });
});
