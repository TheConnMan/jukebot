module.exports.globals = {
  version: process.env.npm_package_version,
  slackWebhook: process.env.SLACK_WEBHOOK,
  slackSongAdded: process.env.SLACK_SONG_ADDED !== 'false',
  slackSongPlaying: process.env.SLACK_SONG_PLAYING !== 'false',
  slackSongLinks: process.env.SLACK_SONG_LINKS === 'true',
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  chatHistory: process.env.CHAT_HISTORY ? parseInt(process.env.CHAT_HISTORY) : 24 * 60,
  videoHistory: process.env.VIDEO_HISTORY ? parseInt(process.env.VIDEO_HISTORY) : 24 * 60
};
