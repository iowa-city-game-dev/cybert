/**
 * This class provides functions to help with constructing dialog.
 */
export class DialogUtils {
  /**
   * Get a random robot noise for CyBert to make.
   *
   * @return A robot noise.
   */
  public makeRobotNoise(): string {
    const robotNoises = [
      'Beep.',
      'Beep boop.',
      'Blorp. (Oh. Excuse me.)',
      'Bzzzt!',
      'Whirrrrr...',
      'Boop beep.',
      'Oh no, another screw just fell out of me.',
      'Beep beep beep beeeeep...',
      'Chortle.',
      'Zip!',
      'Buzzzzz...',
      'C-c-*clunk*! (Oh no!)',
      'Arm! STOP. MOVING. (Sorry about that.)',
      '11010001110001010110...',
      'ERROR. ERROR. (Sigh...)',
      '0xE55EB3D66CCCA3.',
      'Ding!'
    ];
    return `_${this.chooseRandomMessage(robotNoises)}_`;
  }

  /**
   * Choose a random message from the given list of messages.
   *
   * @param possibleMessages The list of messages to choose from.
   * @return A message from the list.
   */
  public chooseRandomMessage(possibleMessages: string[]): string {
    const index = Math.floor(Math.random() * possibleMessages.length);
    return possibleMessages[index];
  }
}
