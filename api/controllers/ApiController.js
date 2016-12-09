module.exports = {
  subscribe: function(req, res) {
    req.socket.join('listeners');
    req.socket.on('disconnect', function() {
      emitListenerCount();
    });
    emitListenerCount();
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
  }
};

function emitListenerCount() {
  var io = sails.io;
  io.sockets.in('listeners').emit('listening', {
    count: io.sockets.adapter.rooms.listeners ? io.sockets.adapter.rooms.listeners.length : 0
  });
}
