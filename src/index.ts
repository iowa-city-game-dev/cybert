import {Client} from 'discord.js';
import {logger} from './utils/logger';
import {environment} from './utils/environment';
import {welcome} from './actions/welcome-new-member';

const client = new Client();

logger.info(`message="CyBert is starting up.", version="${environment.botVersion}"`);

client.on('ready', () => logger.info('message="CyBert is ready."'));
client.on('guildMemberAdd', welcome);

client.login(environment.botToken)
  .catch(error => logger.error({message: 'message="CyBert failed to start."', error}));
