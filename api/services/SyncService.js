var Promise = require('promise');
var log4js = require('log4js');
var logger = log4js.getLogger();
var SlackWebhook = require('slack-webhook');
var slack = sails.config.slackWebhook ? new SlackWebhook(sails.config.slackWebhook, {
  defaults: {
    username: 'JukeBot'
  }
}) : null;

var videoTimeout;

module.exports = {
  addVideo,
  sendAddMessages,
  skip
};

function addVideo(video) {
  logger.info('Adding video ' + video.key);
  return new Promise(function(resolve, reject) {
    Video.findOne({
      playing: true
    }).exec(function(err, current) {
      if (!current) {
        video.startTime = new Date();
        video.playing = true;
        video.played = true;
        videoTimeout = setTimeout(endCurrentVideo, video.duration);
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
    if (slack && sails.config.slackSongPlaying && sails.config.slackSongAdded) {
      sendSlackAddedNotification(video).then(function() {
        resolve(video);
      });
    } else if (video.playing && slack && sails.config.slackSongPlaying ) {
      sendSlackAddedNotification(video).then(function() {
        resolve(video);
      });
    } else if (slack && sails.config.slackSongAdded) {
      sendSlackAddedNotification(video).then(function() {
        resolve(video);
      });
    } else {
      resolve(video);
    }
  });
}

function skip() {
  clearTimeout(videoTimeout);
  endCurrentVideo();
}

function endCurrentVideo() {
  Video.findOne({
    playing: true
  }).exec(function(err, current) {
    current.playing = false;
    current.save(function() {
      logger.info('Publishing end song ' + current.key);
      Video.publishUpdate(current.id, current);
      findNextVideo(current);
    });
  });
}

function findNextVideo(lastVideo) {
  Video.find({
    played: false
  }).sort('createdAt ASC').exec(function(err, upcoming) {
    if (upcoming.length > 0) {
      startVideo(upcoming[0]);
    } else {
      YouTubeService.nextRelated(lastVideo.key).then(function(nextKey) {
        return YouTubeService.getYouTubeVideo(nextKey, lastVideo.user);
      }).then(addVideo).then(sendAddMessages);
    }
  });
}

function startVideo(video) {
  video.playing = true;
  video.played = true;
  video.startTime = new Date();
  logger.info('Setting timeout');
  videoTimeout = setTimeout(endCurrentVideo, video.duration);
  video.save(() => {
      logger.info('Stopping video ' + video.key);
      Video.publishUpdate(video.id, video);
      if (slack && sails.config.slackSongPlaying) {
        sendSlackPlayingNotification(video).then(function() {
          logger.info('Started playing video ' + video.key);
        });
      } else {
        logger.info('Started playing video ' + video.key);
      }
    });
}

function sendSlackAddedNotification(video) {
  return slack.send({
    text: video.user + ' added a song to the playlist' + (video.playing ? ' and it\'s playing now' : '') + '! <' + sails.config.serverUrl + '|Listen to JukeBot>',
    attachments: [{
      title: video.title,
      title_link: 'https://www.youtube.com/watch?v=' + video.key,
      thumb_url: video.thumbnail
    }]
  });
}

function sendSlackPlayingNotification(video) {
  return slack.send({
    text: '*' + video.title + '* is now playing! <' + sails.config.serverUrl + '|Listen to JukeBot>',
    'mrkdwn': true
  });
}
