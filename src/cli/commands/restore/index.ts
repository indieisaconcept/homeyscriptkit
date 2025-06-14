import { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import { command } from '../../util/command';
import { restoreCommand } from './util';

/**
 * Handles the restore command to restore HomeyScripts from a backup.
 * This function restores HomeyScripts from a backup directory to the server.
 * If no directory is specified, it defaults to 'backup'.
 * If a script name is provided, only that specific script will be restored.
 *
 * @param {Object} params - The parameters object
 * @param {HomeyScriptClient} params.client - The HomeyScript client instance
 * @param {CommandEvent} params.event - The command event containing arguments and options
 * @returns {Promise<NormalizedOperationResults>} A promise that resolves when the restore operation is complete
 */
export const handler = async ({
  client,
  event,
}: {
  client: HomeyScriptClient;
  event: CommandEvent;
}) => {
  const dir = (event.args?.[0] ?? 'backup').trim();
  const scriptName = event.flags?.['script'] as string | undefined;

  return restoreCommand({ dir, scriptName, client });
};

/**
 * Creates a command handler for restoring HomeyScripts from a backup
 * Requires user confirmation before proceeding to prevent accidental overwrites
 * @returns {Promise<void>} A promise that resolves when the restore operation is complete
 */
export default command(
  {
    confirm: {
      message: 'This will delete all remote HomeyScripts. Are you sure?',
      default: false,
    },
  },
  handler
);
