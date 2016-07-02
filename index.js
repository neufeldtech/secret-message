var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var callbackURL = process.env.SLACK_CALLBACK_URL || 'foobar';
var redisURL = process.env.REDIS_URL || 'foobar';
var appURL = process.env.APP_URL || 'foobar';
var bodyParser = require('body-parser');
var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;
var redis = require('redis');
var client = redis.createClient(redisURL);
require('./lib.js')();

setInterval(function() {
  wakeUp(appURL);
}, 300000); // every 5 minutes (300000)

client.on('connect', function (err) {
  console.log('Redis client connected')
});

client.on('error', function(err){
  console.log('Redis encountered an error: '+err)
  console.log('we will now exit')
  process.exit(1);
})

app.use(bodyParser.urlencoded({extended: true}));

passport.use(new SlackStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
    scope: 'commands chat:write:bot',
    skipUserProfile: true
    },
  function(accessToken, refreshToken, profile, done) {
    done(null,'foobar')
  }
));

app.get('/auth/slack', passport.authorize('slack'));

app.get('/auth/slack/callback', passport.authorize('slack', {successRedirect: 'https://my.slack.com', failureRedirect: '/login'}), function(req, res) {
    res.redirect('https://my.slack.com');
  });

//Slack token authentication middleware
app.get('/',function (req, res){
  res.json({"message":"OK"})
})

app.post('/secret/set', function (req, res) {
  var body = req.body
  if (body.token == verificationToken){
    res.end(null,function(err){ //send a 200 response
      sendSecret(body.response_url, body.user_name, body.text); //execute the action
      var redisKey = body.team_id + body.channel_id + body.user_id;
      client.set(redisKey, body.text)
    });
  } else {
    console.log('Failed token verification.');
    console.log('Expected token: '+verificationToken)
    console.log('Received token: '+req.body.token);
    return
  }
});

app.post('/secret/get', function (req, res) {
  var payload = safelyParseJson(req.body.payload);
  console.log(payload);
  if (payload && payload.token == verificationToken){
    var redisKey = payload.team.id + payload.channel.id + payload.user.id;
    client.get(redisKey, function(err,reply){
      var secret = ""
      if (err){
        console.log('error retrieving key from redis: '+err)
        return
      } else{
        secret = reply.toString();
        res.json({
          "text": "This is the secret: "+secret,
          "response_type": "ephemeral"
        })
        //updateMessage(payload, secret); //execute action
      }
    });
    client.del(redisKey);
  } else {
    console.log('Null Payload or Failed token verification.');
    console.log('Expected token: '+verificationToken)
    console.log('Received token: '+req.body.token);
    return
  }
});
app.listen(process.env.PORT, function () {
  console.log('Example app listening');
  // console.log(safelyParseJson('{"payload":"{\"actions\":[{\"name\":\"readMessage\",\"value\":\"readMessage\"}],\"callback_id\":\"readMessage\",\"team\":{\"id\":\"T0BCJDZ8Q\",\"domain\":\"neufeldtech\"},\"channel\":{\"id\":\"C0BCEGD6X\",\"name\":\"general\"},\"user\":{\"id\":\"U0BCH4N2K\",\"name\":\"jordan.neufeld\"},\"action_ts\":\"1467468185.125008\",\"message_ts\":\"1467468175.000005\",\"attachment_id\":\"1\",\"token\":\"XiLexN3vvMIE5dXD8NlEM0Kn\",\"original_message\":{\"text\":\"\",\"bot_id\":\"B1NBWFTS6\",\"attachments\":[{\"callback_id\":\"readMessage\",\"fallback\":\"Please visit <http:\\/\\/secretmessage.neufeldtech.com>\",\"title\":\"jordan.neufeld sent a secret message:\",\"id\":1,\"color\":\"3AA3E3\",\"actions\":[{\"id\":\"1\",\"name\":\"readMessage\",\"text\":\"View message\",\"type\":\"button\",\"value\":\"readMessage\",\"style\":\"\",\"confirm\":{\"text\":\"yolo\",\"title\":\"This message will self destruct after reading!\",\"ok_text\":\"I have read the message!\",\"dismiss_text\":\"Cancel\"}}]}],\"type\":\"message\",\"subtype\":\"bot_message\",\"ts\":\"1467468175.000005\"},\"response_url\":\"https:\\/\\/hooks.slack.com\\/actions\\/T0BCJDZ8Q\\/56340699763\\/ZVVDA9AlAZbcekc8dWtH1JpE\"}"}'))
});
