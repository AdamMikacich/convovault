const debug = require('debug')('storage');
const error = require('debug')('error');
const config = require('../config');

const Minio = require('minio');
const request = require('request');

class Storage {
  async init() {
    const minioClient = new Minio.Client(config.data.storage);

    await updateBuckets();

    debug('init');
    return;
  }

  async updateBucket(name) {
    return new Promise((resolve, reject) => {
      minioClient.bucketExists(name, function(err, exists) {
        if (err) return reject(err);
        if (exists) {
          debug('found bucket', name);
          return resolve();
        } else {
          minioClient.makeBucket(name, 'us-west-1', function(err2) {
            if (err2) return reject(err2);
            debug('made bucket', name);
            return resolve();
          })
        }
      })
    });
  }

  async updateBuckets() {
    return updateBucket('assets');
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