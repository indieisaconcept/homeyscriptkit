/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TypeScript definitions for HomeyScript VM context
 *
 * This file defines the globals, APIs, and functions available in the HomeyScript
 * sandboxed Node.js VM environment. These types are based on the actual context
 * provided by the HomeyScript app.
 *
 * @see https://github.com/athombv/com.athom.homeyscript
 */
import type { HomeyAPI } from 'homey-api';

declare namespace HomeyScript {
  /** Script execution context information */
  interface ScriptContext {
    readonly __filename__: string;
    readonly __last_executed__: Date;
    readonly __ms_since_last_executed__: number;
    readonly __script_id__: string;
    readonly args: readonly any[];
  }

  /** Cross-script persistent storage interface */
  interface GlobalSettings {
    get(key: string): any;
    set(key: string, value: any): void;
    keys(): readonly string[];
  }
}

declare global {
  // ===== SCRIPT CONTEXT =====
  const __filename__: string;
  const __last_executed__: Date;
  const __ms_since_last_executed__: number;
  const __script_id__: string;
  const args: readonly any[];

  // ===== NODE.JS MODULES =====
  const _: typeof import('lodash');
  const Buffer: typeof import('buffer').Buffer;
  const URLSearchParams: typeof globalThis.URLSearchParams;
  const http: typeof import('http');
  const https: typeof import('https');
  const fetch: typeof globalThis.fetch;

  // ===== LOGGING & CONSOLE =====
  /** Console methods all map to the same HomeyScript logging function */
  const console: Pick<Console, 'log' | 'error' | 'info'>;
  /** Async logging to HomeyScript console and realtime interface */
  const log: (...args: readonly any[]) => Promise<void>;

  // ===== HOMEY INTEGRATION =====
  const Homey: Readonly<HomeyAPI>;
  const global: HomeyScript.GlobalSettings;

  // ===== SCRIPT FUNCTIONS =====
  function say(text: string): Promise<void>;
  function tag(
    id: string,
    value: string | number | boolean | null
  ): Promise<void>;
  const wait: (milliseconds: number) => Promise<void>;

  // ===== DEPRECATED =====
  /** @deprecated Use tag(id, value) instead */
  function setTagValue(
    id: string,
    opts: { type: string },
    value: any
  ): Promise<void>;
}

// Prevent accidental global namespace pollution
export {};
