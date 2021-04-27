import {Client} from 'discord.js';
import {logger} from './utils/logger';
import {environment} from './utils/environment';

const client = new Client();

logger.info('message="CyBert is starting up."');

client.on('ready', () => {
  logger.info('message="CyBert is ready."');
});

client.login(environment.botToken)
  .catch(error => logger.error({message: 'message="CyBert failed to start."', error}));
