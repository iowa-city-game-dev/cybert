import {Client} from 'discord.js';
import {logger} from './utils/logger';
import {environment} from './utils/environment';
import {welcomeNewMember} from './actions/welcome-new-member';
import {introduceSelf} from './actions/introduce-self';

const client = new Client();

logger.info(`message="CyBert is starting up.", version="${environment.botVersion}"`);

client.on('ready', () => logger.info('message="CyBert is ready."'));
client.on('guildCreate', introduceSelf);
client.on('guildMemberAdd', welcomeNewMember);

client.login(environment.botToken)
  .catch(error => logger.error({message: 'message="CyBert failed to start."', error}));
