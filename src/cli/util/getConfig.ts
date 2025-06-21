import { join } from 'path';

/**
 * Configuration file interface (as found in .hsk.json)
 */
export interface ConfigFile {
  https?: boolean;
  apiKey?: string;
  ip?: string;
  host?: string;
}

/**
 * Runtime configuration interface (with defaults applied)
 */
export interface Config {
  https: boolean;
  verbose: boolean;
  apiKey: string;
  ip: string;
  host?: string;
}

const defaultConfig: Config = {
  https: false,
  verbose: false,
  apiKey: '',
  ip: '',
};

/**
 * Safely loads the configuration file from the project root
 * Returns a complete config object with defaults applied
 */
export async function getConfig(): Promise<Config> {
  try {
    const configPath = join(process.cwd(), '.hsk.json');
    const config = await import(configPath);
    const loaded = config.default || config;

    return {
      ...defaultConfig,
      ...loaded,
    };
  } catch (_error) {
    // File doesn't exist or is invalid, return defaults
    return { ...defaultConfig };
  }
}
