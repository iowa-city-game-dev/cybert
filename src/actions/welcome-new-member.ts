import {GuildMember, TextChannel} from 'discord.js';
import {logger} from '../utils/logger';
import {environment} from '../utils/environment';

/**
 * Send a message welcoming the given member to the server.
 *
 * @param member The new member.
 */
export function welcomeNewMember(member: GuildMember): void {
  const welcomeChannel = member.guild.channels.cache.find(
    channel => channel.name === environment.welcomeChannelName && channel.type == 'text'
  ) as TextChannel;
  if (welcomeChannel) {
    welcomeChannel.send(`Welcome, ${member}! Please feel free to introduce yourself.`)
      .catch(error => logger.error({message: `message="Unable to send welcome message.", memberId="${member.id}"`,
        error}));
  } else {
    logger.error(`message="Unable to find channel.", channelName="${environment.welcomeChannelName}"`);
  }
}
