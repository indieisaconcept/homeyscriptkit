import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OperationAction,
  OperationResult,
  handleOperationResults,
} from './handleOperationResults';

describe('handleOperationResults', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle all successful operations', () => {
    const results = [
      {
        status: 'fulfilled',
        script: {
          id: 'test1',
          name: 'Test Script 1',
          version: '1.0.0',
        },
        action: OperationAction.CREATE,
      },
      {
        status: 'fulfilled',
        script: {
          id: 'test2',
          name: 'Test Script 2',
          version: '1.0.0',
        },
        action: OperationAction.CREATE,
      },
    ] as OperationResult[];

    const result = handleOperationResults({ results });

    expect(result).toEqual({
      summary: {
        successful: 2,
        failed: 0,
      },
      results,
    });
  });

  it('should handle mixed success and failure operations', () => {
    const results: OperationResult[] = [
      {
        status: 'fulfilled',
        script: {
          id: 'test1',
          name: 'Test Script 1',
          version: '1.0.0',
        },
        action: OperationAction.CREATE,
      },
      {
        status: 'rejected',
        script: {
          id: 'test2',
          name: 'Test Script 2',
          version: '1.0.0',
        },
        reason: new Error('Failed'),
        action: OperationAction.CREATE,
      },
    ];

    const result = handleOperationResults({ results });

    expect(result).toEqual({
      summary: {
        successful: 1,
        failed: 1,
      },
      results,
    });
  });

  it('should handle all failed operations', () => {
    const results: OperationResult[] = [
      {
        status: 'rejected',
        script: {
          id: 'test1',
          name: 'Test Script 1',
          version: '1.0.0',
        },
        reason: new Error('Failed 1'),
        action: OperationAction.CREATE,
      },
      {
        status: 'rejected',
        script: {
          id: 'test2',
          name: 'Test Script 2',
          version: '1.0.0',
        },
        reason: new Error('Failed 2'),
        action: OperationAction.CREATE,
      },
    ];

    const result = handleOperationResults({ results });

    expect(result).toEqual({
      summary: {
        successful: 0,
        failed: 2,
      },
      results,
    });
  });

  it('should handle empty results array', () => {
    const results: OperationResult[] = [];

    const result = handleOperationResults({ results });

    expect(result).toEqual({
      summary: {
        successful: 0,
        failed: 0,
      },
      results,
    });
  });
});
