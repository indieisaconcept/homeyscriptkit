import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../util/client';
import { handler as backupHandler } from './index';
import { backupCommand } from './util';

vi.mock('./util');

describe('backupHandler', () => {
  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should backup all scripts when no arguments are provided', async () => {
    await backupHandler({ event: { args: [] }, client: mockClient });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: undefined,
    });
  });

  it('should backup specific script when script ID is provided', async () => {
    await backupHandler({
      event: { args: ['test-script'] },
      client: mockClient,
    });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: 'test-script',
    });
  });

  it('should backup to custom directory when dir flag is provided', async () => {
    await backupHandler({
      event: {
        args: [],
        flags: { dir: 'custom-backup' },
      },
      client: mockClient,
    });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'custom-backup',
      scriptId: undefined,
    });
  });

  it('should handle backup command errors', async () => {
    const error = new Error('Backup failed');
    vi.mocked(backupCommand).mockRejectedValueOnce(error);

    await expect(
      backupHandler({ event: { args: [] }, client: mockClient })
    ).rejects.toThrow('Backup failed');

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: undefined,
    });
  });

  it('should handle invalid script ID', async () => {
    const error = new Error('Script not found');
    vi.mocked(backupCommand).mockRejectedValueOnce(error);

    await expect(
      backupHandler({
        event: { args: ['invalid-script'] },
        client: mockClient,
      })
    ).rejects.toThrow('Script not found');

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: 'invalid-script',
    });
  });

  it('should handle empty script ID', async () => {
    await backupHandler({
      event: { args: [''] },
      client: mockClient,
    });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: '',
    });
  });

  it('should ignore extra arguments', async () => {
    await backupHandler({
      event: { args: ['test-script', 'extra-arg'] },
      client: mockClient,
    });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: 'test-script',
    });
  });

  it('should handle non-string script ID', async () => {
    await backupHandler({
      event: { args: ['123'] },
      client: mockClient,
    });

    expect(backupCommand).toHaveBeenCalledWith({
      client: mockClient,
      dir: 'backup',
      scriptId: '123',
    });
  });
});
