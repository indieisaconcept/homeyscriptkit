import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import createSonosClient, { EQType } from './client';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Sonos Client', () => {
  const testIP = '192.168.1.100';
  let client: ReturnType<typeof createSonosClient>;

  beforeEach(() => {
    client = createSonosClient({ ip: testIP });
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getEQValue', () => {
    it('should successfully get surround enable value', async () => {
      const mockResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>1</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      });

      const [error, result] = await client.getEQValue(EQType.SurroundEnable);

      expect(error).toBeNull();
      expect(result).toEqual({
        EQType: EQType.SurroundEnable,
        CurrentValue: '1',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `http://${testIP}:1400/MediaRenderer/RenderingControl/Control`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Host: `${testIP}:1400`,
            SOAPACTION: 'urn:schemas-upnp-org:service:RenderingControl:1#GetEQ',
            'Content-Type': 'text/xml; charset="utf-8"',
          }),
        })
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const [error, result] = await client.getEQValue(EQType.SurroundEnable);

      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toContain('HTTP error! status: 500');
      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const [error, result] = await client.getEQValue(EQType.SurroundEnable);

      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Network error');
      expect(result).toBeNull();
    });

    it('should handle response without CurrentValue', async () => {
      const mockResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      });

      const [error, result] = await client.getEQValue(EQType.SubEnable);

      expect(error).toBeNull();
      expect(result).toEqual({
        EQType: EQType.SubEnable,
        CurrentValue: undefined,
      });
    });
  });

  describe('setEQValue', () => {
    it('should successfully set EQ value and return current value', async () => {
      // Mock the SET request (no response body needed)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      // Mock the subsequent GET request
      const getResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>0</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(getResponse),
      });

      const [error, result] = await client.setEQValue(
        EQType.SurroundEnable,
        '0'
      );

      expect(error).toBeNull();
      expect(result).toEqual({
        EQType: EQType.SurroundEnable,
        CurrentValue: '0',
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle SET request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const [error, result] = await client.setEQValue(
        EQType.SurroundEnable,
        '1'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toContain('HTTP error! status: 400');
      expect(result).toBeNull();
    });
  });

  describe('toggleEQValue', () => {
    it('should toggle from 1 to 0', async () => {
      // Mock GET request returning current value of 1
      const getCurrentResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>1</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(getCurrentResponse),
      });

      // Mock SET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      // Mock GET request after SET returning new value of 0
      const getNewResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>0</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(getNewResponse),
      });

      const [error, result] = await client.toggleEQValue(EQType.SurroundEnable);

      expect(error).toBeNull();
      expect(result).toEqual({
        EQType: EQType.SurroundEnable,
        CurrentValue: '0',
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should toggle from 0 to 1', async () => {
      // Mock GET request returning current value of 0
      const getCurrentResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>0</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(getCurrentResponse),
      });

      // Mock SET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      // Mock GET request after SET returning new value of 1
      const getNewResponse = `
        <?xml version="1.0"?>
        <s:Envelope>
          <s:Body>
            <u:GetEQResponse>
              <CurrentValue>1</CurrentValue>
            </u:GetEQResponse>
          </s:Body>
        </s:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(getNewResponse),
      });

      const [error, result] = await client.toggleEQValue(EQType.SubEnable);

      expect(error).toBeNull();
      expect(result).toEqual({
        EQType: EQType.SubEnable,
        CurrentValue: '1',
      });
    });

    it('should handle errors during toggle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const [error, result] = await client.toggleEQValue(EQType.SurroundEnable);

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });
  });

  describe('createSonosClient', () => {
    it('should create client with correct IP', () => {
      const testClient = createSonosClient({ ip: '192.168.1.200' });

      expect(testClient).toHaveProperty('getEQValue');
      expect(testClient).toHaveProperty('setEQValue');
      expect(testClient).toHaveProperty('toggleEQValue');
    });
  });
});
