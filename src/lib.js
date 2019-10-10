var request = require('request');
var debug = require('debug')('app');

module.exports = {
  wakeUp: function(url, callback) {
    request(
      {
        method: 'get',
        uri: url
      }
      , function(error, response, body) {
        if (error) {
          callback('Error calling self wakeup: ' + error);
          return;
        }
        callback(null, response.statusCode);
        return;
      }
    );
  },
  safelyParseJson: function(json) {
    var parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      debug("failure to parse json: " + e);
      return null;
    }
    return parsed;
  },
  sendSecret: function(responseUrl, username, secretId, callback) {
    var message = {
      response_type: "in_channel",
      attachments: [
        {
          fallback: username + " sent a secret message",
          title: username + " sent a secret message:",
          callback_id: 'send_secret:' + secretId,
          color: "#6D5692",
          attachment_type: "default",
          actions: [
            {
              name: "readMessage",
              text: ":envelope: Read message",
              type: "button",
              value: "readMessage"
            }
          ]
        }
      ]
    };
    request(
      {
        method: 'post',
        uri: responseUrl,
        json: true,
        body: message
      }
      , function(error, response, body) {
        if (error) {
          callback("Error posting secret button to slack " + error);
          return;
        }
        callback(null, response.statusCode);
        return;
      }
    );
  },
  sendErrorMessage: function(responseUrl, text, attachments, callback) {
    var message = {
      response_type: "ephemeral",
      text: text,
      attachments: attachments
    };
    request(
      {
        method: 'post',
        uri: responseUrl,
        json: true,
        body: message
      }
      , function(error, response, body) {
        if (error) {
          callback("Error posting error message to slack " + error);
          return;
        }
        callback(null, response.statusCode);
        return;
      }
    );
  }
};
