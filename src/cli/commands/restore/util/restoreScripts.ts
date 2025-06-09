import fs from 'fs/promises';

import { HomeyScriptClient } from '../../../util/client';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';

/**
 * Restores one or more scripts from backup files to the Homey device
 * @param options - Configuration options for the restore operation
 * @param options.client - The HomeyScriptClient instance used to communicate with the Homey device
 * @param options.scripts - Array of script filenames to restore
 * @param options.dir - The directory path containing the backup scripts to restore
 * @returns Promise resolving to NormalizedOperationResults containing the status of each script restoration
 * @throws Will throw if the backup directory cannot be accessed or if the script files are invalid
 */
export const restoreScripts = async ({
  client,
  scripts,
  dir,
}: {
  client: HomeyScriptClient;
  scripts: string[];
  dir: string;
}): Promise<NormalizedOperationResults> => {
  const results = await Promise.all(
    scripts.map(async (path) => {
      const name = path.replace('.json', '');
      try {
        const scriptPath = `${dir}/${name}.json`;
        const scriptContent = await fs.readFile(scriptPath, 'utf-8');
        const script = JSON.parse(scriptContent);

        await client.createScript(script);

        return {
          script,
          status: 'fulfilled' as const,
          action: OperationAction.RESTORE,
        };
      } catch (error) {
        return {
          script: {
            id: path,
            name,
          },
          status: 'rejected' as const,
          reason: error instanceof Error ? error.message : 'Unknown error',
          action: OperationAction.RESTORE,
        };
      }
    })
  );

  return handleOperationResults({ results });
};
