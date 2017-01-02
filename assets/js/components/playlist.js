function PlaylistController($scope, $video, $storage) {
  this.notifications = $storage.get('notifications') === 'true' ||  !$storage.get('notifications');
  this.activeTab = 'up-next';

  io.socket.get('/api/subscribeRelatedVideos', {});
  io.socket.on('related', (videos) => {
    debugger;
    this.relatedVideos = videos;
    $scope.$digest();
  });

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
  };

  this.setTab = function(tab) {
    this.activeTab = tab;
  };
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
