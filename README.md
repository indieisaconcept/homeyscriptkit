# HomeyScriptKit

A collection of custom scripts for
[HomeyScript](https://homey.app/en-au/app/com.athom.homeyscript/HomeyScript/),
enabling advanced automation and control of your Homey smart home hub.

## Overview

This repository contains a set of HomeyScript scripts that extend the
functionality of your Homey.

![HomeyScript Example](resources/example.png) _Example of a flow executing a
custom HomeyScript script_

### Key Features

#### 🔗 URL-like Argument Passing

HomeyScriptKit provides a standardized way to pass arguments to scripts using
URL-like string parameters. This allows for flexible and intuitive parameter
passing to your scripts, making them more reusable and configurable across
different automation scenarios.

#### 🔗 Standardized Result Handling

Unlike the standard HomeyScript card which only makes results available when
using inline scripts, HomeyScriptKit provides a standardized way to set and
return results from script execution. This enables subsequent flow cards to
access and use the script's output, allowing for more complex automation chains
and data passing between flow steps.

```
hsk://<script>/<command>/<result:optional>?<args>
```

- **script** - script name (primary identifier)
- **command** - action to execute within the script
- **result** - optional custom result key (defaults to
  `<script>.<command>.Result`)
- **args** - querystring parameters for the command

**Examples:**

```
# Standard result: sonos.toggleSurround.Result
hsk://sonos/toggleSurround?ip=192.168.1.1

# Custom result key: sonos.livingRoom.Result
hsk://sonos/toggleSurround/livingRoom?ip=192.168.1.1
```

#### 📦 Third-Party Package Bundling

HomeyScriptKit's build system can bundle third-party npm packages directly into
your scripts, allowing you to leverage the vast ecosystem of JavaScript
libraries. This enables more powerful and feature-rich scripts by incorporating
existing solutions for common tasks like data manipulation, HTTP requests, or
specialized algorithms.

**Note:** Your mileage may vary depending on package complexity and
dependencies. Always thoroughly test bundled packages in your HomeyScript
environment to ensure compatibility and performance.

#### 🔄 Direct Script Synchronization

HomeyScriptKit includes a synchronization feature that allows you to directly
sync your scripts to your Homey device. This eliminates the need for manual
copying and pasting, streamlining the development and deployment process. Simply
run the sync command, and your scripts will be automatically updated on your
Homey, making it easier to test and iterate on your automation scripts.

**Disclaimer:** Whilst the author has taken every step to ensure the reliability
and safety of this tool, it is provided as-is without any guarantees. Always
ensure you have a backup of your scripts before performing any operations, as
some commands may overwrite existing scripts. Additionally, be mindful of
running commands during active automation flows to prevent any potential
disruption to your home automation.

For detailed information about using the CLI tool, see [HSK_CLI.md](HSK_CLI.md).

## Available Scripts

- **example** - simple example illustrating implementation
- **sonos** - enhanced home theatre control for Sonos systems

## Getting Started

### Prerequisites

1. A Homey smart home hub
2. Access to
   [HomeyScript](https://homey.app/en-au/app/com.athom.homeyscript/HomeyScript/)
   app

### Installation

1. Navigate to the `./dist` directory in this repository
2. Copy the contents of your desired script
3. Create a new HomeyScript in your Homey's web interface
4. Paste the script contents and save

### Using Scripts in Flows

Once installed, call your scripts from HomeyScript flows using the HSK URL
format:

```
hsk://script-name/command?parameter1=value1&parameter2=value2
```

The script results will be available in subsequent flow cards via tags like
`script-name.command.Result`.

## Creating Your Own Scripts

📖 **[Complete Script Creation Guide →](CREATING_SCRIPTS.md)**

Want to create your own HomeyScript scripts using HSK? Check out the guide which
covers:

- Development setup and environment
- Step-by-step script creation
- Advanced features and patterns
- Testing and debugging
- Best practices and troubleshooting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

For development guidelines, see [CREATING_SCRIPTS.md](CREATING_SCRIPTS.md).

## License

This project is licensed under the MIT License - see the LICENSE file for
details.

## Support

If you encounter any issues or have questions:

1. Open an issue in this repository
2. Check the
   [HomeyScript documentation](https://athombv.github.io/com.athom.homeyscript/)
3. Visit the [Homey Community](https://community.homey.app/)

**💡 Troubleshooting tip:** If you're experiencing issues with a script, try
using the debug builds from the `./dist` directory which contain unminified,
readable code that's easier to troubleshoot in HomeyScript.
