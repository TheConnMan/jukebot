var Promise = require('promise');
var request = require('request');
var moment = require('moment');

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
    duration: moment.duration(item.contentDetails.duration).asMilliseconds(),
    user: user,
    thumbnail: item.snippet.thumbnails.default.url,
    title: item.snippet.title
  });
}
