const debug = require('debug')('db');
const error = require('debug')('error');

const config = require('../config');

const { Sequelize, Model, DataTypes } = require('sequelize');

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
  }

  async define(sequelize) {
    this.models.Messages = sequelize.define('messages', {
      slack_message_id: {
        type: DataTypes.STRING,
        allowNull: false
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

    return await sequelize.sync({ alter: true });
  }

  async saveMessage(event) {
    const { Messages } = this.models;

    return Messages.create({
      slack_message_id: event.client_msg_id,
      slack_channel_id: event.channel,
      slack_user_id: event.user,
      content: event.text,
      assets: null
    });
  }
}

module.exports = new DB();