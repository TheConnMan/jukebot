var Promise = require('promise');

module.exports = {
  addVideo: addVideo
};

function addVideo(video) {
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
          Video.publishCreate(video);
          resolve(video);
        });
      } else {
        Video.publishCreate(video);
        resolve(video);
      }
    });
  });
}

function endCurrentVideo() {
  Video.findOne({
    playing: true
  }).exec(function(err, current) {
    current.playing = false;
    current.save(function() {
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
  setTimeout(endCurrentVideo, video.durationSeconds * 1000);
  video.save(function() {
    Video.publishUpdate(video.id, video);
    console.log('Started playing video ' + video.key);
  });
}
