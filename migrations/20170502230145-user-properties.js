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
  createUsers(db).then(db.addColumn('chat', 'realuser', 'string', db.addColumn('video', 'realuser', 'string', callback)));
};

exports.down = function(db, callback) {
  return db.dropTable('user', null, db.removeColumn('chat', 'realuser', db.removeColumn('video', 'realuser', callback)));
};

exports._meta = {
  "version": 1
};

function createUsers(db) {
  return new Promise((resolve, reject) => {
    db.createTable('user', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true
      },
      provider: 'string',
      uid: 'string',
      name: 'string',
      email: 'string',
      properties: 'text',
      createdAt: 'datetime',
      updatedAt: 'datetime'
    }, resolve);
  });
}
