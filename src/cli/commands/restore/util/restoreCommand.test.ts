import { Dirent } from 'fs';
import fs from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../../util/client';
import { NormalizedOperationResults } from '../../../util/handleOperationResults';
import { deleteScripts } from './deleteScripts';
import { restoreCommand } from './restoreCommand';
import { restoreScripts } from './restoreScripts';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('./deleteScripts');
vi.mock('./restoreScripts');

describe('restoreCommand', () => {
  const mockClient = {} as HomeyScriptClient;
  const mockDir = 'backup';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should throw error if backup directory does not exist', async () => {
    const error = new Error('Directory not found');
    vi.mocked(fs.access).mockRejectedValue(error);

    await expect(
      restoreCommand({
        client: mockClient,
        dir: mockDir,
      })
    ).rejects.toThrow(
      new Error('Failed to restore script(s)', {
        cause: new Error(`Backup directory 'backup': ${error.message}`),
      })
    );

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).not.toHaveBeenCalled();
    expect(restoreScripts).not.toHaveBeenCalled();
  });

  it('should restore all scripts when no script name is provided', async () => {
    const mockScripts = ['script1.json', 'script2.json'];
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue(
      mockScripts as unknown as Dirent<Buffer<ArrayBufferLike>>[]
    );

    await restoreCommand({
      client: mockClient,
      dir: mockDir,
    });

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).toHaveBeenCalledWith(mockClient);
    expect(restoreScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: mockScripts,
      dir: mockDir,
    });
  });

  it('should restore specific script when script name is provided', async () => {
    const scriptName = 'specific-script.json';
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await restoreCommand({
      client: mockClient,
      dir: mockDir,
      scriptName,
    });

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).not.toHaveBeenCalled();
    expect(deleteScripts).not.toHaveBeenCalled();
    expect(restoreScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: [scriptName],
      dir: mockDir,
    });
  });

  it('should return early if no scripts are found', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([]);

    await restoreCommand({
      client: mockClient,
      dir: mockDir,
    });

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).not.toHaveBeenCalled();
    expect(restoreScripts).not.toHaveBeenCalled();
  });

  it('should handle errors during restore operation', async () => {
    const error = new Error('Restore failed');
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockRejectedValue(error);

    await expect(
      restoreCommand({
        client: mockClient,
        dir: mockDir,
      })
    ).rejects.toThrow(
      new Error('Failed to restore script(s)', { cause: error })
    );

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).not.toHaveBeenCalled();
    expect(restoreScripts).not.toHaveBeenCalled();
  });

  it('should handle errors during deleteScripts operation', async () => {
    const error = new Error('Delete failed');
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([
      'script1.json',
    ] as unknown as Dirent<Buffer<ArrayBufferLike>>[]);
    vi.mocked(deleteScripts).mockRejectedValue(error);

    await expect(
      restoreCommand({
        client: mockClient,
        dir: mockDir,
      })
    ).rejects.toThrow(
      new Error('Failed to restore script(s)', { cause: error })
    );

    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).toHaveBeenCalledWith(mockClient);
    expect(restoreScripts).not.toHaveBeenCalled();
  });

  it('should return the result from restoreScripts', async () => {
    const mockResult: NormalizedOperationResults = {
      results: [
        {
          script: { id: '1', name: 'script1', code: 'test', version: '1.0.0' },
          status: 'fulfilled',
        },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    };
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([
      'script1.json',
    ] as unknown as Dirent<Buffer<ArrayBufferLike>>[]);

    vi.mocked(restoreScripts).mockResolvedValue(mockResult);

    const result = await restoreCommand({
      client: mockClient,
      dir: mockDir,
    });

    expect(result).toBe(mockResult);
    expect(fs.access).toHaveBeenCalledWith(mockDir);
    expect(fs.readdir).toHaveBeenCalledWith(mockDir);
    expect(deleteScripts).toHaveBeenCalledWith(mockClient);
    expect(restoreScripts).toHaveBeenCalledWith({
      client: mockClient,
      scripts: ['script1.json'],
      dir: mockDir,
    });
  });
});
