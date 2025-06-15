import fs from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { findExistingScript } from './findExistingScript';
import { pushScripts } from './pushScripts';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('./findExistingScript');
vi.mock('../../../util/handleOperationResults');

describe('pushScripts', () => {
  const mockClient = {
    createScript: vi.fn(),
    updateScript: vi.fn(),
  } as unknown as HomeyScriptClient;

  const mockScriptContent = 'console.log("test");';
  const mockScripts = ['homeyscript.test1.min.js', 'homeyscript.test2.min.js'];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.readFile).mockResolvedValue(mockScriptContent);
    vi.mocked(handleOperationResults).mockReturnValue(
      {} as NormalizedOperationResults
    );
  });

  it('should create new scripts when they do not exist', async () => {
    const scriptName = 'test1';
    const mockCreatedScript: HomeyScript = {
      id: 'new-id',
      name: scriptName,
      version: '1.0.0',
      code: mockScriptContent,
    };

    vi.mocked(findExistingScript).mockResolvedValue(undefined);
    vi.mocked(mockClient.createScript).mockResolvedValue(mockCreatedScript);

    await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockCreatedScript,
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
      ],
    });

    expect(mockClient.createScript).toHaveBeenCalledWith({
      name: scriptName,
      code: mockScriptContent,
    });

    expect(mockClient.updateScript).not.toHaveBeenCalled();
  });

  it('should update existing scripts', async () => {
    const scriptName = 'test1';
    const existingScript: HomeyScript = {
      id: 'existing-id',
      name: scriptName,
      version: '1.0.0',
      code: mockScriptContent,
    };

    const mockUpdatedScript: HomeyScript = {
      ...existingScript,
      code: mockScriptContent,
    };

    vi.mocked(findExistingScript).mockResolvedValue(existingScript);
    vi.mocked(mockClient.updateScript).mockResolvedValue(mockUpdatedScript);

    await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockUpdatedScript,
          status: 'fulfilled' as const,
          action: OperationAction.UPDATE,
        },
      ],
    });

    expect(mockClient.updateScript).toHaveBeenCalledWith({
      id: existingScript.id,
      name: scriptName,
      code: mockScriptContent,
    });
    expect(mockClient.createScript).not.toHaveBeenCalled();
  });

  it('should handle invalid script filenames', async () => {
    await pushScripts({
      client: mockClient,
      scripts: ['invalid-filename.js'],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: {
            id: 'invalid-filename.js',
            name: 'invalid-filename.js',
          },
          status: 'rejected' as const,
          reason: new Error(
            'Invalid script filename format: invalid-filename.js'
          ),
        },
      ],
    });

    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(mockClient.updateScript).not.toHaveBeenCalled();
  });

  it('should handle file read errors', async () => {
    const error = new Error('Failed to read file');
    vi.mocked(fs.readFile).mockRejectedValue(error);
    vi.mocked(findExistingScript).mockResolvedValue(undefined);

    await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: {
            id: mockScripts[0],
            name: mockScripts[0],
          },
          status: 'rejected' as const,
          reason: error,
        },
      ],
    });

    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(mockClient.updateScript).not.toHaveBeenCalled();
  });

  it('should handle client errors', async () => {
    const error = new Error('Failed to create script');
    vi.mocked(findExistingScript).mockResolvedValue(undefined);
    vi.mocked(mockClient.createScript).mockRejectedValue(error);

    await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: {
            id: mockScripts[0],
            name: mockScripts[0],
          },
          status: 'rejected' as const,
          reason: error,
        },
      ],
    });

    expect(mockClient.createScript).toHaveBeenCalled();
    expect(mockClient.updateScript).not.toHaveBeenCalled();
  });

  it('should handle multiple scripts', async () => {
    const scriptName1 = 'test1';
    const scriptName2 = 'test2';

    const mockCreatedScript: HomeyScript = {
      id: 'new-id',
      name: scriptName1,
      version: '1.0.0',
      code: mockScriptContent,
    };

    const existingScript: HomeyScript = {
      id: 'existing-id',
      name: scriptName2,
      version: '1.0.0',
      code: mockScriptContent,
    };

    const mockUpdatedScript: HomeyScript = {
      ...existingScript,
      code: mockScriptContent,
    };

    vi.mocked(findExistingScript)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(existingScript);

    vi.mocked(mockClient.createScript).mockResolvedValue(mockCreatedScript);
    vi.mocked(mockClient.updateScript).mockResolvedValue(mockUpdatedScript);

    await pushScripts({
      client: mockClient,
      scripts: mockScripts,
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockCreatedScript,
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
        {
          script: mockUpdatedScript,
          status: 'fulfilled' as const,
          action: OperationAction.UPDATE,
        },
      ],
    });

    expect(mockClient.createScript).toHaveBeenCalledTimes(1);
    expect(mockClient.updateScript).toHaveBeenCalledTimes(1);
  });

  it('should handle empty scripts array', async () => {
    const mockNormalizedResults = {
      summary: {
        successful: 0,
        failed: 0,
      },
      results: [],
    };

    vi.mocked(handleOperationResults).mockReturnValue(mockNormalizedResults);

    const result = await pushScripts({
      client: mockClient,
      scripts: [],
    });

    expect(result).toEqual(mockNormalizedResults);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [],
    });
    expect(mockClient.createScript).not.toHaveBeenCalled();
    expect(mockClient.updateScript).not.toHaveBeenCalled();
  });

  it('should handle empty script content', async () => {
    const scriptName = 'test1';
    vi.mocked(fs.readFile).mockResolvedValue('');
    vi.mocked(findExistingScript).mockResolvedValue(undefined);

    const mockCreatedScript: HomeyScript = {
      id: 'new-id',
      name: scriptName,
      version: '1.0.0',
      code: '',
    };

    vi.mocked(mockClient.createScript).mockResolvedValue(mockCreatedScript);

    await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: mockCreatedScript,
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
      ],
    });

    expect(mockClient.createScript).toHaveBeenCalledWith({
      name: scriptName,
      code: '',
    });
  });

  it('should return normalized operation results', async () => {
    const mockNormalizedResults = {
      summary: {
        successful: 1,
        failed: 0,
      },
      results: [
        {
          script: {
            id: 'new-id',
            name: 'test1',
            version: '1.0.0',
            code: mockScriptContent,
          },
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
      ],
    };

    vi.mocked(findExistingScript).mockResolvedValue(undefined);
    vi.mocked(mockClient.createScript).mockResolvedValue({
      id: 'new-id',
      name: 'test1',
      version: '1.0.0',
      code: mockScriptContent,
    });
    vi.mocked(handleOperationResults).mockReturnValue(mockNormalizedResults);

    const result = await pushScripts({
      client: mockClient,
      scripts: [mockScripts[0] as string],
    });

    expect(result).toEqual(mockNormalizedResults);
    expect(handleOperationResults).toHaveBeenCalledWith({
      results: [
        {
          script: {
            id: 'new-id',
            name: 'test1',
            version: '1.0.0',
            code: mockScriptContent,
          },
          status: 'fulfilled' as const,
          action: OperationAction.CREATE,
        },
      ],
    });
  });
});
