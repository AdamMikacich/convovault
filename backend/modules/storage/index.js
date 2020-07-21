const debug = require('debug')('storage');
const error = require('debug')('error');
const config = require('../config');

const Minio = require('minio');
const request = require('request');

class Storage {
  async init() {
    const minioClient = new Minio.Client(config.data.minio);

    debug('init');
    return;
  }

  async saveFile(file) {
    debug(file);

    return new Promise((resolve, reject) => {
      request({
        url: file.url_private,
        headers: {
          'Authorization': `Bearer ${config.data.slack.token}`
        }
      }, function(err, res) {
        if (err) return reject(err);
        debug(res.body);
        return resolve(file.id);
      });
    });
  }
}

module.exports = new Storage();