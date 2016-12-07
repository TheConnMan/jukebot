module.exports = {
  add: function(req, res) {
    var params = req.allParams();
    var key = YouTubeService.parseYouTubeLink(params.link);
    YouTubeService.getYouTubeVideo(key, params.user || 'Anonymous').then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
      res.send(200);
    }).catch(function(err) {
      res.send(err);
    });
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
