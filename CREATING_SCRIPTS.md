# Creating Scripts with HSK

HomeyScriptKit (HSK) provides a framework for creating standardized HomeyScript
scripts with URL-like argument passing and result handling. This comprehensive
guide covers everything you need to know about developing your own scripts.

## Development Setup

### Prerequisites

1. Basic understanding of TypeScript
2. Node.js environment:
   - Install [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm):
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     ```
   - Restart your terminal

### Getting Started

1. Clone this repository

```bash
git clone https://github.com/indieisaconcept/homeyscriptkit.git
cd homeyscriptkit
```

2. Install and use the correct Node.js version

```bash
nvm install # This will install the version specified in .nvmrc
nvm use # This will switch to the project's Node.js version
```

3. Install dependencies

```bash
npm install
```

### Project Structure

```
homeyscriptkit/
├── packages/      # Source files for HomeyScripts
├── dist/          # Compiled scripts (output)
├── types/         # TypeScript type definitions
```

## Understanding the HSK Framework

### Event Object

The `event` object passed to your handler contains:

- `script` - The script name from the URL
- `command` - The command name from the URL
- `result` - The computed result tag name
- `params` - Parsed query parameters as key-value pairs

### Context Object

The `context` object provides metadata about the script execution:

- `filename` - Same as script name
- `scriptId` - Combination of script and command names
- `lastExecuted` - ISO timestamp of last execution (if available)
- `msSinceLastExecuted` - Milliseconds since last execution (if available)

### Result Handling

HSK automatically manages result tagging:

1. Before execution: Sets the tag to `null`
2. After successful execution: Sets the tag to your returned value
3. On error: Sets `script.error.Result` with error message

## Basic Script Structure

All HSK scripts follow a consistent pattern:

```typescript
import hsk, { type BaseParams, type Event } from '@hsk';

// Define your parameter types (optional but recommended)
interface MyScriptParams extends BaseParams {
  requiredParam: string;
  optionalParam?: string;
}

// Your script logic
await hsk(async (event: Event<'myCommand', MyScriptParams>) => {
  const { command, params, script, result } = event;

  // Your script implementation here
  console.log(`Executing ${command} on ${script}`);
  console.log('Parameters:', params);

  // Return any data you want to make available to subsequent flow cards
  return { success: true, message: 'Script executed successfully' };
});
```

## Step-by-Step Guide

### 1. Create Your Script Directory

Create a new directory in the `packages` folder:

```bash
mkdir packages/my-script
```

### 2. Create the Script File

Create an `index.ts` file in your new directory:

```typescript
// packages/my-script/index.ts
import hsk, { type BaseParams, type Event } from '@hsk';

interface MyScriptParams extends BaseParams {
  name: string;
  action?: string;
}

await hsk(async (event: Event<'execute', MyScriptParams>) => {
  const { params } = event;

  if (!params.name) {
    throw new Error('Name parameter is required');
  }

  const action = params.action || 'default';
  const message = `Hello ${params.name}, executing ${action} action!`;

  console.log(message);

  return {
    message,
    timestamp: new Date().toISOString(),
    success: true,
  };
});
```

### 3. Build Your Script

Run the build command to compile your script:

```bash
# For development (unminified, easier to debug)
npm run build-debug

# For production (minified, optimized)
npm run build
```

### 4. Deploy to HomeyScript

1. Navigate to the `./dist` directory
2. Copy the contents of your compiled script
3. Create a new HomeyScript in your Homey's web interface
4. Paste the script contents and save

### 5. Use Your Script in Flows

Call your script from HomeyScript flows using the HSK URL format:

```
hsk://my-script/execute?name=John&action=greet
```

This will:

- Execute the `execute` command in your `my-script` script
- Pass `name=John` and `action=greet` as parameters
- Store the result in the tag `my-script.execute.Result`

## Development Workflow

### Available NPM Scripts

- `npm run build` - Build all scripts for production (minified, optimized)
- `npm run build-debug` - Build all scripts for debugging (unminified, readable)
- `npm run watch` - Watch mode for development (unminified)
- `npm run lint` - Run ESLint
- `npm run format` - Format code using Prettier
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:watch` - Run tests in watch mode (same as `npm test`)

**💡 Pro tip:** Use `build-debug` during development and `build` for final
deployment to get the best of both worlds - readable code for debugging and
optimized code for production.

### Building Scripts

