module.exports = {
  subscribe: function(req, res) {
    Video.watch(req.socket);
    Video.find().exec(function(err, videos) {
      Video.subscribe(req.socket, videos);
    });
  },
  recent: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send(videos);
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
