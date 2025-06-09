import fs from 'fs/promises';

import { HomeyScript } from '../../../types';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';

/**
 * Backs up multiple scripts to a directory
 * @param options - Options for backing up scripts
 * @param options.scriptIds - Array of script IDs to backup
 * @param options.dir - Directory to save the backups to
 * @returns Promise that resolves when all scripts are backed up
 */
export const backupScripts = async (options: {
  scripts: HomeyScript[];
  dir: string;
}): Promise<NormalizedOperationResults> => {
  const { scripts, dir } = options;

  await fs.mkdir(dir, { recursive: true });

  const results = await Promise.all(
    scripts.map(async (script) => {
      try {
        const scriptPath = `${dir}/${script.name}.json`;
        await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));

        return {
          script,
          status: 'fulfilled' as const,
          action: OperationAction.BACKUP,
        };
      } catch (error) {
        return {
          script,
          status: 'rejected' as const,
          reason: error,
          action: OperationAction.BACKUP,
        };
      }
    })
  );

  return handleOperationResults({ results });
};
