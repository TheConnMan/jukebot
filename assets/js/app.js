var app = angular.module('app', ['notification', 'storage', 'video', 'angularMoment', 'ngSanitize']);
app.controller('controller', function($scope, $rootScope, $notification, $storage, $video, $timeout, $http, $log) {
  $('.ui.search')
    .search({
      minCharacters: 3,
      onSelect(result, response) {
        if (result.playlistId) {
          $scope.addPlaylist(result.playlistId)
            .then(() => {
              $('.ui.search input').val('');
            });
        } else {
          $scope.readd(result.key)
            .then(() => {
              $('.ui.search input').val('');
            });
        }
      },
      apiSettings: {
        onResponse(videos) {
          return {
            results: $.map(videos, (v) => {
              v.title = v.title + ' (' + (v.playlistId ? v.playlistItems + ' videos' : moment.duration(v.duration).format('H:mm:ss')) + ')';
              v.image = v.thumbnail;
              return v;
            })
          };
        },
        url: 'api/search?query={query}&maxResults=10'
      }
    });

    $rootScope.theme = $storage.get('theme');

    $scope.updateTheme = function(theme) {
      $rootScope.theme = theme;
      $storage.set('theme', theme);
    };

    $rootScope.title = 'JukeBot';
    $scope.username = $storage.get('username');
    $scope.initTime = new Date().getTime();
    $scope.autoplay = false;
    $scope.listeners = {};
    $scope.newChat = '';

    $scope.minimizeVideo = $storage.get('minimizeVideo') === 'true';

    $scope.toggleVideo = function() {
      $scope.minimizeVideo = !$scope.minimizeVideo;
      $storage.set('minimizeVideo', $scope.minimizeVideo);
    };

    /*************
     * Favorites *
     *************/
    $scope.likeCurrentVideo = function() {
      let video = $video.current();
      $storage.likeVideo(video);
      if ($scope.likesCurrentVideo()) {
        $scope.$emit('likeVideo', {
          video
        });
      }
    };

    $scope.likesCurrentVideo = function() {
      return $storage.likesVideo($video.current().key);
    };

    $scope.likeVideo = function(video) {
      return $storage.likeVideo(video);
    };

    $scope.likes = function() {
      return $storage.getLikedVideos();
    };
    /*****************
     * End Favorites *
     *****************/

    /**************************
     * Video Service Passthru *
     **************************/
    $scope.currentVideo = function() {
      return $video.current();
    };

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

    $scope.addPlaylist = function(key) {
      return $video.addPlaylistById($scope.username, key);
    };

    $scope.skip = function() {
      return $video.skip($scope.username);
    };

    $scope.findVideoById = function(id) {
      return $video.findById(id);
    };

    $scope.videoInUpcoming = function(key) {
      return $video.videoInUpcoming(key);
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
      if (currentVideo && $scope.startTime() === 0 && $rootScope.notifications) {
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
        $('.ui.dropdown').dropdown();

        let $playing = $('#video-list .yellow').closest('playlistitem');

        if ($playing.length) {
          $playing[0].scrollIntoView({
            behavior: 'smooth'
          });
        }
      }, 0);
    }, true);

    $scope.$watch('username', function(newUsername) {
      $storage.set('username', $scope.username);
      io.socket._raw.emit('username', newUsername);
    });

    io.socket.get('/api/subscribeUsers', {
      username: $scope.username
    });

    /************
     * Autoplay *
     ************/
    io.socket.on('autoplay', function(obj) {
      $scope.autoplay = obj.autoplay;
      $scope.$digest();
    });

    io.socket.get('/api/autoplay');

    $scope.toggleAutoplay = function() {
      io.socket._raw.emit('autoplay', $scope.autoplay);
    };
    /****************
     * End Autoplay *
     ****************/

    /***************
     * Chrome Flag *
     ***************/
    $scope.canShowChromeFlag = function() {
      return !$storage.get('chromeFlag');
    };

    $scope.hideChromeFlag = function() {
      $storage.set('chromeFlag', 'true');
    };
    /*******************
     * End Chrome Flag *
     *******************/

    /*************
     * Listeners *
     *************/
     io.socket.on('listening', function(obj) {
       $scope.listeners = obj.users;
       $scope.$digest();
     });

    $scope.toggleListeners = function() {
      $('.listeners').toggle();
    };

    $scope.listenerUsernames = function() {
      return Object.values($scope.listeners);
    };

    $scope.listenerCount = function() {
      return Object.keys($scope.listeners).length;
    };
    /*****************
     * End Listeners *
     *****************/
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
