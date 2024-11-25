import {Guild, Message, EmbedBuilder, TextChannel} from 'discord.js';
import {Logger} from './logger.ts';
import {Constants} from './constants.ts';
import {RandomUtils} from './random-utils.ts';
import {DateTime} from 'luxon';

/**
 * This class provides functions to help with sending messages.
 */
export class MessageUtils {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
    private readonly randomUtils: RandomUtils) {
  }

  /**
   * Send one or more messages to the given channel.
   *
   * @param channel The channel.
   * @param messages The messages to send.
   * @return A promise that resolves after the given messages have been sent.
   */
  public async sendMessages(channel: TextChannel | null, messages: readonly string[]): Promise<void> {
    if (channel) {
      for (const message of messages) {
        await this.pretendToThink();
        await this.sendMessage(channel, message);
      }
    } else {
      throw new Error('Unable to send message(s) - channel not defined.');
    }
  }

  /**
   * Send an embed with a countdown timer link to the given channel.
   *
   * @param channel The channel.
   * @param eventTitle The title of the event.
   * @param dateTime The date and time to count down to.
   * @return A promise that resolves after the embed has been sent.
   */
  public async sendEventCountdownLink(channel: TextChannel | null, eventTitle: string, dateTime: DateTime):
      Promise<void> {
    if (channel) {
      const link = this.constructCountdownTimerLink(
          `${eventTitle} - ` +
              `${dateTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT)} Central`,
          eventTitle,
          dateTime
      );
      const embed = new EmbedBuilder()
          .setDescription(`**${link}**\nClick the link above to see a countdown timer for the start of the event.`);
      await this.pretendToThink();
      await channel.send({
        embeds: [embed]
      });
    } else {
      throw new Error('Unable to send countdown timer link - channel not defined.');
    }
  }

  /**
   * Add an emoji reaction to the given message.
   *
   * @param message The message.
   * @return A promise that resolves after the reaction has been added.
   */
  public async addReaction(message: Message): Promise<void> {
    const emojiName = this.chooseRandomEmoji();
    const emoji = message.client.emojis.cache.find(emoji => emoji.name === emojiName);
    if (emoji) {
      await this.pretendToThink();
      await message.react(emoji.id);
    } else {
      throw new Error(`Unable to react to message - emoji "${emojiName}" not found.`);
    }
  }

  /**
   * Get the channel with the given name from the given guild. Returns `null` if the channel does not exist.
   *
   * @param channelName The channel name.
   * @param guild The guild.
   */
  public getChannel(channelName: string, guild: Guild): TextChannel | null {
    const channel = guild.channels.cache.find(
        channel => channel.name === channelName && channel.isTextBased()
    );
    if (!channel) {
      this.logger.warn('Unable to find channel.', {channelName});
      return null;
    }
    return channel as TextChannel;
  }

  /**
   * Send the given message to the given channel. This also shows a typing indicator for a brief period of time before
   * sending the message.
   *
   * @param channel The channel.
   * @param message The message.
   * @return A promise that resolves after the given message has been sent.
   */
  private async sendMessage(channel: TextChannel, message: string): Promise<void> {
    channel.sendTyping();
    await this.pretendToTypeMessage(message.length);
    await channel.send(message);
  }

  /**
   * Wait for a bit to make it seem like CyBert is thinking of something to type.
   *
   * @return A promise that resolves when the time is up.
   */
  private pretendToThink(): Promise<void> {
    const thinkingTimeMillis =
      this.constants.botMaxThinkingTimeInSeconds * this.randomUtils.generateRandomNumber() * 1000;
    return new Promise<void>(resolve => setTimeout(resolve, thinkingTimeMillis));
  }

  /**
   * Wait for a bit to make it seem like CyBert is typing. The longer the message is, the longer the wait time will be.
   *
   * @param messageLength The length of the message.
   * @return A promise that resolves when the time is up.
   */
  private pretendToTypeMessage(messageLength: number): Promise<void> {
    const wordsPerMinute = this.constants.botAverageWordsPerMinute + ((this.constants.botMaxVariationInWordsPerMinute *
      this.randomUtils.generateRandomNumber()) - (this.constants.botMaxVariationInWordsPerMinute / 2));
    const typingTimeMillis = (1 / (wordsPerMinute * this.constants.averageCharactersPerWord)) * messageLength * 60 *
      1000;
    return new Promise<void>(resolve => setTimeout(resolve, typingTimeMillis));
  }

  /**
   * Get a link with the given text, which points to a countdown timer set to the given date and time.
   *
   * @param linkText The link text.
   * @param timerTitle The title of the countdown timer.
   * @param dateTime The date and time to count down to.
   * @return A link.
   */
  public constructCountdownTimerLink(linkText: string, timerTitle: string, dateTime: DateTime): string {
    const url = 'https://globaltimekeeper.com/countdown.php?' +
      `yr=${dateTime.setZone(this.constants.timeZone).year}` +
      `&mo=${dateTime.setZone(this.constants.timeZone).month}` +
      `&dy=${dateTime.setZone(this.constants.timeZone).day}` +
      `&hr=${dateTime.setZone(this.constants.timeZone).hour}` +
      `&mi=${dateTime.setZone(this.constants.timeZone).minute}` +
      `&tz=${encodeURIComponent(this.constants.timeZone)}` +
      `&tx1=${encodeURIComponent(timerTitle)}` +
      `&tx2=${encodeURIComponent('Time until event begins:')}` +
      '&ad=0' +
      '&ln=en' +
      '&cl=2' +
      '&bg=3';
    return `[${linkText}](${url})`;
  }

  /**
   * Choose a random emoji out of the available emoji.
   *
   * @return The name of the chosen emoji.
   */
  private chooseRandomEmoji(): string {
    const availableEmoji: readonly string[] = [
      'autobot',
      'bb8',
      'bender_dance',
      'blinking_robot',
      'bmo',
      'bot',
      'c3po',
      'megaman_spin',
      'meow_bot',
      'mettaton',
      'music_robot',
      'nyan_lovebot',
      'r2d2',
      'robot_blue',
      'robot_dance',
      'robot_groove',
      'robot_head',
      'robot_walk',
      'robot_with_clamps'
    ];
    return this.randomUtils.chooseRandomString(availableEmoji);
  }
}
