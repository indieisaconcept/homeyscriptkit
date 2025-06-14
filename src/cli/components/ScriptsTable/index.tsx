import { Box, Text } from 'ink';

import type { HomeyScript } from '../../types';
import { formatScriptsTable } from './util/formatScriptsTable';

interface ScriptsTableProps {
  scripts: HomeyScript[];
}

export const ScriptsTable: React.FC<ScriptsTableProps> = ({ scripts }) => {
  return (
    <Box>
      <Text>{formatScriptsTable(scripts)}</Text>
    </Box>
  );
};
