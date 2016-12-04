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
  }
};
