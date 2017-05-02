'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  createChats(db).then(() => {
    return createVideos(db);
  }).then(callback);
};

exports.down = function(db) {
  return db.dropTable('chat', null, db.dropTable('video', null, callback));
};

exports._meta = {
  "version": 1
};

function createChats(db) {
  return new Promise((resolve, reject) => {
    db.createTable('chat', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true
      },
      username: 'string',
      message: 'string',
      type: 'string',
      time: 'datetime',
      data: 'string',
      createdAt: 'datetime',
      updatedAt: 'datetime'
    }, resolve);
  });
}

function createVideos(db) {
  return new Promise((resolve, reject) => {
    db.createTable('video', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true
      },
      key: 'string',
      title: 'string',
      duration: 'int',
      user: 'string',
      startTime: 'datetime',
      thumbnail: 'string',
      playing: 'boolean',
      played: 'boolean',
      isSuggestion: 'boolean',
      createdAt: 'datetime',
      updatedAt: 'datetime'
    }, resolve);
  });
}
