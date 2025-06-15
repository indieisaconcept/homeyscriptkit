import { HomeyScript } from '../../../types';
import { HomeyScriptClient } from '../../../util/client';

/**
 * Finds an existing script by name
 * @param options - Configuration options for finding a script
 * @param options.client - The HomeyScriptClient instance used to communicate with Homey
 * @param options.scriptName - The name of the script to find
 * @returns Promise that resolves to the found script or undefined
 */
export const findExistingScript = async ({
  client,
  scriptName,
}: {
  client: HomeyScriptClient;
  scriptName: string;
}): Promise<HomeyScript | undefined> => {
  const scripts = await client.listScripts();
  return scripts.find((script) => script.name === scriptName);
};
