import {Guild, TextChannel} from 'discord.js';
import {environment} from '../utils/environment';
import {logger} from '../utils/logger';

/**
 * Have CyBert introduce himself to the server.
 *
 * @param guild The server to do the introduction on.
 */
export function introduceSelf(guild: Guild): void {
  const welcomeChannel = guild.channels.cache.find(
    channel => channel.name === environment.welcomeChannelName && channel.type == 'text'
  ) as TextChannel;
  if (welcomeChannel) {
    welcomeChannel.send('Hello, I am CyBert.')
      .catch(error => logger.error({message: 'message="Unable to send introduction message."', error}));
  } else {
    logger.error(`message="Unable to find channel.", channelName="${environment.welcomeChannelName}"`);
  }
}
