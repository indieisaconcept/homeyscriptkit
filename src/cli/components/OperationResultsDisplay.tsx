import { Badge, UnorderedList } from '@inkjs/ui';
import { Box, Text } from 'ink';

import type { NormalizedOperationResults } from '../util/handleOperationResults';

interface ScriptDetails {
  name: string;
  id: string;
  action?: string;
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

  // Group results by status
  const groupedResults = results.results.reduce(
    (acc, result) => {
      const status = result.status;
      const scriptName = result.script.name || 'Unknown';
      const scriptId = result.script.id || 'Unknown';
      const action = result.action || 'UNKNOWN';
      const scriptDetails: ScriptDetails = {
        name: scriptName,
        id: scriptId,
        action,
      };

      if (!acc[status]) {
        acc[status] = {
          count: 0,
          scripts: [],
        };
      }

      acc[status].count++;
      acc[status].scripts.push(scriptDetails);
      return acc;
    },
    {} as Record<
      'fulfilled' | 'rejected',
      {
        count: number;
        scripts: ScriptDetails[];
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
                  {script.name} ({script.action}){' '}
                  <Text dimColor>({script.id})</Text>
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
        {renderSummary(
          'fulfilled',
          groupedResults.fulfilled?.count || 0,
          groupedResults.fulfilled?.scripts || []
        )}
        {renderSummary(
          'rejected',
          groupedResults.rejected?.count || 0,
          groupedResults.rejected?.scripts || []
        )}
      </Box>
    </Box>
  );
}
