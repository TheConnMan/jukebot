var app = angular.module('app', []);
app.controller('controller', function($scope, $timeout, $http) {
    $scope.currentVideo = '';
    $scope.startTime = 0;

    $scope.getIframeSrc = function() {
      return 'https://www.youtube.com/embed/' + $scope.currentVideo + '?autoplay=1&start=' + $scope.startTime;
    };

    $scope.videos = [];
    $scope.getAllVideos = function() {
      io.socket.get('/video/subscribe');

      $http.get('/video/recent').success(function(data) {
          $scope.videos = data;
      });

      $http.get('/video/current').success(function(data) {
        $scope.currentVideo = data.key;
        $scope.startTime = data.startTime;
      });
    };

    $scope.getAllVideos();

    io.socket.on('video', function(obj) {
        if (obj.verb === 'created') {
            $scope.videos.push(obj.data);
            $scope.$digest();
        }
    });
}).config(function($sceProvider) {
    $sceProvider.enabled(false);
});
