module.exports.connections = {
  localDiskDb: {
    adapter: 'sails-disk',
    filePath: 'data/',
    fileName: 'jukebot.db'
  },

  mysql: {
    adapter: 'sails-mysql',
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER || 'sails',
    password: process.env.MYSQL_PASSWORD || 'sails',
    database: process.env.MYSQL_DB || 'sails',
  }

};
