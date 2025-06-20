import { HomeyScriptClient } from './client';

export interface Config {
  https: boolean;
  verbose: boolean;
  apiKey: string;
  ip: string;
}

/**
 * Creates a session object for API key authentication
 * @param {Object} params - The parameters for creating the session
 * @param {string} params.apiKey - The API key for authentication
 * @param {string} params.ip - The IP address of the Homey
 * @param {boolean} params.https - Whether to use HTTPS
 * @returns {Object} A session object with host and token
 */
const getApiKeySession = ({
  apiKey,
  ip,
  https,
}: {
  apiKey: string;
  ip: string;
  https: boolean;
}) => {
  const host = https
    ? `https://${ip.replace(/\./g, '-')}.homey.homeylocal.com`
    : `http://${ip}`;

  return {
    host,
    token: apiKey,
  };
};

/**
 * Gets a HomeyScriptClient instance using API key authentication
 * @param config - The session configuration
 * @returns Promise resolving to a HomeyScriptClient instance
 */
export const getClient = async (config: Config): Promise<HomeyScriptClient> => {
  if (!config.apiKey || !config.ip) {
    throw new Error(
      'API key and IP address are required. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  }

  const session = getApiKeySession({
    apiKey: config.apiKey,
    ip: config.ip,
    https: config.https,
  });

  return new HomeyScriptClient(session);
};
