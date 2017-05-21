module.exports = {
  index: function(req, res) {
    res.view('homepage', {
      user: req.user,
      auth: sails.config.globals.oauth.google.clientID && sails.config.globals.oauth.google.clientSecret
    });
  }
};
