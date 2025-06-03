import { describe, expect, it, vi } from 'vitest';

import { toggleHomeTheatre } from './toggleHomeTheatre';

// Mock the Sonos client
vi.mock('../client', () => ({
  default: vi.fn(() => ({
    toggleEQValue: vi
      .fn()
      .mockResolvedValue([
        null,
        { EQType: 'SurroundEnable', CurrentValue: '1' },
      ]),
    setEQValue: vi
      .fn()
      .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '1' }]),
  })),
  EQType: {
    SurroundEnable: 'SurroundEnable',
    SubEnable: 'SubEnable',
  },
}));

describe('toggleHomeTheatre command', () => {
  it('should execute without throwing errors', async () => {
    const params = { ip: '192.168.1.100' };

    // Should not throw
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should handle different IP addresses', async () => {
    const params = { ip: '10.0.0.50' };

    // Should not throw
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should handle surround toggle error gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi
        .fn()
        .mockResolvedValue([new Error('Network error'), null]),
      setEQValue: vi
        .fn()
        .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '1' }]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle surround toggle error gracefully without throwing
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should handle null surround result gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi.fn().mockResolvedValue([null, null]),
      setEQValue: vi
        .fn()
        .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '1' }]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle null surround result gracefully without throwing
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should handle surround result without CurrentValue gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi
        .fn()
        .mockResolvedValue([null, { EQType: 'SurroundEnable' }]),
      setEQValue: vi
        .fn()
        .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '1' }]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle missing CurrentValue gracefully without throwing
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should handle subwoofer set error gracefully', async () => {
    // Override the mock for this test
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi
        .fn()
        .mockResolvedValue([
          null,
          { EQType: 'SurroundEnable', CurrentValue: '1' },
        ]),
      setEQValue: vi
        .fn()
        .mockResolvedValue([new Error('Subwoofer error'), null]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle subwoofer set error gracefully without throwing
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });

  it('should work with both enabled and disabled states', async () => {
    // Test with surround disabled (value '0')
    const mockClient = vi.fn(() => ({
      toggleEQValue: vi
        .fn()
        .mockResolvedValue([
          null,
          { EQType: 'SurroundEnable', CurrentValue: '0' },
        ]),
      setEQValue: vi
        .fn()
        .mockResolvedValue([null, { EQType: 'SubEnable', CurrentValue: '0' }]),
    }));

    vi.doMock('../client', () => ({
      default: mockClient,
      EQType: {
        SurroundEnable: 'SurroundEnable',
        SubEnable: 'SubEnable',
      },
    }));

    const params = { ip: '192.168.1.100' };

    // Should handle disabled state without throwing
    await expect(toggleHomeTheatre(params)).resolves.toBeUndefined();
  });
});
