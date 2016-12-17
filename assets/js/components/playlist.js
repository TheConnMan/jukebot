function PlaylistController($scope, $video, $storage) {
  this.notifications = $storage.get('notifications') === 'true' ||  !$storage.get('notifications');
  this.activeTab = 'up-next';

  this.getVideos = function() {
    return $video.getVideos();
  };

  this.toggleNotifications = function(newVal) {
    $storage.set('notifications', newVal);
  };

  this.scrollToBottom = function() {
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
