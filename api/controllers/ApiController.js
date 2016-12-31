var users = {};
var recentlyLeft = [];

module.exports = {
  subscribeUsers: function(req, res) {
    var params = req.allParams();
    var id = req.socket.id;
    req.socket.join('listeners');

    var username = params.username || 'Anonymous';
    users[id] = username;

    var index = recentlyLeft.indexOf(username);
    if (index === -1) {
      ChatService.addMachineMessage(users[id] + ' entered the room', username);
    } else {
      recentlyLeft.splice(index, 1);
    }
    emitListeners();

    req.socket.on('disconnect', function() {
      var username = users[id];
      recentlyLeft.push(username);
      delete users[id];
      setTimeout(function() {
        userDisconnected(username);
      }, 1000);
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

  addPlaylist: function(req, res) {
    res.send(200);
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

    sails.io.sockets.in(id).emit('autoplay', {
      autoplay: SyncService.getAutoplay()
    });
  },

  start: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - 24 * 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send({
        videos: videos
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
    var params = req.allParams();
    SyncService.skip(params.username || 'Anonymous');
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

function userDisconnected(username) {
  var index = recentlyLeft.indexOf(username);
  if (index !== -1) {
    recentlyLeft.splice(index, 1);
    ChatService.addMachineMessage(username + ' left the room');
    emitListeners();
    if (Object.keys(users).length === 0) {
      SyncService.setAutoplay(false);
    }
  }
}

function emitListeners() {
  var io = sails.io;
  io.sockets.in('listeners').emit('listening', {
    users: users
  });
}
