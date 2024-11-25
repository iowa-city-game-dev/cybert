import {Client, GatewayIntentBits} from 'discord.js';
import {Constants} from './utils/constants.ts';
import {DiscordBot} from './discord-bot.ts';
import {GuildCreateHandler} from './handlers/guild-create-handler.ts';
import {GuildMemberAddHandler} from './handlers/guild-member-add-handler.ts';
import {MessageUtils} from './utils/message-utils.ts';
import {DialogUtils} from './utils/dialog-utils.ts';
import {RandomUtils} from './utils/random-utils.ts';
import {Logger} from './utils/logger.ts';
import {MessageHandler} from './handlers/message-handler.ts';
import {EventTracker} from './event-reminders/event-tracker.ts';
import {google} from 'googleapis';

// Instantiate dependencies.
const logger = new Logger();
const constants = new Constants();
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
const randomUtils = new RandomUtils();
const messageUtils = new MessageUtils(logger, constants, randomUtils);
const dialogUtils = new DialogUtils(randomUtils);
const guildCreateHandler = new GuildCreateHandler(logger, constants, dialogUtils, messageUtils);
const guildMemberAddHandler = new GuildMemberAddHandler(logger, constants, dialogUtils, messageUtils, randomUtils);
const messageHandler = new MessageHandler(logger, messageUtils);
const eventTracker = new EventTracker(logger, dialogUtils, messageUtils, randomUtils, constants, google);

// Instantiate and initialize the discord bot.
const discordBot = new DiscordBot(logger, constants, discordClient, guildCreateHandler, guildMemberAddHandler,
    messageHandler, eventTracker);
discordBot.initialize();
