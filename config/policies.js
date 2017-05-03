module.exports.policies = {

   '*': true,

  'ProfileController': {
    '*': 'isAuthenticated'
  }
};
