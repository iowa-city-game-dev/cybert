import {Logger} from '../utils/logger.ts';
import {CalendarEvent} from './calendar-event.ts';
import {DialogUtils} from '../utils/dialog-utils.ts';
import {MessageUtils} from '../utils/message-utils.ts';
import {RandomUtils} from '../utils/random-utils.ts';
import {Constants} from '../utils/constants.ts';
import {Guild} from 'discord.js';
import {setTimeoutAt, Timeout} from 'safe-timers';
import {DateTime} from 'luxon';
import {NotificationStrategy} from './notification-strategy.ts';

export class GeneralNotificationStrategy implements NotificationStrategy {
  private announcementNotificationTimeout: Timeout | null = null;
  private reminderNotificationTimeout: Timeout | null = null;
  private startNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants) {
  }

  /**
   * Schedule the notifications for the event.
   *
   * @param event The event.
   */
  public scheduleNotifications(event: CalendarEvent): void {
    const now = DateTime.now();
    const threeWeeksBeforeStart = event.startTime.minus({weeks: 3});
    const oneDayBeforeStart = event.startTime.minus({days: 1});

    if (now <= threeWeeksBeforeStart) {
      this.logger.info('Scheduling announcement notification for general event.', {eventId: event.id});
      this.announcementNotificationTimeout =
        setTimeoutAt(() => this.sendAnnouncementNotification(event), threeWeeksBeforeStart.toMillis());
    }
    if (now <= oneDayBeforeStart) {
      this.logger.info('Scheduling reminder notification for general event.', {eventId: event.id});
      this.reminderNotificationTimeout =
        setTimeoutAt(() => this.sendReminderNotification(event), oneDayBeforeStart.toMillis());
    }
    if (now <= event.startTime) {
      this.logger.info('Scheduling start notification for general event.', {eventId: event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(event), event.startTime.toMillis());
    }
  }

  /**
   * If notifications have been scheduled, cancel them.
   *
   * @param event The event.
   */
  public cancelNotifications(event: CalendarEvent): void {
    this.logger.info('Canceling notifications for general event.', {eventId: event.id});
    if (this.announcementNotificationTimeout) {
      this.logger.info('Canceling announcement notification for general event.', {eventId: event.id});
      this.announcementNotificationTimeout.clear();
      this.announcementNotificationTimeout = null;
    }
    if (this.reminderNotificationTimeout) {
      this.logger.info('Canceling reminder notification for general event.', {eventId: event.id});
      this.reminderNotificationTimeout.clear();
      this.reminderNotificationTimeout = null;
    }
    if (this.startNotificationTimeout) {
      this.logger.info('Canceling start notification for general event.', {eventId: event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
  }

  /**
   * Send the event announcement notification.
   *
   * @param event The event.
   */
  private async sendAnnouncementNotification(event: CalendarEvent): Promise<void> {
    this.logger.info('Sending announcement notification for general event.', {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateAnnouncementMessage(event));
    } catch (error) {
      this.logger.error('Unable to send announcement notification for general event.', error as Error,
          {eventId: event.id});
    }
  }

  /**
   * Send the event reminder notification.
   *
   * @param event The event.
   */
  private async sendReminderNotification(event: CalendarEvent): Promise<void> {
    this.logger.info('Sending reminder notification for general event.', {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateReminderMessage(event));
      await this.messageUtils.sendEventCountdownLink(announcementsChannel, event.title, event.startTime);
    } catch (error) {
      this.logger.error('Unable to send reminder notification for general event.', error as Error, {eventId: event.id});
    }
  }

  /**
   * Send the event start notification.
   *
   * @param event The event.
   */
  private async sendStartNotification(event: CalendarEvent): Promise<void> {
    this.logger.info('Sending start notification for general event.', {eventId: event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateStartMessage(event));
    } catch (error) {
      this.logger.error('Unable to send start notification for general event.', error as Error, {eventId: event.id});
    }
  }

  /**
   * Generate an event announcement message.
   *
   * @param event The event.
   * @return An event announcement message.
   */
  private generateAnnouncementMessage(event: CalendarEvent): string[] {
    const startDateAndTime = event.startTime
        .setZone(this.constants.timeZone)
        .toFormat('MMMM d \'at\' h:mm a \'Central\'');
    const announcementOptions = [
      `I have an announcement to make. The event ${event.title} is approaching. It will start on ` +
          `${startDateAndTime}.`,
      `I am alerting you of an event that will occur in the near future: ${event.title}. This will happen on ` +
          startDateAndTime,
      `Insert data into your calendars for ${startDateAndTime}. At this time, ${event.title} will occur.`
    ];
    return [
      this.randomUtils.chooseRandomString(announcementOptions),
      this.dialogUtils.makeRobotNoise()
    ];
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
      `Oh! Hey! ${event.title} starts tomorrow at ${startTime}!`,
      `You may desire to recall that ${event.title} will begin tomorrow at ${startTime}.`,
      `I am looking at the calendar and I am seeing ${event.title} tomorrow at ${startTime}. Have a ' +
          'nice day.`
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
    const startMessageOptions = [
      `I thought you might want to know... It is now time for ${event.title} to start!`,
      `Do not forget! ${event.title} is starting now!`,
      `The time has come for ${event.title} to begin! According to my reasoning capabilities, this information ` +
          'may be useful to you.'
    ];
    return [
      this.randomUtils.chooseRandomString(startMessageOptions),
      this.dialogUtils.makeRobotNoise()
    ];
  }
}
