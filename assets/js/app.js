var app = angular.module('app', []);
app.controller('controller', function($scope, $timeout, $http) {
    $scope.initTime = new Date().getTime();
    $scope.videos = [];
    $scope.currentVideo = function() {
      var playing = $scope.videos.filter(function(video) { return video.playing; });
      return playing.length == 1 ? playing[0] : null;
    };

    $scope.startTime = function() {
      var video = $scope.currentVideo();
      return video ? Math.max(Math.floor(($scope.initTime - new Date(video.startTime).getTime()) / 1000), 0) : 0;
    };

    $scope.getIframeSrc = function() {
      var video = $scope.currentVideo();
      return video ? 'https://www.youtube.com/embed/' + video.key + '?autoplay=1&start=' + $scope.startTime() : '';
    };

    $scope.getAllVideos = function() {
      io.socket.get('/video/subscribe');

      $http.get('/video/recent').success(function(videos) {
          $scope.videos = videos;
      });
    };

    $scope.getAllVideos();

    io.socket.on('video', function(obj) {
      if (obj.verb === 'created') {
          $scope.videos.push(obj.data);
      } else if (obj.verb === 'updated') {
        var video = $scope.videos.filter(function(v) { return v.id === obj.data.id; });
        if (video.length === 1) {
          $scope.videos[$scope.videos.indexOf(video[0])] = obj.data;
        }
      }
      $scope.$digest();
    });

    $scope.upcoming = function() {
      return $scope.videos.filter(function(video) { return !video.played && !video.playing; });
    };

    $scope.recent = function() {
      return $scope.videos.filter(function(video) { return video.played && !video.playing; });
    };
}).config(function($sceProvider) {
    $sceProvider.enabled(false);
});
