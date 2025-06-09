import fs from 'fs/promises';
import path from 'path';

import type { HomeyScript } from '../../../types';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';

/**
 * Writes scripts to the filesystem
 * @param options - Configuration options for writing files
 * @param options.dir - Directory to write the files to
 * @param options.scripts - The scripts to write
 * @returns Promise that resolves when the files are written
 */
export const writeScripts = async ({
  dir,
  scripts,
}: {
  dir: string;
  scripts: HomeyScript[];
}): Promise<NormalizedOperationResults> => {
  const results = await Promise.all(
    scripts.map(async (script) => {
      try {
        const scriptPath = path.join(dir, `${script.name}/index.js`);

        await fs.mkdir(path.dirname(scriptPath), { recursive: true });
        await fs.writeFile(scriptPath, script.code ?? '');

        return {
          script,
          status: 'fulfilled' as const,
          action: OperationAction.PULL,
        };
      } catch (error) {
        return {
          script,
          status: 'rejected' as const,
          reason: error,
          action: OperationAction.PULL,
        };
      }
    })
  );

  return handleOperationResults({ results });
};
