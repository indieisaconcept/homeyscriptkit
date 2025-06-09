import { describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../../util/client';
import { listCommand } from './listCommand';

vi.mock('./formatScriptsTable');

describe('listCommand', () => {
  it('should handle empty script list', async () => {
    const mockClient = {
      listScripts: vi.fn().mockResolvedValue([]),
    } as unknown as HomeyScriptClient;

    const result = await listCommand(mockClient);
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('should handle successful script list', async () => {
    const mockScripts = [
      {
        id: '1',
        name: 'script1',
        version: '1.0.0',
        code: 'console.log("script1")',
        lastExecuted: '2024-03-20T12:00:00Z',
      },
      {
        id: '2',
        name: 'script2',
        version: '1.0.0',
        code: 'console.log("script2")',
        lastExecuted: '2024-03-20T12:00:00Z',
      },
    ];

    const mockClient = {
      listScripts: vi.fn().mockResolvedValue(mockScripts),
    } as unknown as HomeyScriptClient;

    const result = await listCommand(mockClient);
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockScripts);
  });

  it('should handle single script in list', async () => {
    const mockScript = {
      id: '1',
      name: 'single-script',
      version: '2.0.0',
      code: 'console.log("test")',
      lastExecuted: '2024-03-20T12:00:00Z',
    };

    const mockClient = {
      listScripts: vi.fn().mockResolvedValue([mockScript]),
    } as unknown as HomeyScriptClient;

    const result = await listCommand(mockClient);
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockScript]);
  });

  it('should handle scripts with optional properties', async () => {
    const mockScripts = [
      {
        id: '1',
        name: 'script1',
        version: '1.0.0',
        code: 'console.log("first")',
      },
      {
        id: '2',
        name: 'script2',
        version: '2.0.0',
        lastExecuted: '2024-03-20T12:00:00Z',
      },
    ];

    const mockClient = {
      listScripts: vi.fn().mockResolvedValue(mockScripts),
    } as unknown as HomeyScriptClient;

    const result = await listCommand(mockClient);
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockScripts);
  });

  it('should throw error when listScripts fails', async () => {
    const listScriptsError = new Error('API Error');

    const mockError = new Error('Failed to fetch HomeyScripts', {
      cause: listScriptsError,
    });

    const mockClient = {
      listScripts: vi.fn().mockRejectedValue(listScriptsError),
    } as unknown as HomeyScriptClient;

    await expect(listCommand(mockClient)).rejects.toThrow(mockError);

    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
  });
});
