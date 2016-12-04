module.exports = {
  add: function(req, res) {
    YouTubeService.getYouTubeVideo(req.body.key, req.body.user).then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
      return res.send(200);
    });
  },

  slash: function(req, res) {
    var params = req.allParams();
    if (params.token !== process.env.SLASH_TOKEN) {
      res.send(401);
    } else {
      var args = params.text.split(' ');
      var command = args.shift();
      switch (command) {
        case 'add':
          var key = YouTubeService.parseYouTubeLink(args[0]);
          YouTubeService.getYouTubeVideo(key, params.user_name).then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
            res.send('Successfully added "' + video.title + '"');
          }).catch(function(err) {
            res.send(err);
          });
          break;
        default:
          res.send('The command "' + command + '" is not currently supported');
          break;
      }
    }
  }
};
