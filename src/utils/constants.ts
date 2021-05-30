export class Constants {
  public readonly botToken = process.env.BOT_TOKEN;
  public readonly botVersion = process.env.npm_package_version || 'undefined';
  public readonly googleApiKey = process.env.GOOGLE_API_KEY;
  public readonly googleCalendarId = process.env.GOOGLE_CALENDAR_ID;
  public readonly timeZone = 'America/Chicago';
  public readonly calendarCheckIntervalHours = 24;
  public readonly botMaxThinkingTimeInSeconds = 5;
  public readonly botAverageWordsPerMinute = 120;
  public readonly botMaxVariationInWordsPerMinute = 30;
  public readonly averageCharactersPerWord = 5;
  public readonly generalChannelName = 'general';
  public readonly announcementsChannelName = 'announcements';
}
