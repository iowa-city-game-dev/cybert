/**
 * This is a class for generating random numbers.
 */
export class RandomUtils {
  /**
   * Generate a random number.
   *
   * @return A random floating-point number in the range [0,1).
   */
  public generateRandomNumber(): number {
    return Math.random();
  }

  /**
   * Choose a random string from the given list of strings.
   *
   * @param possibleStrings The list of messages to choose from.
   * @return A string from the list.
   */
  public chooseRandomString(possibleStrings: readonly string[]): string {
    const index = Math.floor(this.generateRandomNumber() * possibleStrings.length);
    return possibleStrings[index];
  }
}
