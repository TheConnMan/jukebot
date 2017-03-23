var log4js = require('log4js');
var logger = log4js.getLogger('config/bootstrap');

module.exports.bootstrap = function(cb) {

  if (process.env.FLUENTD_HOST) {
    log4js.addAppender(require('fluent-logger').support.log4jsAppender('jukebot', {
      host: process.env.FLUENTD_HOST,
      timeout: 3.0
    }));
  }

  Video.findOne({
    playing: true
  }).then(function(current, err) {
    if (current) {
      if (Date.now() > current.startTime.getTime() + current.duration) {
        SyncService.endCurrentVideo('JukeBot');
      } else {
        SyncService.restartVideo(current);
      }
    }
    cb();
  });
};
