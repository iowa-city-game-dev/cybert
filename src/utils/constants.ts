export class Constants {
  public readonly botToken = process.env.BOT_TOKEN;
  public readonly botVersion = process.env.npm_package_version;
  public readonly botMaxThinkingTimeInSeconds = 5;
  public readonly botAverageWordsPerMinute = 120;
  public readonly botMaxVariationInWordsPerMinute = 30;
  public readonly averageCharactersPerWord = 5;
  public readonly generalChannelName = 'general';
}
