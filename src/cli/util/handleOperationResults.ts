// import { TerminalOutput } from './terminalOutput';
import { HomeyScript } from '../types';

export interface NormalizedOperationResults {
  results?: OperationResult[];
  summary?: {
    successful: number;
    failed: number;
  };
}

export enum OperationAction {
  CREATE = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  BACKUP = 'BACKUP',
  PULL = 'PULL',
}

export type OperationResult =
  | { script: HomeyScript; status: 'fulfilled'; action?: OperationAction }
  | {
      script: Partial<HomeyScript>;
      status: 'rejected';
      reason: unknown;
      action?: OperationAction;
    };

/**
 * Helper function to handle success/failure counts and display appropriate spinner message
 * @param options - Configuration options for handling operation results
 * @param options.results - Array of Promise Results from the operation
 * @returns Object containing success and failure counts
 */
export const handleOperationResults = ({
  results,
}: {
  results: OperationResult[];
}): NormalizedOperationResults => {
  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  return {
    results,
    summary: {
      successful,
      failed,
    },
  };
};
