var app = angular.module('app', []);
app.controller('controller', function($scope, $timeout) {
    $scope.currentVideo = 'FhKS3WGxjOg';
    $scope.startTime = 20;

    $scope.getIframeSrc = function() {
      return 'https://www.youtube.com/embed/' + $scope.currentVideo + '?autoplay=1&start=' + $scope.startTime;
    };

}).config(function($sceProvider) {
    $sceProvider.enabled(false);
});
