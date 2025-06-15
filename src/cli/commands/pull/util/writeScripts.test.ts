import fs from 'fs/promises';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HomeyScript } from '../../../types';
import {
  type NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { writeScripts } from './writeScripts';

// Mock fs/promises and handleOperationResults
vi.mock('fs/promises');
vi.mock('../../../util/handleOperationResults');

describe('writeScripts', () => {
  const mockDir = '/test/dir';
  const mockScript: HomeyScript = {
    id: 'test-id',
    name: 'testScript',
    code: 'console.log("test");',
    version: '1.0.0',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should write script files successfully', async () => {
    const mockResults: NormalizedOperationResults = {
      results: [
        {
          script: mockScript,
          status: 'fulfilled' as const,
          action: OperationAction.PULL,
        },
      ],
      summary: { successful: 1, failed: 0 },
    };
    vi.mocked(handleOperationResults).mockReturnValue(mockResults);

    const result = await writeScripts({ dir: mockDir, scripts: [mockScript] });

    // Verify directory creation and file writing
    const expectedDir = path.join(mockDir, mockScript.name);
    const expectedPath = path.join(expectedDir, 'index.js');
    expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(expectedPath, mockScript.code);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockScript,
          status: 'fulfilled',
          action: OperationAction.PULL,
        },
      ],
    });
    expect(result).toEqual(mockResults);
  });

  it('should handle empty script code', async () => {
    const emptyScript: HomeyScript = {
      id: 'empty-id',
      name: 'emptyScript',
      code: '',
      version: '1.0.0',
    };

    await writeScripts({ dir: mockDir, scripts: [emptyScript] });

    const expectedDir = path.join(mockDir, emptyScript.name);
    const expectedPath = path.join(expectedDir, 'index.js');
    expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(expectedPath, '');
  });

  it('should handle script with no name', async () => {
    const noNameScript: HomeyScript = {
      id: 'no-name-id',
      name: '',
      code: 'console.log("test");',
      version: '1.0.0',
    };

    await writeScripts({ dir: mockDir, scripts: [noNameScript] });

    const expectedDir = path.join(mockDir, '');
    const expectedPath = path.join(expectedDir, 'index.js');
    expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(expectedPath, noNameScript.code);
  });

  it('should handle script with no code', async () => {
    const noCodeScript: HomeyScript = {
      id: 'no-code-id',
      name: 'noCodeScript',
      code: null as unknown as string,
      version: '1.0.0',
    };

    await writeScripts({ dir: mockDir, scripts: [noCodeScript] });

    const expectedDir = path.join(mockDir, noCodeScript.name);
    const expectedPath = path.join(expectedDir, 'index.js');
    expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(expectedPath, '');
  });

  it('should handle multiple scripts with some failures', async () => {
    const error = new Error('File system error');
    (fs.writeFile as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(error);

    const scripts: HomeyScript[] = [
      mockScript,
      {
        id: 'test-id-2',
        name: 'testScript2',
        code: 'console.log("test2");',
        version: '1.0.0',
      },
    ];

    await writeScripts({ dir: mockDir, scripts });

    expect(fs.mkdir).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: scripts[0],
          status: 'fulfilled',
          action: OperationAction.PULL,
        },
        {
          script: scripts[1],
          status: 'rejected',
          reason: error,
          action: OperationAction.PULL,
        },
      ],
    });
  });

  it('should handle all scripts failing', async () => {
    const error = new Error('File system error');
    (fs.writeFile as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);

    const scripts: HomeyScript[] = [
      mockScript,
      {
        id: 'test-id-2',
        name: 'testScript2',
        code: 'console.log("test2");',
        version: '1.0.0',
      },
    ];

    await writeScripts({ dir: mockDir, scripts });

    expect(fs.mkdir).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: scripts[0],
          status: 'rejected',
          reason: error,
          action: OperationAction.PULL,
        },
        {
          script: scripts[1],
          status: 'rejected',
          reason: error,
          action: OperationAction.PULL,
        },
      ],
    });
  });
});
