import { Box, Text } from 'ink';

interface ErrorDisplayProps {
  error: Error;
  verbose?: boolean;
}

export function ErrorDisplay({ error, verbose = false }: ErrorDisplayProps) {
  return (
    <Box flexDirection="column">
      <Text color="red">Error: {error.message}</Text>
      {verbose && (error.cause as Error) && (
        <Box marginLeft={2}>
          <Text color="yellow">Cause: {String(error.cause)}</Text>
        </Box>
      )}
      {verbose && error.stack && (
        <Box marginLeft={2}>
          <Text color="gray">Stack:</Text>
          <Box marginLeft={2}>
            <Text color="gray">{error.stack}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
