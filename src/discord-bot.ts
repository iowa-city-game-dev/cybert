import {Constants} from './utils/constants';
import {Client} from 'discord.js';
import {Logger} from './utils/logger';
import {GuildMemberAddHandler} from './handlers/guild-member-add-handler';
import {GuildCreateHandler} from './handlers/guild-create-handler';
import {MessageHandler} from './handlers/message-handler';

/**
 * This class is responsible for setting up the Discord Bot.
 */
export class DiscordBot {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
    private readonly discordClient: Client,private readonly guildCreateHandler: GuildCreateHandler,
    private guildMemberAddHandler: GuildMemberAddHandler, private messageHandler: MessageHandler) {
  }

  /**
   * Initialize CyBert.
   */
  public initialize(): void {
    this.logger.info('CyBert is starting up.', {version: this.constants.botVersion});
    this.setUpEventHandlers();
    this.login();
  }

  /**
   * Set up event handlers.
   */
  private setUpEventHandlers(): void {
    this.discordClient.on('ready', () => this.logger.info('CyBert is ready.'));
    this.discordClient.on('guildCreate', guild => this.guildCreateHandler.handleEvent(guild));
    this.discordClient.on('guildMemberAdd', member => this.guildMemberAddHandler.handleEvent(member));
    this.discordClient.on('message', message => this.messageHandler.handleEvent(message));
  }

  /**
   * Log in to Discord.
   *
   * @return A promise that resolves after CyBert is logged in to Discord.
   */
  private async login(): Promise<void> {
    try {
      await this.discordClient.login(this.constants.botToken);
    } catch (error) {
      this.logger.error('CyBert failed to start.', error);
    }
  }
}
