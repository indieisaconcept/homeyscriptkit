import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';

/**
 * Lists all scripts from the Homey device with terminal feedback
 * @param client - The HomeyScriptClient instance used to communicate with Homey
 * @returns Promise that resolves when the command is complete
 * @throws Error if the command fails to fetch scripts
 */
export const listCommand = async (
  client: HomeyScriptClient
): Promise<HomeyScript[]> => {
  try {
    const scripts = await client.listScripts();

    if (scripts.length === 0) {
      return [];
    }

    return scripts;
  } catch (error) {
    throw new Error('Failed to fetch HomeyScripts', {
      cause: error,
    });
  }
};
