function PlaylistItemController($rootScope, $scope, $http, $video, $storage) {
  this.formatDuration = function() {
    return $video.formatDuration(this.video.duration);
  };

  this.expectedPlayTime = function() {
    return $video.expectedPlayTime(this.video);
  };

  this.startTime = function() {
    return $video.startTime(this.video);
  };

  this.skip = function() {
    return $video.skip();
  };

  this.readd = function() {
    return $video.addByKey($rootScope.profile.username, this.video.key);
  };

  this.remove = function() {
    return $video.removePermanently($rootScope.profile.username, this.video.id);
  };

  this.likeVideo = function() {
    $storage.likeVideo(this.video);
    if (this.likesVideo(this.video.key)) {
      $scope.$emit('likeVideo', {
        video: this.video
      });
    }
  };

  this.likesVideo = function() {
    return $storage.likesVideo(this.video.key);
  };
}

angular
.module('app')
.component('playlistitem', {
  templateUrl: 'components/playlist-item.html',
  controller: PlaylistItemController,
  bindings: {
    video: '<',
    showAddedBy: '<',
    showExpectedPlaytime: '<',
    isSuggestion: '<',
    canScroll: '<'
  }
});
