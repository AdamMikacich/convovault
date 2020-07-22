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
    await this.updateUsers();

    debug('init');
    return;
  }

  async define(sequelize) {
    this.models.Messages = sequelize.define('messages', {
      message_id: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true
      },
      channel_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
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

    this.models.Channels = sequelize.define('channels', {
      channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      channel_name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });

    this.models.Users = sequelize.define('users', {
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      real_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
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
      channel_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expiration: {
        type: 'TIMESTAMP',
        allowNull: false
      }
    });

    const { Users, Messages } = this.models;

    Users.hasMany(Messages, {foreignKey: 'user_id'});
    Messages.belongsTo(Users, {foreignKey: 'user_id'});

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
        channel_id: channel.id,
        channel_name: channel.name
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

  async updateUsers() {
    const { Users } = this.models;

    const response = await bot.slack.users.list({});
    if (response.ok !== true) {
      error('cannot update users', response);
      return;
    }

    for (const user of response.members) {
      let email = user.profile.email;
      if (email === undefined) email = null;

      await Users.upsert({
        user_id: user.id,
        name: user.name,
        real_name: user.profile.real_name,
        email: email
      });
    }
    return;
  }

  async saveMessage(event) {
    const { Messages } = this.models;

    let message_id = event.client_msg_id;
    if (message_id === undefined) message_id = null;

    let assets = '';
    if (event.subtype === 'file_share') {
      assets = await this.saveFiles(event.files);
    }

    return Messages.create({
      message_id,
      channel_id: event.channel,
      user_id: event.user,
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
      channel_id: event.channel_id,
      user_id: event.user_id,
      expiration: Sequelize.fn(
        'DATE_ADD',
        Sequelize.literal('CURRENT_TIMESTAMP'),
        Sequelize.literal('INTERVAL 30 MINUTE')
      )
    });

    return id;
  }

  async getMessages(id) {
    const { Sessions, Messages, Users } = this.models;

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
        channel_id: session.channel_id
      },
      include: [{
        model: Users,
        required: true
      }],
      order: Sequelize.literal('createdAt DESC')
    });

    return results.map((result) => {
      const json = result.toJSON();
      if (json.assets === '') {
        json.assets = [];
      } else {
        json.assets = json.assets.split(',');
      }
      return json;
    });
  }
}

module.exports = new DB();