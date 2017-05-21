module.exports.models = {
  connection: process.env.MYSQL_HOST ? 'mysql' : 'localDiskDb',

  migrate: process.env.MYSQL_HOST ? 'safe' : 'alter'
};
