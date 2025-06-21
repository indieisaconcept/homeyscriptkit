import { HomeyScriptClient } from './client';
import type { Config } from './getConfig';

/**
 * Creates a session object for API key authentication
 * @param {Object} params - The parameters for creating the session
 * @param {string} params.apiKey - The API key for authentication
 * @param {string} params.ip - The IP address of the Homey
 * @param {boolean} params.https - Whether to use HTTPS
 * @param {string} params.host - The host URL (supersedes ip and https)
 * @returns {Object} A session object with host and token
 */
const getApiKeySession = ({
  apiKey,
  ip,
  https,
  host,
}: {
  apiKey: string;
  ip: string;
  https: boolean;
  host?: string;
}) => {
  // If host is provided, use it directly (supersedes ip and https)
  if (host) {
    return {
      host: host.startsWith('http') ? host : `http://${host}`,
      token: apiKey,
    };
  }

  // Fall back to ip + https logic
  const hostUrl = https
    ? `https://${ip.replace(/\./g, '-')}.homey.homeylocal.com`
    : `http://${ip}`;

  return {
    host: hostUrl,
    token: apiKey,
  };
};

/**
 * Gets a HomeyScriptClient instance using API key authentication
 * @param config - The session configuration
 * @returns Promise resolving to a HomeyScriptClient instance
 */
export const getClient = async (config: Config): Promise<HomeyScriptClient> => {
  // If host is provided, we only need apiKey
  if (config.host && !config.apiKey) {
    throw new Error(
      'API key is required when using --host flag. Use --apiKey flag or configure it in .hsk.json'
    );
  } else if (!config.host && (!config.apiKey || !config.ip)) {
    // If no host, we need both apiKey and ip
    throw new Error(
      'API key and IP address are required when not using --host flag. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  }

  const session = getApiKeySession({
    apiKey: config.apiKey,
    ip: config.ip,
    https: config.https,
    ...(config.host && { host: config.host }),
  });

  return new HomeyScriptClient(session);
};
