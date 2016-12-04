module.exports = {
  subscribe: function(req, res) {
    Video.watch(req.socket);
    console.log('User subscribed to ' + req.socket.id);
  },
  recent: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(new Date().getTime() - 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send(videos);
    });
  },
  current: function(req, res) {
    Video.findOne({
      playing: true
    }).exec(function(err, video) {
      if (video) {
        res.send({
          key: video.key,
          startTime: Math.floor((new Date().getTime() - video.startTime.getTime()) / 1000)
        });
      } else {
        res.send({});
      }
    });
  }
};
