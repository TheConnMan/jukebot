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
  return db.addColumn('video', 'autoplay', 'boolean', function() {
    db.runSql('update video set autoplay=(user="Autoplay")', callback);
  });
};

exports.down = function(db, callback) {
  return db.removeColumn('video', 'autoplay', callback);
};

exports._meta = {
  "version": 1
};
