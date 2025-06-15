import { z } from 'zod';

/**
 * Regex pattern for HSK URL validation and parsing
 */
const HSK_URL_PATTERN =
  /^hsk:\/\/(?<script>[^/]+)\/(?<command>[^/?]+)(?:\/(?<pathResult>[^/?]+))?(?:\?(?<query>.+))?$/;

/**
 * Combined Zod schema that validates HSK URL format and transforms it into a Config object
 */
const ConfigSchema = z
  .string()
  .regex(
    HSK_URL_PATTERN,
    'Invalid HSK URL format. Expected: hsk://script/command[/result]?params'
  )
  .transform((configString) => {
    const match = configString.match(HSK_URL_PATTERN);

    const {
      script = '',
      command = '',
      pathResult,
      query,
    } = match?.groups ?? {};

    // Generate tag name based on the URL structure
    const tagName = pathResult
      ? `${script}.${pathResult}.Result`
      : command
        ? `${script}.${command}.Result`
        : `${script}.Result`;

    return {
      script,
      command,
      result: tagName,
      params: query ? Object.fromEntries(new URLSearchParams(query)) : {},
    };
  })
  .pipe(
    z.object({
      script: z.string().min(1, 'Script name cannot be empty'),
      command: z.string().min(1, 'Command name cannot be empty'),
      result: z.string(),
      params: z.record(z.string()).default({}),
    })
  );

/**
 * Configuration type inferred from Zod schema
 */
export type Config = z.infer<typeof ConfigSchema>;

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
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : `Failed to parse configuration: ${config}`
    );
    return null;
  }
};
