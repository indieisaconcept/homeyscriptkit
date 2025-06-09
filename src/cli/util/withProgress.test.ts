import { oraPromise } from 'ora';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommandEvent } from '../types';
import type { HomeyScriptClient } from './client';
import type { Config as SessionConfig } from './getSession';
import { withProgress } from './withProgress';

// Mock oraPromise
vi.mock('ora', () => ({
  oraPromise: vi.fn((promise, _options) => promise),
}));

describe('withProgress', () => {
  const mockClient = {} as HomeyScriptClient;
  const mockEvent = {} as CommandEvent;
  const mockConfig = {} as SessionConfig;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should execute handler successfully with progress', async () => {
    const mockResult = { data: 'test' };
    const handler = vi.fn().mockResolvedValue(mockResult);
    const options = {
      text: 'Processing...',
      successText: 'Done!',
      failText: 'Failed!',
    };

    const wrappedHandler = withProgress(handler, options);
    const result = await wrappedHandler({
      client: mockClient,
      event: mockEvent,
      config: mockConfig,
    });

    expect(oraPromise).toHaveBeenCalledWith(expect.any(Promise), options);
    expect(handler).toHaveBeenCalledWith({
      client: mockClient,
      event: mockEvent,
      config: mockConfig,
    });
    expect(result).toEqual(mockResult);
  });

  it('should handle handler errors with progress', async () => {
    const error = new Error('Test error');
    const handler = vi.fn().mockRejectedValue(error);
    const options = {
      text: 'Processing...',
      successText: 'Done!',
      failText: 'Failed!',
    };

    const wrappedHandler = withProgress(handler, options);

    await expect(
      wrappedHandler({
        client: mockClient,
        event: mockEvent,
        config: mockConfig,
      })
    ).rejects.toThrow('Test error');

    expect(oraPromise).toHaveBeenCalledWith(expect.any(Promise), options);
  });

  it('should work without progress options', async () => {
    const mockResult = { data: 'test' };
    const handler = vi.fn().mockResolvedValue(mockResult);

    const wrappedHandler = withProgress(handler);
    const result = await wrappedHandler({
      client: mockClient,
      event: mockEvent,
      config: mockConfig,
    });

    expect(oraPromise).toHaveBeenCalledWith(expect.any(Promise), undefined);
    expect(handler).toHaveBeenCalledWith({
      client: mockClient,
      event: mockEvent,
      config: mockConfig,
    });
    expect(result).toEqual(mockResult);
  });
});
