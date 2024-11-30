import {Logger} from '../utils/logger.ts';
import {CalendarEvent} from './calendar-event.ts';
import {DialogUtils} from '../utils/dialog-utils.ts';
import {MessageUtils} from '../utils/message-utils.ts';
import {RandomUtils} from '../utils/random-utils.ts';
import {Constants} from '../utils/constants.ts';
import {Guild} from 'discord.js';
import {DateTime} from 'luxon';
import {setTimeoutAt, Timeout} from 'safe-timers';
import {NotificationStrategy} from './notification-strategy.ts';

export class GameDevDiscussionsNotificationStrategy implements NotificationStrategy {
  private reminderNotificationTimeout: Timeout | null = null;
  private startNotificationTimeout: Timeout | null = null;
  private endNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants) {
  }

  /**
   * Schedule the notifications for the event.
   *
   * @param event The event.
   * @param nextEventStartTime The start time for the next event, if there is one.
   */
  public scheduleNotifications(event: CalendarEvent, nextEventStartTime?: DateTime): void {
    const now = DateTime.now();
    const oneDayBeforeStart = event.startTime.minus({days: 1});

    if (now <= oneDayBeforeStart) {
      this.logger.info(`Scheduling reminder notification for ${event.title} event.`, {eventId: event.id});
      this.reminderNotificationTimeout =
          setTimeoutAt(() => this.sendReminderNotification(event), oneDayBeforeStart.toMillis());
    }
    if (now <= event.startTime) {
      this.logger.info(`Scheduling start notification for ${event.title} event.`, {eventId: event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(event), event.startTime.toMillis());
    }
    if (now <= event.endTime && nextEventStartTime) {
      this.logger.info(`Scheduling end notification for ${event.title} event.`, {eventId: event.id});
      this.endNotificationTimeout =
          setTimeoutAt(() => this.sendEndNotification(event, nextEventStartTime), event.endTime.toMillis());
    }
  }

  /**
   * If notifications have been scheduled, cancel them.
   *
   * @param event The event.
   */
  public cancelNotifications(event: CalendarEvent): void {
    this.logger.info(`Canceling notifications for ${event.title} event.`, {eventId: event.id});
    if (this.reminderNotificationTimeout) {
      this.logger.info(`Canceling reminder notification for ${event.title} event.`, {eventId: event.id});
      this.reminderNotificationTimeout.clear();
      this.reminderNotificationTimeout = null;
    }
    if (this.startNotificationTimeout) {
      this.logger.info(`Canceling start notification for ${event.title} event.`, {eventId: event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
    if (this.endNotificationTimeout) {
      this.logger.info(`Canceling end notification for ${event.title} event.`, {eventId: event.id});
      this.endNotificationTimeout.clear();
      this.endNotificationTimeout = null;
    }
  }

  /**
   * Send the event reminder notification.
   *
   * @param event The event.
   */
  private async sendReminderNotification(event: CalendarEvent): Promise<void> {
    this.logger.info(`Sending reminder notification for ${event.title} event.`, {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateReminderMessage(event));
      await this.messageUtils.sendEventCountdownLink(announcementsChannel, event.title, event.startTime);
    } catch (error) {
      this.logger.error(`Unable to send reminder notification for ${event.title} event.`, error as Error,
          {eventId: event.id});
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
      this.logger.error(`Unable to send start notification for ${event.title} event.`, error as Error,
          {eventId: event.id});
    }
  }

  /**
   * Send the event end notification.
   *
   * @param event The event.
   * @param nextEventStartTime The start time for the next event, if there is one.
   */
  private async sendEndNotification(event: CalendarEvent, nextEventStartTime?: DateTime): Promise<void> {
    this.logger.info(`Sending end notification for ${event.title} event.`, {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateEndMessage(event, nextEventStartTime));
    } catch (error) {
      this.logger.error(`Unable to send end notification for ${event.title} event.`, error as Error,
          {eventId: event.id});
    }
  }

  /**
   * Generate an event reminder message.
   *
   * @param event The event.
   * @return An event reminder message.
   */
  private generateReminderMessage(event: CalendarEvent): string[] {
    const startTime = event.startTime.setZone(this.constants.timeZone).toLocaleString(DateTime.TIME_SIMPLE) +
        ' Central';
    const reminderOptions = [
      `@everyone, ${event.title} is tomorrow at ${startTime}. Do not forget about it. (Unless you want to.)`,
      `ATTENTION @everyone: Please remember to join us tomorrow at ${startTime} for ${event.title}. That is all.`,
      `Oh! @everyone! The next ${event.title} is tomorrow at ${startTime}. I am feeling the anticipation!`
    ];
    return [
      this.randomUtils.chooseRandomString(reminderOptions),
      this.dialogUtils.makeRobotNoise()
    ];
  }

  /**
   * Generate an event start message.
   *
   * @param event The event.
   * @return An event start message.
   */
  private generateStartMessage(event: CalendarEvent): string[] {
    const introOptions = [
      `Prepare yourselves! It is time for ${event.title}.`,
      `Just in case you may have forgotten... ${event.title} is starting right now!`,
      `Oh. Wow. It is time for ${event.title}!`
    ];
    const join = 'Please join using the General voice channel.';
    const outroOptions = [
      'I look forward to learning more about game development from you all.',
      'I do hope someone has some cool new stuff to show us!',
      'Even if you cannot think of anything to discuss, you will still be able to bask in glorious silence together. ' +
          this.dialogUtils.makeRobotNoise()
    ];
    return [
      `${this.randomUtils.chooseRandomString(introOptions)} ${this.dialogUtils.makeRobotNoise()} ${join}`,
      this.randomUtils.chooseRandomString(outroOptions)
    ];
  }

  /**
   * Generate an event end message.
   *
   * @param event The event.
   * @param nextEventStartTime The start time for the next event, if there is one.
   * @return An event end message.
   */
  private generateEndMessage(event: CalendarEvent, nextEventStartTime?: DateTime): string[] {
    if (nextEventStartTime) {
      const nextEventDateAndTime = nextEventStartTime
          .setZone(this.constants.timeZone)
          .toFormat('MMMM d \'at\' h:mm a \'Central\'');
      const closingOptions = [
        `Thank you for joining ${event.title} today.`,
        `I am so glad you could make it to today's ${event.title} event.`,
        `It was good to see you all at ${event.title} today.`
      ];
      const nextEventOptions = [
        `I hope you can make it to the next one on ${nextEventDateAndTime}.`,
        `See you next time on ${nextEventDateAndTime}!`,
        `The next one will be on ${nextEventDateAndTime}. Please store this information in your data banks.`
      ];
      return [
        `${this.randomUtils.chooseRandomString(closingOptions)} ${this.dialogUtils.makeRobotNoise()}`,
        this.randomUtils.chooseRandomString(nextEventOptions)
      ];
    } else {
      throw new Error(`Unable to generate end message for ${event.title} event - nextEventStartTime is not ` +
          'defined.');
    }
  }
}
