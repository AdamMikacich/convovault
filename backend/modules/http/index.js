const debug = require('debug')('http');
const error = require('debug')('error');
const config = require('../config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const db = require('../db');

class HTTP {
  async init() {
    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({ extended: true }));

    // app.use('/', express.static(path.join(__dirname, './../../frontend/dist')));
    
    // app.get('*', (req, res) => {
    //   res.sendFile(path.join(__dirname, './../../frontend/dist/index.html'));
    // });

    app.post('/slack', async (req, res) => {
      res.status(200).send();

      const event = req.body.event;
      debug(event);

      const { type } = event;

      if (type === 'message') {
        db.saveMessage(event);
      } else if (type === 'channel_created' || type === 'channel_rename') {
        db.updateChannels();
      }
    });

    app.post('/slack/command', async (req, res) => {
      res.status(200).send();

      const event = req.body;

      const id = db.saveSession(event);
      request.post({
        url: event.response_url,
        headers: {
          'Authorization': `Bearer ${config.data.slack.token}`
        },
        formData: {
          text: 'Your session ID: ' + id
        }
      }, function(err, res) {
        if (err) return error('command response', err);
        debug('command response', res.body);
      });
    });

    const port = config.data.http.port;
    app.listen(port, () => {
      debug('listening on port', port);
    })

    debug('init');
    return;
  }
}

module.exports = new HTTP();