module.exports = {

  get: function(req, res) {
    return User.findOne({
      id: req.session.passport.user
    })
    .then(user => {
      if (user) {
        return res.ok(user.properties);
      } else {
        return res.notFound();
      }
    });
  },

  add: function(req, res) {
    return User.findOne({
      id: req.session.passport.user
    })
    .then(user => {
      if (user) {
        var body = req.body || {};
        Object.keys(body).forEach(key => {
          user.properties[key] = body[key];
        });
        return user.save().then(() => {
          return res.ok(user.properties);
        });
      } else {
        return res.notFound();
      }
    });
  },

  remove: function(req, res) {
    return User.findOne({
      id: req.session.passport.user
    })
    .then(user => {
      if (user) {
        var body = req.body || [];
        body.forEach(key => {
          delete user.properties[key];
        });
        return user.save().then(() => {
          return res.ok(user.properties);
        });
      } else {
        return res.notFound();
      }
    });
  }
};
