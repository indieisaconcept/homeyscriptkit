import { vi } from 'vitest';

// Mock global functions that are available in Homey environment
vi.stubGlobal(
  'log',
  vi.fn(() => vi.fn())
);
vi.stubGlobal('tag', vi.fn());
vi.stubGlobal('args', []);
vi.stubGlobal('__last_executed__', new Date());
vi.stubGlobal('__ms_since_last_executed__', 1000);

// Export to satisfy TypeScript
export {};
