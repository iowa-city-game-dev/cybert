import {Logger} from '../utils/logger';
import {GoogleApis} from 'googleapis';
import {Constants} from '../utils/constants';
import {TrackedEvent} from './tracked-event';
import {CalendarEvent, EventType} from './calendar-event';
import {DateTime} from 'luxon';
import {DialogUtils} from '../utils/dialog-utils';
import {MessageUtils} from '../utils/message-utils';
import {RandomUtils} from '../utils/random-utils';
import {Guild} from 'discord.js';

/**
 * This class keeps track of calendar events and has CyBert send announcements and reminders about them.
 */
export class EventTracker {
  private initialized = false;
  private guild: Guild | undefined;
  private trackedEvents = new Map<string, TrackedEvent>();

  constructor(private readonly logger: Logger, private readonly dialogUtils: DialogUtils,
    private readonly messageUtils: MessageUtils, private readonly randomUtils: RandomUtils,
    private readonly constants: Constants, private readonly googleApis: GoogleApis) {
  }

  /**
   * Initialize the event tracker.
   *
   * @param guild The guild to send notifications to.
   */
  public async initialize(guild: Guild): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
      this.logger.info('Initializing event tracker.');

      this.guild = guild;
      this.initializeEventTracking();
      setInterval(() => this.updateEventTracking(), this.constants.calendarCheckIntervalHours * 60 * 60 * 1000);
    }
  }

  /**
   * Initialize tracking of events.
   *
   * @return A promise that resolves after the event tracking has been initialized.
   */
  private async initializeEventTracking(): Promise<void> {
    if (this.guild) {
      const events = await this.getUpcomingEvents();

      const eventsForType = new Map<EventType, CalendarEvent[]>();
      eventsForType.set(EventType.GameDevDiscussions, events.filter(event => event.type === EventType.GameDevDiscussions));

      for (const event of events) {
        let relatedEvents = eventsForType.get(event.type);
        if (!relatedEvents) {
          relatedEvents = [];
        }
        this.trackedEvents.set(
            event.id,
            new TrackedEvent(this.logger, this.dialogUtils, this.messageUtils, this.randomUtils, this.guild,
                this.constants, event, relatedEvents)
        );
      }
    }
  }

  /**
   * Update tracking of events.
   *
   * @return A promise that resolves after the event tracking has been updated.
   */
  private async updateEventTracking(): Promise<void> {
    if (this.guild) {
      const events = await this.getUpcomingEvents();

      const eventsForType = new Map<EventType, CalendarEvent[]>();
      eventsForType.set(EventType.GameDevDiscussions, events.filter(event => event.type === EventType.GameDevDiscussions));

      for (const event of events) {
        const trackedEvent = this.trackedEvents.get(event.id);

        let relatedEvents = eventsForType.get(event.type);
        if (!relatedEvents) {
          relatedEvents = [];
        }

        if (trackedEvent) {
          trackedEvent.updateEvent(event, relatedEvents);
        } else {
          this.trackedEvents.set(event.id, new TrackedEvent(this.logger, this.dialogUtils, this.messageUtils,
              this.randomUtils, this.guild, this.constants, event, relatedEvents));
        }
      }

      const eventForId = new Map<string, CalendarEvent>(events.map(event => [event.id, event]));
      for (const trackedEvent of this.trackedEvents.values()) {
        if (!eventForId.has(trackedEvent.id) && trackedEvent.canBeDeleted()) {
          this.logger.info('Tracked event is no longer on the calendar. Event will no longer be tracked.',
              {id: trackedEvent.id});
          trackedEvent.cancelNotifications();
          this.trackedEvents.delete(trackedEvent.id);
        }
      }
    }
  }

  /**
   * Get upcoming calendar events.
   *
   * @return A promise that returns the upcoming calendar events.
   */
  private async getUpcomingEvents(): Promise<CalendarEvent[]> {
    try {
      const now = DateTime.now();
      const googleCalendarApi = this.googleApis.calendar({version: 'v3', auth: this.constants.googleApiKey});
      const response = await googleCalendarApi.events.list({
        calendarId: this.constants.googleCalendarId,
        singleEvents: true,
        timeMin: now.toISO(),
        timeMax: now.plus({weeks: 4}).toISO()
      });
      if (response.data.items) {
        const events: CalendarEvent[] = [];
        for (const responseItem of response.data.items) {
          try {
            events.push(new CalendarEvent(responseItem));
          } catch (error) {
            this.logger.error('Unable to get information from Google Calendar event.', error);
          }
        }
        return events;
      } else {
        this.logger.error('Unable to retrieve calendar events.');
        return [];
      }
    } catch (error) {
      this.logger.error('An error occurred while retrieving calendar events.', error);
      return [];
    }
  }
}
