var Promise = require('promise');

module.exports = {
  addVideo: addVideo
};

function addVideo(video) {
  return new Promise(function(resolve, reject) {
    Video.findOne({
      playing: true
    }).exec(function(err, current) {
      console.log(current);
      if (!current) {
        video.startTime = new Date();
        video.playing = true;
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
