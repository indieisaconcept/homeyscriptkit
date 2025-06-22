/**
 * Regex pattern for HSK URL validation and parsing
 */
const HSK_URL_PATTERN =
  /^hsk:\/\/(?<script>[^/]+)\/(?<command>[^/?]+)(?:\/(?<pathResult>[^/?]+))?(?:\?(?<query>.+))?$/;

/**
 * Configuration type for HSK URL parsing
 */
export interface Config {
  script: string;
  command: string;
  result: string;
  params: Record<string, string>;
}

/**
 * Validates and parses an HSK URL string into a Config object
 */
function parseHSKConfig(configString: string): Config | null {
  const match = configString.match(HSK_URL_PATTERN);

  if (!match) {
    throw new Error(
      'Invalid HSK URL format. Expected: hsk://script/command[/result]?params'
    );
  }

  const { script = '', command = '', pathResult, query } = match.groups ?? {};

  // Validate required fields
  if (!script?.trim()) {
    throw new Error('Script name cannot be empty');
  }

  if (!command?.trim()) {
    throw new Error('Command name cannot be empty');
  }

  // Generate tag name based on the URL structure
  const tagName = pathResult
    ? `${script}.${pathResult}.Result`
    : command
      ? `${script}.${command}.Result`
      : `${script}.Result`;

  // Parse query parameters
  let params: Record<string, string> = {};
  if (query) {
    try {
      params = Object.fromEntries(new URLSearchParams(query));
    } catch (_error) {
      throw new Error(`Invalid query parameters: ${query}`);
    }
  }

  return {
    script: script.trim(),
    command: command.trim(),
    result: tagName,
    params,
  };
}

/**
 * Extracts and parses configuration from a HomeyScriptKit URL string.
 *
 * Supports the format: `hsk://script/command[/result]?param1=value1&param2=value2`
 *
 * @param config - HomeyScriptKit URL string to parse
 * @returns Parsed configuration object or null if parsing fails
 */
export const getConfiguration = (config?: string): Config | null => {
  if (!config || typeof config !== 'string') {
    return null;
  }

  try {
    return parseHSKConfig(config);
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : `Failed to parse configuration: ${config}`
    );
    return null;
  }
};
