/// <reference lib="dom" />

type Result<T> = [Error | null, T | null];

export enum EQType {
  SurroundEnable = 'SurroundEnable',
  SubEnable = 'SubEnable',
}

interface IEQResponse {
  EQType: EQType;
  CurrentValue?: string;
}

/**
 * Creates a SOAP action to set an EQ property value
 *
 * @param {string} EQType - The EQ property to change (e.g. 'SurroundEnable', 'SubEnable')
 * @param {unknown} value - The desired value for the EQ property (typically 0 or 1)
 * @returns {string} The formatted SOAP action XML string
 */
const createSetEQAction = (EQType: string, value: string): string => `
<u:SetEQ xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
  <InstanceID>0</InstanceID>
  <EQType>${EQType}</EQType>
  <DesiredValue>${value}</DesiredValue>
</u:SetEQ>`;

/**
 * Creates a SOAP action to get an EQ property value
 *
 * @param {string} EQType - The EQ property to request (e.g. 'SurroundEnable', 'SubEnable')
 * @returns {string} The formatted SOAP action XML string
 */
const createGetEQAction = (EQType: string): string => `
<u:GetEQ xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
  <InstanceID>0</InstanceID>
  <EQType>${EQType}</EQType>
</u:GetEQ>
`;

/**
 * Creates a SOAP envelope wrapping the provided action body
 *
 * @param {string} [actionBody=''] - The SOAP action body to wrap
 * @returns {string} The complete SOAP envelope XML string
 */
const createSoapEnvelope = (actionBody = ''): string => `
<?xml version="1.0" encoding="utf-8"?>
  <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>${actionBody}</s:Body>
</s:Envelope>
`;

interface RequestOptions {
  url: string;
  content: string;
  headers: {
    host: string;
    soapaction: string;
  };
}

/**
 * Makes a SOAP request to the Sonos API
 *
 * @param {RequestOptions} options - The request configuration
 * @param {string} options.url - The endpoint URL path
 * @param {string} options.content - The SOAP action content
 * @param {object} options.headers - Request headers
 * @param {string} options.headers.host - The Sonos device IP address
 * @param {string} options.headers.soapaction - The SOAP action identifier
 * @returns {Promise<Result<string>>}
 */
const request = async (options: RequestOptions): Promise<Result<string>> => {
  try {
    const response = await fetch(
      `http://${options.headers.host}:1400${options.url}`,
      {
        method: 'POST',
        headers: {
          Host: `${options.headers.host}:1400`,
          SOAPACTION: `urn:schemas-upnp-org:service:${options.headers.soapaction}`,
          'Content-Type': 'text/xml; charset="utf-8"',
        },
        body: createSoapEnvelope(options.content).replace(/\n/g, ''),
      }
    );

    if (!response.ok) {
      return [new Error(`HTTP error! status: ${response.status}`), null];
    }

    const text = await response.text();
    return [null, text];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

/**
 * Toggles an EQ value between 0 and 1
 *
 * @param {{ ip: string }} options - Options containing the ip address
 * @param {EQType} EQType - The EQ property to toggle
 * @returns {Promise<Result<IEQResponse>>}
 */
const toggleEQValue = async (
  options: { ip: string },
  EQType: EQType
): Promise<Result<IEQResponse>> => {
  try {
    const [err, result] = await getEQValue(options, EQType);
    if (err) return [err, null];

    const newValue = +(result?.CurrentValue || '') ? 0 : 1;
    return setEQValue(options, EQType, String(newValue));
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

/**
 * Retrieves the current value of an EQ property
 *
 * @param {{ ip: string }} options - Options containing the ip address
 * @param {EQType} EQType - The EQ property to retrieve
 * @returns {Promise<Result<IEQResponse>>}
 */
const getEQValue = async (
  options: { ip: string },
  EQType: EQType
): Promise<Result<IEQResponse>> => {
  try {
    const [err, response] = await request({
      url: '/MediaRenderer/RenderingControl/Control',
      content: createGetEQAction(EQType),
      headers: {
        host: options.ip,
        soapaction: 'RenderingControl:1#GetEQ',
      },
    });

    if (err) return [err, null];
    if (!response) return [new Error('No response received'), null];

    const currentValue: RegExpExecArray | null =
      /<CurrentValue>(.*?)<\/CurrentValue>/gi.exec(response);

    return [
      null,
      {
        EQType,
        CurrentValue: currentValue?.[1],
      } as IEQResponse,
    ];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

/**
 * Sets a specific value for an EQ property
 *
 * @param {{ ip: string }} options - Options containing the ip address
 * @param {EQType} EQType - The EQ property to set
 * @param {unknown} value - The value to set (typically 0 or 1)
 * @returns {Promise<Result<IEQResponse>>}
 */
const setEQValue = async (
  options: { ip: string },
  EQType: EQType,
  value: string
): Promise<Result<IEQResponse>> => {
  try {
    const [err] = await request({
      url: '/MediaRenderer/RenderingControl/Control',
      content: createSetEQAction(EQType, value),
      headers: {
        host: options.ip,
        soapaction: 'RenderingControl:1#SetEQ',
      },
    });

    if (err) return [err, null];

    return getEQValue(options, EQType);
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

/**
 * Creates a Sonos client instance for controlling EQ settings
 *
 * @param {{ ip: string }} options - Options containing the ip address
 * @returns {Object} An object containing methods to control EQ settings
 * @returns {Function} .toggleEQValue - Function to toggle an EQ setting between 0 and 1
 * @returns {Function} .getEQValue - Function to get the current value of an EQ setting
 * @returns {Function} .setEQValue - Function to set a specific value for an EQ setting
 */

export default (options: { ip: string }) => ({
  toggleEQValue: (EQType: EQType) => toggleEQValue(options, EQType),
  getEQValue: (EQType: EQType) => getEQValue(options, EQType),
  setEQValue: (EQType: EQType, value: string) =>
    setEQValue(options, EQType, value),
});
