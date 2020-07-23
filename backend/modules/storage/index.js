const debug = require('debug')('storage');
const error = require('debug')('error');
const config = require('../config');

const Minio = require('minio');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

class Storage {
  async init() {
    this.minioClient = new Minio.Client(config.data.storage);

    await this.updateBuckets();

    debug('init');
    return;
  }

  async updateBucket(name) {
    return new Promise((resolve, reject) => {
      this.minioClient.bucketExists(name, (err, exists) => {
        if (err) return reject(err);
        if (exists) {
          debug('found bucket', name);
          return resolve();
        } else {
          this.minioClient.makeBucket(name, 'us-west-1', (err2) => {
            if (err2) return reject(err2);
            debug('made bucket', name);
            return resolve();
          })
        }
      })
    });
  }

  async updateBuckets() {
    return this.updateBucket('assets');
  }

  async getFileFromURL(url) {
    return new Promise((resolve, reject) => {
      request({
        url,
        headers: {
          'Authorization': `Bearer ${config.data.slack.token}`
        }
      }, function(err, res) {
        if (err) return reject(err);
        return resolve(res.body);
      });
    });
  }

  async saveFile(file) {
    debug(file);

    const content = await this.getFileFromURL(file.url_private);
    const id = uuidv4();
    this.minioClient.putObject('assets', id, content, (err, etag) => {
      if (err) return error(err);
      debug('saved in minio', etag);
    });

    return id;
  }

  async getFile(id) {
    return new Promise((resolve, reject) => {
      this.minioClient.fGetObject('assets', id, `/tmp/${id}`, function(err) {
        if (err) return error(err);
        debug('saved in tmp', id);
        resolve();
      })
    });
  }
}

module.exports = new Storage();