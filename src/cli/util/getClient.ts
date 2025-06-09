import { HomeyScriptClient } from './client';
import { getSession } from './getSession';
import type { Config as SessionConfig } from './getSession';

/**
 * Gets a HomeyScriptClient instance by first obtaining a session
 * @param config - The session configuration
 * @returns Promise resolving to a HomeyScriptClient instance
 */
export const getClient = async (
  config: SessionConfig
): Promise<HomeyScriptClient> => {
  const session = await getSession(config);
  return new HomeyScriptClient(session);
};
