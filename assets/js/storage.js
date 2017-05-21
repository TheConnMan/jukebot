angular
.module('storage', [])
.factory('$storage', function() {

  function getObj(key) {
    try {
      return JSON.parse(localStorage[key]);
    } catch(e) {
      return null;
    }
  }

  function setObj(key, obj) {
    localStorage[key] = JSON.stringify(obj);
  }

  return {
    get(key) {
      return localStorage[key] || '';
    },

    set(key, value) {
      localStorage[key] = value;
    },

    getLikedVideos() {
      return likedVideos;
    }
  };
});
