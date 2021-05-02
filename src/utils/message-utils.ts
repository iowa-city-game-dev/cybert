import {Guild, TextChannel} from 'discord.js';
import {logger} from './logger';
import {environment} from './environment';

/**
 * Send one or more messages to the given channel.
 *
 * @param channel The channel.
 * @param messages The messages to send.
 */
export async function sendMessages(channel: TextChannel | null, messages: string[]): Promise<void> {
  if (channel) {
    for (const message of messages) {
      await pretendToThink();
      await sendMessage(channel, message);
    }
  } else {
    logger.error('message="Unable to send message(s) - channel not defined."');
  }
}

/**
 * Get the channel with the given name from the given guild.
 *
 * @param channelName The channel name.
 * @param guild The guild.
 */
export function getChannel(channelName: string, guild: Guild): TextChannel | null {
  const channel = guild.channels.cache.find(
    channel => channel.name === channelName && channel.type == 'text'
  ) as TextChannel;
  if (!channel) {
    logger.warn(`message="Unable to find channel.", channelName="${channelName}"`);
  }
  return channel;
}

/**
 * Send the given message to the given channel. This also shows a typing indicator for a brief period of time before
 * sending the message.
 *
 * @param channel The channel.
 * @param message The message.
 */
async function sendMessage(channel: TextChannel, message: string): Promise<void> {
  channel.startTyping();
  await pretendToTypeMessage(message.length);
  channel.stopTyping();

  try {
    await channel.send(message);
  } catch (error) {
    logger.error({message: 'message="Unable to send message."', error});
  }
}

/**
 * Wait for a bit to make it seem like CyBert is thinking of something to type.
 *
 * @return A promise that resolves when the time is up.
 */
function pretendToThink(): Promise<void> {
  const thinkingTimeMillis = environment.botMaxThinkingTimeInSeconds * Math.random() * 1000;
  return new Promise<void>(resolve => setTimeout(resolve, thinkingTimeMillis));
}

/**
 * Wait for a bit to make it seem like CyBert is typing. The longer the message is, the longer the wait time will be.
 *
 * @param messageLength The length of the message.
 * @return A promise that resolves when the time is up.
 */
function pretendToTypeMessage(messageLength: number): Promise<void> {
  const wordsPerMinute = environment.botAverageWordsPerMinute + ((environment.botMaxVariationInWordsPerMinute *
    Math.random()) - (environment.botMaxVariationInWordsPerMinute / 2));
  const typingTimeMillis = (1 / (wordsPerMinute * environment.averageCharactersPerWord)) * messageLength * 60 * 1000;
  return new Promise<void>(resolve => setTimeout(resolve, typingTimeMillis));
}
