import { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import { command } from '../../util/command';
import { pullCommand } from './util';

/**
 * Handles the pull command to fetch HomeyScripts from the server.
 * This function pulls HomeyScripts from the server and saves them to the specified directory.
 * If no directory is specified, it defaults to 'packages'.
 *
 * @param {Object} params - The parameters object
 * @param {HomeyScriptClient} params.client - The HomeyScript client instance
 * @param {CommandEvent} params.event - The command event containing arguments and options
 * @returns {Promise<NormalizedOperationResults>} A promise that resolves when the pull operation is complete
 */
export const handler = async ({
  client,
  event,
}: {
  client: HomeyScriptClient;
  event: CommandEvent;
}) => {
  const dir = event.args?.[0] ?? 'packages';
  return pullCommand({ client, dir });
};

/**
 * Creates a command handler for pulling HomeyScripts from the server
 * Requires user confirmation before proceeding to prevent accidental overwrites
 * @returns {Promise<void>} A promise that resolves when the pull operation is complete
 */
export default command(
  {
    confirm: {
      message:
        "This may overwrite the contents of existing HomeyScripts in the '{event.flags.dir}' directory. Are you sure you want to continue?",
      default: false,
    },
  },
  handler
);
