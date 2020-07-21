const debug = require('debug')('storage');
const error = require('debug')('error');
const config = require('../config');

class Storage {
  async init() {
    debug('init');
    return;
  }

  async saveFile(file) {
    debug(file);
    return file.id;
  }
}

module.exports = new Storage();