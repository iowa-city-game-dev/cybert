import {EventNotifier} from './event-notifier';
import {GameDevTogetherEventNotifier} from './game-dev-together-event-notifier';
import {GameDevDiscussionsEventNotifier} from './game-dev-discussions-event-notifier';
import {GeneralEventNotifier} from './general-event-notifier';
import {Logger} from '../utils/logger';
import {CalendarEvent, EventType} from './calendar-event';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Guild} from 'discord.js';
import {Constants} from '../utils/constants';
import {DateTime} from 'luxon';

/**
 * This class represents a calendar event that is being tracked in order to provide notifications.
 */
export class TrackedEvent {
  private event: CalendarEvent;
  private nextEventStartTime: DateTime | null;
  private eventNotifier: EventNotifier;

  public get id(): string {
    return this.event.id;
  }

  constructor(readonly logger: Logger, readonly dialogUtils: DialogUtils, readonly messageUtils: MessageUtils,
      readonly randomUtils: RandomUtils, readonly guild: Guild, readonly constants: Constants, event: CalendarEvent,
      relatedEvents: CalendarEvent[]) {
    this.event = event;
    this.nextEventStartTime = this.getNextEventStartTime(relatedEvents);

    switch (event.type) {
      case EventType.GameDevDiscussions: {
        this.eventNotifier = new GameDevDiscussionsEventNotifier(logger, dialogUtils, messageUtils, guild, randomUtils,
            constants, event, this.nextEventStartTime);
        break;
      }
      case EventType.GameDevTogether: {
        this.eventNotifier =
            new GameDevTogetherEventNotifier(logger, dialogUtils, messageUtils, guild, randomUtils, constants, event);
        break;
      }
      case EventType.General: {
        this.eventNotifier =
            new GeneralEventNotifier(logger, dialogUtils, messageUtils, guild, randomUtils, constants, event);
        break;
      }
    }
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
   * @private The start time of the next recurrence of the event, or `null` if none exists.
   */
  private getNextEventStartTime(relatedEvents: CalendarEvent[]): DateTime | null {
    let nextEventStartTime: DateTime | null = null;
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
  private nextEventStartTimeChanged(nextEventStartTime: DateTime | null): boolean {
    if (!this.nextEventStartTime || !nextEventStartTime) {
      return this.nextEventStartTime !== nextEventStartTime;
    } else {
      return !this.nextEventStartTime.equals(nextEventStartTime);
    }
  }
}
