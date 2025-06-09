import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import { NormalizedOperationResults } from '../../../util/handleOperationResults';
import { backupCommand } from './backupCommand';
import { backupScripts } from './backupScripts';

vi.mock('./backupScripts', () => ({
  backupScripts: vi.fn(),
}));

describe('backupCommand', () => {
  const mockScripts: HomeyScript[] = [
    {
      id: 'script1',
      name: 'Script 1',
      version: '1',
      code: 'console.log("test1")',
      lastExecuted: new Date().toISOString(),
    },
    {
      id: 'script2',
      name: 'Script 2',
      version: '1',
      code: 'console.log("test2")',
      lastExecuted: new Date().toISOString(),
    },
  ];

  const mockClient = {
    listScripts: vi.fn(),
    getScript: vi.fn(),
  } as unknown as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create backup directory and backup a single script when scriptId is provided', async () => {
    const scriptId = 'test-script-id';
    const dir = 'custom-backup';

    vi.mocked(mockClient.getScript).mockResolvedValue(
      mockScripts[0] as HomeyScript
    );

    await backupCommand({ client: mockClient, dir, scriptId });

    expect(backupScripts).toHaveBeenCalledWith({
      scripts: [mockScripts[0]],
      dir,
    });
    expect(mockClient.listScripts).not.toHaveBeenCalled();
  });

  it('should create backup directory and backup all scripts when no scriptId is provided', async () => {
    const dir = 'backup';

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);

    await backupCommand({ client: mockClient, dir });

    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(backupScripts).toHaveBeenCalledWith({
      scripts: mockScripts,
      dir,
    });
  });

  it('should handle empty script list', async () => {
    const dir = 'backup';
    vi.mocked(mockClient.listScripts).mockResolvedValueOnce([]);

    await backupCommand({ client: mockClient, dir });

    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(backupScripts).not.toHaveBeenCalled();
  });

  it('should use default backup directory when not specified', async () => {
    const mockScripts: HomeyScript[] = [
      {
        id: 'script1',
        name: 'Script 1',
        version: '1',
        code: 'console.log("test1")',
        lastExecuted: new Date().toISOString(),
      },
    ];
    vi.mocked(mockClient.listScripts).mockResolvedValueOnce(mockScripts);

    await backupCommand({ client: mockClient });

    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(backupScripts).toHaveBeenCalledWith({
      scripts: mockScripts,
      dir: 'backup',
    });
  });

  it('should handle errors during backup', async () => {
    const error = new Error('Backup failed');
    vi.mocked(mockClient.listScripts).mockRejectedValueOnce(error);

    await expect(backupCommand({ client: mockClient })).rejects.toThrow(
      'Error backing up HomeyScripts'
    );

    expect(mockClient.listScripts).toHaveBeenCalledWith({ resolve: true });
    expect(backupScripts).not.toHaveBeenCalled();
  });

  it('should handle getScript failure when backing up single script', async () => {
    const error = new Error('Failed to get script');
    vi.mocked(mockClient.getScript).mockRejectedValueOnce(error);

    await expect(
      backupCommand({ client: mockClient, scriptId: 'test-script' })
    ).rejects.toThrow('Error backing up HomeyScripts');

    expect(mockClient.getScript).toHaveBeenCalledWith('test-script');
    expect(backupScripts).not.toHaveBeenCalled();
  });

  it('should return backup results for single script', async () => {
    const mockResult: NormalizedOperationResults = {
      results: [
        { script: mockScripts[0] as HomeyScript, status: 'fulfilled' as const },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    };

    vi.mocked(mockClient.getScript).mockResolvedValue(
      mockScripts[0] as HomeyScript
    );

    vi.mocked(backupScripts).mockResolvedValueOnce(mockResult);

    const result = await backupCommand({
      client: mockClient,
      scriptId: 'script1',
    });

    expect(result).toEqual(mockResult);
    expect(backupScripts).toHaveBeenCalledWith({
      scripts: [mockScripts[0]],
      dir: 'backup',
    });
  });

  it('should return backup results for multiple scripts', async () => {
    const mockResult: NormalizedOperationResults = {
      results: [
        { script: mockScripts[0] as HomeyScript, status: 'fulfilled' as const },
        { script: mockScripts[1] as HomeyScript, status: 'fulfilled' as const },
      ],
      summary: {
        successful: 2,
        failed: 0,
      },
    };
    vi.mocked(backupScripts).mockResolvedValueOnce(mockResult);
    vi.mocked(mockClient.listScripts).mockResolvedValueOnce(mockScripts);

    const result = await backupCommand({ client: mockClient });

    expect(result).toEqual(mockResult);
    expect(backupScripts).toHaveBeenCalledWith({
      scripts: mockScripts,
      dir: 'backup',
    });
  });

  it('should return empty object for empty script list', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValueOnce([]);

    const result = await backupCommand({ client: mockClient });

    expect(result).toEqual({});
  });
});
