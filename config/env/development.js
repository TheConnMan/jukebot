module.exports = {

  serverUrl: process.env.SERVER_URL || 'http://127.0.0.1:1337',
  slackWebhook: process.env.SLACK_WEBHOOK,
  slackSongAdded: process.env.SLACK_SONG_ADDED !== 'false',
  slackSongPlaying: process.env.SLACK_SONG_PLAYING !== 'false'
};
