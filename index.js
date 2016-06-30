var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var callbackURL = process.env.SLACK_CALLBACK_URL || 'foobar';
var bodyParser = require('body-parser');
var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;

app.use(bodyParser.urlencoded({extended: true}));
passport.use(new SlackStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        scope: 'commands',
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

app.post('/secret', function (req, res) {
  console.log(req)
  var body = req.body
  if (body.token == verificationToken){
    res.json({
      "response_type":"in_channel",
      "attachments": [
        {
          "title": body.user_name + " sent a secret message:",
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
                "text": body.text,
                "ok_text":"I have read the message!",
                "dismiss_text":"Cancel"
              }
            }
          ]
        }
      ]
    });//end res.json
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
