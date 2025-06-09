import type { BaseParams } from '../../src/hsk';

/**
 * Base parameters required for all Sonos operations
 */
export interface SonosDeviceParams extends BaseParams {
  /** IP address of the Sonos device */
  ip: string;
}
