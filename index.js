var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var callbackURL = process.env.SLACK_CALLBACK_URL || 'foobar';
var request = require('request');
var bodyParser = require('body-parser');
var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;

app.use(bodyParser.urlencoded({extended: true}));
passport.use(new SlackStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        scope: 'commands chat:write:bot',
        skipUserProfile: true
    }, ()=>{}));

app.get('/auth/slack', passport.authenticate('slack'));

app.get('/auth/slack/callback', function(req, res) {
    res.redirect('https://my.slack.com');
  });

//Slack token authentication middleware
app.get('/',function (req, res){
  res.json({"message":"OK"})
})
function sendSecret(responseUrl, username, text){
  var message = {
    "response_type":"in_channel",
    "attachments": [
      {
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

app.post('/secret', function (req, res) {
  console.log(req)
  var body = req.body
  if (body.token == verificationToken){
    res.end(null,function(err){
      sendSecret(body.response_url, body.user_name, body.text);
    });
  } else {
    console.log('Failed token verification.');
    console.log('Expected token: '+verificationToken)
    console.log('Received token: '+req.body.token);
    return
  }
});

app.post('/update', function (req, res) {
  console.log(JSON.stringify(req.body));

});
app.listen(process.env.PORT, function () {
  console.log('Example app listening');
});
