function HeartController($scope, $storage) {

  $scope.video = this.video;
  $scope.classes = this.classes;

  this.likeVideo = function(video) {
    $storage.likeVideo(video);
    if (this.likesVideo(video.key)) {
      $scope.$emit('likeVideo', {
        video
      });
    }
  };

  this.likesVideo = function(key) {
    return $storage.likesVideo(key);
  };
}

angular
.module('app')
.component('heart', {
  templateUrl: 'components/heart.html',
  controller: HeartController,
  bindings: {
    video: '=',
    classes: '='
  }
});
