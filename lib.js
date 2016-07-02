var request = require('request');
module.exports = function(){
  this.wakeUp = function(url){
    request(
      {
        method: 'get',
        uri: url + '/',
      }
    , function (error, response, body) {
      }
    );
  }
  this.safelyParseJson = function(json) {
    var parsed
    try {
      parsed = JSON.parse(json)
    } catch (e) {
      console.error("failure to parse json: "+e)
    }
    return parsed // Could be undefined!
  }
  this.sendSecret = function(responseUrl, username, text){
    var message = {
      "response_type":"in_channel",
      "attachments": [
        {
          "fallback": "Please visit http://secretmessage.neufeldtech.com",
          "title": username + " sent a secret message:",
          "callback_id": "readMessage",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "readMessage",
              "text": "View message",
              "type": "button",
              "value": "readMessage",
              "confirm": {
                "title": "This message will self destruct after reading!",
                "text": text,
                "ok_text":"I have read the message!",
                "dismiss_text":"Cancel"
              }
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
        if(!error && response.statusCode == 200){
          return
        } else {
          console.log(error)
          console.log('error: '+ response.statusCode)
          console.log(body)
        }
      }
    );
  }
  this.updateMessage = function(payload){
    var message = {
      "text":"this is the secret"
    }
    request(
      {
        method: 'post',
        uri: payload.response_url,
        json: true,
        body: message
      }, function(error, response, body){
        if(!error && response.statusCode == 200){
          return
        } else {
          console.log(error)
          console.log('error: '+ response.statusCode)
          console.log(body)
        }
      }
    );
  }
}
