import {Guild} from 'discord.js';
import {Constants} from '../utils/constants';
import {logger} from '../utils/logger';
import {MessageUtils} from '../utils/message-utils';
import {DialogUtils} from '../utils/dialog-utils';

/**
 * This class allows CyBert to introduce himself.
 */
export class SelfIntroduction {
  constructor(private constants: Constants, private dialogUtils: DialogUtils, private messageUtils: MessageUtils) {
  }

  /**
   * Have CyBert introduce himself to the server.
   *
   * @param guild The server to do the introduction on.
   */
  public introduceSelf(guild: Guild): void {
    logger.info('message="CyBert joined a new server. Giving an introduction."');
    const welcomeChannel = this.messageUtils.getChannel(this.constants.generalChannelName, guild);
    this.messageUtils.sendMessages(welcomeChannel, [
      '_Bwwwwwdoodoodadadeepdeepdoodoodadadeep...wooowaaaweeeewrrrrbleeeeblaaaachhh-**BOINGA**-**BOINGA**-' +
        'khhhhhSCHAAAAABLBLBLBLBLBLshhhh..._',
      'Oh. OH MY.',
      'I am terribly sorry about that. That was the sound of my dial-up modem connecting to the internet.',
      '(I do wish I had been built with more modern technology.)',
      `Oh! I should introduce myself! ${this.dialogUtils.makeRobotNoise()} I am CyBert.`,
      'I was invited here to help with things like sending reminders about events and welcoming new members.',
      'Welcome..... CyBert. (Sorry. I was just practicing.)',
      this.dialogUtils.makeRobotNoise()
    ]);
  }
}
