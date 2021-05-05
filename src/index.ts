import {Client} from 'discord.js';
import {Constants} from './utils/constants';
import {DiscordBot} from './discord-bot';
import {SelfIntroduction} from './actions/self-introduction';
import {NewMemberWelcome} from './actions/new-member-welcome';
import {MessageUtils} from './utils/message-utils';
import {DialogUtils} from './utils/dialog-utils';

// Instantiate dependencies.
const discordClient = new Client();
const constants = new Constants();
const messageUtils = new MessageUtils(constants);
const dialogUtils = new DialogUtils();
const selfIntroduction = new SelfIntroduction(constants, dialogUtils, messageUtils);
const newMemberWelcome = new NewMemberWelcome(constants, dialogUtils, messageUtils);

// Instantiate and initialize the discord bot.
const discordBot = new DiscordBot(discordClient, constants, selfIntroduction, newMemberWelcome);
discordBot.initialize();
