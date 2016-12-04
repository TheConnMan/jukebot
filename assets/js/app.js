var app = angular.module('app', []);
app.controller('controller', function($scope, $timeout, $http, $log) {
    $scope.currentVideo = 'FhKS3WGxjOg';
    $scope.startTime = 20;

    $scope.getIframeSrc = function() {
      return 'https://www.youtube.com/embed/' + $scope.currentVideo + '?autoplay=1&start=' + $scope.startTime;
    };

    $scope.videos = [];
    $scope.getAllVideos = function() {
      io.socket.get('/video/subscribe');

      $http.get('/video/recent').success(function(data) {
          $scope.videos = data;
          $log.info(data);
      });
    };

    $scope.getAllVideos();

    io.socket.on('video', function(obj) {
        $log.info(obj);
        if (obj.verb === 'created') {
            $scope.videos.push(obj.data);
            $scope.currentVideo = obj.data.key;
            $scope.$digest();
        }
    });
}).config(function($sceProvider) {
    $sceProvider.enabled(false);
});
