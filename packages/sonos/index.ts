import hsk, { type Event } from '@hsk';

import { toggleHomeTheatre, toggleSubwoofer, toggleSurround } from './commands';
import { SonosDeviceParams } from './types';

const debug = log.bind(null, 'Sonos');

// Create commands object from imported functions
const commands = {
  toggleHomeTheatre,
  toggleSurround,
  toggleSubwoofer,
};

const handler = async (event: Event<keyof typeof commands>) => {
  const { command, params } = event;

  if (!commands[command]) {
    debug(
      'No valid command provided. Available commands:',
      Object.keys(commands).join(', ')
    );

    return;
  }

  // Validate that required ip parameter is provided
  if (!params['ip']) {
    debug('IP address is required but not provided');
    return;
  }

  return commands[command](params as unknown as SonosDeviceParams);
};

await hsk(handler);
