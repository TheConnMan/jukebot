var app = angular.module('app', ['notification', 'storage', 'video']);
app.controller('controller', function($scope, $rootScope, $notification, $storage, $video, $timeout, $http, $log) {
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
    $scope.initTime = new Date().getTime();
    $scope.videos = $video.getVideos();
    $scope.listeners = {};

    $scope.likeCurrentVideo = function() {
      $storage.likeVideo($video.current());
    };

    $scope.likeVideo = function(video) {
      $storage.likeVideo(video);
    };

    $scope.likesCurrentVideo = function() {
      return $storage.likesVideo($video.current().key);
    };

    /**************************
     * Video Service Passthru *
     **************************/

    $scope.currentVideo = function() {
      return $video.current();
    };

    $scope.getVideos = function() {
      return $video.getVideos();
    }

    $scope.addVideo = function() {
      $log.log('Adding video');
      $log.log($scope.link);
      $log.log($scope.username);
      if ($scope.link) {
        $video
          .add(link, user)
          .success(() => $scope.link = '')
          .error((e) => {
            $scope.link = '';
            sweetAlert('Error', e, 'error');
          });
      }
    };

    $scope.readd = function(key) {
      return $video.addByKey($scope.username, key);
    };

    /******************************
     * End Video Service Passthru *
     ******************************/

    $scope.startTime = function() {
      let video = $video.current();

      return video ? Math.max(Math.floor(($scope.initTime - new Date(video.startTime).getTime()) / 1000), 0) : 0;
    };

    $scope.$watch($video.current, function(currentVideo) {
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
          url: currentVideo ? `//www.youtube.com/embed/${currentVideo.key}` : '',
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

    $video.getAll();
    $video.subscribe();

    io.socket.on('video', function(obj) {
      $log.log('Received a video update');
      $log.log(obj);
      if (obj.verb === 'created') {
        if ($video.current() && $scope.username !== obj.data.user) {
          $notification('New Video Added', {
            body: obj.data.user + ' added ' + obj.data.title,
            icon: obj.data.thumbnail,
            delay: 4000,
            focusWindowOnClick: true
          });
        }
        $video.push(obj.data);
      } else if (obj.verb === 'updated') {
        $video.update(obj.data);
      } else if (obj.verb === 'destroyed') {
        $video.remove(obj.id);
      }
      $scope.$digest();
    });

    io.socket.on('listening', function(obj) {
      $scope.listeners = obj.users;
      $scope.$digest();
    });

    io.socket.get('/api/subscribe', {
      username: $scope.username
    });

    $scope.remove = function(id) {
      $http.delete('/api/remove/' + id);
    };



    $scope.skip = function() {
      return $video.skip();
    };

    $scope.findVideoById = function(id) {
      return $video.findById(id);
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
