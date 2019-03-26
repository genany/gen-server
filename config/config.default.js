'use strict'
const path = require('path')

module.exports = appInfo => {
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1546945849591_9977'

  // add your config here
  config.middleware = []
  config.mysql = {
    client: {
      host: '127.0.0.1',
      port: '3306',
      user: 'root',
      password: '',
      database: 'gen'
    },
    app: true,
    agent: false
  }
  config.scaffoldDir = path.join(appInfo.baseDir, '..', 'gen', 'scaffold')
  config.static = {
    prefix: '',
    dir: path.join(appInfo.baseDir, 'app/public')
  }

  exports.multipart = {
    whitelist: ['.zip']
  }

  return config
}
