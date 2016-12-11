var users = {};

module.exports = {
  subscribeUsers: function(req, res) {
    var params = req.allParams();
    var id = req.socket.id;
    req.socket.join('listeners');

    users[id] = params.username || 'Anonymous';
    emitListeners();

    req.socket.on('disconnect', function() {
      delete users[id];
      emitListeners();
      if (Object.keys(users).length === 0) {
        SyncService.setAutoplay(false);
      }
    });

    req.socket.on('username', function(d) {
      users[id] = d || 'Anonymous';
      emitListeners();
    });
  },

  add: function(req, res) {
    var params = req.allParams();
    try {
      var key = YouTubeService.parseYouTubeLink(params.link);
      YouTubeService.getYouTubeVideo(key, params.user || 'Anonymous').then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
        res.send(200);
      }).catch(function(err) {
        res.send(400, err);
      });
    } catch (err) {
      res.send(400, err);
    }
  },

  remove: function(req, res) {
    var params = req.allParams();
    Video.destroy({
      id: params.id
    }).exec(function(err) {
      Video.publishDestroy(params.id);
      res.send(204);
    });
  },

  autoplay: function(req, res) {
    var id = req.socket.id;
    req.socket.join('autoplay');

    req.socket.on('autoplay', function(autoplay) {
      SyncService.setAutoplay(autoplay);
      sails.io.sockets.in('autoplay').emit('autoplay', {
        autoplay: autoplay
      });
    });
  },

  start: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - 24 * 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send({
        videos: videos,
        autoplay: SyncService.getAutoplay()
      });
    });
  },

  subscribeVideos: function(req, res) {
    Video.watch(req.socket);
    Video.find().exec(function(err, videos) {
      Video.subscribe(req.socket, videos);
    });
  },

  skip: function(req, res) {
    SyncService.skip();
    res.send(200);
  },

  search: function(req, res) {
    var params = req.allParams();
    YouTubeService.search(params.query, params.maxResults).then(function(videos) {
      res.send(videos);
    }).catch(function(err) {
      res.send(500, err);
    });
  }
};

function emitListeners() {
  var io = sails.io;
  io.sockets.in('listeners').emit('listening', {
    users: users
  });
}
