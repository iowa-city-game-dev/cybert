import {Guild} from 'discord.js';
import {environment} from '../utils/environment';
import {getChannel, sendMessages} from '../utils/message-utils';
import {logger} from '../utils/logger';
import {makeRobotNoise} from '../utils/dialog-utils';

/**
 * Have CyBert introduce himself to the server.
 *
 * @param guild The server to do the introduction on.
 */
export function introduceSelf(guild: Guild): void {
  logger.info('message="CyBert joined new server. Giving introduction."');
  const welcomeChannel = getChannel(environment.generalChannelName, guild);
  sendMessages(welcomeChannel, [
    '_Bwwwwwdoodoodadadeepdeepdoodoodadadeep...wooowaaaweeeewrrrrbleeeeblaaaachhh-**BOINGA**-**BOINGA**-khhhhhSCHAAAAABLBLBLBLBLBLshhhh..._',
    'Oh. OH MY.',
    'I am terribly sorry about that. That was the sound of my dial-up modem connecting to the internet.',
    '(I do wish I had been built with more modern technology.)',
    `Oh! I should introduce myself! ${makeRobotNoise()} I am CyBert.`,
    'I was invited here to help with things like sending reminders about events and welcoming new members.',
    'Welcome..... CyBert. (Sorry. I was just practicing.)',
    makeRobotNoise()
  ]);
}
