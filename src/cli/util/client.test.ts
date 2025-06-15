import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ClientConfig, HomeyScriptClient } from './client';

describe('HomeyScriptClient', () => {
  const mockConfig: ClientConfig = {
    host: 'http://localhost:3000',
    token: 'test-token',
  };

  const mockScript = {
    id: 'test-id',
    name: 'Test Script',
    code: 'console.log("test");',
  };

  const mockHttpClient = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      new HomeyScriptClient({ ...mockConfig, httpClient: mockHttpClient });
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should handle trailing slash in host URL', () => {
      const configWithSlash: ClientConfig = {
        ...mockConfig,
        host: 'http://localhost:3000/',
        httpClient: mockHttpClient,
      };
      new HomeyScriptClient(configWithSlash);
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should throw error if no host is provided', () => {
      const { host: _host, ...configWithoutHost } = mockConfig;
      const invalidConfig = {
        ...configWithoutHost,
        httpClient: mockHttpClient,
      } as unknown as ClientConfig;
      expect(() => new HomeyScriptClient(invalidConfig)).toThrow(
        'Host is required'
      );
    });

    it('should throw error if no token is provided', () => {
      const { token: _token, ...configWithoutToken } = mockConfig;
      const invalidConfig = {
        ...configWithoutToken,
        httpClient: mockHttpClient,
      } as unknown as ClientConfig;
      expect(() => new HomeyScriptClient(invalidConfig)).toThrow(
        'Token is required'
      );
    });
  });

  describe('listScripts', () => {
    it('should return array of scripts', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const mockResponse = {
        script1: mockScript,
        script2: { ...mockScript, id: 'script2' },
      };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.listScripts();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockScript);
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
    });

    it('should handle empty response', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await client.listScripts();
      expect(result).toHaveLength(0);
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
    });

    it('should handle API error', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(client.listScripts()).rejects.toThrow(
        'HTTP error! status: 500'
      );
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
    });

    it('should resolve full script details when resolve option is true', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const mockResponse = {
        script1: { id: 'script1', name: 'Test Script 1' },
        script2: { id: 'script2', name: 'Test Script 2' },
      };
      const fullScript1 = {
        id: 'script1',
        name: 'Test Script 1',
        code: 'console.log("test1");',
      };
      const fullScript2 = {
        id: 'script2',
        name: 'Test Script 2',
        code: 'console.log("test2");',
      };

      mockHttpClient
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(fullScript1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(fullScript2),
        });

      const result = await client.listScripts({ resolve: true });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(fullScript1);
      expect(result[1]).toEqual(fullScript2);

      expect(mockHttpClient).toHaveBeenCalledTimes(3);
      expect(mockHttpClient).toHaveBeenNthCalledWith(
        1,
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
      expect(mockHttpClient).toHaveBeenNthCalledWith(
        2,
        'http://localhost:3000/api/app/com.athom.homeyscript/script/script1',
        expect.any(Object)
      );
      expect(mockHttpClient).toHaveBeenNthCalledWith(
        3,
        'http://localhost:3000/api/app/com.athom.homeyscript/script/script2',
        expect.any(Object)
      );
    });
  });

  describe('getScript', () => {
    it('should return a single script', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScript),
      });

      const result = await client.getScript('test-id');
      expect(result).toEqual(mockScript);
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/test-id',
        expect.any(Object)
      );
    });

    it('should handle non-existent script', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(client.getScript('non-existent')).rejects.toThrow(
        'HTTP error! status: 404'
      );
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/non-existent',
        expect.any(Object)
      );
    });

    it('should handle invalid script ID', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      await expect(client.getScript('')).rejects.toThrow('ID is required');
      expect(mockHttpClient).not.toHaveBeenCalled();
    });
  });

  describe('createScript', () => {
    it('should create a new script', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const newScript = {
        name: 'New Script',
        code: 'console.log("new");',
      };

      // Mock listScripts to return empty list (no duplicates)
      mockHttpClient
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...newScript, id: 'new-id' }),
        });

      const result = await client.createScript(newScript);
      expect(result).toEqual({ ...newScript, id: 'new-id' });
      expect(mockHttpClient).toHaveBeenCalledTimes(2);
      expect(mockHttpClient).toHaveBeenNthCalledWith(
        1,
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
      expect(mockHttpClient).toHaveBeenNthCalledWith(
        2,
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newScript),
        })
      );
    });

    it('should handle missing required fields', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const invalidScript = {
        name: 'Invalid Script',
      } as { name: string; code?: string };

      await expect(client.createScript(invalidScript)).rejects.toThrow(
        'code is required'
      );
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should handle duplicate script name', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const newScript = {
        name: 'Existing Script',
        code: 'console.log("new");',
      };

      // Mock listScripts to return a script with the same name
      mockHttpClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            existing: {
              id: 'existing-id',
              name: 'Existing Script',
            },
          }),
      });

      await expect(client.createScript(newScript)).rejects.toThrow(
        'A script with name "Existing Script" already exists'
      );

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script',
        expect.any(Object)
      );
    });
  });

  describe('updateScript', () => {
    it('should update an existing script', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const updatedScript = {
        id: 'test-id',
        name: 'Updated Script',
        code: 'console.log("updated");',
      };

      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedScript),
      });

      const result = await client.updateScript(updatedScript);
      expect(result).toEqual(updatedScript);
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/test-id',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedScript),
        })
      );
    });

    it('should handle non-existent script update', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const updatedScript = {
        id: 'non-existent',
        name: 'Updated Script',
        code: 'console.log("updated");',
      };

      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(client.updateScript(updatedScript)).rejects.toThrow(
        'HTTP error! status: 404'
      );
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/non-existent',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedScript),
        })
      );
    });

    it('should handle missing required fields', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      const invalidScript = {
        id: 'test-id',
        name: 'Invalid Script',
      } as { id: string; name: string; code?: string };

      await expect(client.updateScript(invalidScript)).rejects.toThrow(
        'code is required'
      );
      expect(mockHttpClient).not.toHaveBeenCalled();
    });
  });

  describe('deleteScript', () => {
    it('should delete a script', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(client.deleteScript('test-id')).resolves.not.toThrow();
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/test-id',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle non-existent script deletion', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(client.deleteScript('non-existent')).rejects.toThrow(
        'HTTP error! status: 404'
      );
      expect(mockHttpClient).toHaveBeenCalledWith(
        'http://localhost:3000/api/app/com.athom.homeyscript/script/non-existent',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle invalid script ID', async () => {
      const client = new HomeyScriptClient({
        ...mockConfig,
        httpClient: mockHttpClient,
      });
      await expect(client.deleteScript('')).rejects.toThrow('ID is required');
      expect(mockHttpClient).not.toHaveBeenCalled();
    });
  });
});
