import {Client} from 'discord.js';
import {Constants} from './utils/constants';
import {DiscordBot} from './discord-bot';
import {GuildCreateHandler} from './handlers/guild-create-handler';
import {GuildMemberAddHandler} from './handlers/guild-member-add-handler';
import {MessageUtils} from './utils/message-utils';
import {DialogUtils} from './utils/dialog-utils';
import {RandomUtils} from './utils/random-utils';
import {Logger} from './utils/logger';

// Instantiate dependencies.
const logger = new Logger();
const constants = new Constants();
const discordClient = new Client();
const randomUtils = new RandomUtils();
const messageUtils = new MessageUtils(logger, constants, randomUtils);
const dialogUtils = new DialogUtils(randomUtils);
const guildCreateHandler = new GuildCreateHandler(logger, constants, dialogUtils, messageUtils);
const guildMemberAddHandler = new GuildMemberAddHandler(logger, constants, dialogUtils, messageUtils);

// Instantiate and initialize the discord bot.
const discordBot = new DiscordBot(logger, constants, discordClient, guildCreateHandler, guildMemberAddHandler);
discordBot.initialize();
