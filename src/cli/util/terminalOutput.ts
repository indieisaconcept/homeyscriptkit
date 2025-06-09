import ora, { Ora } from 'ora';

interface ConsoleInterface {
  log: (...args: unknown[]) => void;
}

interface TerminalOutputConfig {
  spinner?: Ora;
  console?: ConsoleInterface;
}

export class TerminalOutput {
  private spinner: Ora;
  private messages: string[] = [];
  private console: ConsoleInterface;

  constructor(config?: TerminalOutputConfig) {
    this.spinner = config?.spinner ?? ora();
    this.console = config?.console ?? console;
  }

  /**
   * Start the spinner with an initial message
   * @param message - The initial message to display
   */
  start(message: string): void {
    this.spinner.start(message);
  }

  /**
   * Update the current spinner message
   * @param message - The new message to display
   */
  update(message: string): void {
    this.spinner.text = message;
  }

  /**
   * Display an informational message and stop the spinner
   * @param message - The message to display
   */
  info(message: string): void {
    this.spinner.info(message);
  }

  /**
   * Display a success message and stop the spinner
   * @param message - The message to display
   */
  succeed(message: string): void {
    this.spinner.succeed(message);
  }

  /**
   * Display a warning message and stop the spinner
   * @param message - The message to display
   */
  warn(message: string): void {
    this.spinner.warn(message);
  }

  /**
   * Display an error message and stop the spinner
   * @param message - The message to display
   */
  fail(message: string): void {
    this.spinner.fail(message);
  }

  /**
   * Stop the spinner and persist the current message
   * @param options - Options for persisting the message
   */
  stopAndPersist(options?: { text?: string; symbol?: string }): void {
    this.spinner.stopAndPersist(options);
  }

  /**
   * Add a message to the message queue
   * @param message - The message to add
   */
  queue(message: string): void {
    this.messages.push(message);
  }

  /**
   * Add a new line to the console
   */
  newLine(): void {
    this.console.log('');
  }

  /**
   * Flush all queued messages to the console
   * @param value - Optional value to add to the queue before flushing
   */
  flush(value?: string): void {
    if (value) {
      this.messages.push(value);
    }
    if (this.messages.length > 0) {
      this.console.log('\n' + this.messages.join('\n'));
      this.messages = [];
    }
  }
}
