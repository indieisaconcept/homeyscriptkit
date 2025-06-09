import { describe, expect, it } from 'vitest';

import type { TableColumn } from './formatTable';
import { formatTable } from './formatTable';

describe('formatTable', () => {
  interface TestData {
    name: string;
    age: number | null;
    active: boolean | undefined;
    date?: string;
  }

  const testData: TestData[] = [
    {
      name: 'John Doe',
      age: 30,
      active: true,
      date: '2024-03-20T10:00:00Z',
    },
    {
      name: 'Jane Smith',
      age: 25,
      active: false,
    },
  ];

  const defaultColumns: TableColumn<TestData>[] = [
    { header: 'Name', key: 'name' },
    { header: 'Age', key: 'age' },
    { header: 'Active', key: 'active' },
    {
      header: 'Last Updated',
      key: 'date',
      formatter: (value) => {
        if (typeof value === 'string') {
          return new Date(value).toLocaleString();
        }
        return 'Never';
      },
    },
  ];

  it('should format data with default columns', () => {
    const result = formatTable({ data: testData, columns: defaultColumns });

    expect(result).toContain('Name');
    expect(result).toContain('Age');
    expect(result).toContain('Active');
    expect(result).toContain('Last Updated');
    expect(result).toContain('John Doe');
    expect(result).toContain('30');
    expect(result).toContain('true');
    expect(result).toContain('false');
    expect(result).toContain('Never');
  });

  it('should handle empty data array', () => {
    const result = formatTable({ data: [], columns: defaultColumns });

    expect(result).toContain('Name');
    expect(result).toContain('Age');
    expect(result).toContain('Active');
    expect(result).toContain('Last Updated');
    expect(result).not.toContain('John Doe');
  });

  it('should apply custom formatters', () => {
    const columns: TableColumn<TestData>[] = [
      { header: 'Name', key: 'name' },
      {
        header: 'Status',
        key: 'active',
        formatter: (value) => {
          if (typeof value === 'boolean') {
            return value ? '✅' : '❌';
          }
          return '❓';
        },
      },
    ];

    const result = formatTable({ data: testData, columns });

    expect(result).toContain('Name');
    expect(result).toContain('Status');
    expect(result).toContain('John Doe');
    expect(result).toContain('✅');
    expect(result).toContain('❌');
  });

  it('should handle null/undefined values', () => {
    const data: TestData[] = [{ name: 'Test', age: null, active: undefined }];

    const result = formatTable({ data, columns: defaultColumns });

    expect(result).toContain('Test');
    expect(result).toContain('');
  });

  it('should apply custom table options', () => {
    const options = {
      style: {
        head: ['red'],
        border: ['blue'],
      },
    };

    const result = formatTable({
      data: testData,
      columns: defaultColumns,
      options,
    });

    // Note: We can't easily test the actual colors in the output
    // but we can verify the table structure is maintained
    expect(result).toContain('Name');
    expect(result).toContain('Age');
    expect(result).toContain('Active');
    expect(result).toContain('Last Updated');
  });

  it('should handle different data types', () => {
    interface MixedData {
      text: string;
      number: number;
      boolean: boolean;
      date: Date;
      array: string[];
    }

    const mixedData: MixedData[] = [
      {
        text: 'Test',
        number: 42,
        boolean: true,
        date: new Date('2024-03-20'),
        array: ['a', 'b', 'c'],
      },
    ];

    const columns: TableColumn<MixedData>[] = [
      { header: 'Text', key: 'text' },
      { header: 'Number', key: 'number' },
      { header: 'Boolean', key: 'boolean' },
      {
        header: 'Date',
        key: 'date',
        formatter: (value) => {
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }
          return String(value);
        },
      },
      {
        header: 'Array',
        key: 'array',
        formatter: (value) => {
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          return String(value);
        },
      },
    ];

    const result = formatTable({ data: mixedData, columns });

    expect(result).toContain('Test');
    expect(result).toContain('42');
    expect(result).toContain('true');
    expect(result).toContain('3/20/2024');
    expect(result).toContain('a, b, c');
  });
});
