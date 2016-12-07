var app = angular.module('app', []);
app.controller('controller', function($scope, $timeout, $http, $log) {
    $scope.username = sessionStorage.username;
    $scope.initTime = new Date().getTime();
    $scope.videos = [];
    $scope.listening = 0;

    $scope.currentVideo = function() {
      var playing = $scope.videos.filter(function(video) { return video.playing; });
      return playing.length == 1 ? playing[0] : null;
    };

    $scope.startTime = function() {
      var video = $scope.currentVideo();
      return video ? Math.max(Math.floor(($scope.initTime - new Date(video.startTime).getTime()) / 1000), 0) : 0;
    };

    $scope.$watch($scope.currentVideo, function(currentVideo) {
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
      $scope.listening = obj.count;
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
      sessionStorage.username = $scope.username;
      $log.log('Adding video');
      $log.log($scope.link);
      $http.post('/api/add', {
        link: $scope.link,
        user: $scope.username
      }).success(function() {
        $scope.link = '';
      });
    };

    $scope.remove = function(id) {
      $http.delete('/api/remove/' + id);
    };

    $scope.readd = function(key) {
      $http.post('/api/add', {
        link: 'https://www.youtube.com/watch?v=' + key,
        user: $scope.username
      });
    };

    $scope.findVideoById = function(id) {
      var videoMap = $scope.videos.reduce(function(map, video) {
        map[video.id.toString()] = video;
        return map;
      }, {});
      return videoMap[id.toString()];
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
