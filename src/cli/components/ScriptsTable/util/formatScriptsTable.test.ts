import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HomeyScript } from '../../../types';
import { formatTable } from '../../../util/formatTable';
import { formatScriptsTable } from './formatScriptsTable';

vi.mock('../../../util/formatTable');

describe('formatScriptsTable', () => {
  const mockScripts: HomeyScript[] = [
    {
      id: 'script1',
      name: 'Test Script 1',
      version: '1.0.0',
      lastExecuted: '2024-03-20T10:00:00Z',
    },
    {
      id: 'script2',
      name: 'Test Script 2',
      version: '2.0.0',
      lastExecuted: null as unknown as string,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call formatTable with correct columns and data', () => {
    formatScriptsTable(mockScripts);

    expect(formatTable).toHaveBeenCalledWith({
      data: mockScripts,
      columns: [
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
          formatter: expect.any(Function),
        },
        {
          header: 'ID',
          key: 'id',
        },
      ],
    });
  });

  it('should handle empty scripts array', () => {
    formatScriptsTable([]);

    expect(formatTable).toHaveBeenCalledWith({
      data: [],
      columns: expect.arrayContaining([
        expect.objectContaining({ header: 'ID' }),
        expect.objectContaining({ header: 'Name' }),
        expect.objectContaining({ header: 'Version' }),
        expect.objectContaining({ header: 'Last Executed' }),
      ]),
    });
  });

  it('should format dates correctly', () => {
    const scriptWithDate: HomeyScript[] = [
      {
        id: 'script3',
        name: 'Test Script 3',
        version: '3.0.0',
        lastExecuted: '2024-03-20T15:30:00Z',
      },
    ];

    formatScriptsTable(scriptWithDate);

    // Get the first argument from the first call to `formatTable`
    const formatTableCall = vi.mocked(formatTable).mock.calls[0]?.[0];

    // Safely find the formatter for the "Last Executed" column
    const lastExecutedFormatter = formatTableCall?.columns.find(
      (col) => col.header === 'Last Executed'
    )?.formatter;

    if (!lastExecutedFormatter) {
      throw new Error('Last Executed column formatter not found');
    }

    // Expected output is based on the local timezone; adjust test if needed
    const formattedDate = new Date('2024-03-20T15:30:00Z').toLocaleString();

    expect(lastExecutedFormatter('2024-03-20T15:30:00Z')).toBe(formattedDate);
    expect(lastExecutedFormatter(null as unknown as string)).toBe('Never');
  });
});
