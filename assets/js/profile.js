angular
.module('profile', [])
.factory('$profile', ['$rootScope', '$http', '$storage', function($rootScope, $http, $storage) {

  $rootScope.profile = {
    username: $storage.get('username') || 'Anonymous',
    theme: $storage.get('theme'),
    minimizeVideo: $storage.get('minimizeVideo') === 'true',
    videoNotifications: $storage.get('videoNotifications') === 'true' || !$storage.get('videoNotifications'),
    chatNotifications: $storage.get('chatNotifications') === 'true' || !$storage.get('chatNotifications')
  };

  $rootScope.$watch('profile.username', function() {
    persistProperty('username', $rootScope.profile.username);
  });

  $rootScope.$watch('profile.theme', function() {
    persistProperty('theme', $rootScope.profile.theme);
  });

  $rootScope.$watch('profile.minimizeVideo', function() {
    persistProperty('minimizeVideo', $rootScope.profile.minimizeVideo);
  });

  $rootScope.$watch('profile.videoNotifications', function() {
    persistProperty('videoNotifications', $rootScope.profile.videoNotifications);
  });

  $rootScope.$watch('profile.chatNotifications', function() {
    persistProperty('chatNotifications', $rootScope.profile.chatNotifications);
  });

  if (loggedIn) {
    $http.get('/profile/get').then(({ data }) => {
      Object.keys(data).forEach(key => {
        $rootScope.profile[key] = data[key];
      });
      persistProperties();
    });
  }

  function persistProperty(key, value) {
    $storage.set(key, value);
    var payload = {};
    payload[key] = value;
    return loggedIn ? $http.post('/profile/add', payload) : Promise.resolve();
  }

  function persistProperties() {
    return loggedIn ? $http.post('/profile/add', $rootScope.profile) : Promise.resolve();
  }

  return {};
}]);