Scripts in the `packages` directory are compiled into the `dist` directory using
Rolldown, making them ready for use in HomeyScript. The build process:

1. Formats the code using Prettier
2. Runs ESLint for code quality checks
3. Cleans the `dist` directory
4. Compiles TypeScript to JavaScript
5. Bundles the code using Rolldown
6. Applies minification (production builds only)

### Build Output

The compiled scripts in the `dist` directory are ready to be copied into your
HomeyScript environment. Each script is:

- Bundled into a single file
- Optimized for HomeyScript runtime
- Compatible with the Homey environment

### Debugging Scripts

**🚀 For easier debugging, always use debug builds during development!**

HomeyScriptKit provides two build modes optimized for different scenarios:

#### Debug vs Production Builds

**Debug builds** (`npm run build-debug`):

- Preserve original variable names
- Maintain proper code formatting and indentation
- Keep readable function names
- Include comments and spacing
- Easier to debug in HomeyScript environment

**Production builds** (`npm run build`):

- Minified and optimized for size
- Ideal for deployment to production environments

#### Debugging in HomeyScript

When troubleshooting scripts directly on your Homey device:

1. **Use debug builds** - Copy scripts from `./dist` directory that were built
   with `npm run build-debug`
2. **Add logging statements** - Use `console.log()` liberally to trace execution
   flow
3. **Check HomeyScript logs** - View execution details and error messages in the
   HomeyScript interface
4. **Test incrementally** - Start with simple parameter values and gradually
   increase complexity

#### Local Development Debugging

For debugging during development:

```bash
# Watch mode for continuous rebuilding during development
npm run watch

# Run with debug output
npm run build-debug

# Check for linting issues
npm run lint
```

#### Common Debugging Strategies

1. **Parameter validation** - Always log received parameters first
2. **Step-by-step logging** - Add console.log at each major step
3. **Error boundaries** - Wrap risky operations in try-catch blocks
4. **Result verification** - Log the final result before returning

Example debugging approach:

```typescript
await hsk(async (event: Event<'debug-example', MyParams>) => {
  console.log('Received event:', event);
  console.log('Parameters:', event.params);

  try {
    const result = await someOperation(event.params);
    console.log('Operation result:', result);
    return result;
  } catch (error) {
    console.error('Operation failed:', error.message);
    throw error;
  }
});
```

### Testing

The project uses [Vitest](https://vitest.dev/) for testing, providing fast and
reliable unit testing capabilities.

#### Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (automatically re-runs when files change)
npm test
# or
npm run test:watch
```

#### Writing Tests

Tests are written using Vitest and should be placed alongside your source files
or in a dedicated `__tests__` directory. Test files should follow the naming
convention `*.test.ts` or `*.spec.ts`.

Example test structure:

```typescript
import { describe, expect, it } from 'vitest';

import { yourFunction } from './your-script';

describe('YourScript', () => {
  it('should do something', () => {
    const result = yourFunction();
    expect(result).toBe(expectedValue);
  });
});
```

#### Continuous Integration

The project includes GitHub Actions workflow that automatically:

- ✅ Runs tests on every push and pull request
- ✅ Uses the Node.js version specified in `.nvmrc`
- ✅ Runs linting checks
- ✅ Ensures code quality before merging

The CI workflow runs on both `main` and `develop` branches, ensuring code
quality and preventing regressions.

### Development Environment

#### TypeScript Configuration

The project uses TypeScript with the following key settings:

- Target: ES5
- Module: ESNext
- Strict type checking enabled
- Node.js module resolution
- ES Module interop enabled

#### Code Quality Tools

- **ESLint** - For code linting
- **Prettier** - For code formatting
- **TypeScript** - For type checking
- **lint-staged** - For pre-commit hooks

## Advanced Features

### Multiple Commands

You can handle multiple commands in a single script:

```typescript
import hsk, { type Event } from '@hsk';

const commands = {
  start: async (params: any) => {
    console.log('Starting...', params);
    return { status: 'started' };
  },

  stop: async (params: any) => {
    console.log('Stopping...', params);
    return { status: 'stopped' };
  },

  status: async (params: any) => {
    return { status: 'running', uptime: '5 minutes' };
  },
};

await hsk(async (event: Event<keyof typeof commands>) => {
  const { command, params } = event;

  if (!commands[command]) {
    throw new Error(`Unknown command: ${command}`);
  }

  return commands[command](params);
});
```

Usage:

```
hsk://my-service/start?timeout=30
hsk://my-service/stop
hsk://my-service/status
```

### Custom Result Tags

You can specify custom result tag names:

```
hsk://my-script/execute/customResult?name=John
```

This stores the result in `my-script.customResult.Result` instead of the default
`my-script.execute.Result`.

### Parameter Validation

Always validate your parameters for robust scripts:

```typescript
await hsk(async (event: Event<'process', MyParams>) => {
  const { params } = event;

  // Validate required parameters
  const required = ['deviceId', 'action'];
  const missing = required.filter((param) => !params[param]);

  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }

  // Your script logic here
  return processDevice(params.deviceId, params.action);
});
```

## Best Practices

### 1. Type Safety

Always define parameter interfaces for better development experience:

```typescript
interface DeviceParams extends BaseParams {
  deviceId: string;
  action: 'on' | 'off' | 'toggle';
  brightness?: string;
}
```

### 2. Error Handling

Use proper error handling and meaningful error messages:

```typescript
await hsk(async (event: Event<'control', DeviceParams>) => {
  try {
    const result = await controlDevice(event.params);
    return result;
  } catch (error) {
    throw new Error(`Device control failed: ${error.message}`);
  }
});
```

### 3. Parameter Validation

Validate all required parameters before processing:

```typescript
const validateParams = (params: any, required: string[]) => {
  const missing = required.filter((param) => !params[param]);
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
};
```

### 4. Documentation

Comment your code and document expected parameters:

```typescript
/**
 * Controls a smart device
 *
 * Required parameters:
 * - deviceId: The device identifier
 * - action: The action to perform (on/off/toggle)
 *
 * Optional parameters:
 * - brightness: Brightness level (0-100) for dimmable devices
 */
