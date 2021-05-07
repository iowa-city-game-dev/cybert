/**
 * This class provides functions to help with constructing dialog.
 */
import {RandomUtils} from './random-utils';

export class DialogUtils {
  private readonly robotNoises: Readonly<string[]>;

  constructor(private readonly randomUtil: RandomUtils) {
    this.robotNoises = DialogUtils.getRobotNoises();
  }

  /**
   * Choose a random message from the given list of messages.
   *
   * @param possibleMessages The list of messages to choose from.
   * @return A message from the list.
   */
  public chooseRandomMessage(possibleMessages: Readonly<string[]>): string {
    const index = Math.floor(this.randomUtil.generateRandomNumber() * possibleMessages.length);
    return possibleMessages[index];
  }

  /**
   * Get a random robot noise for CyBert to make.
   *
   * @return A robot noise.
   */
  public makeRobotNoise(): string {
    return `_${this.chooseRandomMessage(this.robotNoises)}_`;
  }

  /**
   * Get the list of possible robot noises.
   *
   * @return The list of possible robot noises.
   */
  private static getRobotNoises(): string[] {
    return [
      'Beep.',
      'Beep boop.',
      'Blorp. (Oh. Excuse me.)',
      'Bzzzt!',
      'Whirrrrr...',
      'Boop beep.',
      '(Oh no, another screw just fell out of me.)',
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
  }
}
