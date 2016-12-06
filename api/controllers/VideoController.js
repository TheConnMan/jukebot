module.exports = {
  subscribe: function(req, res) {
    Video.watch(req.socket);
    Video.find().exec(function(err, videos) {
      Video.subscribe(req.socket, videos);
    });
    console.log('User subscribed to ' + req.socket.id);
  },
  recent: function(req, res) {
    Video.find({
      createdAt: {
        '>=': new Date(Date.now() - 3600 * 1000)
      }
    }).exec(function(err, videos) {
      res.send(videos);
    });
  }
};
