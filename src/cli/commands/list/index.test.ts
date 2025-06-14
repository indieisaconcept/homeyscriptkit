import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeyScriptClient } from '../../util/client';
import { handler as listHandler } from './index';
import { listCommand } from './util';

// Mock dependencies
vi.mock('../../util/getClient');
vi.mock('./util');

describe('listHandler', () => {
  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should list all scripts when no arguments are provided', async () => {
    await listHandler({ client: mockClient });
    expect(listCommand).toHaveBeenCalledWith(mockClient);
  });

  it('should handle list command errors', async () => {
    const error = new Error('List command error');
    vi.mocked(listCommand).mockRejectedValueOnce(error);

    await expect(listHandler({ client: mockClient })).rejects.toThrow(
      'List command error'
    );

    expect(listCommand).toHaveBeenCalledWith(mockClient);
  });
});
