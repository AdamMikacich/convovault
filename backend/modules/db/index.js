const debug = require('debug')('db');
const error = require('debug')('error');

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('convovault', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql'
});

const Messages = sequelize.define('messages', {
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

class DB {
  async init() {
    await sequelize.sync({ alter: true });
    // const jane = await User.create({
    //   username: 'janedoe',
    //   birthday: new Date(1980, 6, 20)
    // });

    // console.log(jane);
  }
}

module.exports = new DB();