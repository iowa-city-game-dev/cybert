import {GuildCreateHandler} from '../../src/handlers/guild-create-handler';
import SpyObj = jasmine.SpyObj;
import {Logger} from '../../src/utils/logger';
import {Constants} from '../../src/utils/constants';
import {DialogUtils} from '../../src/utils/dialog-utils';
import {MessageUtils} from '../../src/utils/message-utils';
import createSpyObj = jasmine.createSpyObj;
import {Guild, TextChannel} from 'discord.js';

describe('GuildCreateHandler', () => {
  const generalChannelName = 'generalChannelName';

  let mockLogger: SpyObj<Logger>;
  let mockConstants: SpyObj<Constants>;
  let mockDialogUtils: SpyObj<DialogUtils>;
  let mockMessageUtils: SpyObj<MessageUtils>;
  let guildCreateHandler: GuildCreateHandler;

  beforeEach(() => {
    mockLogger = createSpyObj('mockLogger', ['debug', 'info', 'warn', 'error']);
    mockConstants = createSpyObj('mockConstants', [], {generalChannelName});
    mockDialogUtils = createSpyObj('mockDialogUtils', ['makeRobotNoise']);
    mockMessageUtils = createSpyObj('mockMessageUtils', ['getChannel', 'sendMessages']);
    guildCreateHandler = new GuildCreateHandler(mockLogger, mockConstants, mockDialogUtils, mockMessageUtils);
  });

  describe('handleEvent', () => {
    const robotNoise1 = 'robotNoise1';
    const robotNoise2 = 'robotNoise2';

    let mockGuild: SpyObj<Guild>;
    let mockWelcomeChannel: SpyObj<TextChannel>;

    beforeEach(() => {
      mockGuild = createSpyObj('mockGuild', [], {id: 'guildId'});
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

    it('should use MessageUtils.sendMessages to send the correct sequence of introduction messages', () => {
      guildCreateHandler.handleEvent(mockGuild);

      expect(mockMessageUtils.sendMessages).toHaveBeenCalledOnceWith(mockWelcomeChannel, [
        '_Bwwwwwdoodoodadadeepdeepdoodoodadadeep...wooowaaaweeeewrrrrbleeeeblaaaachhh-**BOINGA**-**BOINGA**-' +
          'khhhhhSCHAAAAABLBLBLBLBLBLshhhh..._',
        'Oh. OH MY.',
        'I am terribly sorry about that. That was the sound of my dial-up modem connecting to the internet.',
        '(I do wish I had been built with more modern technology.)',
        `Oh! I should introduce myself! ${robotNoise1} I am CyBert.`,
        'I was invited here to help with things like sending reminders about events and welcoming new members.',
        'Welcome..... CyBert. (Sorry. I was just practicing.)',
        robotNoise2
      ]);
    });

    it('should write an error log if MessageUtils.sendMessages throws an error', () => {
      const error = new Error('errorMessage');
      mockMessageUtils.sendMessages.and.throwError(error);

      guildCreateHandler.handleEvent(mockGuild);

      expect(mockLogger.error).toHaveBeenCalledOnceWith('Unable to send introduction.', error);
    });
  });
});
