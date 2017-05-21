module.exports.policies = {

   '*': true,

  'FavoriteController': {
    '*': 'isAuthenticated'
  },

  'ProfileController': {
    '*': 'isAuthenticated'
  }
};
