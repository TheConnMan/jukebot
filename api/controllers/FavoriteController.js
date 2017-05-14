module.exports = {

  find: function(req, res) {
    return Favorite.find({
    user: req.session.passport.user
    })
    .then(favorites => {
      return res.ok(favorites);
    });
  },

  findOne: function(req, res) {
    return Favorite.findOne({
      id: req.params.id,
      user: req.session.passport.user
    })
    .then(favorite => {
      if (favorite) {
        return res.ok(favorite);
      } else {
        return res.notFound();
      }
    });
  },

  create: function(req, res) {
    var body = req.body || {};
    return Favorite.create({
      key: body.key,
      title: body.title,
      user: req.session.passport.user
    }).then(favorite => {
      return res.ok(favorite);
    }).catch(err => {
      return res.badRequest('Invalid favorite attributes: ' + Object.keys(err.invalidAttributes).join(', '));
    });
  },

  update: function(req, res) {
    return res.badRequest('Favorites can not be updated');
  },

  destroy: function(req, res) {
    return Favorite.findOne({
      key: req.params.id,
      user: req.session.passport.user
    }).then(favorite => {
      if (favorite) {
        return favorite.destroy().then(() => {
          return res.ok(favorite);
        });
      } else {
        return res.notFound();
      }
    });
  }
};
