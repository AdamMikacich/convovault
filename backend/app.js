const debug = require('debug')('app');
const error = require('debug')('error');

const logger = require('./modules/logger');
const config = require('./modules/config');
const bot = require('./modules/bot');
const db = require('./modules/db');
const storage = require('./modules/storage');
const http = require('./modules/http');

(async () => {
  await logger.init();
  await config.init();
  await bot.init();
  await db.init();
  await storage.init();
  await http.init();
  debug('init');
})().catch((err) => {
  error(err);
});