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
import { NormalizedOperationResults } from '../src/cli/util/handleOperationResults';

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

	Examples

		$ npx hsk sync --dir ./scripts
		$ npx hsk pull --dir ./my-scripts

	Note: Authentication is handled automatically using stored Athom Cloud API
	      credentials. Please authenticate with the Homey CLI first if you
	      haven't already.
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

  const config = {
    ...defaultConfig,
    https: cli.flags.https ?? defaultConfig.https,
    verbose: cli.flags.verbose ?? false,
  };

  const { help, version, https, verbose, ...commandFlags } = cli.flags;

  const handler = handlers[command as keyof typeof handlers];

  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }

  process.stdout.write('\n');
  return handler({ flags: commandFlags, args }, config);
}

main()
  .then((result) => {
    if (!result) {
      return;
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
  })
  .finally(() => {
    process.exit(1);
  });
