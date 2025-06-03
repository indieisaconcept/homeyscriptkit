import type { BaseParams } from '../hsk';

/**
 * Base parameters required for all Sonos operations
 */
export interface SonosDeviceParams extends BaseParams {
  /** IP address of the Sonos device */
  ip: string;
}
