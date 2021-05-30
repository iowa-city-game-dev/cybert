import {calendar_v3} from 'googleapis';
import {DateTime, Interval} from 'luxon';

export enum EventType {
  GameDevDiscussions = 'GAME_DEV_DISCUSSIONS',
  GameDevTogether = 'GAME_DEV_TOGETHER',
  General = 'GENERAL'
}

/**
 * This class represents an event on the calendar.
 */
export class CalendarEvent {
  public readonly type: EventType;
  public readonly id: string;
  public readonly title: string;
  public readonly startTime: DateTime;
  public readonly endTime: DateTime;

  constructor(event: calendar_v3.Schema$Event) {
    if (event.id && event.summary && event.start?.dateTime && event.end?.dateTime) {
      if (event.summary == 'Game Dev Discussions') {
        this.type = EventType.GameDevDiscussions;
      } else if (event.summary == 'Game Dev Together') {
        this.type = EventType.GameDevTogether;
      } else {
        this.type = EventType.General;
      }

      this.id = event.id;
      this.title = event.summary;
      this.startTime = DateTime.fromISO(event.start.dateTime);
      this.endTime = DateTime.fromISO(event.end.dateTime);
    } else {
      throw new Error('The Google Calendar event does not contain enough information to create an instance ' +
        'of CalendarEvent.');
    }
  }

  /**
   * Check whether this event is equal to the given event.
   *
   * @param otherEvent The event to compare to.
   * @return A boolean indicating whether the two events are equal.
   */
  public equals(otherEvent: CalendarEvent): boolean {
    return this.id === otherEvent.id &&
        this.title === otherEvent.title &&
        this.startTime.equals(otherEvent.startTime) &&
        this.endTime.equals(otherEvent.endTime);
  }

  /**
   * Check whether the current time is within one hour before the start or after the end of the event.
   *
   * @return A boolean indicating whether the current time is within an hour of the event.
   */
  public isCurrentTimeWithinOneHourOfEvent(): boolean {
    const interval = Interval.fromDateTimes(
        this.startTime.minus({hours: 1}),
        this.endTime.plus({hours: 1})
    );
    return interval.contains(DateTime.now());
  }
}
