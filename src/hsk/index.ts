import { Config, getConfiguration } from './util/getConfiguration';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Generic event type for command execution - extends Config with specific typing
 */
export type Event<
  TCommand extends string = string,
  TParams extends Record<string, string> = Record<string, string>,
> = Prettify<
  Config & {
    command: TCommand;
    params: TParams;
  }
>;

export type BaseParams = Record<string, string>;

/**
 * Generic context type for script execution
 */
export interface Context {
  filename: string;
  scriptId: string;
  lastExecuted?: string;
  msSinceLastExecuted?: number;
}

/**
 * Executes a function with HomeyScriptKit configuration parsed from URL string.
 *
 * Automatically handles:
 * - URL parsing and validation
 * - Result tagging with computed tag names
 * - Error management and logging
 * - Context creation with script metadata
 *
 * The function expects the first argument in the global `args` array to be a
 * HomeyScriptKit URL string in the format: `hsk://script/command[/result]?params`
 *
 * @template TCommand - The command string type for type-safe command handling
 * @template TParams - The parameters object type for type-safe parameter access
 * @param asyncFn - The async function to execute with parsed configuration and context
 * @returns Promise resolving to the function's return value
 *
 * @example
 * ```typescript
 * // Basic usage with automatic tag generation
 * export default hsk(async (event, context) => {
 *   console.log(`Executing ${event.command} on ${event.script}`);
 *   console.log('Params:', event.params);
 *   console.log('Tag name:', event.result); // Auto-generated: "script.command.Result"
 *
 *   return { success: true, timestamp: new Date().toISOString() };
 * });
 *
 * // With typed parameters
 * type SonosParams = { ip: string; volume?: string };
 *
 * export default hsk<'toggleSurround', SonosParams>(async (event, context) => {
 *   const { ip, volume } = event.params; // Fully typed
 *   // Implementation here
 *   return { status: 'completed' };
 * });
 *
 * // URL examples that trigger the function:
 * // hsk://sonos/toggleSurround?ip=192.168.1.1
 * // → event.result = "sonos.toggleSurround.Result"
 * //
 * // hsk://lights/dim/success?brightness=50
 * // → event.result = "lights.success.Result"
 * ```
 */
export default async <
  TCommand extends string = string,
  TParams extends Record<string, string> = Record<string, string>,
>(
  asyncFn: (
    event: Event<TCommand, TParams>,
    context: Context
  ) => Promise<unknown> | unknown
): Promise<unknown> => {
  const configString = args[0] as string;
  const fallbackTagName = 'script.error.Result';

  try {
    const config = getConfiguration(configString);

    if (!config) {
      throw new Error(
        'Invalid configuration: missing or invalid script/command'
      );
    }

    const { script, command, result: tagName } = config;

    await tag(tagName, null);

    const context: Context = {
      filename: script,
      scriptId: `${script}.${command}`,
      lastExecuted: __last_executed__?.toISOString(),
      msSinceLastExecuted: __ms_since_last_executed__,
    };

    const result = await asyncFn(config as Event<TCommand, TParams>, context);

    await tag(tagName, result as Parameters<typeof tag>[1]);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Script execution failed:', errorMessage);
    await tag(fallbackTagName, `Error: ${errorMessage}`);
    throw error;
  }
};
