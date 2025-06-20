#!/usr/bin/env -S tsx --node-options=--no-deprecation
import { render } from 'ink';
import meow from 'meow';

import defaultConfig from '../.hsk.json';
import {
  backupHandler,
  listHandler,
  pullHandler,
  pushHandler,
  restoreHandler,
} from '../src/cli/commands';
import { ErrorDisplay } from '../src/cli/components/ErrorDisplay';
import { Layout } from '../src/cli/components/Layout';
import { OperationResultsDisplay } from '../src/cli/components/OperationResultsDisplay';
import { ScriptsTable } from '../src/cli/components/ScriptsTable';
import { CLIFlags } from '../src/cli/types';
import { NormalizedOperationResults } from '../src/cli/util/handleOperationResults';

/**
 * Configuration file interface
 */
interface ConfigFile {
  https: boolean;
  apiKey: string;
  ip: string;
}

const handlers = {
  list: listHandler,
  pull: pullHandler,
  sync: pushHandler,
  backup: backupHandler,
  restore: restoreHandler,
};

const cli = meow(
  `
	Usage

		$ npx hsk <command> [options]

	Commands

		Script Management

		list                     List all remote HomeyScript scripts
		sync [script]            Push scripts to remote
		pull                     Pull all remote scripts and save them locally

		Backup & Restore

		backup [script]          Create a backup of scripts as JSON files
		restore [script]         Restore scripts from backup files

	Options

		--help, -h               Show help
		--version, -v            Show version
		--https, -s              Use HTTPS instead of HTTP to connect to Homey
		--verbose                Show detailed error information
		--dir, -d <directory>    Specify directory for script operations
		--apiKey <key>           API key for Homey authentication
		--ip <address>           Homey IP address

	Examples

		$ npx hsk sync --dir ./scripts
		$ npx hsk pull --dir ./my-scripts
		$ npx hsk list --apiKey your-api-key --ip 192.168.1.100

	Authentication

	API key authentication is required. You must provide both --apiKey and --ip flags,
	or configure them in the .hsk.json file. Command line flags take precedence over
	configuration file values.

	To create an API key, see: https://support.homey.app/hc/en-us/articles/8178797067292-Getting-started-with-API-Keys
`,
  {
    description: false,
    importMeta: import.meta,
    flags: {
      help: {
        type: 'boolean',
        shortFlag: 'h',
      },
      version: {
        type: 'boolean',
        shortFlag: 'v',
      },
      https: {
        type: 'boolean',
        shortFlag: 's',
      },
      verbose: {
        type: 'boolean',
      },
      dir: {
        type: 'string',
        shortFlag: 'd',
      },
      apiKey: {
        type: 'string',
      },
      ip: {
        type: 'string',
      },
    },
  }
);

/**
 * Main CLI entry point
 */
async function main() {
  const [command, ...args] = cli.input;

  if (!command) {
    cli.showHelp();
    return;
  }

  // Type the flags for better type safety
  const flags = cli.flags as CLIFlags;
  const configFile = defaultConfig as ConfigFile;

  const config = {
    https: flags.https ?? configFile.https,
    verbose: flags.verbose ?? false,
    // Command line flags take precedence over config file values
    apiKey: flags.apiKey ?? configFile.apiKey,
    ip: flags.ip ?? configFile.ip,
  };

  // Validate that both apiKey and ip are provided
  if (!config.apiKey || !config.ip) {
    throw new Error(
      'API key and IP address are required. Use --apiKey and --ip flags or configure them in .hsk.json'
    );
  }

  const { help, version, https, verbose, apiKey, ip, ...commandFlags } = flags;

  const handler = handlers[command as keyof typeof handlers];

  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }

  return handler({ flags: commandFlags, args }, config);
}

main()
  .then((result) => {
    if (!result) {
      process.exit(0);
    }

    const isScriptsResult = Array.isArray(result);
    render(
      <Layout>
        {isScriptsResult ? (
          <ScriptsTable scripts={result} />
        ) : (
          <OperationResultsDisplay
            results={result as NormalizedOperationResults}
          />
        )}
      </Layout>
    );
    process.exit(0);
  })
  .catch((error) => {
    render(
      <Layout>
        <ErrorDisplay
          error={error as Error}
          verbose={cli.flags.verbose as boolean}
        />
      </Layout>
    );
    process.exit(1);
  });
