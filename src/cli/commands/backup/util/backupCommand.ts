import { HomeyScriptClient } from '../../../util/client';
import { NormalizedOperationResults } from '../../../util/handleOperationResults';
import { backupScripts } from './backupScripts';

/**
 * Creates a backup of HomeyScripts by saving their JSON representation to a directory
 * @param options - Options for backing up scripts
 * @param options.client - The HomeyScriptClient instance used to communicate with Homey
 * @param options.dir - Directory to save the backups to (defaults to 'backup')
 * @param options.scriptId - Optional ID of a single script to backup
 * @returns Promise that resolves when all scripts are backed up
 * @throws Error if the backup operation fails
 */
export const backupCommand = async (options: {
  client: HomeyScriptClient;
  dir?: string;
  scriptId?: string | undefined;
}): Promise<NormalizedOperationResults> => {
  const { client, dir = 'backup', scriptId } = options;

  try {
    if (scriptId) {
      const script = await client.getScript(scriptId);
      return backupScripts({ scripts: [script], dir });
    }

    // Get all scripts
    const scripts = await client.listScripts({ resolve: true });

    if (scripts.length === 0) {
      return {};
    }

    // Save each script's JSON representation
    return backupScripts({ scripts, dir });
  } catch (error) {
    throw new Error('Error backing up HomeyScripts', {
      cause: error,
    });
  }
};
