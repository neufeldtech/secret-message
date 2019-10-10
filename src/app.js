var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var appURL = process.env.APP_URL || 'foobar';

var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;
var debug = require('debug')('app');
var bodyParser = require('body-parser');
var shortId = require('shortid');
var lib = require('./lib.js');
const client = require('prom-client');
const secretCreatedCounter = new client.Counter({
  name: 'secrets_created',
  help: 'Number of secrets created in storage'
});
const secretRetrievedCounter = new client.Counter({
  name: 'secrets_retrieved',
  help: 'Number of secrets retrieved from storage'
});
module.exports = function(app, redisService) {
  redisService.registerConnectEvent(function(cb) {
    console.log(cb);
  });
  redisService.registerErrorEvent(function(cb) {
    console.log(cb);
  });

  passport.use(new SlackStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: appURL + '/auth/slack/callback',
    scope: 'commands chat:write:bot',
    skipUserProfile: true
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, 'foobar');
  }
  ));

  setInterval(function() {
    lib.wakeUp(appURL, function(err, res) {
      if (err) {
        debug(err);
        return;
      }
      return;
    });
  }, 300000); // every 5 minutes (300000)

  app.use(bodyParser.urlencoded({extended: true}));

  app.get('/auth/slack', passport.authorize('slack'));

  app.get('/auth/slack/callback', passport.authorize('slack', {failureRedirect: 'http://secretmessage.xyz/error'}), function(req, res) {
    res.redirect('http://secretmessage.xyz/success');
  });

  // Slack token authentication middleware
  app.get('/', function(req, res) {
    res.json({message: "OK"});
  });

  app.get('/prometheus', function(req, res) {
    if (process.env.PROM_TOKEN && (req.query.token === process.env.PROM_TOKEN)) {
      return res.end(client.register.metrics());
    }
    return res.status(403).end(null);
  });

  app.post(/(\/secret\/set|\/slash)/, function(req, res) {
    var body = req.body;
    if (body.token === verificationToken) {
      if (body.ssl_check == '1') {
        return res.end(null);
      }
      res.end(null, function(_err) { // send a 200 response
        if (body.text.length < 1) {
          var attachments = [
            {
              fallback: "Error: Secret text is empty",
              title: "Error: Secret text is empty",
              text: "It looks like you tried to send a secret but forgot to provide the secret's text. You can send a secret like this: `/secret I am scared of heights`",
              callback_id: 'secret_text_empty:',
              color: "#FF0000",
              attachment_type: "default"
            }
          ];
          lib.sendErrorMessage(body.response_url, null, attachments, function(err, res) {
            if (err) {
              console.log(err);
              return;
            }
          });
          return;
        }
        var secretId = shortId.generate();
        lib.sendSecret(body.response_url, body.user_name, secretId, function(err, res) {
          if (err) {
            console.log(err);
            return;
          }
          return;
        }); // execute the action
        redisService.set(secretId, body.text, function(err, res) {
          if (err) {
            console.log(err);
            return;
          }
          secretCreatedCounter.inc();
          return;
        });
      });
    } else {
      debug('Failed token verification.');
      debug('Expected token: ' + verificationToken);
      debug('Received token: ' + req.body);
      res.status(403).end(null);
      return;
    }
  });

  app.post(/(\/secret\/get|\/interactive)/, function(req, res) {
    var payload = lib.safelyParseJson(req.body.payload);
    if (payload && payload.token === verificationToken) {
      if (/^delete_secret\:/.test(payload.callback_id)) {
        res.json({
          delete_original: true
        });
      } else {
        // Support legacy (unnamed) callback_id and new (named) callback_id
        var secretId = payload.callback_id.replace(/^send_secret\:/, '');
        redisService.get(secretId, function(err, reply) {
          var secret = "";
          if (err || !reply) {
            debug('error retrieving key from redis: ' + err);
            res.json({
              delete_original: true,
              response_type: "ephemeral",
              attachments: [
                {
                  fallback: "Error: message not found",
                  title: "Error: Message not found",
                  text: "The secret with id " + secretId + " could not be retrieved.",
                  callback_id: 'msg_not_found:',
                  color: "#FF0000",
                  attachment_type: "default"
                }
              ]

            });
          } else {
            secretRetrievedCounter.inc();
            secret = reply;
            res.json({
              delete_original: true,
              response_type: "ephemeral",
              attachments: [
                {
                  fallback: 'Secret message',
                  title: 'Secret message:',
                  text: secret,
                  footer: "The above message is only visible to you and will disappear when your Slack client reloads. To remove it immediately, click the button below:",
                  mrkdwn: false,
                  callback_id: 'delete_secret:',
                  color: "#6D5692",
                  attachment_type: "default",
                  actions: [
                    {
                      name: "removeMessage",
                      text: ":x: Delete message",
                      type: "button",
                      style: "danger",
                      value: "removeMessage"
                    }
                  ]
                }
              ]
            });
          }
        });
        redisService.del(secretId, function(err, reply) {
          if (err) {
            console.log(err);
            return;
          }
          return;
        });
      }
    } else {
      debug('Null Payload or Failed token verification.');
      debug('Expected token: ' + verificationToken);
      debug('Received payload: ' + payload);
      res.status(403).end(null);
      return;
    }
  });
};
