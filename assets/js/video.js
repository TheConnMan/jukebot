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
    return videos.filter(function(video) { return !video.played || new Date(video.startTime) >= new Date(Date.now() - 3600 * 1000); });
  }

  function findById(id) {
    return videos.find((v) => v.id.toString() == id);
  }

  function current() {
    return videos.find((v) => v.playing);
  }

  function subscribe() {
    io.socket.get('/video/subscribe');
  }

  function getAll() {
    return $http.get('/api/start').then(({ data }) => {
      videos = data.videos;

      return data;
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
  }

  function remove(id) {
    let removedVideo = findById(id);

    if (removedVideo) {
      videos.splice(videos.indexOf(removedVideo), 1);
    }
  }

  function removePermanently(id) {
    return $http.delete(`/api/remove/${id}`);
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
    removePermanently,
    upcoming,
    recent
  };
}]);
