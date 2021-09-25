import {EventNotifier} from './event-notifier';
import {Logger} from '../utils/logger';
import {CalendarEvent} from './calendar-event';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Constants} from '../utils/constants';
import {Guild} from 'discord.js';
import {setTimeoutAt, Timeout} from 'safe-timers';
import {DateTime} from 'luxon';

export class GameDevTogetherEventNotifier extends EventNotifier {
  private startNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants,
      readonly event: CalendarEvent) {
    super(logger, dialogUtils, messageUtils, guild, randomUtils, constants, event, null);
  }

  /**
   * If a notification has been scheduled, cancel it.
   */
  public cancelNotifications(): void {
    this.logger.info(`Canceling notifications for ${this.event.title} event.`, {eventId: this.event.id});
    if (this.startNotificationTimeout) {
      this.logger.info(`Canceling start notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
  }

  /**
   * Schedule the notification for the event.
   */
  protected scheduleNotifications(): void {
    if (DateTime.now() <= this.event.startTime) {
      this.logger.info(`Scheduling start notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(), this.event.startTime.toMillis());
    }
  }

  /**
   * Send the event start notification.
   */
  private async sendStartNotification(): Promise<void> {
    this.logger.info(`Sending start notification for ${this.event.title} event.`, {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateStartMessage());
    } catch (error) {
      this.logger.error(`Unable to send start notification for ${this.event.title} event.`, error,
          {eventId: this.event.id});
    }
  }

  /**
   * Generate an event start message.
   *
   * @return An event start message.
   */
  private generateStartMessage(): string[] {
    const introOptions = [
      `It is time for ${this.event.title} to start!`,
      `${this.event.title} is starting right at this very moment!`,
      `Oh?! It is already time for ${this.event.title}!`
    ];
    const join = 'Please join using the General voice channel.';
    const outroOptions = [
      'I am looking forward to seeing what you all create today.',
      'I cannot wait to see what you humans create next.',
      'According to Wikipedia, humans can increase motivation by participating in activities within social groups. ' +
          'Fascinating!'
    ];
    return [
      `${this.randomUtils.chooseRandomString(introOptions)} ${this.dialogUtils.makeRobotNoise()} ${join}`,
      this.randomUtils.chooseRandomString(outroOptions)
    ];
  }
}
