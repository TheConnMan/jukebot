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
    return videos.filter(function(video) { return !video.played || new Date(video.startTime) >= new Date(Date.now() - videoHistory * 60 * 1000); });
  }

  function findById(id) {
    return videos.find((v) => v.id === id);
  }

  function findByKey(key) {
    return videos.find((v) => v.key === key);
  }

  function current() {
    return videos.find((v) => v.playing);
  }

  function subscribe() {
    io.socket.get('/api/subscribeVideos');
  }

  function getAll() {
    return $http.get('/api/start').then(({ data }) => {
      videos = data.videos;

      return data;
    });
  }

  function skip(username) {
    return $http.post('/api/skip', {
      username
    });
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

  function addPlaylistById(user, playlistId) {
    return $http.post('/api/addPlaylist', {
      playlistId,
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

  function videoInUpcoming(key) {
    return upcoming().filter((video) => video.key === key).length === 1;
  }

  function formatDuration(duration) {
    return moment.duration(duration).format('H:mm:ss');
  }

  function expectedPlayTime(video) {
    if (video.played || video.playing) {
      return '';
    }
    let currentVideo = current();
    let currentStartTime = moment(currentVideo.startTime);
    let upcomingVideos = upcoming();
    upcomingVideos.unshift(currentVideo);
    let betweenVideos = upcomingVideos.slice(0, upcomingVideos.indexOf(video));
    let expectedTime = betweenVideos.reduce(function(time, video) {
      time.add(moment.duration(video.duration));
      return time;
    }, currentStartTime);
    return expectedTime.format('LT');
  }

  function startTime(video) {
    return moment(video.startTime).format('LT');
  }

  return {
    push,
    add,
    addByKey,
    addPlaylistById,
    update,
    getVideos,
    findById,
    findByKey,
    current,
    subscribe,
    getAll,
    skip,
    remove,
    removePermanently,
    upcoming,
    recent,
    videoInUpcoming,
    formatDuration,
    expectedPlayTime,
    startTime
  };
}]);
