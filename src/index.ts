import {Client} from 'discord.js';
import {logger} from './utils/logger';

const client = new Client();

logger.info('CyBert is starting up.');
client.on('ready', () => {
  logger.info('CyBert is ready.');
});
