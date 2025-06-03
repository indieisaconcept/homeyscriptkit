import client, { EQType } from '../client';
import type { SonosDeviceParams } from '../types';

const logger = log.bind(null, 'sonos/toggleSurround');

/**
 * Toggles surround sound setting between enabled and disabled states
 *
 * @param {SonosDeviceParams} params - Parameters containing the ip address
 * @returns {Promise<void>}
 * @throws {Error} When unable to toggle surround setting
 */
export const toggleSurround = async (params: SonosDeviceParams) => {
  const sonos = client({ ip: params.ip });
  const [err, result] = await sonos.toggleEQValue(EQType.SurroundEnable);

  if (err || !result) {
    logger('Failed to toggle surround', { error: err?.message });
    return;
  }

  logger('Surround mode updated', { result });
};
