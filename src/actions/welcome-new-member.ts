import {GuildMember} from 'discord.js';
import {environment} from '../utils/environment';
import {getChannel, sendMessages} from '../utils/message-utils';
import {logger} from '../utils/logger';

/**
 * Send a message welcoming the given member to the server.
 *
 * @param member The new member.
 */
export function welcomeNewMember(member: GuildMember): void {
  logger.info(`message="New member joined server. Sending welcome message.", memberName="${member.displayName}", ` +
    `memberId="${member.id}"`);
  const welcomeChannel = getChannel(environment.welcomeChannelName, member.guild);
  sendMessages(welcomeChannel, [`Welcome, ${member}! Please feel free to introduce yourself.`]);
}
