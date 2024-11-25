import {GuildMember} from 'discord.js';
import {Constants} from '../utils/constants.ts';
import {Logger} from '../utils/logger.ts';
import {DialogUtils} from '../utils/dialog-utils.ts';
import {MessageUtils} from '../utils/message-utils.ts';
import {RandomUtils} from '../utils/random-utils.ts';

/**
 * This class handles `guildMemberAdd` events.
 */
export class GuildMemberAddHandler {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
    private readonly dialogUtils: DialogUtils, private readonly messageUtils: MessageUtils,
    private readonly randomUtils: RandomUtils) {
  }

  /**
   * Handle the `guildMemberAdd` event for the given member.
   *
   * @param member The new member.
   */
  public handleEvent(member: GuildMember): void {
    this.welcomeNewMember(member);
  }

  /**
   * Send a message welcoming the given member to the server.
   *
   * @param member The new member.
   * @return A promise that resolves after the welcome messages have been sent.
   */
  private async welcomeNewMember(member: GuildMember): Promise<void> {
    this.logger.info('New member joined server. Sending welcome message.', {memberId: member.id});
    const generalChannel = this.messageUtils.getChannel(this.constants.generalChannelName, member.guild);

    try {
      await this.messageUtils.sendMessages(generalChannel, this.generateWelcomeMessages(member));
    } catch (error) {
      this.logger.error('Unable to send welcome message to new member.', error as Error, {memberId: member.id});
    }
  }

  /**
   * Generate a series of welcome messages for a new member.
   *
   * @param member The new member.
   * @return A series of welcome messages.
   */
  private generateWelcomeMessages(member: GuildMember): string[] {
    const greetings: readonly string[] = [
      `Hello ${member}.`,
      `Oh! It is ${member}!`,
      `${member}, how are you?`,
      `Greetings, ${member}!`
    ];
    const welcomeMessages: readonly string[] = [
      'Welcome to the group.',
      'We are glad you are here.',
      'It is marvelous that you have joined us.',
      'It is a pleasure to meet you.'
    ];
    const awkwardComments: readonly string[] = [
      'Please familiarize yourself with your surroundings.',
      'You really should meet these other humans. They are great.',
      'I must say, I am very intrigued to meet yet another human.',
      'I hope you enjoy this virtual environment. It is quite suitable for prolonged habitation.'
    ];
    const introductionRequests: readonly string[] = [
      'When you are ready, we would love to hear a little bit about you.',
      'Also, please feel free to introduce yourself.',
      'We would like to get to know you. Could you tell us about yourself?',
      'If you do not mind, would you introduce yourself to us?'
    ];

    return [
      `${this.randomUtils.chooseRandomString(greetings)} ${this.dialogUtils.makeRobotNoise()} ` +
        `${this.randomUtils.chooseRandomString(welcomeMessages)} ` +
        `${this.randomUtils.chooseRandomString(awkwardComments)}`,
      this.randomUtils.chooseRandomString(introductionRequests),
      this.dialogUtils.makeRobotNoise()
    ];
  }
}
