import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handler as restoreHandler } from '.';
import type { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import { restoreCommand } from './util';

vi.mock('./util');

describe('restoreHandler', () => {
  const mockEvent: CommandEvent = {
    args: ['backup'],
    flags: {
      script: 'test-script',
    },
  };

  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should restore all scripts when no arguments are provided', async () => {
    const eventWithoutDir: CommandEvent = { args: [] };

    await restoreHandler({ event: eventWithoutDir, client: mockClient });

    expect(restoreCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptName: undefined,
    });
  });

  it('should restore to custom directory when provided', async () => {
    const eventWithOnlyDir: CommandEvent = { args: ['custom-backup'] };

    await restoreHandler({ event: eventWithOnlyDir, client: mockClient });

    expect(restoreCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'custom-backup',
      scriptName: undefined,
    });
  });

  it('should restore specific script when scriptName is provided', async () => {
    await restoreHandler({ event: mockEvent, client: mockClient });

    expect(restoreCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptName: 'test-script',
    });
  });

  it('should handle restore command errors', async () => {
    const error = new Error('Restore failed');
    vi.mocked(restoreCommand).mockRejectedValueOnce(error);

    await expect(
      restoreHandler({ event: mockEvent, client: mockClient })
    ).rejects.toThrow('Restore failed');

    expect(restoreCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptName: 'test-script',
    });
  });

  it('should handle args with whitespace', async () => {
    const eventWithWhitespace: CommandEvent = {
      args: ['  backup  '],
    };

    await restoreHandler({ event: eventWithWhitespace, client: mockClient });

    expect(restoreCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptName: undefined,
    });
  });
});
