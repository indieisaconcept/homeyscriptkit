import { confirm } from '@inquirer/prompts';
import pupa from 'pupa';

import type { CommandEvent } from '../types';
import type { HomeyScriptClient } from './client';
import { getClient } from './getClient';
import type { Config } from './getClient';

interface CommandConfig {
  confirm?: {
    message: string;
    default?: boolean;
  };
  eventDefaults?: Record<string, unknown>;
}

type CommandHandler<T> = (params: {
  client: HomeyScriptClient;
  event: CommandEvent;
  config: Config;
}) => Promise<T>;

export const command = <T>(
  configOrHandler: CommandConfig | CommandHandler<T>,
  handler?: CommandHandler<T>
) => {
  const commandConfig = handler ? (configOrHandler as CommandConfig) : {};
  const commandHandler = handler || (configOrHandler as CommandHandler<T>);

  return async (event: CommandEvent, sessionConfig: Config): Promise<T> => {
    // Merge eventDefaults with the actual event, handling nested objects
    const mergedEvent = commandConfig.eventDefaults
      ? {
          ...event,
          ...commandConfig.eventDefaults,
          flags: {
            ...(commandConfig.eventDefaults['flags'] ?? {}),
            ...event.flags,
          },
        }
      : event;

    if (commandConfig.confirm?.message) {
      const message = pupa(
        commandConfig.confirm.message,
        {
          event: mergedEvent,
          config: sessionConfig,
        },
        {
          ignoreMissing: true,
        }
      );

      process.stdout.write('\n');

      const confirmed = await confirm(
        {
          message,
          default: commandConfig.confirm.default ?? false,
        },
        {
          clearPromptOnDone: true,
        }
      );

      process.stdout.write('\x1b[A');

      if (!confirmed) {
        throw new Error('Operation cancelled by the user');
      }
    }

    const client = await getClient(sessionConfig);

    return commandHandler({
      client,
      event: mergedEvent,
      config: sessionConfig,
    });
  };
};
