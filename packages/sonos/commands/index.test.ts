import { describe, expect, it } from 'vitest';

describe('Sonos Commands Index', () => {
  it('should export all command functions', async () => {
    const commandsModule = await import('./index');

    // Verify all expected commands are exported
    expect(commandsModule).toHaveProperty('toggleHomeTheatre');
    expect(commandsModule).toHaveProperty('toggleSurround');
    expect(commandsModule).toHaveProperty('toggleSubwoofer');

    // Verify they are functions
    expect(typeof commandsModule.toggleHomeTheatre).toBe('function');
    expect(typeof commandsModule.toggleSurround).toBe('function');
    expect(typeof commandsModule.toggleSubwoofer).toBe('function');
  });

  it('should have the correct number of exports', async () => {
    const commandsModule = await import('./index');

    // Get all enumerable properties (exports)
    const exports = Object.keys(commandsModule);

    // Should have exactly 3 command exports
    expect(exports).toHaveLength(3);
    expect(exports).toContain('toggleHomeTheatre');
    expect(exports).toContain('toggleSurround');
    expect(exports).toContain('toggleSubwoofer');
  });
});
