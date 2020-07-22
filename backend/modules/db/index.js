const debug = require('debug')('db');
const error = require('debug')('error');
const config = require('../config');

const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
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

    this.models.Sessions = sequelize.define('sessions', {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      slack_channel_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slack_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expiration: {
        type: 'TIMESTAMP',
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

  async saveSession(event) {
    const { Sessions } = this.models;

    const id = uuidv4();
    
    Sessions.create({
      id,
      slack_channel_id: event.channel_id,
      slack_user_id: event.user_id,
      expiration: Sequelize.fn(
        'DATE_ADD',
        Sequelize.literal('CURRENT_TIMESTAMP'),
        Sequelize.literal('INTERVAL 30 MINUTE')
      )
    });

    return id;
  }

  async getMessages(id) {
    const { Sessions, Messages } = this.models;

    const session = await Sessions.findOne({
      where: {
        id,
        expiration: {
          [Op.gt]: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }
    });

    if (session === null) return null;

    const results = await Messages.findAll({
      where: {
        slack_channel_id: session.slack_channel_id
      },
      order: Sequelize.literal('createdAt DESC')
    });

    return results.map((result) => result.toJSON());
  }
}

module.exports = new DB();