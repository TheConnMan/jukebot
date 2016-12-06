var Promise = require('promise');
var request = require('request');

module.exports = {
  parseYouTubeLink: parseYouTubeLink,
  getYouTubeVideo: getYouTubeVideo
};

function parseYouTubeLink(link) {
  return link.match(/v=[^?&]+/g)[0].substring(2);
}

function getYouTubeVideo(key, user) {
  return new Promise(function(resolve, reject) {
    request('https://www.googleapis.com/youtube/v3/videos?id=' + key + '&part=snippet,contentDetails&key=' + process.env.GOOGLE_API_KEY, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        parseYouTubeVideo(JSON.parse(body), user).exec(function(err, video) {
          if (err) {
            throw err;
          }
          resolve(video);
        });
      } else {
        reject(error);
      }
    });
  });
}

function parseYouTubeVideo(data, user) {
  if (data.items.length != 1) {
    throw 'Unexpected video count';
  }
  var item = data.items[0];
  return Video.create({
    key: item.id,
    duration: parseDuration(item.contentDetails.duration),
    user: user,
    thumbnail: item.snippet.thumbnails.default.url,
    title: item.snippet.title
  });
}

function parseDuration(duration) {
  var seconds = 0;
  if (duration.substring(2).indexOf('M') == -1) {
    return parseInt(duration.substring(2, duration.length));
  }
  duration.substring(2).match(/[1-9]+[A-Za-z]/g).forEach(function(item) {
    switch(item.slice(-1)) {
      case 'H':
        seconds += 3600 * parseInt(item.substring(0, item.length));
        break;
      case 'M':
        seconds += 60 * parseInt(item.substring(0, item.length));
        break;
      case 'S':
        seconds += parseInt(item.substring(0, item.length));
        break;
    }
  });
  return seconds * 1000;
}
