module.exports = {
  index: function(req, res) {
    res.view('homepage', {
      user: req.user
    });
  }
};
