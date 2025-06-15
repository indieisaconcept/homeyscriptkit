import type { HomeyScript } from '../types.js';

/**
 * Configuration interface for the HomeyScriptClient
 */
export interface ClientConfig {
  /** The host URL of the Homey API */
  host: string;
  /** The authentication token for the Homey API */
  token: string;
  /** Optional HTTP client for making requests */
  httpClient?: typeof fetch;
}

const validateScript = (
  script: Partial<HomeyScript>,
  requiredFields: (keyof HomeyScript)[]
) => {
  requiredFields.forEach((field) => {
    if (!script[field]) {
      throw new Error(`${field} is required`);
    }
  });
};

/**
 * Client for interacting with the Homey Script API
 * Provides methods to manage Homey scripts including listing, creating, updating, and deleting scripts
 */
export class HomeyScriptClient {
  private baseUrl: string;
  private headers: HeadersInit;
  private httpClient: typeof fetch;

  /**
   * Creates a new instance of HomeyScriptClient
   * @param config - The client configuration containing host and token
   */
  constructor({ host, token, httpClient = fetch }: ClientConfig) {
    if (!host) {
      throw new Error('Host is required');
    }

    if (!token) {
      throw new Error('Token is required');
    }

    this.baseUrl = `${host.replace(/\/$/, '')}/api/app/com.athom.homeyscript`;
    this.headers = {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    };
    this.httpClient = httpClient;
  }

  /**
   * Makes an HTTP request to the Homey API
   * @param path - The API endpoint path
   * @param options - Additional fetch options
   * @returns Promise resolving to the response data
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.httpClient(`${this.baseUrl}/${path}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Retrieves a list of all scripts from the Homey API
   * @param options - Configuration options for the request
   * @param options.resolve - Whether to resolve each script's full details. If true, makes an additional request for each script
   * @returns Promise resolving to an array of HomeyScript objects
   */
  async listScripts({ resolve } = { resolve: false }): Promise<HomeyScript[]> {
    const results = await this.request<Record<string, HomeyScript>>('script');
    const scripts = Object.values(results);

    return !resolve
      ? scripts
      : Promise.all(scripts.map((script) => this.getScript(script.id)));
  }

  /**
   * Retrieves a specific script by its ID
   * @param id - The unique identifier of the script to retrieve
   * @returns Promise resolving to a HomeyScript object
   */
  async getScript(id: string): Promise<HomeyScript> {
    if (!id) {
      throw new Error('ID is required');
    }

    return this.request<HomeyScript>(`script/${id}`);
  }

  /**
   * Creates a new script in the Homey API
   * @param script - The script data containing name and code
   * @returns Promise resolving to the created HomeyScript object
   * @throws Error if a script with the same name already exists
   */
  async createScript(
    script: Pick<HomeyScript, 'name' | 'code'>
  ): Promise<HomeyScript> {
    validateScript(script, ['name', 'code']);

    // Check for existing script with the same name
    const existingScripts = await this.listScripts();
    const existingScript = existingScripts.find((s) => s.name === script.name);

    if (existingScript) {
      throw new Error(`A script with name "${script.name}" already exists`);
    }

    return this.request<HomeyScript>('script', {
      method: 'POST',
      body: JSON.stringify(script),
    });
  }

  /**
   * Updates an existing script in the Homey API
   * @param script - The script data containing id, name, and code
   * @returns Promise resolving to the updated HomeyScript object
   */
  async updateScript(
    script: Pick<HomeyScript, 'id' | 'name' | 'code'>
  ): Promise<HomeyScript> {
    validateScript(script, ['id', 'name', 'code']);

    return this.request<HomeyScript>(`script/${script.id}`, {
      method: 'PUT',
      body: JSON.stringify(script),
    });
  }

  /**
   * Deletes a script from the Homey API
   * @param id - The unique identifier of the script to delete
   * @returns Promise resolving to void
   */
  async deleteScript(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }

    await this.request<unknown>(`script/${id}`, {
      method: 'DELETE',
    });
  }
}
