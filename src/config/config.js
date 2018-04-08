// default config
module.exports = {
	port: 8361, // server port
  // host: '127.0.0.1', // server host, removed from 3.1.0
  // workers: 0, // server workers num, if value is 0 then get cpus num
  // createServer: undefined, // create server function
  // startServerTimeout: 3000, // before start server time
  // reloadSignal: 'SIGUSR2', // reload process signal
  // stickyCluster: false, // sticky cluster, add from 3.1.0
  // onUnhandledRejection: err => think.logger.error(err), // unhandledRejection handle
  // onUncaughtException: err => think.logger.error(err), // uncaughtException handle
  // processKillTimeout: 10 * 1000, // process kill timeout, default is 10s
  // jsonpCallbackField: 'callback', // jsonp callback field
  // jsonContentType: 'application/json', // json content type
  errnoField: 'code', // errno field
  errmsgField: 'msg', // errmsg field
  // defaultErrno: 1000, // default errno
  // validateDefaultErrno: 1001 // validate default errno
};
