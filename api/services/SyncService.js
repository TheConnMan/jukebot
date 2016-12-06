var Promise = require('promise');
var log4js = require('log4js');
var logger = log4js.getLogger();
var SlackWebhook = require('slack-webhook');
var slack = process.env.SLACK_WEBHOOK ? new SlackWebhook(process.env.SLACK_WEBHOOK, {
  defaults: {
    username: 'JukeBot'
  }
}) : null;

module.exports = {
  addVideo: addVideo,
  sendAddMessages: sendAddMessages
};

function addVideo(video) {
  logger.info('Adding video ' + video.key)
  return new Promise(function(resolve, reject) {
    Video.findOne({
      playing: true
    }).exec(function(err, current) {
      if (!current) {
        video.startTime = new Date();
        video.playing = true;
        video.played = true;
        setTimeout(endCurrentVideo, video.durationSeconds * 1000);
        video.save(function() {
          resolve(video);
        });
      } else {
        resolve(video);
      }
    });
  });
}

function sendAddMessages(video) {
  return new Promise(function(resolve, reject) {
    Video.publishCreate(video);
    if (slack) {
      slack.send({
        text: '@' + video.user + ' added a song to the playlist' + (video.playing ? ' and it\'s playing now' : '') + '! <' + sails.config.serverUrl + '|Listen to JukeBot>',
        attachments: [formatSlackAttachment(video)]
      }).then(function() {
        resolve(video);
      });
    } else {
      resolve(video);
    }
  });
}

function formatSlackAttachment(video) {
  return {
    title: video.title,
    title_link: 'https://www.youtube.com/watch?v=' + video.key,
    thumb_url: video.thumbnail
  };
}

function endCurrentVideo() {
  Video.findOne({
    playing: true
  }).exec(function(err, current) {
    current.playing = false;
    current.save(function() {
      logger.info('Publishing end song ' + current.key);
      Video.publishUpdate(current.id, current);
      findNextVideo();
    });
  });
}

function findNextVideo() {
  Video.find({
    played: false
  }).sort('createdAt ASC').exec(function(err, upcoming) {
    if (upcoming.length > 0) {
      startVideo(upcoming[0]);
    }
  });
}

function startVideo(video) {
  video.playing = true;
  video.played = true;
  video.startTime = new Date();
  logger.info('Setting timeout');
  setTimeout(endCurrentVideo, video.durationSeconds * 1000);
  video.save(function() {
    setTimeout(function() {
      logger.info('Stopping video ' + video.key);
      Video.publishUpdate(video.id, video);
    }, 1000);
    if (slack) {
      slack.send({
        text: '*' + video.title + '* is now playing! <' + sails.config.serverUrl + '|Listen to JukeBot>',
        'mrkdwn': true
      }).then(function() {
        logger.info('Started playing video ' + video.key);
      });
    } else {
      logger.info('Started playing video ' + video.key);
    }
  });
}
