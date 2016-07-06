var request = require('request');
module.exports = {
  wakeUp: function(url, callback){
    request(
      {
        method: 'get',
        uri: url,
      }
    , function (error, response, body) {
        if (error){
          callback('Error calling self wakeup: ' + error)
          return
        } else {
          callback(null, response.statusCode)
          return
        }
      }
    );
  },
  safelyParseJson: function(json, callback) {
    var parsed
    try {
      parsed = JSON.parse(json)
    } catch (e) {
      console.error("failure to parse json: "+e)
      callback(null)
      return
    }
    callback(parsed)
    return
  },
  sendSecret: function(responseUrl, username, text, secretId, callback){
    var message = {
      "response_type":"in_channel",
      "attachments": [
        {
          "fallback": username + " sent a secret message",
          "title": username + " sent a secret message:",
          "callback_id": secretId,
          "color": "#6D5692",
          "attachment_type": "default",
          "actions": [
            {
              "name": "readMessage",
              "text": "View message",
              "type": "button",
              "value": "readMessage",
            }
          ]
        }
      ]
    }
    request(
      {
        method: 'post',
        uri: responseUrl,
        json: true,
        body: message
      }
    , function (error, response, body) {
        if(error){
          callback("Error posting secret button to slack " + error)
          return
        } else {
          callback(null, response.statusCode)
          return
        }
      }
    );
  }
}
