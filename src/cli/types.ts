export interface CommandEvent {
  flags?: Record<string, unknown>;
  args?: string[];
}

export interface HomeyScript {
  id: string;
  name: string;
  code?: string;
  version: string;
  lastExecuted?: string;
}
