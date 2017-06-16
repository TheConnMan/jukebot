var help = [
  'JukeBot - Slack-Enabled Synchronized Music Listening',
  'Available Commands:',
  '    add [youtube-link] - Add a video to the queue',
  '    skip - skip the currently playing music video',
  '    help - This help text'
];

module.exports = {
  slash: function(req, res) {
    var params = req.allParams();
    if (sails.config.globals.slashToken.indexOf(params.token) === -1) {
      res.send(401);
    } else {
      var args = params.text.split(' ');
      var command = args.shift();
      switch (command) {
        case 'add':
          var key = YouTubeService.parseYouTubeLink(args[0]);
          YouTubeService.getYouTubeVideo(key, '@' + params.user_name, null).then(SyncService.addVideo).then(SyncService.sendAddMessages).then(function(video) {
            res.send('Successfully added "' + video.title + '"');
          }).catch(function(err) {
            res.send(err);
          });
          break;
        case 'skip':
          SyncService.skip(params.user_name);
          res.send('Successfully skipped.');
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
