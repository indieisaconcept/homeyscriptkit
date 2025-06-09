import fs from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScript } from '../../../types';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { backupScripts } from './backupScripts';

vi.mock('fs/promises');
vi.mock('../../../util/handleOperationResults');

describe('backupScripts', () => {
  const mockScripts: HomeyScript[] = [
    { id: '1', name: 'script1', code: 'test1', version: '1' },
    { id: '2', name: 'script2', code: 'test2', version: '1' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully backup multiple scripts', async () => {
    const backupDir = '/backup/dir';

    await backupScripts({
      scripts: mockScripts,
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledTimes(2);

    expect(fs.writeFile).toHaveBeenCalledWith(
      '/backup/dir/script1.json',
      JSON.stringify(mockScripts[0], null, 2)
    );

    expect(fs.writeFile).toHaveBeenCalledWith(
      '/backup/dir/script2.json',
      JSON.stringify(mockScripts[1], null, 2)
    );

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.BACKUP,
        },
        {
          script: mockScripts[1],
          status: 'fulfilled',
          action: OperationAction.BACKUP,
        },
      ],
    });
  });

  it('should handle mixed errors', async () => {
    const backupDir = '/backup/dir';
    const fsError = new Error('File system error');

    vi.mocked(fs.writeFile)
      .mockRejectedValueOnce(fsError)
      .mockResolvedValueOnce(undefined);

    await backupScripts({
      scripts: mockScripts,
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'rejected',
          reason: fsError,
          action: OperationAction.BACKUP,
        },
        {
          script: mockScripts[1],
          status: 'fulfilled',
          action: OperationAction.BACKUP,
        },
      ],
    });
  });

  it('should handle empty script IDs array', async () => {
    const backupDir = '/backup/dir';
    await backupScripts({
      scripts: [],
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should handle directory not existing', async () => {
    const backupDir = '/nonexistent/dir';
    const fsError = new Error('ENOENT: no such file or directory');
    const script: HomeyScript = {
      id: '1',
      name: 'script1',
      code: 'test1',
      version: '1',
    };

    vi.mocked(fs.writeFile).mockRejectedValueOnce(fsError);

    await backupScripts({
      scripts: [script],
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script,
          status: 'rejected',
          reason: fsError,
          action: OperationAction.BACKUP,
        },
      ],
    });
  });

  it('should handle invalid script names', async () => {
    const backupDir = '/backup/dir';
    const scriptWithInvalidName: HomeyScript = {
      id: '3',
      name: 'script/with/slashes',
      code: 'test3',
      version: '1',
    };
    const fsError = new Error('EINVAL: invalid argument');

    vi.mocked(fs.writeFile).mockRejectedValueOnce(fsError);

    await backupScripts({
      scripts: [scriptWithInvalidName],
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: scriptWithInvalidName,
          status: 'rejected',
          reason: fsError,
          action: OperationAction.BACKUP,
        },
      ],
    });
  });

  it('should handle permission errors', async () => {
    const backupDir = '/protected/dir';
    const fsError = new Error('EACCES: permission denied');
    const script: HomeyScript = {
      id: '1',
      name: 'script1',
      code: 'test1',
      version: '1',
    };

    vi.mocked(fs.writeFile).mockRejectedValueOnce(fsError);

    await backupScripts({
      scripts: [script],
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script,
          status: 'rejected',
          reason: fsError,
          action: OperationAction.BACKUP,
        },
      ],
    });
  });

  it('should return normalized operation results', async () => {
    const backupDir = '/backup/dir';
    const script1: HomeyScript = {
      id: '1',
      name: 'script1',
      code: 'test1',
      version: '1',
    };
    const script2: HomeyScript = {
      id: '2',
      name: 'script2',
      code: 'test2',
      version: '1',
    };
    const mockResults: NormalizedOperationResults = {
      results: [
        {
          script: script1,
          status: 'fulfilled' as const,
          action: OperationAction.BACKUP,
        },
        {
          script: script2,
          status: 'fulfilled' as const,
          action: OperationAction.BACKUP,
        },
      ],
      summary: {
        successful: 2,
        failed: 0,
      },
    };

    vi.mocked(handleOperationResults).mockResolvedValueOnce(mockResults);

    const result = await backupScripts({
      scripts: [script1, script2],
      dir: backupDir,
    });

    expect(fs.mkdir).toHaveBeenCalledWith(backupDir, { recursive: true });
    expect(result).toEqual(mockResults);
    expect(result.summary).toBeDefined();
    expect(result.summary?.successful).toBe(2);
    expect(result.summary?.failed).toBe(0);
  });
});
