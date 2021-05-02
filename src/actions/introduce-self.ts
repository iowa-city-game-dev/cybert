import {Guild} from 'discord.js';
import {environment} from '../utils/environment';
import {getChannel, sendMessages} from '../utils/message-utils';
import {logger} from '../utils/logger';

/**
 * Have CyBert introduce himself to the server.
 *
 * @param guild The server to do the introduction on.
 */
export function introduceSelf(guild: Guild): void {
  logger.info('message="CyBert joined new server. Giving introduction."');
  const welcomeChannel = getChannel(environment.welcomeChannelName, guild);
  sendMessages(welcomeChannel, ['Hello, I am CyBert.']);
}
