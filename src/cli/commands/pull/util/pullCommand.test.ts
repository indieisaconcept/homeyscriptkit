import fs from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import {
  NormalizedOperationResults,
  OperationAction,
} from '../../../util/handleOperationResults';
import { pullCommand } from './pullCommand';
import { writeScripts } from './writeScripts';

vi.mock('fs/promises');
vi.mock('./writeScripts');

describe('pullCommand', () => {
  const mockClient = {
    listScripts: vi.fn(),
    getScript: vi.fn(),
  } as unknown as HomeyScriptClient;

  const mockDir = '/test/dir';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully pull all scripts and return writeScripts result', async () => {
    const script1: HomeyScript = {
      id: '1',
      name: 'Script 1',
      version: '1.0.0',
      code: 'test1',
    };
    const script2: HomeyScript = {
      id: '2',
      name: 'Script 2',
      version: '1.0.0',
      code: 'test2',
    };
    const mockScripts = [script1, script2];

    const mockWriteResult: NormalizedOperationResults = {
      results: [
        {
          script: script1,
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
        {
          script: script2,
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
      ],
      summary: {
        successful: 2,
        failed: 0,
      },
    };
    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(writeScripts).mockResolvedValue(mockWriteResult);

    const result = await pullCommand({
      client: mockClient,
      dir: mockDir,
    });

    expect(result).toEqual(mockWriteResult);
    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(writeScripts).toHaveBeenCalledTimes(1);
    expect(writeScripts).toHaveBeenCalledWith({
      dir: mockDir,
      scripts: [script1, script2],
    });
  });

  it('should return empty object for empty script list', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValue([]);

    const result = await pullCommand({
      client: mockClient,
      dir: mockDir,
    });

    expect(result).toEqual({});
    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(writeScripts).not.toHaveBeenCalled();
  });

  it('should handle errors when writing script files', async () => {
    // Mock script list
    const mockScripts: HomeyScript[] = [
      { id: '1', name: 'Script 1', version: '1.0.0' },
      { id: '2', name: 'Script 2', version: '1.0.0' },
    ];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(writeScripts).mockRejectedValue(
      new Error('Failed to write files')
    );

    // Execute the command
    await expect(
      pullCommand({
        client: mockClient as unknown as HomeyScriptClient,
        dir: mockDir,
      })
    ).rejects.toThrow('Failed to write files');

    // Verify results
    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(writeScripts).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when listing scripts', async () => {
    const listScriptsError = new Error('Failed to list scripts');

    vi.mocked(mockClient.listScripts).mockRejectedValue(listScriptsError);

    // Execute the command and expect it to throw
    await expect(
      pullCommand({
        client: mockClient as unknown as HomeyScriptClient,
        dir: mockDir,
      })
    ).rejects.toThrow(
      new Error('Error pulling HomeyScripts', {
        cause: listScriptsError,
      })
    );

    // Verify mocks
    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
  });

  it('should create directory if it does not exist', async () => {
    const mockScripts: HomeyScript[] = [
      { id: '1', name: 'Script 1', version: '1.0.0' },
    ];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    await pullCommand({
      client: mockClient as unknown as HomeyScriptClient,
      dir: mockDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(mockDir, { recursive: true });
  });

  it('should handle directory creation errors', async () => {
    const mockScripts: HomeyScript[] = [
      { id: '1', name: 'Script 1', version: '1.0.0' },
    ];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    const mkdirError = new Error('Failed to create directory');
    vi.mocked(fs.mkdir).mockRejectedValue(mkdirError);

    await expect(
      pullCommand({
        client: mockClient as unknown as HomeyScriptClient,
        dir: mockDir,
      })
    ).rejects.toThrow('Error pulling HomeyScripts');

    expect(fs.mkdir).toHaveBeenCalledWith(mockDir, { recursive: true });
  });
});
