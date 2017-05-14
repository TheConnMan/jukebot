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
  createFavorites(db).then(callback);
};

exports.down = function(db, callback) {
  return db.dropTable('favorite', callback);
};

exports._meta = {
  "version": 1
};

function createFavorites(db) {
  return new Promise((resolve, reject) => {
    db.createTable('favorite', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true
      },
      key: 'string',
      title: 'string',
      user: {
        type: 'int',
        foreignKey: {
          name: 'favorite_user_id_fk',
          table: 'user',
          rules: {
            onDelete: 'CASCADE'
          },
          mapping: 'id'
        }
      },
      createdAt: 'datetime',
      updatedAt: 'datetime'
    }, resolve);
  });
}
