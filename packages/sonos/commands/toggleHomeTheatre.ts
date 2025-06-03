import client, { EQType } from '../client';
import type { SonosDeviceParams } from '../types';

const logger = log.bind(null, 'sonos/toggleHomeTheatre');

/**
 * Toggles home theatre mode by synchronizing both surround and subwoofer settings
 * This ensures both settings are in the same state (either both on or both off)
 *
 * @param {SonosDeviceParams} params - Parameters containing the ip address
 * @returns {Promise<void>}
 * @throws {Error} When unable to toggle settings
 */
export const toggleHomeTheatre = async (params: SonosDeviceParams) => {
  const sonos = client({ ip: params.ip });

  let [err, result] = await sonos.toggleEQValue(EQType.SurroundEnable);

  if (err || !result?.CurrentValue) {
    logger('Failed to toggle surround', { error: err?.message });
    return;
  }

  logger('Successfully toggled surround', { value: result.CurrentValue });

  [err, result] = await sonos.setEQValue(EQType.SubEnable, result.CurrentValue);

  if (err) {
    logger('Failed to set subwoofer', { error: err?.message });
    return;
  }

  logger('Home theatre mode updated', { result });
};
