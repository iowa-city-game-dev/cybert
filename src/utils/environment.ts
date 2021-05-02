export const environment = {
  botToken: process.env.BOT_TOKEN,
  botVersion: process.env.npm_package_version,
  botMaxThinkingTimeInSeconds: 5,
  botAverageWordsPerMinute: 120,
  botMaxVariationInWordsPerMinute: 30,
  averageCharactersPerWord: 5,
  welcomeChannelName: 'welcome'
} as const;
