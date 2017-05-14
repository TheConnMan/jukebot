function PlaylistController($rootScope, $scope, $video, $storage, $log, $notification) {
  var self = this;
  self.notifications = $storage.get('notifications') === 'true' ||  !$storage.get('notifications');
  self.activeTab = 'up-next';
  self.relatedVideos = [];

  $rootScope.notifications = self.notifications;

  $video.getAll().then(function() {
    setTimeout(function() {
      self.scrollToCurrentlyPlaying();
    }, 250);
  });
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
      $video.remove(parseInt(obj.id));
    }
    $rootScope.$digest();
  });

  io.socket.get('/api/subscribeRelatedVideos', {});
  io.socket.on('related', function(videos) {
    this.relatedVideos = videos;
    $scope.$digest();
  });

  this.getVideos = function() {
    return $video.getVideos();
  };

  this.toggleNotifications = function(newVal) {
    $storage.set('notifications', newVal);
    $rootScope.notifications = newVal;
  };

  this.scrollToCurrentlyPlaying = function() {
    var $list = $('#video-list');
    var $playing = $list.find('.yellow').closest('playlistitem');

    if ($playing.length) {
      $playing[0].scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  this.setTab = function(tab) {
    this.activeTab = tab;

    window.setTimeout(function() {
      this.scrollToCurrentlyPlaying();
    }, 250);
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
