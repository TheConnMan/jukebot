angular
.module('video', [])
.factory('$video', ['$http', '$log', function($http, $log) {
  var videos = [];
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

  function push(video) {
    videos.push(video);
  }

  function update(v) {
    var video = findById(v.id);

    if (video) {
      videos[videos.indexOf(video)] = v;
    }
  }

  function getVideos() {
    return videos.filter(function(video) { return !video.played || new Date(video.startTime) >= new Date(Date.now() - videoHistory * 60 * 1000); });
  }

  function findById(id) {
    return videos.find(function(v) {
      return v.id === id;
    });
  }

  function findByKey(id) {
    return videos.find(function(v) {
      return v.key === key;
    });
  }

  function current(id) {
    return videos.find(function(v) {
      return v.playing;
    });
  }

  function subscribe() {
    io.socket.get('/api/subscribeVideos');
  }

  function getAll() {
    return $http.get('/api/start').then(function(res) {
      videos = res.data.videos;

      return res.data;
    });
  }

  function skip(username) {
    return $http.post('/api/skip', {
      username: username
    });
  }

  function add(link, user) {
    return $http.post('/api/add', {
      link: link,
      user: user
    });
  }

  function addByKey(user, key) {
    return $http.post('/api/add', {
      link: YOUTUBE_URL + key,
      user: user
    });
  }

  function addPlaylistById(user, playlistId) {
    return $http.post('/api/addPlaylist', {
      playlistId: playlistId,
      user: user
    });
  }

  function remove(id) {
    var removedVideo = findById(id);

    if (removedVideo) {
      videos.splice(videos.indexOf(removedVideo), 1);
    }
  }

  function removePermanently(user, id) {
    return $http.delete('/api/remove', {
      params: {
        user: user,
        id: id
      }
    });
  }

  function upcoming() {
    return videos.filter(function(video) {
      return !video.played && !video.playing;
    });
  }

  function recent() {
    return videos.filter(function(video) {
      return video.played && !video.playing;
    });
  }

  function videoInUpcoming(key) {
    return upcoming().filter(function(video) {
      return video.key === key;
    }).length === 1;
  }

  function formatDuration(duration) {
    return moment.duration(duration).format('H:mm:ss');
  }

  function expectedPlayTime(video) {
    if (video.played || video.playing) {
      return '';
    }
    var currentVideo = current();
    var currentStartTime = moment(currentVideo.startTime);
    var upcomingVideos = upcoming();
    upcomingVideos.unshift(currentVideo);
    var betweenVideos = upcomingVideos.slice(0, upcomingVideos.indexOf(video));
    var expectedTime = betweenVideos.reduce(function(time, video) {
      time.add(moment.duration(video.duration));
      return time;
    }, currentStartTime);
    return expectedTime.format('LT');
  }

  function startTime(video) {
    return moment(video.startTime).format('LT');
  }

  return {
    push: push,
    add: add,
    addByKey: addByKey,
    addPlaylistById: addPlaylistById,
    update: update,
    getVideos: getVideos,
    findById: findById,
    findByKey: findByKey,
    current: current,
    subscribe: subscribe,
    getAll: getAll,
    skip: skip,
    remove: remove,
    removePermanently: removePermanently,
    upcoming: upcoming,
    recent: recent,
    videoInUpcoming: videoInUpcoming,
    formatDuration: formatDuration,
    expectedPlayTime: expectedPlayTime,
    startTime: startTime
  };
}]);
