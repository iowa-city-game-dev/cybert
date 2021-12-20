import {Logger} from '../utils/logger';
import {CalendarEvent} from './calendar-event';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Constants} from '../utils/constants';
import {Guild} from 'discord.js';
import {setTimeoutAt, Timeout} from 'safe-timers';
import {DateTime} from 'luxon';
import {NotificationStrategy} from './notification-strategy';

export class GameDevTogetherNotificationStrategy implements NotificationStrategy {
  private startNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants) {
  }

  /**
   * Schedule the notification for the event.
   *
   * @param event The event.
   */
  public scheduleNotifications(event: CalendarEvent): void {
    if (DateTime.now() <= event.startTime) {
      this.logger.info(`Scheduling start notification for ${event.title} event.`, {eventId: event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(event), event.startTime.toMillis());
    }
  }

  /**
   * If a notification has been scheduled, cancel it.
   *
   * @param event The event.
   */
  public cancelNotifications(event: CalendarEvent): void {
    this.logger.info(`Canceling notifications for ${event.title} event.`, {eventId: event.id});
    if (this.startNotificationTimeout) {
      this.logger.info(`Canceling start notification for ${event.title} event.`, {eventId: event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
  }

  /**
   * Send the event start notification.
   *
   * @param event The event.
   */
  private async sendStartNotification(event: CalendarEvent): Promise<void> {
    this.logger.info(`Sending start notification for ${event.title} event.`, {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateStartMessage(event));
    } catch (error) {
      this.logger.error(`Unable to send start notification for ${event.title} event.`, error,
          {eventId: event.id});
    }
  }

  /**
   * Generate an event start message.
   *
   * @param event The event.
   * @return An event start message.
   */
  private generateStartMessage(event: CalendarEvent): string[] {
    const introOptions = [
      `It is time for ${event.title} to start!`,
      `${event.title} is starting right at this very moment!`,
      `Oh?! It is already time for ${event.title}!`
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
