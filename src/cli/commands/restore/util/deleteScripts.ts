import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';
import {
  type NormalizedOperationResults,
  OperationAction,
  handleOperationResults,
} from '../../../util/handleOperationResults';

/**
 * Deletes all existing scripts from the Homey device
 * @param client - HomeyScriptClient instance for interacting with the Homey device
 * @returns Object containing counts of successful and failed deletions
 */
export const deleteScripts = async (
  client: HomeyScriptClient
): Promise<NormalizedOperationResults> => {
  const existingScripts = await client.listScripts();

  if (existingScripts.length === 0) {
    return {};
  }

  const results = await Promise.all(
    existingScripts.map(async (script) => {
      try {
        await client.deleteScript(script.id);
        return {
          script: {
            id: script.id,
            name: script.name,
          } as unknown as HomeyScript,
          status: 'fulfilled' as const,
          action: OperationAction.DELETE,
        };
      } catch (error) {
        return {
          script,
          status: 'rejected' as const,
          reason: error,
          action: OperationAction.DELETE,
        };
      }
    })
  );

  return handleOperationResults({ results });
};
