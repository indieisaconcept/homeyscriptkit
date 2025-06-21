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

## Configuration

To use the CLI synchronization features, you'll need to configure your Homey
connection. You can do this in two ways:

### Configuration File (Recommended)

1. Copy `.hsk.template.json` to `.hsk.json` in the repository root
2. Update the configuration with your Homey's IP address and API key:
   - `ip`: Your Homey's IP address on your local network
   - `apiKey`: Your Homey API key (see
     [Homey API Key documentation](https://support.homey.app/hc/en-us/articles/8178797067292-Getting-started-with-API-Keys))
   - `https`: Set to `true` if your Homey uses HTTPS, `false` for HTTP

**Example configuration:**

```json
{
  "https": false,
  "ip": "192.168.1.100",
  "apiKey": "your-api-key-here"
}
```

### CLI Flags (Alternative)

You can also provide these values directly via CLI flags, which will override
the configuration file values:

```bash
npx hsk list --apiKey your-api-key --ip 192.168.1.100 --https
```

**Note:** CLI flags take precedence over configuration file values, allowing you
to use different credentials for different operations if needed.

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
- `--apiKey <key>` - API key for Homey authentication
- `--ip <address>` - Homey IP address

## Examples

```bash
# Push scripts from a specific directory
npx hsk sync --dir ./scripts

# Pull scripts to a custom directory
npx hsk pull --dir ./my-scripts

# Override configuration with CLI flags
npx hsk list --apiKey your-api-key --ip 192.168.1.100 --https
```

## Authentication

The CLI requires API key authentication for direct Homey access. You can provide
authentication credentials either through the configuration file (see
Configuration section above) or via CLI flags.

**Creating API Keys:** To create an API key for your Homey, see the
[Homey API Key documentation](https://support.homey.app/hc/en-us/articles/8178797067292-Getting-started-with-API-Keys)
for detailed instructions on how to create and manage API keys.

**HTTPS Format:** When using `--https` with API key authentication, the CLI will
automatically format the hostname using Homey's local domain format:
`https://192-168-1-100.homey.homeylocal.com` instead of `https://192.168.1.100`.

## Script Locations

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
5. **Authentication**: Use API key authentication for direct local network
   access
6. **Security**: Keep your API key secure and don't share it in public
   repositories

## GitHub Actions Integration

This repository includes automated CI/CD workflows that use the CLI for
deployment. The workflows can:

- **Manual Sync**: Trigger sync by commenting `/hsk sync` on pull requests
- **Skip Sync**: Skip automatic sync by including `/skip-sync` in merge commit
  messages
- **Automatic Deployment**: Deploy on successful merges to the main branch

For detailed workflow documentation, see
[.github/workflows/README.md](.github/workflows/README.md).

## Troubleshooting

### Common Issues

1. **Authentication Failed**

   - Check your API key and IP address
   - Verify your internet connection
   - Ensure the API key is valid and not expired

2. **Sync Errors**

   - Check script syntax
   - Verify script permissions
   - Ensure sufficient storage space on Homey

3. **Connection Issues**
   - Verify your Homey is online
   - Check your network connection
   - Try using `--https` if HTTP fails
   - Ensure the IP address is correct

## Contributing

Found a bug or have a feature request? Please open an issue or submit a pull
request on our GitHub repository.

## License

This tool is part of HomeyScriptKit and is licensed under the MIT License.
