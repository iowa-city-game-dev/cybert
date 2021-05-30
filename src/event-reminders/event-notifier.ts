import {CalendarEvent} from './calendar-event';
import {Logger} from '../utils/logger';
import {DateTime} from 'luxon';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Constants} from '../utils/constants';
import {Guild} from 'discord.js';

export abstract class EventNotifier {
  constructor(protected readonly logger: Logger, protected readonly dialogUtils: DialogUtils,
      protected readonly messageUtils: MessageUtils, protected readonly guild: Guild,
      protected readonly randomUtils: RandomUtils, protected readonly constants: Constants,
      protected event: CalendarEvent, protected nextEventStartTime: DateTime | null) {
    this.logger.info('Creating new event notifier.', {
      eventType: event.type.toString(),
      eventId: event.id,
      eventTitle: event.title,
      eventStartTime: event.startTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) +
          ' Central',
      nextEventStartTime: nextEventStartTime ?
        nextEventStartTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) + ' Central' :
        'none'
    });
    this.scheduleNotifications();
  }

  /**
   * Reset the event notifier using the given event.
   *
   * @param event The new event to use.
   * @param nextEventStartTime The start time of the next recurrence of the event, if one exists.
   */
  public resetEvent(event: CalendarEvent, nextEventStartTime: DateTime | null): void {
    this.logger.info('Updating event notifier with new event details.', {
      eventType: event.type.toString(),
      eventId: event.id,
      eventTitle: event.title,
      eventStartTime: event.startTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) +
          ' Central',
      nextEventStartTime: nextEventStartTime ?
        nextEventStartTime.setZone(this.constants.timeZone).toLocaleString(DateTime.DATETIME_SHORT) + ' Central' :
        'none'
    });
    this.event = event;
    this.nextEventStartTime = nextEventStartTime;
    this.cancelNotifications();
    this.scheduleNotifications();
  }

  public abstract cancelNotifications(): void;
  protected abstract scheduleNotifications(): void;
}
