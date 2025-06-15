import { Badge, UnorderedList } from '@inkjs/ui';
import { Box, Text } from 'ink';

import type { NormalizedOperationResults } from '../util/handleOperationResults';

interface ScriptDetails {
  name: string;
  id: string;
}

interface OperationResultsDisplayProps {
  results: NormalizedOperationResults;
}

export function OperationResultsDisplay({
  results,
}: OperationResultsDisplayProps) {
  if (!results || !results.results) {
    return null;
  }

  // Group results by action and status
  const groupedResults = results.results.reduce(
    (acc, result) => {
      const action = result.action || 'UNKNOWN';
      const status = result.status;
      const scriptName = result.script.name || 'Unknown';
      const scriptId = result.script.id || 'Unknown';
      const scriptDetails: ScriptDetails = {
        name: scriptName,
        id: scriptId,
      };

      if (!acc[action]) {
        acc[action] = {
          fulfilled: { count: 0, scripts: [] },
          rejected: { count: 0, scripts: [] },
        };
      }

      acc[action][status].count++;
      acc[action][status].scripts.push(scriptDetails);
      return acc;
    },
    {} as Record<
      string,
      {
        fulfilled: { count: number; scripts: ScriptDetails[] };
        rejected: { count: number; scripts: ScriptDetails[] };
      }
    >
  );

  const renderSummary = (
    status: 'fulfilled' | 'rejected',
    count: number,
    scripts: ScriptDetails[]
  ) => {
    if (count === 0) return null;

    const color = status === 'fulfilled' ? 'green' : 'red';
    const label = status === 'fulfilled' ? 'SUCCESSFUL' : 'FAILED';

    return (
      <Box flexDirection="column" gap={1}>
        <Badge color={color}>
          {count} {label}
        </Badge>
        <Box marginLeft={2}>
          <UnorderedList>
            {scripts.map((script) => (
              <UnorderedList.Item key={script.id}>
                <Text>
                  {script.name} <Text dimColor>({script.id})</Text>
                </Text>
              </UnorderedList.Item>
            ))}
          </UnorderedList>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column" gap={1}>
        {Object.entries(groupedResults).map(([action, counts]) => (
          <Box key={action} flexDirection="column" gap={1}>
            <Box flexDirection="column" gap={1}>
              {renderSummary(
                'fulfilled',
                counts.fulfilled.count,
                counts.fulfilled.scripts
              )}
              {renderSummary(
                'rejected',
                counts.rejected.count,
                counts.rejected.scripts
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
