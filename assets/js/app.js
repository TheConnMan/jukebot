var app = angular.module('app', ['notification', 'storage']);
app.controller('controller', function($scope, $rootScope, $notification, $storage, $timeout, $http, $log) {
  $('.ui.search')
    .search({
      minCharacters: 3,
      onSelect(result, response) {
        $scope.readd(result.key)
          .then(() => {
            $('.ui.search input').val('');
          });
      },
      apiSettings: {
        onResponse(videos) {
          return {
            results: videos
          };
        },
        url: 'video/search?query={query}&maxResults=10'
      }
    });
    $notification.getPermission();

    $rootScope.title = 'JukeBot';
    $scope.username = $storage.get('username');
    io.socket._raw.emit('username', $scope.username);
    $scope.initTime = new Date().getTime();
    $scope.videos = [];
    $scope.listeners = {};

    $scope.likeCurrentVideo = function() {
      $storage.likeVideo($scope.currentVideo());
    };

    $scope.likeVideo = function(video) {
      $storage.likeVideo(video);
    };

    $scope.likesCurrentVideo = function() {
      return $storage.likesVideo($scope.currentVideo().key);
    };

    $scope.currentVideo = function() {
      var playing = $scope.videos.filter(function(video) { return video.playing; });
      return playing.length == 1 ? playing[0] : null;
    };

    $scope.startTime = function() {
      var video = $scope.currentVideo();
      return video ? Math.max(Math.floor(($scope.initTime - new Date(video.startTime).getTime()) / 1000), 0) : 0;
    };

    $scope.$watch($scope.currentVideo, function(currentVideo) {
      $rootScope.title = currentVideo ? currentVideo.title : 'JukeBot';
      if (currentVideo && $scope.startTime() === 0) {
        $notification(currentVideo.title, {
          icon: currentVideo.thumbnail,
          delay: 4000,
          focusWindowOnClick: true
        });
      }
      setTimeout(function() {
        $('.ui.embed').embed({
          url: currentVideo ? '//www.youtube.com/embed/' + currentVideo.key : '',
          autoplay: true,
          parameters: {
            start: $scope.startTime()
          }
        });
      }, 0);
    }, true);

    $scope.$watch('username', function(newUsername) {
      $storage.set('username', $scope.username);
      io.socket._raw.emit('username', newUsername);
    });

    $scope.getAllVideos = function() {
      io.socket.get('/video/subscribe');

      $http.get('/video/recent').success(function(videos) {
        $log.log('Got all videos');
        $log.log(videos);
        $scope.videos = videos;
      });
    };

    $scope.getAllVideos();

    io.socket.on('video', function(obj) {
      $log.log('Received a video update');
      $log.log(obj);
      if (obj.verb === 'created') {
        if ($scope.currentVideo() && $scope.username !== obj.data.user) {
          $notification('New Video Added', {
            body: obj.data.user + ' added ' + obj.data.title,
            icon: obj.data.thumbnail,
            delay: 4000,
            focusWindowOnClick: true
          });
        }
        $scope.videos.push(obj.data);
      } else if (obj.verb === 'updated') {
        var video = $scope.findVideoById(obj.data.id);
        if (video) {
          $scope.videos[$scope.videos.indexOf(video)] = obj.data;
        }
      } else if (obj.verb === 'destroyed') {
        var removedVideo = $scope.findVideoById(obj.id);
        if (removedVideo) {
          $scope.videos.splice($scope.videos.indexOf(removedVideo), 1);
        }
      }
      $scope.$digest();
    });

    io.socket.on('listening', function(obj) {
      $scope.listeners = obj.users;
      $scope.$digest();
    });

    io.socket.get('/api/subscribe');

    $scope.upcoming = function() {
      return $scope.videos.filter(function(video) { return !video.played && !video.playing; });
    };

    $scope.recent = function() {
      return $scope.videos.filter(function(video) { return video.played && !video.playing; });
    };

    $scope.addVideo = function() {
      $log.log('Adding video');
      $log.log($scope.link);
      $log.log($scope.username);
      if ($scope.link) {
        $http.post('/api/add', {
          link: $scope.link,
          user: $scope.username
        }).success(function() {
          $scope.link = '';
        }).error(function(e) {
          $scope.link = '';
          sweetAlert('Error', e, 'error');
        });
      }
    };

    $scope.remove = function(id) {
      $http.delete('/api/remove/' + id);
    };

    $scope.readd = function(key) {
      return $http.post('/api/add', {
        link: 'https://www.youtube.com/watch?v=' + key,
        user: $scope.username
      });
    };

    $scope.skip = function() {
      $http.post('/video/skip');
    };

    $scope.findVideoById = function(id) {
      var videoMap = $scope.videos.reduce(function(map, video) {
        map[video.id.toString()] = video;
        return map;
      }, {});
      return videoMap[id.toString()];
    };

    $scope.canShowChromeFlag = function() {
      return !$storage.get('chromeFlag');
    };

    $scope.hideChromeFlag = function() {
      $storage.set('chromeFlag', 'true');
    };

    $scope.toggleListeners = function() {
      $('.listeners').toggle();
    };

    $scope.listenerUsernames = function() {
      return Object.values($scope.listeners);
    };

    $scope.listenerCount = function() {
      return Object.keys($scope.listeners).length;
    };
}).config(function($sceProvider) {
    $sceProvider.enabled(false);
}).directive('enterPress', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.enterPress);
        });
        event.preventDefault();
      }
    });
  };
});
