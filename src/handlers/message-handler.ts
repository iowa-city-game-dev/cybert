import {Message} from 'discord.js';
import {Logger} from '../utils/logger';
import {MessageUtils} from '../utils/message-utils';

/**
 * This class handles `message` events.
 */
export class MessageHandler {
  private readonly robotRegex: RegExp;

  constructor(private readonly logger: Logger, private readonly messageUtils: MessageUtils) {
    this.robotRegex = MessageHandler.getRobotRegex();
  }

  /**
   * Handle the `message` event for the given message.
   *
   * @param message The message.
   */
  public handleEvent(message: Message): void {
    if (!MessageHandler.isFromCyBert(message)) {
      this.addReactionIfRobotThemed(message);
    }
  }

  /**
   * Get a regular expression for finding robot-themed content.
   *
   * @return The regular expression.
   */
  private static getRobotRegex(): RegExp {
    const robotThemedTerms = [
      'cybert',
      'robots?',
      'robotics?',
      'robo',
      'bots?',
      'nanobots?',
      'chatbots?',
      'ai',
      'artificial intelligence',
      'machine learning',
      'deep learning',
      'cyborgs?',
      'androids?',
      'droids?',
      'automatons?',
      'automata',
      'autonomous',
      'humanoids?',
      'tamagotchis?',
      'turing tests?',
      'roombas?',
      'drones?',
      'mars rovers?',
      'machinery',
      'mechs?',
      'mecha',
      'animatronics?',
      'replicants?',
      'transformers?',
      'daleks?',
      'uncanny valley',
      'simulation',
      'boston dynamics',
      'furby',
      'hal',
      'nier',
      'terminator',
      'bender',
      'r2-?d2',
      'c-?3po',
      'bb-?8',
      'ibm watson',
      'robotnik',
      'mega ?man',
      'ultron',
      'voltron',
      'cylons?',
      'tasbot',
      'glados',
      'bomberman',
      'mettaton',
      'metal gear',
      'five nights at freddy\'?s',
      'talos principle',
      'bmo',
      'into the breach',
      'the matrix',
      'cave story'
    ];

    const pattern = `\\b(${robotThemedTerms.join('|')})\\b`;
    return new RegExp(pattern, 'i');
  }

  /**
   * Check whether the given message is from CyBert.
   *
   * @param message The message.
   * @return `true` if the message is from CyBert, or `false` if it is not.
   */
  private static isFromCyBert(message: Message): boolean {
    return message.client.user?.id == message.author.id;
  }

  /**
   * If the given message is robot-themed or includes CyBert's name, react with a robot emoji.
   *
   * @param message The message.
   * @return A promise that resolves after a reaction is added, or after it is determined no reaction is needed.
   */
  private async addReactionIfRobotThemed(message: Message): Promise<void> {
    if (this.robotRegex.test(message.content)) {
      this.logger.info('Received a robot-themed message. Reacting with an emoji.', {
        messageId: message.id,
        authorId: message.author.id
      });
      try {
        await this.messageUtils.addReaction(message);
      } catch (error) {
        this.logger.error('Unable to add reaction to message.', error, {
          messageId: message.id,
          authorId: message.author.id
        });
      }
    }
  }
}
