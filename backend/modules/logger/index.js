const debug = require('debug');
var fs = require('fs');
var file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'});

class Logger {
  constructor() {
    const time = (new Date()).toLocaleString();
    file.write('\n' + time + ' BOOTING NOW' + '\n');
  }

  init() {
    debug.log = function(...items) {
      const output = items.join(' ');
      const unformatted = output.replace(/\u001b\[.*?m/g, '').trim();
      const time = (new Date()).toLocaleString();
      file.write(time + ' ' + unformatted + '\n');
      console.log(output);
    }
  }
}

module.exports = new Logger();