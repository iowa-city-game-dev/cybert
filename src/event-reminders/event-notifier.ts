import {CalendarEvent} from './calendar-event';
import {Logger} from '../utils/logger';
import {DateTime} from 'luxon';
import {Constants} from '../utils/constants';
import {NotificationStrategy} from './notification-strategy';

export class EventNotifier {
  constructor(private readonly logger: Logger, private readonly constants: Constants,
      private readonly notificationStrategy: NotificationStrategy, private event: CalendarEvent,
      private nextEventStartTime?: DateTime) {
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
    this.notificationStrategy.scheduleNotifications(event, nextEventStartTime);
  }

  /**
   * Reset the event notifier using the given event.
   *
   * @param event The new event to use.
   * @param nextEventStartTime The start time of the next recurrence of the event, if one exists.
   */
  public resetEvent(event: CalendarEvent, nextEventStartTime?: DateTime): void {
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
    this.notificationStrategy.cancelNotifications(event);
    this.notificationStrategy.scheduleNotifications(event, nextEventStartTime);
  }

  /**
   * If notifications have been scheduled, cancel them.
   */
  public cancelNotifications(): void {
    this.notificationStrategy.cancelNotifications(this.event);
  }
}
