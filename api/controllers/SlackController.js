var help = [
  'JukeBot - Slack-Enabled Syncronized Music Listening',
  'Available Commands:',
  '    add [youtube-link] - Add a video to the queue',
  '    help - This help text'
];

module.exports = {
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
          YouTubeService.getYouTubeVideo(key, '@' + params.user_name).then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
            res.send('Successfully added "' + video.title + '"');
          }).catch(function(err) {
            res.send(err);
          });
          break;
        case 'help':
          res.send(help.join('\n'));
          break;
        default:
          res.send('The command "' + command + '" is not currently supported. Run /jukebot help to see a list of available commands.');
          break;
      }
    }
  }
};
