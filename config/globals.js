var REPO_ROOT = 'https://github.com/TheConnMan/jukebot/';
var version = process.env.npm_package_version;
var commit = (version || '').split('-').length === 1 ? null : version.split('-')[1].slice(0, 7);

module.exports.globals = {
  version: commit ? version.split('-')[0] + '-' + commit : version,
  versionLink: commit ? REPO_ROOT + 'commit/' + commit : REPO_ROOT + 'releases/tag/v' + version,
  slackWebhook: process.env.SLACK_WEBHOOK ? process.env.SLACK_WEBHOOK.split(',') : [],
  slashToken: process.env.SLASH_TOKEN ? process.env.SLASH_TOKEN.split(',') : [],
  slackSongAdded: process.env.SLACK_SONG_ADDED !== 'false',
  slackSongPlaying: process.env.SLACK_SONG_PLAYING !== 'false',
  slackSongLinks: process.env.SLACK_SONG_LINKS === 'true',
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  chatHistory: process.env.CHAT_HISTORY ? parseInt(process.env.CHAT_HISTORY) : 24 * 60,
  videoHistory: process.env.VIDEO_HISTORY ? parseInt(process.env.VIDEO_HISTORY) : 24 * 60,
  autoplayDisableCount: process.env.AUTOPLAY_DISABLE_STREAK ? parseInt(process.env.AUTOPLAY_DISABLE_STREAK) : 10,

  oauth: {
    google: {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    },
  }
};
