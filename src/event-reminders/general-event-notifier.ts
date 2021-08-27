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

export class GeneralEventNotifier extends EventNotifier {
  private announcementNotificationTimeout: Timeout | null = null;
  private reminderNotificationTimeout: Timeout | null = null;
  private startNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants,
      readonly event: CalendarEvent) {
    super(logger, dialogUtils, messageUtils, guild, randomUtils, constants, event, null);
  }

  /**
   * If notifications have been scheduled, cancel them.
   */
  public cancelNotifications(): void {
    if (this.announcementNotificationTimeout) {
      this.logger.info('Canceling announcement notification for general event.', {eventId: this.event.id});
      this.announcementNotificationTimeout.clear();
      this.announcementNotificationTimeout = null;
    }
    if (this.reminderNotificationTimeout) {
      this.logger.info('Canceling reminder notification for general event.', {eventId: this.event.id});
      this.reminderNotificationTimeout.clear();
      this.reminderNotificationTimeout = null;
    }
    if (this.startNotificationTimeout) {
      this.logger.info('Canceling start notification for general event.', {eventId: this.event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
  }

  /**
   * Schedule the notifications for the event.
   */
  protected scheduleNotifications(): void {
    const now = DateTime.now();
    const threeWeeksBeforeStart = this.event.startTime.minus({weeks: 3});
    const oneDayBeforeStart = this.event.startTime.minus({days: 1});

    if (now <= threeWeeksBeforeStart) {
      this.logger.info('Scheduling announcement notification for general event.', {eventId: this.event.id});
      this.announcementNotificationTimeout =
        setTimeoutAt(() => this.sendAnnouncementNotification(), threeWeeksBeforeStart.toMillis());
    }
    if (now <= oneDayBeforeStart) {
      this.logger.info('Scheduling reminder notification for general event.', {eventId: this.event.id});
      this.reminderNotificationTimeout =
        setTimeoutAt(() => this.sendReminderNotification(), oneDayBeforeStart.toMillis());
    }
    if (now <= this.event.startTime) {
      this.logger.info('Scheduling start notification for general event.', {eventId: this.event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(), this.event.startTime.toMillis());
    }
  }

  /**
   * Send the event announcement notification.
   */
  private async sendAnnouncementNotification(): Promise<void> {
    this.logger.info('Sending announcement notification for general event.', {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateAnnouncementMessage());
    } catch (error) {
      this.logger.error('Unable to send announcement notification for general event.', error, {eventId: this.event.id});
    }
  }

  /**
   * Send the event reminder notification.
   */
  private async sendReminderNotification(): Promise<void> {
    this.logger.info('Sending reminder notification for general event.', {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateReminderMessage());
      await this.messageUtils.sendEventCountdownLink(announcementsChannel, this.event.title, this.event.startTime);
    } catch (error) {
      this.logger.error('Unable to send reminder notification for general event.', error, {eventId: this.event.id});
    }
  }

  /**
   * Send the event start notification.
   */
  private async sendStartNotification(): Promise<void> {
    this.logger.info('Sending start notification for general event.', {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateStartMessage());
    } catch (error) {
      this.logger.error('Unable to send start notification for general event.', error, {eventId: this.event.id});
    }
  }

  /**
   * Generate an event announcement message.
   *
   * @return An event announcement message.
   */
  private generateAnnouncementMessage(): string[] {
    const startDateAndTime = this.event.startTime
        .setZone(this.constants.timeZone)
        .toFormat('MMMM d \'at\' h:mm a \'Central\'');
    const announcementOptions = [
      `I have an announcement to make. The event ${this.event.title} is approaching. It will start on ` +
          `${startDateAndTime}.`,
      `I am alerting you of an event that will occur in the near future: ${this.event.title}. This will happen on ` +
          startDateAndTime,
      `Insert data into your calendars for ${startDateAndTime}. At this time, ${this.event.title} will occur.`
    ];
    return [
      this.randomUtils.chooseRandomString(announcementOptions),
      this.dialogUtils.makeRobotNoise()
    ];
  }

  /**
   * Generate an event reminder message.
   *
   * @return An event reminder message.
   */
  private generateReminderMessage(): string[] {
    const startTime = this.event.startTime.setZone(this.constants.timeZone).toLocaleString(DateTime.TIME_SIMPLE) +
      ' Central';
    const reminderOptions = [
      `Oh! Hey! ${this.event.title} starts tomorrow at ${startTime}!`,
      `You may desire to recall that ${this.event.title} will begin tomorrow at ${startTime}.`,
      `I am looking at the calendar and I am seeing ${this.event.title} tomorrow at ${startTime}. Have a ' +
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
   * @return An event start message.
   */
  private generateStartMessage(): string[] {
    const startMessageOptions = [
      `I thought you might want to know... It is now time for ${this.event.title} to start!`,
      `Do not forget! ${this.event.title} is starting now!`,
      `The time has come for ${this.event.title} to begin! According to my reasoning capabilities, this information ` +
          'may be useful to you.'
    ];
    return [
      this.randomUtils.chooseRandomString(startMessageOptions),
      this.dialogUtils.makeRobotNoise()
    ];
  }
}
