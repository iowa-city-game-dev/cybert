import {CalendarEvent} from './calendar-event.ts';
import {DateTime} from 'luxon';

export interface NotificationStrategy {
  scheduleNotifications: (event: CalendarEvent, nextEventStartTime?: DateTime) => void;
  cancelNotifications: (event: CalendarEvent) => void;
}
