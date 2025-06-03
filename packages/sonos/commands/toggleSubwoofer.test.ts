import { describe, expect, it, vi } from 'vitest';

import { toggleSubwoofer } from './toggleSubwoofer';

// Mock the Sonos client
vi.mock('../client', () => ({
  default: vi.fn(() => ({
    toggleEQValue: vi
      .fn()
      .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '1' }]),
  })),
  EQType: {
    SurroundEnable: 'SurroundEnable',
    SubEnable: 'SubEnable',
  },
}));

describe('toggleSubwoofer command', () => {
  it('should execute without throwing errors', async () => {
    const params = { ip: '192.168.1.100' };

    // Should not throw
    await expect(toggleSubwoofer(params)).resolves.toBeUndefined();
  });

  it('should handle different IP addresses', async () => {
    const params = { ip: '10.0.0.50' };

    // Should not throw
    await expect(toggleSubwoofer(params)).resolves.toBeUndefined();
  });

  it('should handle error responses gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi
        .fn()
        .mockResolvedValue([new Error('Network error'), null]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle error gracefully without throwing
    await expect(toggleSubwoofer(params)).resolves.toBeUndefined();
  });

  it('should handle null result gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi.fn().mockResolvedValue([null, null]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle null result gracefully without throwing
    await expect(toggleSubwoofer(params)).resolves.toBeUndefined();
  });
});
