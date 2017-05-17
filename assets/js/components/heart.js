function HeartController($scope, $favorites) {

  this.likeVideo = function(video) {
    $favorites.likeVideo(video);
    if (this.likesVideo(video.key)) {
      $scope.$emit('likeVideo', {
        video
      });
    }
  };

  this.likesVideo = function(key) {
    return $favorites.likesVideo(key);
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
