import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import {
  NormalizedOperationResults,
  OperationAction,
  OperationResult,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { deleteScripts } from './deleteScripts';

vi.mock('../../../util/handleOperationResults');

describe('deleteScripts', () => {
  const mockClient = {
    listScripts: vi.fn(),
    deleteScript: vi.fn(),
  } as unknown as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should not delete scripts when no scripts exist', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValue([]);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).not.toHaveBeenCalled();
    expect(handleOperationResults).not.toHaveBeenCalled();
  });

  it('should successfully delete all scripts', async () => {
    const mockScripts = [
      { id: 'script1', name: 'Script 1' },
      { id: 'script2', name: 'Script 2' },
      { id: 'script3', name: 'Script 3' },
    ] as HomeyScript[];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript).mockResolvedValue(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(3);
    expect(mockClient.deleteScript).toHaveBeenCalledWith('script1');
    expect(mockClient.deleteScript).toHaveBeenCalledWith('script2');
    expect(mockClient.deleteScript).toHaveBeenCalledWith('script3');
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[2],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
      ],
    });
  });

  it('should handle failures during deletion', async () => {
    const mockScripts = [
      { id: 'script1', name: 'Script 1' },
      { id: 'script2', name: 'Script 2' },
      { id: 'script3', name: 'Script 3' },
    ] as HomeyScript[];

    const error1 = new Error('Failed to delete script1');
    const error2 = new Error('Failed to delete script2');
    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript)
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2)
      .mockResolvedValueOnce(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(3);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'rejected',
          reason: error1,
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'rejected',
          reason: error2,
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[2],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
      ] as OperationResult[],
    });
  });

  it('should handle error when listing scripts', async () => {
    const error = new Error('Network error');
    vi.mocked(mockClient.listScripts).mockRejectedValue(error);

    await expect(deleteScripts(mockClient)).rejects.toThrow('Network error');
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).not.toHaveBeenCalled();
    expect(handleOperationResults).not.toHaveBeenCalled();
  });

  it('should handle scripts with special characters in ID', async () => {
    const mockScripts = [
      { id: 'script@1', name: 'Script 1' },
      { id: 'script#2', name: 'Script 2' },
    ] as HomeyScript[];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript).mockResolvedValue(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(2);
    expect(mockClient.deleteScript).toHaveBeenCalledWith('script@1');
    expect(mockClient.deleteScript).toHaveBeenCalledWith('script#2');
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
      ],
    });
  });

  it('should handle scripts with missing ID', async () => {
    const mockScripts = [
      { id: '', name: 'Script 1' },
      { id: 'script2', name: 'Script 2' },
    ] as HomeyScript[];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript)
      .mockRejectedValueOnce(new Error('ID is required'))
      .mockResolvedValueOnce(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(2);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'rejected',
          reason: new Error('ID is required'),
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
      ],
    });
  });

  it('should handle a large number of scripts', async () => {
    const mockScripts = Array.from({ length: 100 }, (_, i) => ({
      id: `script${i}`,
      name: `Script ${i}`,
    })) as HomeyScript[];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript).mockResolvedValue(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(100);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: mockScripts.map((script) => ({
        script,
        status: 'fulfilled',
        action: OperationAction.DELETE,
      })),
    });
  });

  it('should validate script objects before deletion', async () => {
    const mockScripts = [
      { id: 'script1', name: 'Script 1' },
      { id: null, name: 'Invalid Script' },
      { id: 'script3', name: 'Script 3' },
    ] as unknown as HomeyScript[];

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Invalid script ID'))
      .mockResolvedValueOnce(undefined);

    await deleteScripts(mockClient);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(mockClient.deleteScript).toHaveBeenCalledTimes(3);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'rejected',
          reason: new Error('Invalid script ID'),
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[2],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
      ] as OperationResult[],
    });
  });

  it('should return normalized operation results', async () => {
    const mockScripts = [
      { id: 'script1', name: 'Script 1' },
      { id: 'script2', name: 'Script 2' },
    ] as HomeyScript[];

    const mockResults: NormalizedOperationResults = {
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'rejected',
          reason: new Error('Failed to delete'),
          action: OperationAction.DELETE,
        },
      ] as OperationResult[],
      summary: {
        successful: 1,
        failed: 1,
      },
    };

    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);
    vi.mocked(mockClient.deleteScript)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Failed to delete'));
    vi.mocked(handleOperationResults).mockReturnValue(mockResults);

    const result = await deleteScripts(mockClient);

    expect(result).toEqual(mockResults);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScripts[0],
          status: 'fulfilled',
          action: OperationAction.DELETE,
        },
        {
          script: mockScripts[1],
          status: 'rejected',
          reason: new Error('Failed to delete'),
          action: OperationAction.DELETE,
        },
      ] as OperationResult[],
    });
  });
});
