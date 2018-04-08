const fileCache = require('think-cache-file');
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const mysql = require('think-model-mysql');
const {Console, File, DateFile} = require('think-logger3');
const path = require('path');
const isDev = think.env === 'development';

exports.model = {
  type: 'mysql',
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => think.logger.info(msg)
  },
  mysql: {
    handle: mysql,
    database: 'gen',
    prefix: '',
    encoding: 'utf8',
    host: 'gen.sdemo.cn',
    port: '3306',
    user: 'root',
    password: '',
    dateStrings: true,
    pageSize: 20,
  },
};
