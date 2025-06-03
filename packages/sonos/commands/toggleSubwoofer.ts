import client, { EQType } from '../client';
import type { SonosDeviceParams } from '../types';

const logger = log.bind(null, 'sonos/toggleSubwoofer');

/**
 * Toggles subwoofer between enabled and disabled states
 *
 * @param {SonosDeviceParams} params - Parameters containing the ip address
 * @returns {Promise<void>}
 * @throws {Error} When unable to toggle subwoofer setting
 */
export const toggleSubwoofer = async (params: SonosDeviceParams) => {
  const sonos = client({ ip: params.ip });

  const [err, result] = await sonos.toggleEQValue(EQType.SubEnable);
  if (err || !result) {
    logger('Failed to toggle subwoofer', { error: err?.message });
    return;
  }
  logger('Subwoofer updated', { result });
};
