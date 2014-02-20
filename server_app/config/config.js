var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'server-app'
    },
    port: 3000,
    db: 'mongodb://localhost/server-app-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'server-app'
    },
    port: 3000,
    db: 'mongodb://localhost/server-app-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'server-app'
    },
    port: 3000,
    db: 'mongodb://localhost/server-app-production'
  }
};

module.exports = config[env];
