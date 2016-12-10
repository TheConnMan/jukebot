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

    likeVideo(video) {
      let likes = getObj('likes');
      let key = video.key;

      if (likes) {
        let found = likes.find((l) => l.key === key);

        if (found) {
          let index = likes.indexOf(found);

          likes.splice(index, 1);
        } else {
          likes.push(video);
        }
        setObj('likes', likes);
      } else {
        setObj('likes', [video]);
      }
    },

    likesVideo(videoKey) {
      let likes = getObj('likes');

      if (likes) {
        return !!likes.find((l) => l.key === videoKey);
      } else {
        return false;
      }
    }
  };
});
