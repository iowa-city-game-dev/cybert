import {EventNotifier} from './event-notifier';
import {Logger} from '../utils/logger';
import {CalendarEvent} from './calendar-event';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Constants} from '../utils/constants';
import {Guild} from 'discord.js';
import {DateTime} from 'luxon';
import {setTimeoutAt, Timeout} from 'safe-timers';

export class GameDevDiscussionsEventNotifier extends EventNotifier {
  private reminderNotificationTimeout: Timeout | null = null;
  private startNotificationTimeout: Timeout | null = null;
  private endNotificationTimeout: Timeout | null = null;

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly guild: Guild, readonly randomUtils: RandomUtils, readonly constants: Constants,
      readonly event: CalendarEvent, nextEventStartTime: DateTime | null) {
    super(logger, dialogUtils, messageUtils, guild, randomUtils, constants, event, nextEventStartTime);
  }

  /**
   * If notifications have been scheduled, cancel them.
   */
  public cancelNotifications(): void {
    this.logger.info(`Canceling notifications for ${this.event.title} event.`, {eventId: this.event.id});
    if (this.reminderNotificationTimeout) {
      this.logger.info(`Canceling reminder notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.reminderNotificationTimeout.clear();
      this.reminderNotificationTimeout = null;
    }
    if (this.startNotificationTimeout) {
      this.logger.info(`Canceling start notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.startNotificationTimeout.clear();
      this.startNotificationTimeout = null;
    }
    if (this.endNotificationTimeout) {
      this.logger.info(`Canceling end notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.endNotificationTimeout.clear();
      this.endNotificationTimeout = null;
    }
  }

  /**
   * Schedule the notifications for the event.
   */
  protected scheduleNotifications(): void {
    const now = DateTime.now();
    const oneDayBeforeStart = this.event.startTime.minus({days: 1});

    if (now <= oneDayBeforeStart) {
      this.logger.info(`Scheduling reminder notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.reminderNotificationTimeout =
        setTimeoutAt(() => this.sendReminderNotification(), oneDayBeforeStart.toMillis());
    }
    if (now <= this.event.startTime) {
      this.logger.info(`Scheduling start notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.startNotificationTimeout = setTimeoutAt(() => this.sendStartNotification(), this.event.startTime.toMillis());
    }
    if (now <= this.event.endTime && this.nextEventStartTime) {
      this.logger.info(`Scheduling end notification for ${this.event.title} event.`, {eventId: this.event.id});
      this.endNotificationTimeout = setTimeoutAt(() => this.sendEndNotification(), this.event.endTime.toMillis());
    }
  }

  /**
   * Send the event reminder notification.
   */
  private async sendReminderNotification(): Promise<void> {
    this.logger.info(`Sending reminder notification for ${this.event.title} event.`, {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateReminderMessage());
      await this.messageUtils.sendEventCountdownLink(announcementsChannel, this.event.title, this.event.startTime);
    } catch (error) {
      this.logger.error(`Unable to send reminder notification for ${this.event.title} event.`, error,
          {eventId: this.event.id});
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
   * Send the event end notification.
   */
  private async sendEndNotification(): Promise<void> {
    this.logger.info(`Sending end notification for ${this.event.title} event.`, {eventId: this.event.id});
    const announcementsChannel = this.messageUtils.getChannel(this.constants.announcementsChannelName, this.guild);

    try {
      await this.messageUtils.sendMessages(announcementsChannel, this.generateEndMessage());
    } catch (error) {
      this.logger.error(`Unable to send end notification for ${this.event.title} event.`, error,
          {eventId: this.event.id});
    }
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
      `${this.event.title} is tomorrow at ${startTime}. Do not forget about it. (Unless you want to.)`,
      `ATTENTION: Please remember to join us tomorrow at ${startTime} for ${this.event.title}. That is all.`,
      `Oh! The next ${this.event.title} is tomorrow at ${startTime}. I am feeling the anticipation!`
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
    const introOptions = [
      `Prepare yourselves! It is time for ${this.event.title}.`,
      `Just in case you may have forgotten... ${this.event.title} is starting right now!`,
      `Oh. Wow. It is time for ${this.event.title}!`
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
   * @return An event end message.
   */
  private generateEndMessage(): string[] {
    if (this.nextEventStartTime) {
      const nextEventDateAndTime = this.nextEventStartTime
          .setZone(this.constants.timeZone)
          .toFormat('MMMM d \'at\' h:mm a \'Central\'');
      const closingOptions = [
        `Thank you for joining ${this.event.title} today.`,
        `I am so glad you could make it to today's ${this.event.title} event.`,
        `It was good to see you all at ${this.event.title} today.`
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
      throw new Error(`Unable to generate end message for ${this.event.title} event - nextEventStartTime is not ` +
          'defined.');
    }
  }
}
