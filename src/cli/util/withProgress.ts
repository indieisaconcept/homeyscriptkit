import { PromiseOptions, oraPromise } from 'ora';

import type { CommandEvent } from '../types';
import type { HomeyScriptClient } from './client';
import type { Config } from './getConfig';

type ProgressOptions = Pick<
  PromiseOptions<unknown>,
  'text' | 'successText' | 'failText'
>;

type CommandHandler<T> = (params: {
  client: HomeyScriptClient;
  event: CommandEvent;
  config: Config;
}) => Promise<T>;

type CommandResult<T> = T;

export const withProgress = <T>(
  handler: CommandHandler<T>,
  options?: ProgressOptions
) => {
  return async (
    params: Parameters<CommandHandler<T>>[0]
  ): Promise<CommandResult<T>> => {
    return oraPromise(handler(params), options);
  };
};
