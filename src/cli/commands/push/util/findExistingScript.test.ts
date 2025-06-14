import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import { findExistingScript } from './findExistingScript';

describe('findExistingScript', () => {
  const mockScripts: HomeyScript[] = [
    {
      id: '1',
      name: 'test-script',
      version: '1.0.0',
    },
    {
      id: '2',
      name: 'another-script',
      version: '1.0.0',
    },
  ];

  const mockClient = {
    listScripts: vi.fn(),
  } as unknown as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should find an existing script by name', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);

    const result = await findExistingScript({
      client: mockClient,
      scriptName: 'test-script',
    });

    expect(result).toEqual(mockScripts[0]);
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
  });

  it('should return undefined when script is not found', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValue(mockScripts);

    const result = await findExistingScript({
      client: mockClient,
      scriptName: 'non-existent-script',
    });

    expect(result).toBeUndefined();
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
  });

  it('should handle empty scripts list', async () => {
    vi.mocked(mockClient.listScripts).mockResolvedValue([]);

    const result = await findExistingScript({
      client: mockClient,
      scriptName: 'test-script',
    });

    expect(result).toBeUndefined();
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
  });

  it('should handle client errors', async () => {
    const error = new Error('Failed to fetch scripts');
    vi.mocked(mockClient.listScripts).mockRejectedValue(error);

    await expect(
      findExistingScript({
        client: mockClient,
        scriptName: 'test-script',
      })
    ).rejects.toThrow('Failed to fetch scripts');
    expect(mockClient.listScripts).toHaveBeenCalledTimes(1);
  });
});
