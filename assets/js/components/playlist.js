function PlaylistController($rootScope, $scope, $video, $storage, $log, $notification) {
  let self = this;
  self.notifications = $storage.get('notifications') === 'true' ||  !$storage.get('notifications');
  self.activeTab = 'up-next';
  self.relatedVideos = [];

  $video.getAll();
  $video.subscribe();

  io.socket.on('video', function(obj) {
    $log.log('Received a video update');
    $log.log(obj);
    if (obj.verb === 'created') {
      if ($video.current() && $scope.username !== obj.data.user && self.notifications) {
        $notification('New Video Added', {
          body: obj.data.user + ' added ' + obj.data.title,
          icon: obj.data.thumbnail,
          delay: 4000,
          focusWindowOnClick: true
        });
      }
      $video.push(obj.data);
    } else if (obj.verb === 'updated') {
      $video.update(obj.data);
    } else if (obj.verb === 'destroyed') {
      $video.remove(obj.id);
    }
    $rootScope.$digest();
  });

  io.socket.get('/api/subscribeRelatedVideos', {});
  io.socket.on('related', (videos) => {
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
