angular
.module('storage', [])
.factory('$storage', function() {
  var likedVideos = getObj('likes');

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
    get: function(key) {
      return localStorage[key] || '';
    },

    set: function(key, value) {
      localStorage[key] = value;
    },

    likeVideo: function(video) {
      var likes = likedVideos;
      var key = video.key;

      if (likes) {
        var found = likes.find(function(l) {
          return l.key === key;
        });

        if (found) {
          var index = likes.indexOf(found);

          likes.splice(index, 1);
        } else {
          likes.push(video);
        }
        setObj('likes', likes);
        likedVideos = likes;
      } else {
        setObj('likes', [video]);
        likedVideos = likes;
      }
    },

    likesVideo: function(videoKey) {
      var likes = likedVideos;

      if (likes) {
        return !!likes.find(function(l) {
          return l.key === videoKey;
        });
      } else {
        return false;
      }
    },

    getLikedVideos: function() {
      return likedVideos;
    }
  };
});
