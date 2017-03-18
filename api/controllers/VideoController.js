module.exports = {
  current: function(req, res) {
    return Video.findOne({
      playing: true
    }).then(video => {
      res.send('Currently playing: ' + (video ? video.title : 'No video playing'));
    });
  }
};
