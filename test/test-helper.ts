import clock = jasmine.clock;

/**
 * A class to provide helper utilities for testing.
 */
export class TestHelper {
  /**
   * Clear pending events in the event queue. This assumes that Jasmine's `clock().install()` has been called.
   *
   * @return A promise that resolves when pending events have been cleared.
   */
  public static clearEventQueue(): Promise<void> {
    const promise = new Promise<void>(resolve => setTimeout(resolve, 0));
    clock().tick(0);
    return promise;
  }
}
