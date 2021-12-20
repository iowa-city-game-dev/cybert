import {EventNotifier} from './event-notifier';
import {GameDevTogetherNotificationStrategy} from './game-dev-together-notification-strategy';
import {GeneralNotificationStrategy} from './general-notification-strategy';
import {Logger} from '../utils/logger';
import {CalendarEvent, EventType} from './calendar-event';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Guild} from 'discord.js';
import {Constants} from '../utils/constants';
import {DateTime} from 'luxon';
import {GameDevDiscussionsNotificationStrategy} from './game-dev-discussions-notification-strategy';
import {NotificationStrategy} from './notification-strategy';

/**
 * This class represents a calendar event that is being tracked in order to provide notifications.
 */
export class TrackedEvent {
  private event: CalendarEvent;
  private nextEventStartTime: DateTime | undefined;
  private eventNotifier: EventNotifier;

  public get id(): string {
    return this.event.id;
  }

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly randomUtils: RandomUtils, readonly guild: Guild, readonly constants: Constants, event: CalendarEvent,
      relatedEvents: CalendarEvent[]) {
    this.event = event;
    this.nextEventStartTime = this.getNextEventStartTime(relatedEvents);

    let notificationStrategy: NotificationStrategy;
    switch (this.event.type) {
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

    this.eventNotifier = new EventNotifier(logger, constants, notificationStrategy, this.event,
        this.nextEventStartTime);
  }

  /**
   * Update the calendar event with the given event if it is different than the current one.
   *
   * @param event The new event.
   * @param relatedEvents Other recurrences of the event, if they exist.
   */
  public updateEvent(event: CalendarEvent, relatedEvents: CalendarEvent[]): void {
    const nextEventStartTime = this.getNextEventStartTime(relatedEvents);
    if (!event.equals(this.event) || this.nextEventStartTimeChanged(nextEventStartTime)) {
      this.event = event;
      this.nextEventStartTime = nextEventStartTime;
      this.eventNotifier.resetEvent(event, nextEventStartTime);
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
    this.eventNotifier.cancelNotifications();
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
