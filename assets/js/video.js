angular
.module('video', [])
.factory('$video', ['$http', '$log', function($http, $log) {
  var videos = [];
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

  function push(video) {
    videos.push(video);
  }

  function update(v) {
    let video = findById(v.id);

    if (video) {
      videos[videos.indexOf(video)] = v;
    }
  }

  function getVideos() {
    return videos;
  }

  function findById(id) {
    return videos.find((v) => v.id.toString() == id);
    // var videoMap = videos.reduce((map, video) => {
    //   map[video.id.toString()] = video;
    //   return map;
    // }, {});
    // return videoMap[id.toString()];
  }

  function current() {
    return videos.find((v) => v.playing);
  }

  function subscribe() {
    io.socket.get('/video/subscribe');
  }

  function getAll() {
    $http.get('/video/recent').success((v) => {
      $log.log('Got all videos');
      $log.log(v);
      videos = v;
    });
  }

  function skip() {
    return $http.post('/video/skip');
  }

  function add(link, user) {
    return $http.post('/api/add', {
      link,
      user
    });
  }

  function addByKey(user, key) {
    return $http.post('/api/add', {
      link: YOUTUBE_URL + key,
      user
    });
  },

  function remove(id) {
    let removedVideo = findVideoById(obj.id);

    if (removedVideo) {
      videos.splice(videos.indexOf(removedVideo), 1);
    }
  }

  function upcoming() {
    return videos.filter((video) => !video.played && !video.playing);
  }

  function recent() {
    return videos.filter((video) => video.played && !video.playing);
  }

  return {
    push,
    add,
    addByKey,
    update,
    getVideos,
    findById,
    current,
    subscribe,
    getAll,
    skip,
    remove,
    upcoming,
    recent
  };
}]);
