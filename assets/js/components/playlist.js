function PlaylistController($video, $storage) {
  this.notifications = $storage.get('notifications') === 'true' ||  !$storage.get('notifications');

  this.getVideos = function() {
    return $video.getVideos();
  };

  this.toggleNotifications = function(newVal) {
    $storage.set('notifications', newVal);
  };

  this.skip = function() {
    return $video.skip()
      .then(() => scrollToBottom());
  };

  this.readd = function(key) {
    return $video.addByKey(this.username, key)
      .then(() => scrollToBottom());
  };

  this.remove = function(id) {
    return $video.removePermanently(id)
      .then(() => scrollToBottom());
  };

  this.likeVideo = function(video) {
    $storage.likeVideo(video);
  };

  this.likesVideo = function(key) {
    return $storage.likesVideo(key);
  };

  this.formatDuration = function(duration) {
    return $video.formatDuration(duration);
  };

  this.expectedPlayTime = function(video) {
    return $video.expectedPlayTime(video);
  };

  function scrollToBottom() {
    let $list = $('#video-list');
    $list.animate({
     scrollTop: $list.prop('scrollHeight')
    }, 1000);
  }
}

angular
.module('app')
.component('playlist', {
  templateUrl: 'components/playlist.html',
  controller: PlaylistController,
  bindings: {
    username: '='
  }
});
