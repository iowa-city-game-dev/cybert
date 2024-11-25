import {GameDevTogetherNotificationStrategy} from './game-dev-together-notification-strategy.ts';
import {GeneralNotificationStrategy} from './general-notification-strategy.ts';
import {Logger} from '../utils/logger.ts';
import {CalendarEvent, EventType} from './calendar-event.ts';
import {DialogUtils} from '../utils/dialog-utils.ts';
import {MessageUtils} from '../utils/message-utils.ts';
import {RandomUtils} from '../utils/random-utils.ts';
import {Guild} from 'discord.js';
import {Constants} from '../utils/constants.ts';
import {DateTime} from 'luxon';
import {GameDevDiscussionsNotificationStrategy} from './game-dev-discussions-notification-strategy.ts';
import {NotificationStrategy} from './notification-strategy.ts';

/**
 * This class represents a calendar event that is being tracked in order to provide notifications.
 */
export class TrackedEvent {
  private event: CalendarEvent;
  private nextEventStartTime: DateTime | undefined;
  private notificationStrategy: NotificationStrategy;

  public get id(): string {
    return this.event.id;
  }

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly randomUtils: RandomUtils, readonly guild: Guild, readonly constants: Constants, event: CalendarEvent,
      relatedEvents: CalendarEvent[]) {
    this.event = event;
    this.nextEventStartTime = this.getNextEventStartTime(relatedEvents);

    this.logEventInformation('Creating new tracked event.', event, this.nextEventStartTime);

    this.notificationStrategy =
        this.createNotificationStrategy(logger, dialogUtils, messageUtils, randomUtils, guild, constants, event);
    this.notificationStrategy.scheduleNotifications(event, this.nextEventStartTime);
  }

  /**
   * Update the calendar event with the given event if it is different than the current one.
   *
   * @param event The new event.
   * @param relatedEvents Other recurrences of the event, if they exist.
   */
  public updateEvent(event: CalendarEvent, relatedEvents: CalendarEvent[]): void {
    const nextEventStartTime = this.getNextEventStartTime(relatedEvents);
    this.logEventInformation('Updating tracked event with new event details.', event, nextEventStartTime);

    if (!event.equals(this.event) || this.nextEventStartTimeChanged(nextEventStartTime)) {
      this.event = event;
      this.nextEventStartTime = nextEventStartTime;
      this.notificationStrategy.cancelNotifications(event);
      this.notificationStrategy.scheduleNotifications(event, nextEventStartTime);
    }
  }

  /**
   * Check if the tracked event can currently be deleted.
   *
   * @return A boolean indicating whether the tracked event can be deleted.
   */
  public canBeDeleted(): boolean {
    return !this.event.isCurrentTimeWithinOneHourOfEvent();
  }

  /**
   * Cancel any currently scheduled event notifications.
   */
  public cancelNotifications(): void {
    this.notificationStrategy.cancelNotifications(this.event);
  }

  /**
   * Create a notification strategy, based on the given event's type.
   *
   * @param logger The logger.
   * @param dialogUtils The dialog utils.
   * @param messageUtils The message utils.
   * @param randomUtils The random utils.
   * @param guild The guild.
   * @param constants The constants.
   * @param event The event.
   * @return A notification strategy.
   */
  private createNotificationStrategy(logger: Logger, dialogUtils: DialogUtils, messageUtils: MessageUtils,
      randomUtils: RandomUtils, guild: Guild, constants: Constants, event: CalendarEvent): NotificationStrategy {
    let notificationStrategy: NotificationStrategy;

    switch (event.type) {
      case EventType.GameDevDiscussions: {
        notificationStrategy = new GameDevDiscussionsNotificationStrategy(logger, dialogUtils, messageUtils, guild,
            randomUtils, constants);
        break;
      }
      case EventType.GameDevTogether: {
        notificationStrategy = new GameDevTogetherNotificationStrategy(logger, dialogUtils, messageUtils, guild,
            randomUtils, constants);
        break;
      }
      case EventType.General: {
        notificationStrategy = new GeneralNotificationStrategy(logger, dialogUtils, messageUtils, guild, randomUtils,
            constants);
        break;
      }
    }

    return notificationStrategy;
  }

  /**
   * Write an info log with the given message and information about the given event.
   *
   * @param message The message.
   * @param event The event.
   * @param nextEventStartTime The start time of the next event, if there is one.
   */
  private logEventInformation(message: string, event: CalendarEvent, nextEventStartTime?: DateTime): void {
    this.logger.info(message, {
      eventType: event.type.toString(),
      eventId: event.id,
      eventTitle: event.title,
      eventStartTime: event.startTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) +
        ' Central',
      nextEventStartTime: nextEventStartTime ?
        nextEventStartTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) + ' Central' :
        'none'
    });
  }

  /**
   * Get the start time of the next recurrence of the event, if one exists.
   *
   * @param relatedEvents Other recurrences of the event, if they exist.
   * @private The start time of the next recurrence of the event, or `undefined` if none exists.
   */
  private getNextEventStartTime(relatedEvents: CalendarEvent[]): DateTime | undefined {
    let nextEventStartTime: DateTime | undefined;
    if (relatedEvents) {
      for (const relatedEvent of relatedEvents) {
        if (relatedEvent.startTime > this.event.startTime &&
            (!nextEventStartTime || nextEventStartTime > relatedEvent.startTime)) {
          nextEventStartTime = relatedEvent.startTime;
        }
      }
    }
    return nextEventStartTime;
  }

  /**
   * Check if the start time of the next recurrence of the event has changed.
   *
   * @param nextEventStartTime The new start time.
   * @return A boolean indicating whether the start time has changed.
   */
  private nextEventStartTimeChanged(nextEventStartTime: DateTime | undefined): boolean {
    if (!this.nextEventStartTime || !nextEventStartTime) {
      return this.nextEventStartTime !== nextEventStartTime;
    } else {
      return !this.nextEventStartTime.equals(nextEventStartTime);
    }
  }
}
