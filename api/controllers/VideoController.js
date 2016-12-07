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
        '>=': new Date(new Date().getTime() - 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send(videos);
    });
  }
};
