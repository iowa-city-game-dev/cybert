import SpyObj = jasmine.SpyObj;
import {Logger} from '../../src/utils/logger.ts';
import {Constants} from '../../src/utils/constants.ts';
import {DialogUtils} from '../../src/utils/dialog-utils.ts';
import {MessageUtils} from '../../src/utils/message-utils.ts';
import createSpyObj = jasmine.createSpyObj;
import {Guild, GuildMember, TextChannel} from 'discord.js';
import {GuildMemberAddHandler} from '../../src/handlers/guild-member-add-handler.ts';
import {RandomUtils} from '../../src/utils/random-utils.ts';

describe('GuildMemberAddHandler', () => {
  const generalChannelName = 'generalChannelName';

  let mockLogger: SpyObj<Logger>;
  let mockConstants: SpyObj<Constants>;
  let mockDialogUtils: SpyObj<DialogUtils>;
  let mockMessageUtils: SpyObj<MessageUtils>;
  let mockRandomUtils: SpyObj<RandomUtils>;
  let guildMemberAddHandler: GuildMemberAddHandler;

  beforeEach(() => {
    mockLogger = createSpyObj('mockLogger', ['debug', 'info', 'warn', 'error']);
    mockConstants = createSpyObj('mockConstants', [], {generalChannelName});
    mockDialogUtils = createSpyObj('mockDialogUtils', ['makeRobotNoise']);
    mockMessageUtils = createSpyObj('mockMessageUtils', ['getChannel', 'sendMessages']);
    mockRandomUtils = createSpyObj('mockRandomUtils', ['chooseRandomString']);
    guildMemberAddHandler = new GuildMemberAddHandler(mockLogger, mockConstants, mockDialogUtils, mockMessageUtils,
        mockRandomUtils);
  });

  describe('handleEvent', () => {
    const robotNoise1 = 'robotNoise1';
    const robotNoise2 = 'robotNoise2';
    const guildMemberId = 'guildMemberId';

    let mockGuild: SpyObj<Guild>;
    let mockGuildMember: SpyObj<GuildMember>;
    let mockWelcomeChannel: SpyObj<TextChannel>;

    beforeEach(() => {
      mockGuild = createSpyObj('mockGuild', [], {id: 'guildId'});
      mockGuildMember = createSpyObj('mockGuildMember', ['toString'], {id: guildMemberId, guild: mockGuild});
      mockGuildMember.toString.and.returnValue(`<@${guildMemberId}>`);
      mockWelcomeChannel = createSpyObj('mockWelcomeChannel', ['send']);
      mockMessageUtils.getChannel.and.callFake((channelName, guild) => {
        if (channelName === generalChannelName && guild === mockGuild) {
          return mockWelcomeChannel;
        } else {
          return null;
        }
      });
      mockDialogUtils.makeRobotNoise.and.returnValues(robotNoise1, robotNoise2);
    });

    it('should use MessageUtils.sendMessages to send the correct sequence of welcome messages', () => {
      mockRandomUtils.chooseRandomString.and.callFake(possibleMessages => possibleMessages[0]);

      guildMemberAddHandler.handleEvent(mockGuildMember);

      expect(mockMessageUtils.sendMessages).toHaveBeenCalledOnceWith(mockWelcomeChannel, [
        `Hello <@${guildMemberId}>. ${robotNoise1} Welcome to the group. Please familiarize yourself with your ` +
          'surroundings.',
        'When you are ready, we would love to hear a little bit about you.',
        robotNoise2
      ]);
    });

    it('should write an error log if MessageUtils.sendMessages throws an error', () => {
      const error = new Error('errorMessage');
      mockMessageUtils.sendMessages.and.throwError(error);

      guildMemberAddHandler.handleEvent(mockGuildMember);

      expect(mockLogger.error).toHaveBeenCalledOnceWith('Unable to send welcome message to new member.', error,
          {memberId: guildMemberId});
    });
  });
});
