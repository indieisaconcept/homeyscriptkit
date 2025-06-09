import { confirm } from '@inquirer/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommandEvent } from '../types';
import type { HomeyScriptClient } from './client';
import { command } from './command';
import { getClient } from './getClient';
import type { Config as SessionConfig } from './getSession';

// Mock dependencies
vi.mock('@inquirer/prompts');
vi.mock('./getClient');

describe('command', () => {
  const mockEvent: CommandEvent = {
    args: ['test-arg'],
    flags: {
      script: 'test-script',
    },
  };

  const mockConfig: SessionConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    https: true,
  };

  const mockClient = {} as HomeyScriptClient;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClient).mockResolvedValue(mockClient);
  });

  describe('single argument pattern', () => {
    it('should execute handler without confirmation', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(handler);

      await cmd(mockEvent, mockConfig);

      expect(confirm).not.toHaveBeenCalled();
      expect(getClient).toHaveBeenCalledWith(mockConfig);
      expect(handler).toHaveBeenCalledWith({
        client: mockClient,
        event: mockEvent,
        config: mockConfig,
      });
    });

    it('should handle handler errors', async () => {
      const error = new Error('Handler error');
      const handler = vi.fn().mockRejectedValue(error);
      const cmd = command(handler);

      await expect(cmd(mockEvent, mockConfig)).rejects.toThrow('Handler error');
      expect(handler).toHaveBeenCalledWith({
        client: mockClient,
        event: mockEvent,
        config: mockConfig,
      });
    });
  });

  describe('two argument pattern', () => {
    it('should execute handler when user confirms', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message: 'Test confirmation?',
            default: false,
          },
        },
        handler
      );

      await cmd(mockEvent, mockConfig);

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Test confirmation?',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
      expect(getClient).toHaveBeenCalledWith(mockConfig);
      expect(handler).toHaveBeenCalledWith({
        client: mockClient,
        event: mockEvent,
        config: mockConfig,
      });
    });

    it('should not execute handler when user declines', async () => {
      vi.mocked(confirm).mockResolvedValue(false);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message: 'Test confirmation?',
            default: false,
          },
        },
        handler
      );

      await expect(cmd(mockEvent, mockConfig)).rejects.toThrow(
        'Operation cancelled by the user'
      );

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Test confirmation?',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
      expect(getClient).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle client errors', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const error = new Error('Client error');
      vi.mocked(getClient).mockRejectedValueOnce(error);
      const handler = vi.fn();
      const cmd = command(
        {
          confirm: {
            message: 'Test confirmation?',
            default: false,
          },
        },
        handler
      );

      await expect(cmd(mockEvent, mockConfig)).rejects.toThrow('Client error');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle handler errors', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const error = new Error('Handler error');
      const handler = vi.fn().mockRejectedValue(error);
      const cmd = command(
        {
          confirm: {
            message: 'Test confirmation?',
            default: false,
          },
        },
        handler
      );

      await expect(cmd(mockEvent, mockConfig)).rejects.toThrow('Handler error');
      expect(handler).toHaveBeenCalledWith({
        client: mockClient,
        event: mockEvent,
        config: mockConfig,
      });
    });
  });

  describe('string interpolation', () => {
    it('should interpolate event values in confirm message', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message: 'Are you sure you want to sync {event.flags.script}?',
            default: false,
          },
        },
        handler
      );

      await cmd(mockEvent, mockConfig);

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Are you sure you want to sync test-script?',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
    });

    it('should interpolate config values in confirm message', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message: 'Using client ID: {config.clientId}',
            default: false,
          },
        },
        handler
      );

      await cmd(mockEvent, mockConfig);

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Using client ID: test-client-id',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
    });

    it('should interpolate both event and config values in confirm message', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message:
              'Syncing {event.flags.script} with client {config.clientId}',
            default: false,
          },
        },
        handler
      );

      await cmd(mockEvent, mockConfig);

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Syncing test-script with client test-client-id',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
    });

    it('should handle missing interpolation values gracefully', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const handler = vi.fn().mockResolvedValue(undefined);
      const cmd = command(
        {
          confirm: {
            message: 'Missing value: {event.flags.nonexistent}',
            default: false,
          },
        },
        handler
      );

      await cmd(mockEvent, mockConfig);

      expect(confirm).toHaveBeenCalledWith(
        {
          message: 'Missing value: {event.flags.nonexistent}',
          default: false,
        },
        {
          clearPromptOnDone: true,
        }
      );
    });
  });
});
