import hsk, { type BaseParams, type Event } from '../hsk';

/**
 * A simple script that takes a name and greeting as arguments and prints them
 *
 * Usage: hsk://example/greet?name=John&greeting=Hello
 */

interface GreetParams extends BaseParams {
  name: string;
  greeting: string;
}

await hsk(async (event: Event<'greet', GreetParams>) => {
  // Check if required arguments are provided
  if (!event.params?.name || !event.params?.greeting) {
    console.error('Please provide both name and greeting arguments');
    console.error('Usage: hsk://example/greet?name=Jon&greeting=Hello');
    return;
  }

  return `${event.params.greeting}, ${event.params.name}!`;
});
