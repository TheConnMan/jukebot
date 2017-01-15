const Promise = require('promise');
const request = require('request');
const moment = require('moment');
const log4js = require('log4js');
const logger = log4js.getLogger();

module.exports = {
  parseYouTubeLink,
  getYouTubeVideo,
  search,
  nextRelated,
  relatedVideos,
  getPlaylistVideos
};

function parseYouTubeLink(link) {
  var matcher = /v=([^?&]+)|youtu.be\/([^?&]+)/g;
  var match = matcher.exec(link);
  if (!match || (!match[1] && !match[2])) {
    throw 'Invalid YouTube link';
  }
  return match[1] || match[2];
}

function getYouTubeVideo(key, user, canSave=true) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/videos?id=${key}&part=snippet,contentDetails&key=${process.env.GOOGLE_API_KEY}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        try {
          parseYouTubeVideo(JSON.parse(body), user, canSave).then((video, err) => {
            if (err) {
              throw err;
            }
            resolve(video);
          });
        } catch (e) {
          logger.debug(`Video ${key}: ${e}`);
          resolve(null);
        }
      } else {
        reject(error);
      }
    });
  });
}

function parseYouTubeVideo(data, user, canSave) {
  if (data.items.length != 1) {
    throw 'YouTube link did not match a video';
  }
  var item = data.items[0];
  var model = {
    key: item.id,
    duration: moment.duration(item.contentDetails.duration).asMilliseconds(),
    user: user,
    isSuggestion: canSave ? false : true,
    thumbnail: item.snippet.thumbnails ? item.snippet.thumbnails.default.url : null,
    title: item.snippet.title
  };
  if (canSave) {
    return Video.create(model);
  }
  return new Promise ((resolve, reject) => {
    resolve(new Video._model(model));
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
            title: video.snippet.title + (video.id.playlistId && video.snippet.title.toLowerCase().indexOf('playlist') == -1 ? ' (Playlist)' : '')
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
  return relatedVideos(key)
    .then((videos) => videos[Math.floor(Math.random() * videos.length)].id.videoId);
}

function relatedVideos(key, maxResults = 10) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/search?relatedToVideoId=${key}&part=snippet&key=${process.env.GOOGLE_API_KEY}&maxResults=${maxResults}&type=video`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var items = JSON.parse(body).items;
        if (items.length === 0) {
          reject('No related video found');
        }

        var itemsPromise = items.map((i) => {
          return getYouTubeVideo(i.id.videoId, 'JukeBot', false);
        });

        return Promise.all(itemsPromise)
          .then((videos) => {
            resolve(videos);
          });
      } else {
        reject(error);
      }
    });
  });
}

function getPlaylistVideos(playlistId, user) {
  return new Promise((resolve, reject) => {
    getPlaylistVideosRecursive(playlistId, [], '').then(videos => {
      Promise.all(videos.map(function(video) {
        return getYouTubeVideo(video.snippet.resourceId.videoId, user);
      })).then(resolve);
    });
  });
}

function getPlaylistVideosRecursive(playlistId, videos, pageToken) {
  return new Promise((resolve, reject) => {
    if (pageToken === '' || pageToken) {
      request(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&part=snippet&key=${process.env.GOOGLE_API_KEY}&playlistId=${playlistId}&pageToken=${pageToken}`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let playlist = JSON.parse(body);
          getPlaylistVideosRecursive(playlistId, videos.concat(playlist.items), playlist.nextPageToken).then(function(videos) {
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
