var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var callbackURL = process.env.SLACK_CALLBACK_URL || 'foobar';

var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;
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

app.use(function (req, res, next) {
  console.log(JSON.stringify(req.body));
  if (req.body.token == verificationToken){
    next();
  } else {
    console.log('Failed token verification.');
    console.log('Expected token: '+verificationToken)
    console.log('Received token: '+req.body.token);
  }
});

app.post('/secret', function (req, res) {
  console.log(req)
  res.json({
    "text": "New comic book alert!",
    "attachments": [
        {
            "title": "The Further Adventures of Slackbot",
            "fields": [
                {
                    "title": "Volume",
                    "value": "1",
                    "short": true
                },
                {
                    "title": "Issue",
                    "value": "3",
            "short": true
                }
            ],
            "author_name": "Stanford S. Strickland",
            "author_icon": "https://api.slack.com/img/api/homepage_custom_integrations-2x.png",
            "image_url": "http://i.imgur.com/OJkaVOI.jpg?1"
        },
        {
            "title": "Synopsis",
            "text": "After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy..."
        },
        {
            "fallback": "Would you recommend it to customers?",
            "title": "Would you recommend it to customers?",
            "callback_id": "comic_1234_xyz",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "recommend",
                    "text": "Recommend",
                    "type": "button",
                    "value": "recommend"
                },
                {
                    "name": "no",
                    "text": "No",
                    "type": "button",
                    "value": "bad"
                }
            ]
        }
    ]
});
});

app.listen(process.env.PORT, function () {
  console.log('Example app listening');
});
