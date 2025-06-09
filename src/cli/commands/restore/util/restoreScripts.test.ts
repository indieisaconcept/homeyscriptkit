import fs from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../../util/client';
import {
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { restoreScripts } from './restoreScripts';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('../../../util/handleOperationResults');

describe('restoreScripts', () => {
  const mockClient = {
    createScript: vi.fn(),
  } as unknown as HomeyScriptClient;

  const mockScript = {
    id: 'test-script',
    name: 'Test Script',
    code: 'console.log("test");',
    version: '1.0.0',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully restore a single script', async () => {
    const mockScriptContent = JSON.stringify(mockScript);
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(mockClient.createScript).mockResolvedValue(mockScript);

    await restoreScripts({
      client: mockClient,
      scripts: ['test-script.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup/test-script.json',
      'utf-8'
    );
    expect(mockClient.createScript).toHaveBeenCalledWith(mockScript);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should successfully restore multiple scripts', async () => {
    const mockScript1 = { ...mockScript, id: 'script1' };
    const mockScript2 = { ...mockScript, id: 'script2' };

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(JSON.stringify(mockScript1))
      .mockResolvedValueOnce(JSON.stringify(mockScript2));
    vi.mocked(mockClient.createScript)
      .mockResolvedValueOnce(mockScript1)
      .mockResolvedValueOnce(mockScript2);

    await restoreScripts({
      client: mockClient,
      scripts: ['script1.json', 'script2.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(mockClient.createScript).toHaveBeenCalledTimes(2);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScript1,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
        {
          script: mockScript2,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should handle file read errors', async () => {
    const error = new Error('File not found');
    vi.mocked(fs.readFile).mockRejectedValue(error);

    await restoreScripts({
      client: mockClient,
      scripts: ['missing-script.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup/missing-script.json',
      'utf-8'
    );
    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: { id: 'missing-script.json', name: 'missing-script' },
          status: 'rejected',
          reason: 'File not found',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should handle invalid JSON content', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('invalid json');

    await restoreScripts({
      client: mockClient,
      scripts: ['invalid-script.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup/invalid-script.json',
      'utf-8'
    );
    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: { id: 'invalid-script.json', name: 'invalid-script' },
          status: 'rejected',
          reason: expect.stringContaining('Unexpected token'),
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should handle script creation errors', async () => {
    const mockScriptContent = JSON.stringify(mockScript);
    const error = new Error('Failed to create script');
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(mockClient.createScript).mockRejectedValue(error);

    await restoreScripts({
      client: mockClient,
      scripts: ['test-script.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup/test-script.json',
      'utf-8'
    );
    expect(mockClient.createScript).toHaveBeenCalledWith(mockScript);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: { id: 'test-script.json', name: 'test-script' },
          status: 'rejected',
          reason: 'Failed to create script',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should handle empty scripts array', async () => {
    await restoreScripts({
      client: mockClient,
      scripts: [],
      dir: 'backup',
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [],
    });
  });

  it('should handle special characters in file paths', async () => {
    const mockScriptContent = JSON.stringify(mockScript);
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(mockClient.createScript).mockResolvedValue(mockScript);

    await restoreScripts({
      client: mockClient,
      scripts: ['test script with spaces.json'],
      dir: 'backup',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup/test script with spaces.json',
      'utf-8'
    );
    expect(mockClient.createScript).toHaveBeenCalledWith(mockScript);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should handle special characters in directory path', async () => {
    const mockScriptContent = JSON.stringify(mockScript);
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(mockClient.createScript).mockResolvedValue(mockScript);

    await restoreScripts({
      client: mockClient,
      scripts: ['test-script.json'],
      dir: 'backup with spaces',
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      'backup with spaces/test-script.json',
      'utf-8'
    );
    expect(mockClient.createScript).toHaveBeenCalledWith(mockScript);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
    });
  });

  it('should return normalized operation results', async () => {
    const mockScriptContent = JSON.stringify(mockScript);
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(mockClient.createScript).mockResolvedValue(mockScript);
    vi.mocked(handleOperationResults).mockReturnValue({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    });

    const result = await restoreScripts({
      client: mockClient,
      scripts: ['test-script.json'],
      dir: 'backup',
    });

    expect(result).toEqual({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.RESTORE,
        },
      ],
      summary: {
        successful: 1,
        failed: 0,
      },
    });
  });
});
