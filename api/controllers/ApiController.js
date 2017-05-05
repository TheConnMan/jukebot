const log4js = require('log4js');
const logger = log4js.getLogger('api/controllers/api');

var users = {};
var recentlyLeft = [];

module.exports = {
  subscribeUsers: function(req, res) {
    if (req.session.passport) {
      User.findOne({
        id: req.session.passport.user
      }).then(user => {
        subscribeUsers(req, res, user.name);
      });
    } else {
      subscribeUsers(req, res, null);
    }
  },

  add: function(req, res) {
    var params = req.allParams();
    try {
      var key = YouTubeService.parseYouTubeLink(params.link);
      YouTubeService.getYouTubeVideo(key, params.user || 'Anonymous').then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
        SyncService.resetAutoplayStreak();
        res.send(200);
      }).catch(function(err) {
        res.send(400, err);
      });
    } catch (err) {
      res.send(400, err);
    }
  },

  addPlaylist: function(req, res) {
    var params = req.allParams();
    try {
      YouTubeService.getPlaylistVideos(params.playlistId, params.user || 'Anonymous').then(SyncService.addPlaylist).then(SyncService.sendPlaylistAddMessages).then(function(video) {
        SyncService.resetAutoplayStreak();
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
    Video.findOne({
      id: params.id
    }).then(video => {
      Video.destroy({
        id: params.id
      }).exec(function(err) {
        ChatService.addVideoMessage(video.title + ' was removed from the playlist by ' + params.user, 'removeVideo');
        Video.publishDestroy(params.id);
        res.send(204);
      });
    });
  },

  autoplay: function(req, res) {
    var id = req.socket.id;
    req.socket.join('autoplay');

    req.socket.on('autoplay', function(autoplay) {
      SyncService.setAutoplay(autoplay);
    });

    sails.io.sockets.in(id).emit('autoplay', {
      autoplay: SyncService.getAutoplay()
    });
  },

  start: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - sails.config.globals.videoHistory * 60 * 1000)
      },
      isSuggestion: false
    }).exec(function(err, videos) {
      res.send({
        videos: videos
      });
    });
  },

  subscribeVideos: function(req, res) {
    Video.watch(req.socket);
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - sails.config.globals.videoHistory * 60 * 1000)
      }
    }).exec(function(err, videos) {
      Video.subscribe(req.socket, videos);
    });
  },

  subscribeRelatedVideos(req, res) {
    req.socket.join('relatedVideos');
    Video
      .findOne({ playing: true })
      .exec((err, video) => {
        if (video) {
          SyncService.sendRelatedVideos(video.key);
        }
      });
  },

  skip(req, res) {
    var params = req.allParams();
    SyncService.skip(params.username || 'Anonymous');
    res.send(200);
  },

  search(req, res) {
    var params = req.allParams();
    YouTubeService.search(params.query, params.maxResults).then(function(videos) {
      res.send(videos);
    }).catch(function(err) {
      res.send(500, err);
    });
  }
};

function subscribeUsers(req, res, realuser) {
  var params = req.allParams();
  var id = req.socket.id;
  req.socket.join('listeners');

  var username = params.username || 'Anonymous';
  users[id] = {
    username,
    realuser
  };

  var index = recentlyLeft.indexOf(username);
  if (index === -1) {
    logger.debug(users[id].username + ' entered the room');
    ChatService.addMachineMessage(users[id].username + ' entered the room', username, 'userEnter');
  } else {
    recentlyLeft.splice(index, 1);
  }
  emitListeners();

  req.socket.on('disconnect', function() {
    var username = users[id].username;
    recentlyLeft.push(username);
    delete users[id];
    setTimeout(function() {
      userDisconnected(username);
    }, 1000);
  });

  req.socket.on('username', function(d) {
    users[id].username = d || 'Anonymous';
    emitListeners();
  });
}

function userDisconnected(username) {
  var index = recentlyLeft.indexOf(username);
  if (index !== -1) {
    recentlyLeft.splice(index, 1);
    logger.debug(username + ' left the room');
    ChatService.addMachineMessage(username + ' left the room', username, 'userLeft');
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
