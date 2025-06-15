import { select } from '@inquirer/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getHomey, getSession } from './getSession';

interface MockUser {
  getHomeys: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => {
  const homeyUser: MockUser = {
    getHomeys: vi.fn(),
  };

  const AthomCloudAPI = vi.fn(() => ({
    getAuthenticatedUser: vi.fn().mockResolvedValue(homeyUser),
    authenticate: vi.fn().mockResolvedValue({ __token: 'test-token' }),
  }));

  return {
    AthomCloudAPI,
    homeyUser,
  };
});

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    stopAndPersist: vi.fn().mockReturnThis(),
  })),
}));

vi.mock('@inquirer/prompts');

vi.mock('homey-api', () => ({
  AthomCloudAPI: mocks.AthomCloudAPI,
}));

describe('getSession', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    https: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle missing client credentials', async () => {
    const invalidConfig = {
      clientId: '',
      clientSecret: '',
      https: false,
    };

    await expect(getSession(invalidConfig)).rejects.toThrow();
  });

  it('should successfully authenticate and return session for single Homey', async () => {
    const mockHomey = {
      id: 'test-homey-id',
      name: 'Test Homey',
      localUrl: 'http://test.local',
      localUrlSecure: 'https://test.local',
      authenticate: vi.fn().mockResolvedValue({ __token: 'test-token' }),
    };

    mocks.homeyUser.getHomeys.mockResolvedValue([mockHomey]);

    const result = await getSession(mockConfig);

    expect(result).toEqual({
      host: 'http://test.local',
      token: 'test-token',
    });

    expect(mockHomey.authenticate).toHaveBeenCalled();
  });

  it('should prompt for Homey selection when multiple Homeys are available', async () => {
    const mockHomey = {
      id: 'test-homey-id',
      name: 'Test Homey',
      localUrl: 'http://test.local',
      localUrlSecure: 'https://test.local',
      authenticate: vi.fn().mockResolvedValue({ __token: 'test-token' }),
    };

    const mockHomeys = [
      mockHomey,
      {
        ...mockHomey,
        id: 'test-homey-id-2',
        name: 'Test Homey 2',
      },
    ];

    mocks.homeyUser.getHomeys.mockResolvedValue(mockHomeys);
    vi.mocked(select).mockResolvedValue(mockHomey);

    const result = await getSession(mockConfig);

    expect(vi.mocked(select)).toHaveBeenCalledWith(
      {
        message: 'Select Homey',
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Test Homey'),
            value: mockHomey,
          }),
        ]),
      },
      {
        clearPromptOnDone: true,
      }
    );
    expect(result).toEqual({
      host: 'http://test.local',
      token: 'test-token',
    });
  });

  it('should use secure URL when https is enabled', async () => {
    const mockHomey = {
      id: 'test-homey-id',
      name: 'Test Homey',
      localUrl: 'http://test.local',
      localUrlSecure: 'https://test.local',
      authenticate: vi.fn().mockResolvedValue({ __token: 'test-token' }),
    };

    mocks.homeyUser.getHomeys.mockResolvedValue([mockHomey]);
    const result = await getSession({ ...mockConfig, https: true });

    expect(result).toEqual({
      host: 'https://test.local',
      token: 'test-token',
    });
  });

  it('should throw error when no Homey is selected', async () => {
    mocks.homeyUser.getHomeys.mockResolvedValue([]);

    await expect(getSession(mockConfig)).rejects.toThrow(
      new Error('Authentication failed', {
        cause: new Error('No Homey selected'),
      })
    );
  });
  it('should throw error when Homey authentication fails', async () => {
    const error = new Error('Homey auth failed');

    mocks.homeyUser.getHomeys.mockResolvedValue([
      {
        id: 'test-homey-id',
        name: 'Test Homey',
        localUrl: 'http://test.local',
        localUrlSecure: 'https://test.local',
        authenticate: vi.fn().mockRejectedValue(error),
      },
    ]);

    await expect(getSession(mockConfig)).rejects.toThrow(
      new Error('Authentication failed', {
        cause: error,
      })
    );
  });
});

describe('getHomey', () => {
  const mockHomeys = [
    {
      id: '1',
      name: 'Homey 1',
      localUrl: 'http://test.local',
      localUrlSecure: 'https://test.local',
      authenticate: vi.fn(),
    },
    {
      id: '2',
      name: 'Homey 2',
      localUrl: 'http://test.local',
      localUrlSecure: 'https://test.local',
      authenticate: vi.fn(),
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should prompt user to select a Homey', async () => {
    const selectedHomey = mockHomeys[0];
    vi.mocked(select).mockResolvedValue(selectedHomey);

    const result = await getHomey(mockHomeys);

    expect(vi.mocked(select)).toHaveBeenCalledWith(
      {
        message: 'Select Homey',
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Homey 1'),
            value: mockHomeys[0],
          }),
          expect.objectContaining({
            name: expect.stringContaining('Homey 2'),
            value: mockHomeys[1],
          }),
        ]),
      },
      {
        clearPromptOnDone: true,
      }
    );
    expect(result).toBe(selectedHomey);
  });
});
