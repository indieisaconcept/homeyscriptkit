import { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import { command } from '../../util/command';
import { pushCommand } from './util';

/**
 * Handles the push command to upload HomeyScripts to the server.
 * This function pushes HomeyScripts from the local filesystem to the server.
 * If a script name is provided, only that specific script will be pushed.
 *
 * @param {Object} params - The parameters object
 * @param {HomeyScriptClient} params.client - The HomeyScript client instance
 * @param {CommandEvent} params.event - The command event containing arguments and options
 * @returns {Promise<NormalizedOperationResults>} A promise that resolves when the push operation is complete
 */
export const handler = async ({
  client,
  event,
}: {
  client: HomeyScriptClient;
  event: CommandEvent;
}) =>
  pushCommand({
    client,
    scriptName: event.args?.[0],
    dir: event.flags?.['dir'] as string | undefined,
  });

/**
 * Creates a command handler for pushing HomeyScripts to the server
 * Requires user confirmation before proceeding to prevent accidental overwrites
 * @returns {Promise<void>} A promise that resolves when the push operation is complete
 */
export default command(
  {
    confirm: {
      message:
        'This may overwrite the contents of existing scripts HomeyScripts. Are you sure you want to continue?',
      default: false,
    },
  },
  handler
);
