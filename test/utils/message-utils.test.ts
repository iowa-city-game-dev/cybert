import {Constants} from '../../src/utils/constants.ts';
import SpyObj = jasmine.SpyObj;
import {MessageUtils} from '../../src/utils/message-utils.ts';
import {Collection, Guild, GuildChannel, GuildChannelManager, GuildEmoji, Message, TextChannel} from 'discord.js';
import {RandomUtils} from '../../src/utils/random-utils.ts';
import createSpyObj = jasmine.createSpyObj;
import clock = jasmine.clock;
import {TestHelper} from '../test-helper.ts';
import {Logger} from '../../src/utils/logger.ts';

describe('MessageUtils', () => {
  const botMaxThinkingTimeInSeconds = 10;
  const botAverageWordsPerMinute = 50;
  const botMaxVariationInWordsPerMinute = 3;
  const averageCharactersPerWord = 4;
  const randomNumbers: readonly number[] = [.31, .84, .49, .04];

  let mockLogger: SpyObj<Logger>;
  let mockConstants: SpyObj<Constants>;
  let mockRandomUtils: SpyObj<RandomUtils>;
  let messageUtils: MessageUtils;

  beforeEach(() => {
    mockLogger = createSpyObj('mockLogger', ['debug', 'info', 'warn', 'error']);
    mockConstants = createSpyObj('mockConstants', [], {
      botMaxThinkingTimeInSeconds,
      botAverageWordsPerMinute,
      botMaxVariationInWordsPerMinute,
      averageCharactersPerWord
    });
    mockRandomUtils = createSpyObj('mockRandomUtils', ['generateRandomNumber', 'chooseRandomString']);
    mockRandomUtils.generateRandomNumber.and.returnValues(...randomNumbers);
    messageUtils = new MessageUtils(mockLogger, mockConstants, mockRandomUtils);
  });

  function calculateThinkingTime(randomNumber: number): number {
    return botMaxThinkingTimeInSeconds * 1000 * randomNumber;
  }

  describe('sendMessages', () => {
    const message1 = 'Message 1.';
    const message2 = 'This is message 2.';

    let mockChannel: SpyObj<TextChannel>;

    beforeEach(() => {
      clock().install();
      mockChannel = createSpyObj('mockChannel', ['sendTyping', 'send']);
    });

    afterEach(() => clock().uninstall());

    function calculateTypingTime(messageLength: number, randomNumber: number): number {
      const wordsPerMinute = mockConstants.botAverageWordsPerMinute + ((mockConstants.botMaxVariationInWordsPerMinute *
        randomNumber) - (mockConstants.botMaxVariationInWordsPerMinute / 2));
      return (1 / (wordsPerMinute * mockConstants.averageCharactersPerWord)) * messageLength * 60 * 1000;
    }

    it('should send a single message with the proper timing', async () => {
      messageUtils.sendMessages(mockChannel, [message1]);

      clock().tick(calculateThinkingTime(randomNumbers[0]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).not.toHaveBeenCalled();

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).toHaveBeenCalled();

      clock().tick(calculateTypingTime(message1.length, randomNumbers[1]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).not.toHaveBeenCalled();

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).toHaveBeenCalledOnceWith(message1);
    });

    it('should send multiple messages with the proper timing', async () => {
      messageUtils.sendMessages(mockChannel, [message1, message2]);

      // Start steps for message1.

      clock().tick(calculateThinkingTime(randomNumbers[0]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).toHaveBeenCalledTimes(0);

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).toHaveBeenCalledTimes(1);

      clock().tick(calculateTypingTime(message1.length, randomNumbers[1]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).toHaveBeenCalledTimes(0);

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).toHaveBeenCalledTimes(1);
      expect(mockChannel.send).toHaveBeenCalledWith(message1);

      // Start steps for message2.

      await TestHelper.clearEventQueue();
      await TestHelper.clearEventQueue();
      clock().tick(calculateThinkingTime(randomNumbers[2]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).toHaveBeenCalledTimes(1);

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.sendTyping).toHaveBeenCalledTimes(2);

      clock().tick(calculateTypingTime(message2.length, randomNumbers[3]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).toHaveBeenCalledTimes(1);

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockChannel.send).toHaveBeenCalledTimes(2);
      expect(mockChannel.send).toHaveBeenCalledWith(message2);
    });

    it('should throw an error if the channel is not defined', async () => {
      try {
        await messageUtils.sendMessages(null, [message1]);
        fail('Expected error to be thrown.');
      } catch (error) {
        expect(error).toEqual(new Error('Unable to send message(s) - channel not defined.'));
      }
    });

    it('should throw an error if the sending of a message fails', async () => {
      const expectedError = new Error('Sending of message failed.');
      mockChannel.send.and.throwError(expectedError);

      const promise = messageUtils.sendMessages(mockChannel, [message1]);

      clock().tick(calculateThinkingTime(randomNumbers[0]));
      await TestHelper.clearEventQueue();
      clock().tick(calculateTypingTime(message1.length, randomNumbers[1]));

      try {
        await promise;
        fail('Expected error to be thrown.');
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('addReaction', () => {
    const emojiName = 'autobot';

    let mockMessage: SpyObj<Message>;
    let mockGuildChannelCache: Collection<string, GuildEmoji>;

    beforeEach(() => {
      clock().install();
      mockGuildChannelCache = new Collection<string, GuildEmoji>();
      mockMessage = createSpyObj('mockMessage', ['react'], {
        client: {
          emojis: {
            cache: mockGuildChannelCache
          }
        }
      });
      mockRandomUtils.chooseRandomString.and.callFake(possibleStrings => possibleStrings[0]);
    });

    afterEach(() => clock().uninstall());

    it('should add a reaction with proper timing', async () => {
      const emojiId = 'emojiId';
      const mockEmoji: SpyObj<GuildEmoji> = createSpyObj('mockEmoji', [], {id: emojiId, name: emojiName});
      mockGuildChannelCache.set('1', mockEmoji);

      messageUtils.addReaction(mockMessage);

      clock().tick(calculateThinkingTime(randomNumbers[0]) - 1);
      await TestHelper.clearEventQueue();

      expect(mockMessage.react).not.toHaveBeenCalled();

      clock().tick(1);
      await TestHelper.clearEventQueue();

      expect(mockMessage.react).toHaveBeenCalledOnceWith(emojiId);
    });

    it('should throw an error if the chosen emoji is not found', async () => {
      try {
        await messageUtils.addReaction(mockMessage);
        fail('Expected error to be thrown.');
      } catch (error) {
        expect(error).toEqual(new Error(`Unable to react to message - emoji "${emojiName}" not found.`));
      }
    });

    it('should throw an error if the adding of the reaction fails', async () => {
      const emojiId = 'emojiId';
      const mockEmoji: SpyObj<GuildEmoji> = createSpyObj('mockEmoji', [], {id: emojiId, name: emojiName});
      mockGuildChannelCache.set('1', mockEmoji);

      const expectedError = new Error('Sending of message failed.');
      mockMessage.react.and.throwError(expectedError);

      const promise = messageUtils.addReaction(mockMessage);

      clock().tick(calculateThinkingTime(randomNumbers[0]));
      await TestHelper.clearEventQueue();

      try {
        await promise;
        fail('Expected error to be thrown.');
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('getChannel', () => {
    const channelName = 'channelName';

    let mockGuild: SpyObj<Guild>;
    let mockGuildChannelManager: SpyObj<GuildChannelManager>;
    let mockGuildChannelCache: Collection<string, GuildChannel>;
    let mockChannel: SpyObj<TextChannel>;

    beforeEach(() => {
      mockGuildChannelCache = new Collection<string, GuildChannel>();
      mockGuildChannelManager = createSpyObj('mockGuildChannelManager', [], {cache: mockGuildChannelCache});
      mockGuild = createSpyObj('mockGuild', [], {channels: mockGuildChannelManager});
      mockChannel = createSpyObj('mockChannel', ['isTextBased'], {name: channelName});
      mockChannel.isTextBased.and.returnValue(true);
    });

    it('should return the text channel with the given name if it exists', () => {
      mockGuildChannelCache.set('1', mockChannel);
      const channel = messageUtils.getChannel(channelName, mockGuild);
      expect(channel).toBe(mockChannel);
    });

    it('should return null if the text channel with the given name does not exist', () => {
      const channel = messageUtils.getChannel(channelName, mockGuild);
      expect(channel).toBeNull();
    });
  });
});
