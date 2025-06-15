import fs from 'fs/promises';

import { HomeyScriptClient } from '../../../util/client';
import {
  NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';
import { findExistingScript } from './findExistingScript';

/**
 * Pushes a single script to the Homey device
 * @param options - Configuration options for pushing a script
 * @param options.client - The HomeyScriptClient instance used to communicate with Homey
 * @param options.scriptPath - Path to the script file to push
 * @returns Promise that resolves when the script is pushed
 * @throws Error if the script filename format is invalid or if pushing fails
 */
export const pushScripts = async ({
  client,
  scripts,
}: {
  client: HomeyScriptClient;
  scripts: string[];
}): Promise<NormalizedOperationResults> => {
  const results = await Promise.all(
    scripts.map(async (scriptPath) => {
      try {
        const scriptName = scriptPath.match(/homeyscript\.(.+)\.min\.js/)?.[1];

        if (!scriptName) {
          throw new Error(`Invalid script filename format: ${scriptPath}`);
        }

        const code = await fs.readFile(scriptPath, 'utf-8');
        const existingScript = await findExistingScript({
          client,
          scriptName,
        });

        const updatedScript = existingScript
          ? await client.updateScript({
              id: existingScript.id,
              name: scriptName,
              code,
            })
          : await client.createScript({ name: scriptName, code });

        return {
          script: updatedScript,
          status: 'fulfilled' as const,
          action: existingScript
            ? OperationAction.UPDATE
            : OperationAction.CREATE,
        };
      } catch (error) {
        return {
          script: {
            id: scriptPath,
            name: scriptPath,
          },
          status: 'rejected' as const,
          reason: error,
        };
      }
    })
  );

  return handleOperationResults({ results });
};
