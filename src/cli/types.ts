/**
 * CLI flags interface
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CLIFlags = {
  help: boolean;
  version: boolean;
  https: boolean;
  verbose: boolean;
  dir?: string;
  apiKey?: string;
  ip?: string;
};

export interface CommandEvent {
  flags: Omit<CLIFlags, 'help' | 'version' | 'https' | 'verbose'>;
  args?: string[];
}

export interface HomeyScript {
  id: string;
  name: string;
  code?: string;
  version: string;
  lastExecuted?: string;
}
