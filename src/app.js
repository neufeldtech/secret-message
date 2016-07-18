var verificationToken = process.env.SLACK_VERIFICATION_TOKEN || 'foobar';
var clientID = process.env.SLACK_CLIENT_ID || 'foobar';
var clientSecret = process.env.SLACK_CLIENT_SECRET || 'foobar';
var callbackURL = process.env.SLACK_CALLBACK_URL || 'foobar';
var appURL = process.env.APP_URL || 'foobar';

var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;
var debug = require('debug')('app');
var bodyParser = require('body-parser');
var shortId = require('shortid');
var lib = require('./lib.js');
var cryptoService = require('./crypto.js')();
var sha256 = require('sha256');

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
    callbackURL: callbackURL,
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

  app.post('/secret/set', function(req, res) {
    var body = req.body;
    if (body.token === verificationToken) {
      res.end(null, function(err) { // send a 200 response
        var secretId = shortId.generate();
        lib.sendSecret(body.response_url, body.user_name, body.text, secretId, function(err, res) {
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
          return;
        });
      });
    } else {
      debug('Failed token verification.');
      debug('Expected token: ' + verificationToken);
      debug('Received token: ' + req.body.token);
      res.status(403).end(null);
      return;
    }
  });

  app.post('/secret/get', function(req, res) {
    var payload = lib.safelyParseJson(req.body.payload);
    if (payload && payload.token === verificationToken) {
      // debug(payload);
      var secretId = payload.callback_id;
      redisService.get(secretId, function(err, reply) {
        var secret = "";
        if (err || !reply) {
          debug('error retrieving key from redis: ' + err);
          res.json({
            delete_original: true,
            text: "ERROR: Secret not found",
            response_type: "ephemeral"
          });
        } else {
          secret = reply.toString();
          res.json({
            delete_original: true,
            text: secret,
            response_type: "ephemeral"
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
    } else {
      debug('Null Payload or Failed token verification.');
      debug('Expected token: ' + verificationToken);
      debug('Received token: ' + payload.token);
      res.status(403).end(null);
      return;
    }
  });
};
