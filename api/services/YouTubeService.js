const Promise = require('promise');
const request = require('request');
const moment = require('moment');

module.exports = {
  parseYouTubeLink,
  getYouTubeVideo
};

function parseYouTubeLink(link) {
  var match = link.match(/v=[^?&]+/g);
  if (!match || match.length === 0) {
    throw 'Invalid YouTube link';
  }
  return match[0].substring(2);
}

function getYouTubeVideo(key, user) {
  return new Promise(function(resolve, reject) {
    request(`https://www.googleapis.com/youtube/v3/videos?id=${key}&part=snippet,contentDetails&key=${process.env.GOOGLE_API_KEY}`, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        try {
          parseYouTubeVideo(JSON.parse(body), user).exec((err, video) => {
            if (err) {
              throw err;
            }
            resolve(video);
          });
        } catch (e) {
          reject(e);
        }
      } else {
        reject(error);
      }
    });
  });
}

function parseYouTubeVideo(data, user) {
  if (data.items.length != 1) {
    throw 'YouTube link did not match a video';
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
