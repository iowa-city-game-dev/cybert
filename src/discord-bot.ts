import {Constants} from './utils/constants.ts';
import {Client, Events} from 'discord.js';
import {Logger} from './utils/logger.ts';
import {GuildMemberAddHandler} from './handlers/guild-member-add-handler.ts';
import {GuildCreateHandler} from './handlers/guild-create-handler.ts';
import {MessageHandler} from './handlers/message-handler.ts';
import {EventTracker} from './event-reminders/event-tracker.ts';

/**
 * This class is responsible for setting up the Discord Bot.
 */
export class DiscordBot {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
    private readonly discordClient: Client,private readonly guildCreateHandler: GuildCreateHandler,
    private readonly guildMemberAddHandler: GuildMemberAddHandler, private readonly messageHandler: MessageHandler,
    private readonly eventTracker: EventTracker) {
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
    this.discordClient.on(Events.ClientReady, () => this.logger.info('CyBert is ready.'));
    this.discordClient.on(Events.GuildCreate, guild => this.guildCreateHandler.handleEvent(guild));
    this.discordClient.on(Events.GuildMemberAdd, member => this.guildMemberAddHandler.handleEvent(member));
    this.discordClient.on(Events.MessageCreate, message => this.messageHandler.handleEvent(message));
  }

  /**
   * Log in to Discord.
   *
   * @return A promise that resolves after CyBert is logged in to Discord.
   */
  private async login(): Promise<void> {
    try {
      await this.discordClient.login(this.constants.botToken);
      const guild = this.discordClient.guilds.cache.first();
      if (!guild) {
        throw new Error('No guild found.');
      }
      this.eventTracker.initialize(guild);
    } catch (error) {
      this.logger.error('CyBert failed to start.', error as Error);
    }
  }
}
