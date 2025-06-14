import ora from 'ora';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TerminalOutput } from './terminalOutput';

// Global mocks
const mockSpinner = {
  start: vi.fn(),
  stop: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  stopAndPersist: vi.fn(),
  text: '',
} as unknown as ReturnType<typeof ora>;

const mockConsole = {
  log: vi.fn(),
};

const output: TerminalOutput = new TerminalOutput({
  spinner: mockSpinner,
  console: mockConsole,
});

describe('TerminalOutput', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a new instance with defaults', () => {
    const defaultOutput = new TerminalOutput();
    expect(defaultOutput).toBeInstanceOf(TerminalOutput);
  });

  describe('start', () => {
    it('should show message', () => {
      const message = 'Test message';
      output.start(message);
      expect(mockSpinner.start).toHaveBeenCalledWith(message);
    });
  });

  describe('update', () => {
    it('should update spinner text', () => {
      const message = 'Updated message';
      output.update(message);
      expect(mockSpinner.text).toBe(message);
    });
  });

  describe('info', () => {
    it('should call spinner.info', () => {
      const message = 'Info message';
      output.info(message);
      expect(mockSpinner.info).toHaveBeenCalledWith(message);
    });
  });

  describe('succeed', () => {
    it('should call spinner.succeed', () => {
      const message = 'Success message';
      output.succeed(message);
      expect(mockSpinner.succeed).toHaveBeenCalledWith(message);
    });
  });

  describe('warn', () => {
    it('should call spinner.warn', () => {
      const message = 'Warning message';
      output.warn(message);
      expect(mockSpinner.warn).toHaveBeenCalledWith(message);
    });
  });

  describe('fail', () => {
    it('should call spinner.fail', () => {
      const message = 'Error message';
      output.fail(message);
      expect(mockSpinner.fail).toHaveBeenCalledWith(message);
    });
  });

  describe('stopAndPersist', () => {
    it('should call spinner.stopAndPersist', () => {
      const options = { text: 'Persisted message', symbol: '✓' };
      output.stopAndPersist(options);
      expect(mockSpinner.stopAndPersist).toHaveBeenCalledWith(options);
    });
  });

  describe('newLine', () => {
    it('should call console.log with empty string', () => {
      output.newLine();
      expect(mockConsole.log).toHaveBeenCalledWith('');
    });
  });

  describe('queue and flush', () => {
    it('should queue and flush messages', () => {
      output.queue('Test message 1');
      output.queue('Test message 2');
      output.flush();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '\nTest message 1\nTest message 2'
      );
    });

    it('should flush with additional value', () => {
      output.queue('Test message 1');
      output.queue('Test message 2');
      output.flush('Final message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '\nTest message 1\nTest message 2\nFinal message'
      );
    });
  });
});
