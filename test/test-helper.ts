import clock = jasmine.clock;

/**
 * A class to provide helper utilities for testing.
 */
export class TestHelper {
  /**
   * Get a promise that can be manually resolved from the outside.
   *
   * @return An object containing a promise and its resolver.
   */
  public static getResolvablePromise<Type>(): ResolvablePromise {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let resolver: any;
    const promise = new Promise<Type>(resolve => resolver = resolve);
    return {
      promise,
      resolver
    };
  }

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

export interface ResolvablePromise {
  promise: Promise<any>;
  resolver: (argument?: any) => void;
}
