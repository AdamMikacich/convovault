const debug = require('debug')('app');
const error = require('debug')('error');

const logger = require('./modules/logger');
const config = require('./modules/config');
const http = require('./modules/http');
const db = require('./modules/db');

(async () => {
  await logger.init();
  await config.init();
  await http.init();
  await db.init();
  debug('init');
})().catch((err) => {
  error(err);
});