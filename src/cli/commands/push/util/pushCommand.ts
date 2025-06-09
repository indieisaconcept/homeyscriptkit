import fs from 'fs/promises';
import path from 'path';

import { HomeyScriptClient } from '../../../util/client';
import { NormalizedOperationResults } from '../../../util/handleOperationResults';
import { pushScripts } from './pushScripts';

/**
 * Pushes HomeyScripts to the Homey device
 * @param options - Configuration options for pushing scripts
 * @param options.client - The HomeyScriptClient instance used to communicate with Homey
 * @param options.scriptName - Optional name of a specific script to push. If not provided, all .js files in the scripts directory will be pushed
 * @param options.dir - Optional directory containing the scripts to push. Defaults to 'dist'
 * @returns Promise that resolves with normalized operation results when all scripts are pushed
 */
export const pushCommand = async ({
  client,
  scriptName,
  dir,
}: {
  client: HomeyScriptClient;
  scriptName?: string | undefined;
  dir?: string | undefined;
}): Promise<NormalizedOperationResults> => {
  try {
    const scriptsDir = dir ?? 'dist';

    const scripts = (
      scriptName
        ? [`${scriptName}.js`]
        : (await fs.readdir(scriptsDir)).filter((file) => file.endsWith('.js'))
    ).map((file) => path.join(scriptsDir, file));

    if (scripts.length === 0) {
      return {};
    }

    return pushScripts({ client, scripts });
  } catch (error) {
    throw new Error('Error pushing HomeyScripts', {
      cause: error,
    });
  }
};
