import { HomeyScript } from '../../../types';
import type { TableColumn } from '../../../util/formatTable';
import { formatTable } from '../../../util/formatTable';

export const formatScriptsTable = (scripts: HomeyScript[]): string => {
  const columns: TableColumn[] = [
    {
      header: 'Name',
      key: 'name',
    },
    {
      header: 'Version',
      key: 'version',
    },
    {
      header: 'Last Executed',
      key: 'lastExecuted',
      formatter: (value) =>
        value ? new Date(value as string).toLocaleString() : 'Never',
    },
    {
      header: 'ID',
      key: 'id',
    },
  ];

  return formatTable({ data: scripts, columns });
};
