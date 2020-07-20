const debug = require('debug')('app');
const error = require('debug')('error');

const logger = require('./modules/logger');
const config = require('./modules/config');
const http = require('./modules/http');

(async () => {
  await logger.init();
  await config.init();
  await http.init();
  debug('init');
})().catch((err) => {
  error(err);
});