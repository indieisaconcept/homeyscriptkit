# HomeyScriptKit CLI

The HomeyScriptKit CLI (Command Line Interface) is a tool that helps you manage,
develop, and deploy your HomeyScript scripts efficiently. It's included in this
repository and doesn't require a separate installation.

**Disclaimer:** Whilst the author has taken every step to ensure the reliability
and safety of this tool, it is provided as-is without any guarantees. Always
ensure you have a backup of your scripts before performing any operations, as
some commands may overwrite existing scripts. Additionally, be mindful of
running commands during active automation flows to prevent any potential
disruption to your home automation.

## Installation

After cloning the repository, install dependencies:

```bash
npm install
```

## Basic Usage

```bash
npx hsk <command> [options]
```

## Commands

### Script Management

#### List Scripts

List all remote HomeyScript scripts:

```bash
npx hsk list
```

#### Sync Scripts

Push scripts to remote:

```bash
npx hsk sync [script]
```

The sync command will either update existing scripts or create new ones if they
don't exist on your Homey. This makes it safe to use for both initial deployment
and updates.

#### Pull Scripts

Pull all remote scripts and save them locally:

```bash
npx hsk pull
```

The pull command is particularly useful if you're new to HomeyScriptKit and want
to start managing your existing scripts with it. It downloads all your current
scripts from Homey, allowing you to work on them locally and manage them going
forward with HomeyScriptKit's tools.

### Backup & Restore

#### Backup Scripts

Create a backup of scripts as JSON files:

```bash
npx hsk backup [script]
```

#### Restore Scripts

Restore scripts from backup files:

```bash
npx hsk restore [script]
```

**Caution:** The restore command will delete all existing scripts on your Homey
before restoring from backup. After restoration, you will need to update your
flows to point to the correct scripts, as script IDs may have changed. Make sure
to backup your current scripts before performing a restore operation.

## Options

- `--help, -h` - Show help
- `--version, -v` - Show version
- `--https, -s` - Use HTTPS instead of HTTP to connect to Homey
- `--verbose` - Show detailed error information
- `--dir, -d <directory>` - Specify directory for script operations

## Examples

```bash
# Push scripts from a specific directory
npx hsk sync --dir ./scripts

# Pull scripts to a custom directory
npx hsk pull --dir ./my-scripts
```

## Authentication

The CLI uses the Athom Cloud API for authentication. If you haven't already
authenticated:

1. Run `npx homey login` to authenticate with your Athom account
2. The HomeyScriptKit CLI will automatically use these credentials

## Configuration

The CLI will look for built scripts in the following locations:

1. The directory specified by `--dir` option
2. The `dist` directory in your project root

## Best Practices

1. **Version Control**: Always commit your scripts to version control before
   syncing
2. **Backup**: Regularly create backups of your scripts using the backup command
3. **Directory Structure**: Use the `--dir` option to maintain a clean project
   structure
4. **Testing**: Test scripts locally before syncing to your Homey

## Troubleshooting

### Common Issues

1. **Authentication Failed**

   - Ensure you're logged in with `npx homey login`
   - Check your internet connection
   - Verify your Athom account credentials

2. **Sync Errors**

   - Check script syntax
   - Verify script permissions
   - Ensure sufficient storage space on Homey

3. **Connection Issues**
   - Verify your Homey is online
   - Check your network connection
   - Try using `--https` if HTTP fails

## Contributing

Found a bug or have a feature request? Please open an issue or submit a pull
request on our GitHub repository.

## License

This tool is part of HomeyScriptKit and is licensed under the MIT License.
