const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);

const production = process.env.NODE_ENV === 'production';
const dataPath = path.resolve(__dirname, 'data.json');

class Config {
  constructor() {
    this.data = {
      slack: {
        token: ''
      },
      http: {
        port: production ? 80 : 3000
      }
    };
  }

  async save() {
    const data = JSON.stringify(this.data, null, 2);
    await write(dataPath, data);
  }

  async load() {
    try {
      const data = await read(dataPath);
      this.data = JSON.parse(data);
    } catch (err) {
      this.save();
    }
  }

  async init() {
    await this.load();
  }
}

module.exports = new Config();