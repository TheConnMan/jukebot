const Promise = require('promise');
const request = require('request');
const moment = require('moment');

module.exports = {
  parseYouTubeLink,
  getYouTubeVideo,
  search,
  nextRelated
};

function parseYouTubeLink(link) {
  var matcher = /v=([^?&]+)|youtu.be\/([^?&]+)/g;
  var match = matcher.exec(link);
  if (!match || (!match[1] && !match[2])) {
    throw 'Invalid YouTube link';
  }
  return match[1] || match[2];
}

function getYouTubeVideo(key, user) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/videos?id=${key}&part=snippet,contentDetails&key=${process.env.GOOGLE_API_KEY}`, (error, response, body) => {
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

function search(query, maxResults) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/search?q=${query}&part=snippet&key=${process.env.GOOGLE_API_KEY}&maxResults=${maxResults || 15}&type=video,playlist`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var results = JSON.parse(body).items.map(function(video) {
          return {
            playlistId: video.id.playlistId,
            key: video.id.videoId,
            thumbnail: video.snippet.thumbnails.default.url,
            title: video.snippet.title
          };
        });
        resolve(results);
      } else {
        reject(error);
      }
    });
  });
}

function nextRelated(key) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/search?relatedToVideoId=${key}&part=snippet&key=${process.env.GOOGLE_API_KEY}&maxResults=3&type=video`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var items = JSON.parse(body).items;
        if (items.length === 0) {
          reject('No related video found');
        }
        resolve(items[Math.floor(Math.random() * items.length)].id.videoId);
      } else {
        reject(error);
      }
    });
  });
}

function getPlaylistVideos(playlistId, videos, pageToken) {
  return new Promise((resolve, reject) => {
    if (pageToken === '' || pageToken) {
      request(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&part=snippet&key=${process.env.GOOGLE_API_KEY}&playlistId=${playlistId}&pageToken=${pageToken}`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let playlist = JSON.parse(body);
          getPlaylistVideos(playlistId, videos.concat(playlist.items), playlist.nextPageToken).then(function(videos) {
            resolve(videos);
          });
        } else {
          reject(error);
        }
      });
    } else {
      resolve(videos);
    }
  });
}
