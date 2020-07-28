const debug = require('debug')('storage');
const error = require('debug')('error');
const config = require('../config');

const Minio = require('minio');
const request = require('request');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

  async saveAsset(asset) {
    debug(asset);

    const content = await this.getFileFromURL(asset.url_private);
    const id = uuidv4();
    this.minioClient.putObject('assets', id, content, (err, etag) => {
      if (err) return error(err);
      debug('saved in minio', etag);
    });

    return id;
  }

  async getAssetURL(id) {
    return new Promise((resolve, reject) => {
      this.minioClient.presignedGetObject('assets', id, 1*60*60, function(err, presignedUrl) {
        if (err) return error(err);
        debug('generated url');
        resolve(presignedUrl);
      })
    });
  }
}

module.exports = new Storage();