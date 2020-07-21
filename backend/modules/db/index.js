const debug = require('debug')('db');
const error = require('debug')('error');
const config = require('../config');

const { Sequelize, Model, DataTypes } = require('sequelize');
const bot = require('../bot');
const storage = require('../storage');

class DB {
  constructor() {
    this.models = {};
  }

  async init() {
    const options = config.data.db;
    const sequelize = new Sequelize(options.name, options.user, options.pass, {
      host: options.host,
      port: options.port,
      dialect: options.dialect
    });

    await this.define(sequelize);
    await this.updateChannels();

    debug('init');
    return;
  }

  async define(sequelize) {
    this.models.Messages = sequelize.define('messages', {
      slack_message_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slack_channel_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slack_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      },
      assets: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });

    this.models.Channels = sequelize.define('channels', {
      slack_channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      slack_channel_name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });

    this.models.Assets = sequelize.define('assets', {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });

    return await sequelize.sync({ alter: true });
  }

  async updateChannels() {
    const { Channels } = this.models;

    const response = await bot.slack.conversations.list({});
    if (response.ok !== true) {
      error('cannot update channels', response);
      return;
    }

    for (const channel of response.channels) {
      await Channels.upsert({
        slack_channel_id: channel.id,
        slack_channel_name: channel.name
      });

      if (channel.is_member !== true) {
        debug('bot joining', channel.id);
        await bot.slack.conversations.join({
          channel: channel.id
        });
      }
    }
    return;
  }

  async saveMessage(event) {
    const { Messages } = this.models;

    let slack_message_id = event.client_msg_id;
    if (slack_message_id === undefined) slack_message_id = null;

    let assets = null;
    if (event.subtype === 'file_share') {
      assets = await this.saveFiles(event.files);
    }

    return Messages.create({
      slack_message_id,
      slack_channel_id: event.channel,
      slack_user_id: event.user,
      content: event.text,
      assets
    });
  }

  async saveFiles(files) {
    const { Assets } = this.models;

    const ids = [];
    for (const file of files) {
      const id = await storage.saveFile(file);
      await Assets.create({
        id,
        name: file.name
      });
      ids.push(id);
    }
    return ids.join(',');
  }
}

module.exports = new DB();