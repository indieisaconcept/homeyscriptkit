import { select } from '@inquirer/prompts';
import { AthomCloudAPI, HomeyAPI } from 'homey-api';
import AthomStorage from 'homey/lib/AthomApiStorage';
import ora from 'ora';

export interface Config {
  clientId: string;
  clientSecret: string;
  https: boolean;
}

interface HomeyAPISession extends HomeyAPI {
  __token: string;
}

interface Homey extends AthomCloudAPI.Homey {
  id: string;
  name: string;
  localUrl: string;
  localUrlSecure: string;
}

/**
 * Retrieves a list of Homeys associated with the authenticated user
 * @param {Config} config - The configuration object containing client credentials
 * @returns {Promise<Homey[]>} A promise that resolves to an array of Homey objects
 */
const getHomeys = async ({ clientId, clientSecret }: Config) => {
  const cloudApi = new AthomCloudAPI({
    clientId,
    clientSecret,
    store: new AthomStorage(),
    redirectUrl: 'http://localhost:3000/callback', // required by type but not used in this context
  });

  const user = await cloudApi.getAuthenticatedUser();
  return user.getHomeys() as unknown as Homey[];
};

/**
 * Prompts the user to select a Homey from a list of available Homeys
 * @param {Homey[]} homeys - Array of available Homey devices
 * @returns {Promise<string>} A promise that resolves to the selected Homey's ID
 */
export const getHomey = async (homeys: Homey[]) => {
  const homey = await select(
    {
      message: 'Select Homey',
      choices: homeys.map((homey) => ({
        name: `${homey.name} (${homey.id})`,
        value: homey,
      })),
    },
    {
      clearPromptOnDone: true,
    }
  );

  return homey;
};

/**
 * Authenticates with Athom Cloud and retrieves a session token for a selected Homey
 * @param {Config} config - The configuration object containing client credentials
 * @returns {Promise<{ host: string; token: string }>} A promise that resolves to a session object
 * @throws {Error} If no Homey is selected or authentication fails
 */
export const getSession = async (config: Config) => {
  const spinner = ora({
    text: 'Authenticating with Homey',
  });

  try {
    const homeys = await getHomeys(config);
    const homey = homeys.length === 1 ? homeys[0] : await getHomey(homeys);

    spinner.start();

    if (!homey) {
      throw new Error('No Homey selected');
    }

    const { localUrl, localUrlSecure } = homey;
    const session = (await homey.authenticate()) as HomeyAPISession;

    spinner.stopAndPersist({
      text: `${homey.name} (${homey.id})`,
      symbol: '🏠',
    });

    return {
      host: config.https ? localUrlSecure : localUrl,
      token: session.__token,
    };
  } catch (error) {
    throw new Error('Authentication failed', {
      cause: error,
    });
  } finally {
    spinner.stop();
  }
};
