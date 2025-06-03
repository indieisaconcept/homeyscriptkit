import { describe, expect, it, vi } from 'vitest';

import { toggleSurround } from './toggleSurround';

// Mock the Sonos client
vi.mock('../client', () => ({
  default: vi.fn(() => ({
    toggleEQValue: vi
      .fn()
      .mockResolvedValue([
        null,
        { EQType: 'SurroundEnable', CurrentValue: '1' },
      ]),
  })),
  EQType: {
    SurroundEnable: 'SurroundEnable',
    SubEnable: 'SubEnable',
  },
}));

describe('toggleSurround command', () => {
  it('should execute without throwing errors', async () => {
    const params = { ip: '192.168.1.100' };

    // Should not throw
    await expect(toggleSurround(params)).resolves.toBeUndefined();
  });

  it('should handle different IP addresses', async () => {
    const params = { ip: '10.0.0.50' };

    // Should not throw
    await expect(toggleSurround(params)).resolves.toBeUndefined();
  });
});
