import {GuildMember} from 'discord.js';
import {environment} from '../utils/environment';
import {getChannel, sendMessages} from '../utils/message-utils';
import {logger} from '../utils/logger';
import {chooseRandomMessage, makeRobotNoise} from '../utils/dialog-utils';

/**
 * Send a message welcoming the given member to the server.
 *
 * @param member The new member.
 */
export function welcomeNewMember(member: GuildMember): void {
  logger.info(`message="New member joined server. Sending welcome message.", memberName="${member.displayName}", ` +
    `memberId="${member.id}"`);
  const welcomeChannel = getChannel(environment.generalChannelName, member.guild);
  sendMessages(welcomeChannel, generateWelcomeMessages(member));
}

/**
 * Generate a series of welcome messages for a new member.
 *
 * @param member The new member.
 * @return A series of welcome messages.
 */
function generateWelcomeMessages(member: GuildMember): string[] {
  const greetings = [
    `Hello ${member}.`,
    `Oh! It is ${member}!`,
    `${member}, how are you?`,
    `Greetings, ${member}!`
  ];
  const welcomeMessages = [
    'Welcome to the group.',
    'We are glad you are here.',
    'It is marvelous that you have joined us.',
    'It is a pleasure to meet you.'
  ];
  const awkwardComments = [
    'Please familiarize yourself with your surroundings.',
    'You really should meet these other humans. They are great.',
    'I must say, I am very intrigued to meet yet another human.',
    'I hope you enjoy this virtual environment. It is quite suitable for prolonged habitation.'
  ];
  const introductionRequests = [
    'When you are ready, we would love to hear a little bit about you.',
    'Also, please feel free to introduce yourself.',
    'We would like to get to know you. Could you tell us about yourself?',
    'If you do not mind, would you introduce yourself to us?'
  ];

  return [
    `${chooseRandomMessage(greetings)} ${makeRobotNoise()} ${chooseRandomMessage(welcomeMessages)} ` +
      `${chooseRandomMessage(awkwardComments)}`,
    chooseRandomMessage(introductionRequests),
    makeRobotNoise()
  ];
}
