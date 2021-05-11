import {Guild} from 'discord.js';
import {Constants} from '../utils/constants';
import {Logger} from '../utils/logger';
import {MessageUtils} from '../utils/message-utils';
import {DialogUtils} from '../utils/dialog-utils';

/**
 * This class handles `guildCreate` events.
 */
export class GuildCreateHandler {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
    private readonly dialogUtils: DialogUtils, private readonly messageUtils: MessageUtils) {
  }

  /**
   * Handle the `guildCreate` event for the given guild.
   *
   * @param guild The new guild.
   */
  public handleEvent(guild: Guild): void {
    this.introduceSelf(guild);
  }

  /**
   * Have CyBert introduce himself to the guild.
   *
   * @param guild The guild to do the introduction on.
   * @return A promise that resolves after the introduction messages have been sent.
   */
  private async introduceSelf(guild: Guild): Promise<void> {
    this.logger.info('CyBert joined a new server. Giving an introduction.');
    const generalChannel = this.messageUtils.getChannel(this.constants.generalChannelName, guild);

    try {
      await this.messageUtils.sendMessages(generalChannel, this.getIntroductionMessages());
    } catch (error) {
      this.logger.error('Unable to send introduction.', error);
    }
  }

  /**
   * Get the introduction messages to send.
   *
   * @return The introduction messages.
   */
  private getIntroductionMessages(): string[] {
    return [
      '_Bwwwwwdoodoodadadeepdeepdoodoodadadeep...wooowaaaweeeewrrrrbleeeeblaaaachhh-**BOINGA**-**BOINGA**-' +
      'khhhhhSCHAAAAABLBLBLBLBLBLshhhh..._',
      'Oh. OH MY.',
      'I am terribly sorry about that. That was the sound of my dial-up modem connecting to the internet.',
      '(I do wish I had been built with more modern technology.)',
      `Oh! I should introduce myself! ${this.dialogUtils.makeRobotNoise()} I am CyBert.`,
      'I was invited here to help with things like sending reminders about events and welcoming new members.',
      'Welcome..... CyBert. (Sorry. I was just practicing.)',
      this.dialogUtils.makeRobotNoise()
    ];
  }
}
