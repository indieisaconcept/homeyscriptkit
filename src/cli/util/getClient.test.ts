import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getClient } from './getClient';

// Mock the dependencies
vi.mock('./client');

describe('getClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create client with API key authentication', async () => {
    const config = {
      apiKey: 'test-api-key',
      ip: '192.168.1.100',
      https: false,
      verbose: false,
    };

    const mockClient = {
      // Mock client properties/methods as needed
    };

    const { HomeyScriptClient } = await import('./client');
    vi.mocked(HomeyScriptClient).mockReturnValue(mockClient as never);

    const result = await getClient(config);

    expect(HomeyScriptClient).toHaveBeenCalledWith({
      host: 'http://192.168.1.100',
      token: 'test-api-key',
    });
    expect(result).toBe(mockClient);
  });

  it('should create client with HTTPS when https is true', async () => {
    const config = {
      apiKey: 'test-api-key',
      ip: '192.168.1.100',
      https: true,
      verbose: false,
    };

    const mockClient = {
      // Mock client properties/methods as needed
    };

    const { HomeyScriptClient } = await import('./client');
    vi.mocked(HomeyScriptClient).mockReturnValue(mockClient as never);

    const result = await getClient(config);

    expect(HomeyScriptClient).toHaveBeenCalledWith({
      host: 'https://192-168-1-100.homey.homeylocal.com',
      token: 'test-api-key',
    });
    expect(result).toBe(mockClient);
  });

  it('should throw error when apiKey is missing', async () => {
    const config = {
      apiKey: '',
      ip: '192.168.1.100',
      https: false,
      verbose: false,
    };

    await expect(getClient(config)).rejects.toThrow(
      'API key and IP address are required. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  });

  it('should throw error when ip is missing', async () => {
    const config = {
      apiKey: 'test-api-key',
      ip: '',
      https: false,
      verbose: false,
    };

    await expect(getClient(config)).rejects.toThrow(
      'API key and IP address are required. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  });

  it('should throw error when both apiKey and ip are missing', async () => {
    const config = {
      apiKey: '',
      ip: '',
      https: false,
      verbose: false,
    };

    await expect(getClient(config)).rejects.toThrow(
      'API key and IP address are required. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  });
});
