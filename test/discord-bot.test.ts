import {DiscordBot} from '../src/discord-bot';
import {Constants} from '../src/utils/constants';
import {Client} from 'discord.js';
import {SelfIntroduction} from '../src/actions/self-introduction';
import {NewMemberWelcome} from '../src/actions/new-member-welcome';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {Logger} from '../src/utils/logger';

describe('DiscordBot', () => {
  const botToken = 'botToken';

  let mockLogger: SpyObj<Logger>;
  let mockDiscordClient: SpyObj<Client>;
  let mockConstants: SpyObj<Constants>;
  let mockSelfIntroduction: SelfIntroduction;
  let mockNewMemberWelcome: NewMemberWelcome;

  let discordBot: DiscordBot;

  beforeEach(() => {
    mockLogger = createSpyObj('mockLogger', ['debug', 'info', 'warn', 'error']);

    mockDiscordClient = createSpyObj('mockDiscordClient', ['on', 'login']);
    mockDiscordClient.login.and.returnValue(new Promise<string>(resolve => resolve('')));

    mockConstants = createSpyObj('mockConstants', [], {botToken: botToken});
    mockSelfIntroduction = createSpyObj('mockSelfIntroduction', ['introduceSelf']);
    mockNewMemberWelcome = createSpyObj('mockNewMemberWelcome', ['welcomeNewMember']);

    discordBot = new DiscordBot(mockLogger, mockConstants, mockDiscordClient, mockSelfIntroduction,
      mockNewMemberWelcome);
  });

  describe('initialize', () => {
    it('should set the client event handlers', () => {
      discordBot.initialize();
      expect(mockDiscordClient.on).toHaveBeenCalledWith('guildCreate', mockSelfIntroduction.introduceSelf);
      expect(mockDiscordClient.on).toHaveBeenCalledWith('guildMemberAdd', mockNewMemberWelcome.welcomeNewMember);
    });

    it('should log in using the configured bot token', () => {
      discordBot.initialize();
      expect(mockDiscordClient.login).toHaveBeenCalledOnceWith(botToken);
    });

    it('should set the client event handlers before logging in', () => {
      let loggedIn = false;

      mockDiscordClient.login.and.callFake(() => {
        loggedIn = true;
        return new Promise<string>(resolve => resolve(''));
      });

      mockDiscordClient.on.and.callFake(() => {
        if (loggedIn) {
          fail('An event handler was set after login.');
        }
        return mockDiscordClient;
      });

      discordBot.initialize();
    });
  });
});
