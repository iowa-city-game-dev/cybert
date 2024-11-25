import {RandomUtils} from './random-utils.ts';

/**
 * This class provides functions to help with constructing dialog.
 */
export class DialogUtils {
  private readonly robotNoises: readonly string[];

  constructor(private readonly randomUtils: RandomUtils) {
    this.robotNoises = DialogUtils.getRobotNoises();
  }

  /**
   * Get a random robot noise for CyBert to make.
   *
   * @return A robot noise.
   */
  public makeRobotNoise(): string {
    return `_${this.randomUtils.chooseRandomString(this.robotNoises)}_`;
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
