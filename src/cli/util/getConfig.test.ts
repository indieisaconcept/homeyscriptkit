import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfig } from './getConfig';

// Mock path module
vi.mock('path', () => ({
  join: vi.fn(() => '/mock/path/.hsk.json'),
}));

describe('getConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return default config when file does not exist', async () => {
    const result = await getConfig();
    expect(result).toEqual({
      https: false,
      verbose: false,
      apiKey: '',
      ip: '',
    });
  });

  it('should merge config file with defaults', async () => {
    vi.doMock('/mock/path/.hsk.json', () => ({
      default: { apiKey: 'from-file' },
    }));
    // Re-import getConfig to use the mocked module
    const { getConfig: getConfigWithMock } = await import('./getConfig');
    const result = await getConfigWithMock();
    expect(result).toEqual({
      https: false,
      verbose: false,
      apiKey: 'from-file',
      ip: '',
    });
  });
});