```

### 5. Testing

Write tests for your script logic:

```typescript
// my-script.test.ts
import { describe, expect, it } from 'vitest';

import { myScriptFunction } from './index';

describe('MyScript', () => {
  it('should process parameters correctly', () => {
    const result = myScriptFunction({ name: 'test' });
    expect(result.success).toBe(true);
  });
});
```

### 6. Debugging

Follow the comprehensive debugging strategies outlined in the
[Debugging Scripts](#debugging-scripts) section. Key points:

- Always use `npm run build-debug` during development
- Add strategic `console.log()` statements to trace execution
- Test with simple parameters first, then increase complexity
- Use the HomeyScript logs to view execution details and errors

## Common Patterns

### HTTP API Integration

```typescript
await hsk(async (event: Event<'fetch', { url: string; method?: string }>) => {
  const { url, method = 'GET' } = event.params;

  const response = await fetch(url, { method });
  const data = await response.json();

  return {
    status: response.status,
    data,
    timestamp: new Date().toISOString(),
  };
});
```

### Conditional Logic

```typescript
await hsk(async (event: Event<'process', ProcessParams>) => {
  const { params } = event;

  if (params.mode === 'automatic') {
    return await automaticProcess(params);
  } else if (params.mode === 'manual') {
    return await manualProcess(params);
  } else {
    throw new Error('Invalid mode. Use "automatic" or "manual"');
  }
});
```

## Examples

### Simple Script

Check out `packages/example/` for a basic greeting script that demonstrates:

- Parameter handling
- Input validation
- Result returning

### Complex Script

Check out `packages/sonos/` for a more advanced script that shows:

- Multiple commands
- External API integration
- Modular code organization
- Comprehensive error handling

## Troubleshooting

### Common Issues

1. **Script not found**: Ensure the script name in the URL matches the name of
   your HomeyScript
2. **Parameters not received**: Check URL encoding and parameter names
3. **Result not available**: Verify the result tag name and check for execution
   errors
4. **Build errors**: Run `npm run lint` to check for code issues

### Getting Help

For detailed debugging strategies and techniques, see the
[Debugging Scripts](#debugging-scripts) section above.

If you're still experiencing issues:

1. Check the HomeyScript logs for execution details
2. Test with minimal parameter sets first
3. Verify your script builds without errors locally
4. Review the [examples](#examples) for reference implementations

## Next Steps

Once you've created your script:

1. Test it thoroughly with different parameter combinations
2. Write unit tests if your script has complex logic
3. Consider adding TypeScript documentation
4. Share your script with the community if it might be useful to others

For more advanced topics, explore the existing scripts in the `packages/`
directory and refer to the main README for development workflows and testing
strategies.
