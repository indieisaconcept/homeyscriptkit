import fs from 'fs/promises';

import { HomeyScriptClient } from '../../../util/client';
import { deleteScripts } from './deleteScripts';
import { restoreScripts } from './restoreScripts';

interface RestoreCommandOptions {
  client: HomeyScriptClient;
  dir: string;
  scriptName?: string | undefined;
}

/**
 * Restores scripts from a backup directory to the Homey device.
 *
 * @param options - Configuration options for the restore operation
 * @param options.client - The HomeyScriptClient instance used to communicate with the Homey device
 * @param options.dir - The directory path containing the backup scripts to restore
 * @param options.scriptName - Optional name of a specific script to restore. If not provided, all scripts in the directory will be restored
 * @returns Promise that resolves when the restore operation is complete
 * @throws Error if backup directory does not exist or if restore operation fails
 */
export const restoreCommand = async ({
  client,
  dir,
  scriptName,
}: RestoreCommandOptions) => {
  // Validate backup directory exists
  try {
    await fs.access(dir);
  } catch (error) {
    throw new Error('Failed to restore script(s)', {
      cause: new Error(
        `Backup directory '${dir}': ${(error as Error).message}`
      ),
    });
  }

  try {
    const scripts = (scriptName ? [scriptName] : await fs.readdir(dir)).filter(
      (script) => script.endsWith('.json')
    );

    if (scripts.length === 0) {
      return;
    }

    // Delete existing scripts before restoring but only if no script name is provided
    if (!scriptName) {
      await deleteScripts(client);
    }

    return restoreScripts({
      client,
      scripts,
      dir,
    });
  } catch (error) {
    throw new Error('Failed to restore script(s)', {
      cause: error,
    });
  }
};
