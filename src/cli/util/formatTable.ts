import Table from 'cli-table3';

export interface TableColumn {
  header: string;
  key: string;
  formatter?: (value: unknown) => string;
}

interface TableConfig<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn[];
}

/**
 * Format data into a table
 * @param config - Object containing data and column definitions
 * @returns Formatted table string
 */
export const formatTable = <T = Record<string, unknown>>({
  data,
  columns,
}: TableConfig<T>): string => {
  const table = new Table({
    head: columns.map((col) => col.header),
    style: {
      head: ['cyan'],
      border: ['gray'],
    },
  });

  for (const item of data) {
    const row = columns.map((col) => {
      const value = (item as Record<string, unknown>)[col.key];
      return col.formatter ? col.formatter(value) : String(value ?? '');
    });
    table.push(row);
  }

  return table.toString();
};
