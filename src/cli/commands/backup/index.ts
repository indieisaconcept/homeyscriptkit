import { CommandEvent } from '../../types';
import { HomeyScriptClient } from '../../util/client';
import { command } from '../../util/command';
import { backupCommand } from './util';

/**
 * Handles the backup command for Homey scripts
 * @param {Object} params - The parameters object
 * @param {HomeyScriptClient} params.client - The HomeyScript client instance
 * @param {CommandEvent} params.event - The command event containing arguments
 * @returns {Promise<NormalizedOperationResults>} The result of the backup command
 */
export const handler = async ({
  client,
  event,
}: {
  client: HomeyScriptClient;
  event: CommandEvent;
}) => {
  const dir = (event.flags?.['dir'] as string) ?? 'backup';
  const scriptId = event.args?.[0];
  return backupCommand({ client, dir, scriptId });
};

export default command(handler);
