module.exports = {
  add: function(req, res) {
    var params = req.allParams();
    var key = YouTubeService.parseYouTubeLink(params.link);
    YouTubeService.getYouTubeVideo(key, params.user || 'Anonymous').then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
      res.send(200);
    }).catch(function(err) {
      res.send(err);
    });
  }
};
