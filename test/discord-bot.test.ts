import {DiscordBot} from '../src/discord-bot';
import {Constants} from '../src/utils/constants';
import {Client, Collection, Guild, GuildMember, Message} from 'discord.js';
import {GuildCreateHandler} from '../src/handlers/guild-create-handler';
import {GuildMemberAddHandler} from '../src/handlers/guild-member-add-handler';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {Logger} from '../src/utils/logger';
import {MessageHandler} from '../src/handlers/message-handler';
import {EventTracker} from '../src/event-reminders/event-tracker';
import {TestHelper} from './test-helper';

describe('DiscordBot', () => {
  const botToken = 'botToken';

  let mockLogger: SpyObj<Logger>;
  let mockDiscordClient: SpyObj<Client>;
  let mockConstants: SpyObj<Constants>;
  let mockGuildCreateHandler: SpyObj<GuildCreateHandler>;
  let mockGuildMemberAddHandler: SpyObj<GuildMemberAddHandler>;
  let mockMessageHandler: SpyObj<MessageHandler>;
  let mockEventTracker: SpyObj<EventTracker>;
  let mockGuild: SpyObj<Guild>;

  let discordBot: DiscordBot;

  beforeEach(() => {
    mockLogger = createSpyObj('mockLogger', ['debug', 'info', 'warn', 'error']);

    const guildId = 'guild';
    mockGuild = createSpyObj('mockGuild', [], {id: guildId});
    const mockGuildsCache = new Collection<string, Guild>();
    mockGuildsCache.set(guildId, mockGuild);

    mockDiscordClient = createSpyObj('mockDiscordClient', ['on', 'login'], {
      guilds: {
        cache: mockGuildsCache
      }
    });
    mockDiscordClient.login.and.returnValue(new Promise<string>(resolve => resolve('')));

    mockConstants = createSpyObj('mockConstants', [], {botToken: botToken});
    mockGuildCreateHandler = createSpyObj('mockGuildCreateHandler', ['handleEvent']);
    mockGuildMemberAddHandler = createSpyObj('mockGuildMemberAddHandler', ['handleEvent']);
    mockMessageHandler = createSpyObj('mockMessageHandler', ['handleEvent']);
    mockEventTracker = createSpyObj('mockEventTracker', ['initialize']);

    discordBot = new DiscordBot(mockLogger, mockConstants, mockDiscordClient, mockGuildCreateHandler,
        mockGuildMemberAddHandler, mockMessageHandler, mockEventTracker);
  });

  describe('initialize', () => {
    it('should set the client event handlers', () => {
      const guildCreateEvent = 'guildCreate';
      const guildMemberAddEvent = 'guildMemberAdd';
      const messageEvent = 'message';
      const mockGuild: Guild = createSpyObj('mockGuild', [], {id: 'guildId'});
      const mockGuildMember: GuildMember = createSpyObj('mockGuildMember', [], {id: 'guildMember'});
      const mockMessage: Message = createSpyObj('mockMessage', [], {id: 'message'});

      const eventToHandler = new Map<string, (...args: unknown[]) => unknown>();
      mockDiscordClient.on.and.callFake((event: string, handler: (...args: unknown[]) => unknown) => {
        eventToHandler.set(event, handler);
        return mockDiscordClient;
      });

      discordBot.initialize();

      expect(eventToHandler.has(guildCreateEvent)).toBeTrue();
      (eventToHandler.get(guildCreateEvent) as (guild: Guild) => unknown)(mockGuild);
      expect(mockGuildCreateHandler.handleEvent).toHaveBeenCalledOnceWith(mockGuild);

      expect(eventToHandler.has(guildMemberAddEvent)).toBeTrue();
      (eventToHandler.get(guildMemberAddEvent) as (member: GuildMember) => unknown)(mockGuildMember);
      expect(mockGuildMemberAddHandler.handleEvent).toHaveBeenCalledOnceWith(mockGuildMember);

      expect(eventToHandler.has(messageEvent)).toBeTrue();
      (eventToHandler.get(messageEvent) as (message: Message) => unknown)(mockMessage);
      expect(mockMessageHandler.handleEvent).toHaveBeenCalledOnceWith(mockMessage);
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

    it('should initialize the event tracker after logging in', async () => {
      const loginResolvablePromise = TestHelper.getResolvablePromise<string>();
      mockDiscordClient.login.and.callFake(() => loginResolvablePromise.promise);

      discordBot.initialize();

      expect(mockEventTracker.initialize).not.toHaveBeenCalled();

      loginResolvablePromise.resolver('');
      await loginResolvablePromise.promise;

      expect(mockEventTracker.initialize).toHaveBeenCalledOnceWith(mockGuild);
    });
  });
});
