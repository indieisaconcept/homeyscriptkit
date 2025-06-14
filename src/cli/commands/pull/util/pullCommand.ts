import fs from 'fs/promises';

import { HomeyScriptClient } from '../../../util/client';
import { NormalizedOperationResults } from '../../../util/handleOperationResults';
import { writeScripts } from './writeScripts';

/**
 * Pulls all HomeyScripts from the Homey device and saves them to the local filesystem
 * @param options - Configuration options for pulling scripts
 * @param options.client - The HomeyScriptClient instance used to communicate with Homey
 * @param options.dir - Target directory to save the scripts
 * @returns Promise that resolves when all scripts are pulled and saved
 * @throws Error if any script fails to be pulled or saved
 */
export const pullCommand = async ({
  client,
  dir,
}: {
  client: HomeyScriptClient;
  dir: string;
}): Promise<NormalizedOperationResults> => {
  try {
    const scripts = await client.listScripts({ resolve: true });

    if (scripts.length === 0) {
      return {};
    }

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    return writeScripts({ dir, scripts });
  } catch (error) {
    throw new Error('Error pulling HomeyScripts', {
      cause: error,
    });
  }
};
