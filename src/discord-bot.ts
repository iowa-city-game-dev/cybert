import {Constants} from './utils/constants';
import {Client} from 'discord.js';
import {logger} from './utils/logger';
import {NewMemberWelcome} from './actions/new-member-welcome';
import {SelfIntroduction} from './actions/self-introduction';

/**
 * This class is responsible for setting up the Discord Bot.
 */
export class DiscordBot {
  constructor(private discordClient: Client, private constants: Constants, private selfIntroduction: SelfIntroduction,
    private newMemberWelcome: NewMemberWelcome) {
  }

  /**
   * Initialize CyBert.
   */
  public initialize(): void {
    logger.info(`message="CyBert is starting up.", version="${this.constants.botVersion}"`);
    this.setUpEventHandlers();
    this.login();
  }

  /**
   * Set up event handlers.
   */
  private setUpEventHandlers(): void {
    this.discordClient.on('ready', () => logger.info('message="CyBert is ready."'));
    this.discordClient.on('guildCreate', this.selfIntroduction.introduceSelf);
    this.discordClient.on('guildMemberAdd', this.newMemberWelcome.welcomeNewMember);
  }

  /**
   * Log in to Discord.
   */
  private login(): void {
    this.discordClient.login(this.constants.botToken)
      .catch(error => logger.error({message: 'message="CyBert failed to start."', error}));
  }
}
