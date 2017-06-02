function PlaylistController($rootScope, $scope, $video, $storage, $log, $notification) {
  let self = this;
  self.activeTab = 'up-next';
  self.relatedVideos = [];

  $video.getAll().then(function() {
    setTimeout(function() {
      self.scrollToCurrentlyPlaying();
      self.popup();
    }, 250);
  });
  $video.subscribe();

  io.socket.on('video', function(obj) {
    $log.log('Received a video update');
    $log.log(obj);
    if (obj.verb === 'created') {
      if ($video.current() && $rootScope.profile.username !== obj.data.user && $rootScope.profile.videoNotifications) {
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
    setTimeout(self.popup);
  });

  io.socket.get('/api/subscribeRelatedVideos', {});
  io.socket.on('related', (videos) => {
    this.relatedVideos = videos;
    $scope.$digest();
  });

  this.getVideos = function() {
    return $video.getVideos();
  };

  this.scrollToCurrentlyPlaying = function() {
    let $list = $('#video-list');
    let $playing = $list.find('.yellow').closest('playlistitem');

    if ($playing.length) {
      $playing[0].scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  this.popup = function() {
    $('#video-list span[data-content]').popup({
      variation: 'inverted',
      position: 'top center'
    });
  };

  this.setTab = function(tab) {
    this.activeTab = tab;

    window.setTimeout(() => this.scrollToCurrentlyPlaying(), 250);
  };
}

angular
.module('app')
.component('playlist', {
  templateUrl: 'components/playlist.html',
  controller: PlaylistController
});
