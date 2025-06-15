import { confirm } from '@inquirer/prompts';
import pupa from 'pupa';

import type { CommandEvent } from '../types';
import type { HomeyScriptClient } from './client';
import { getClient } from './getClient';
import type { Config as SessionConfig } from './getSession';

interface CommandConfig {
  confirm?: {
    message: string;
    default?: boolean;
  };
}

type CommandHandler<T> = (params: {
  client: HomeyScriptClient;
  event: CommandEvent;
  config: SessionConfig;
}) => Promise<T>;

export const command = <T>(
  configOrHandler: CommandConfig | CommandHandler<T>,
  handler?: CommandHandler<T>
) => {
  const commandConfig = handler ? (configOrHandler as CommandConfig) : {};
  const commandHandler = handler || (configOrHandler as CommandHandler<T>);

  return async (
    event: CommandEvent,
    sessionConfig: SessionConfig
  ): Promise<T> => {
    if (commandConfig.confirm?.message) {
      const message = pupa(
        commandConfig.confirm.message,
        {
          event,
          config: sessionConfig,
        },
        {
          ignoreMissing: true,
        }
      );

      const confirmed = await confirm(
        {
          message,
          default: commandConfig.confirm.default ?? false,
        },
        {
          clearPromptOnDone: true,
        }
      );

      if (!confirmed) {
        process.stdout.write('\x1b[A');
        throw new Error('Operation cancelled by the user');
      }
    }

    const client = await getClient(sessionConfig);

    return commandHandler({ client, event, config: sessionConfig });
  };
};
