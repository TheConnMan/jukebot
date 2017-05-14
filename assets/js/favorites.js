angular
.module('favorites', [])
.factory('$favorites', ['$rootScope', '$http', '$storage', function($rootScope, $http, $storage) {

  $rootScope.favorites = JSON.parse($storage.get('likes') || '[]');

  if (loggedIn) {
    $http.get('/favorite').then(({ data }) => {
      let localFavorites = $rootScope.favorites;
      $rootScope.favorites = data;
      localFavorites.forEach(favorite => {
        if (!data.find(l => l.key === favorite.key)) {
          likeVideo(favorite);
        }
      });
    });
  }

  function likeVideo(video) {
    let key = video.key;

    let found = $rootScope.favorites.find((l) => l.key === key);

    if (found) {
      let index = $rootScope.favorites.indexOf(found);

      $rootScope.favorites.splice(index, 1);
    } else {
      $rootScope.favorites.push(video);
    }
    $storage.set('likes', JSON.stringify($rootScope.favorites));
    return loggedIn ? (found ? $http.delete('/favorite/' + key) : $http.post('/favorite', video)) : Promise.resolve();
  }

  return {
    likeVideo,

    likesVideo(videoKey) {
      return !!$rootScope.favorites.find((l) => l.key === videoKey);
    }
  };
}]);
