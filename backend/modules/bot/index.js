const debug = require('debug')('bot');
const error = require('debug')('error');
const config = require('../config');

const Slack = require('slack');

class Bot {
  async init() {
    this.slack = new Slack({
      token: config.data.slack.token
    });
  }
}

module.exports = new Bot();
