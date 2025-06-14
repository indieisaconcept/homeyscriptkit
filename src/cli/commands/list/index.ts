import { HomeyScriptClient } from '../../util/client';
import { command } from '../../util/command';
import { listCommand } from './util';

/**
 * Handles the list command to display all HomeyScripts from the server.
 * This function lists all available HomeyScripts and their details.
 *
 * @param {Object} params - The parameters object
 * @param {HomeyScriptClient} params.client - The HomeyScript client instance
 * @returns {Promise<HomeyScript[]>} A promise that resolves when the list operation is complete
 */
export const handler = async ({ client }: { client: HomeyScriptClient }) => {
  const result = await listCommand(client);
  return result;
};

/**
 * Creates a command handler for listing HomeyScripts from the server
 * @returns {Promise<void>} A promise that resolves when the list operation is complete
 */
export default command(handler);
