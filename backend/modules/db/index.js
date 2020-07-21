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
    // const jane = await User.create({
    //   username: 'janedoe',
    //   birthday: new Date(1980, 6, 20)
    // });

    // console.log(jane);
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
      slack_user_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      },
      assets: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });

    return await sequelize.sync({ alter: true });
  }
}

module.exports = new DB();