var redis = require('redis-mock');
var redisService = require('../src/redisService.js')(redis.createClient());
var express = require('express');
var app = express();
var nock = require('nock');
var supertest;
var querystring = require('querystring');

// require('../src/app')(app, redisService);
// var supertest = require('supertest')(app);

describe('Routes', function() {
  beforeEach(function() {
    require('../src/app')(app, redisService);
    supertest = require('supertest')(app);
    nock.enableNetConnect();
    nock.cleanAll();
  });
  it('responds with json on /', function(done) {
    supertest.get('/')
    .expect(200)
    .expect({
      message: 'OK'
    }, done);
  });

  it('redirects to oauth flow on /auth/slack', function(done) {
    supertest.get('/auth/slack')
      .expect(302, done);
  });

  it('redirects to oauth flow on /auth/slack/callback', function(done) {
    supertest.get('/auth/slack/callback')
      .expect(302, done);
  });

  it('should respond with http 200 and empty json on POST /slash', function(done) {
    var body = {
      token: 'foobar',
      team_id: 'T0001',
      team_domain: 'example',
      channel_id: 'C2147483705',
      channel_name: 'test',
      user_id: 'U2147483697',
      user_name: 'Steve',
      command: '/secret',
      text: 'secret_goes_here',
      response_url: 'https://hooks.slack.com/commands/1234/5678'
    }
    supertest.post('/slash')
      .type('form')
      .send(querystring.stringify(body))
      .expect({})
      .expect(200, done);
  });

  it('should respond with http 403 on /slash if token verification failed', function(done) {
    var body = {
      token: 'WRONG_TOKEN'
    }
    supertest.post('/slash')
    .type('form')
    .send(querystring.stringify(body))
    .expect({})
    .expect(403, done);
  });

  it('should respond with http 403 on /interactive if token verification failed', function(done) {
    var body = { payload: '{"type":"interactive_message","actions":[{"name":"readMessage","type":"button","value":"readMessage"}],"callback_id":"send_secret:SyLvsPEWN","team":{"id":"T0BCJDZ8Q","domain":"neufeldtech"},"channel":{"id":"C0BCEGD6X","name":"general"},"user":{"id":"U0BCH4N2K","name":"jordan.neufeld"},"action_ts":"1546054509.087249","message_ts":"1546054493.016100","attachment_id":"1","token":"WRONG_TOKEN","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"","ts":"1546054493.016100","bot_id":"B1X6K0MPY","attachments":[{"callback_id":"send_secret:SyLvsPEWN","fallback":"jordan.neufeld sent a secret message","title":"jordan.neufeld sent a secret message:","id":1,"color":"6D5692","actions":[{"id":"1","name":"readMessage","text":":envelope: Read message","type":"button","value":"readMessage","style":""}]}]},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T0BCJDZ8Q\\/513307572131\\/PhmVvFrJ9QxqucGvvt0lSwe6","trigger_id":"512676218880.11426475296.d3abdbf2859e819410b428dc5a48dbb0"}' }
    supertest.post('/interactive')
    .type('form')
    .send(querystring.stringify(body))
    .expect({})
    .expect(403, done);
  });
});

describe('Route /interactive', function() {
  beforeEach(function() {
    require('../src/app')(app, redisService);
    supertest = require('supertest')(app);
    nock.enableNetConnect();
    nock.cleanAll();
    
    redisService.flushall(function(err, reply) {
      if (err) {
        return;
      }
      redisService.set('12345abcde', 'baseball123', function(err, reply) {
        if (err) {
          return;
        }
      });
    });
  });
  
  context('backwards compatibility', function() {
    it('should respond with secret message if secret was found', function(done) {
      var body = { payload: '{"type":"interactive_message","actions":[{"name":"readMessage","type":"button","value":"readMessage"}],"callback_id":"12345abcde","team":{"id":"T0BCJDZ8Q","domain":"neufeldtech"},"channel":{"id":"C0BCEGD6X","name":"general"},"user":{"id":"U0BCH4N2K","name":"jordan.neufeld"},"action_ts":"1546054509.087249","message_ts":"1546054493.016100","attachment_id":"1","token":"foobar","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"","ts":"1546054493.016100","bot_id":"B1X6K0MPY","attachments":[{"callback_id":"send_secret:SyLvsPEWN","fallback":"jordan.neufeld sent a secret message","title":"jordan.neufeld sent a secret message:","id":1,"color":"6D5692","actions":[{"id":"1","name":"readMessage","text":":envelope: Read message","type":"button","value":"readMessage","style":""}]}]},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T0BCJDZ8Q\\/513307572131\\/PhmVvFrJ9QxqucGvvt0lSwe6","trigger_id":"512676218880.11426475296.d3abdbf2859e819410b428dc5a48dbb0"}' }
      supertest.post('/interactive')
        .type('form')
        .send(querystring.stringify(body))
        .expect({
          delete_original: true,
          "response_type": 'ephemeral',
          "attachments": [
            {
              "fallback": 'Secret from jordan.neufeld:',
              "title": 'Secret from jordan.neufeld:',
              "text": 'baseball123',
              "footer": 'The above message is only visible to you and will disappear when your Slack client reloads. To remove it immediately, click the button below:',
              "mrkdwn": false,
              "callback_id": 'delete_secret:',
              "color": '#6D5692',
              "attachment_type": 'default',
              "actions": [
                {
                  "name": "removeMessage",
                  "style": "danger",
                  "text": ":x: Delete message",
                  "type": "button",
                  "value": "removeMessage",
                }
              ]
            }
          ]
        })
        .expect(200, done);
    });
  })
  context('standard API', function() {
    it('should respond with secret message if secret was found', function(done) {
      var body = { payload: '{"type":"interactive_message","actions":[{"name":"readMessage","type":"button","value":"readMessage"}],"callback_id":"send_secret:12345abcde","team":{"id":"T0BCJDZ8Q","domain":"neufeldtech"},"channel":{"id":"C0BCEGD6X","name":"general"},"user":{"id":"U0BCH4N2K","name":"jordan.neufeld"},"action_ts":"1546054509.087249","message_ts":"1546054493.016100","attachment_id":"1","token":"foobar","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"","ts":"1546054493.016100","bot_id":"B1X6K0MPY","attachments":[{"callback_id":"send_secret:SyLvsPEWN","fallback":"jordan.neufeld sent a secret message","title":"jordan.neufeld sent a secret message:","id":1,"color":"6D5692","actions":[{"id":"1","name":"readMessage","text":":envelope: Read message","type":"button","value":"readMessage","style":""}]}]},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T0BCJDZ8Q\\/513307572131\\/PhmVvFrJ9QxqucGvvt0lSwe6","trigger_id":"512676218880.11426475296.d3abdbf2859e819410b428dc5a48dbb0"}' }
      supertest.post('/interactive')
        .type('form')
        .send(querystring.stringify(body))
        .expect({
          delete_original: true,
          "response_type": 'ephemeral',
          "attachments": [
            {
              "fallback": 'Secret from jordan.neufeld:',
              "title": 'Secret from jordan.neufeld:',
              "text": 'baseball123',
              "footer": 'The above message is only visible to you and will disappear when your Slack client reloads. To remove it immediately, click the button below:',
              "mrkdwn": false,
              "callback_id": 'delete_secret:',
              "color": '#6D5692',
              "attachment_type": 'default',
              "actions": [
                {
                  "name": "removeMessage",
                  "style": "danger",
                  "text": ":x: Delete message",
                  "type": "button",
                  "value": "removeMessage",
                }
              ]
            }
          ]
        })
        .expect(200, done);
    });
    it('should respond with "secret not found" if secret was not found', function(done) {
      var body = { payload: '{"type":"interactive_message","actions":[{"name":"readMessage","type":"button","value":"readMessage"}],"callback_id":"send_secret:bad_id","team":{"id":"T0BCJDZ8Q","domain":"neufeldtech"},"channel":{"id":"C0BCEGD6X","name":"general"},"user":{"id":"U0BCH4N2K","name":"jordan.neufeld"},"action_ts":"1546054509.087249","message_ts":"1546054493.016100","attachment_id":"1","token":"foobar","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"","ts":"1546054493.016100","bot_id":"B1X6K0MPY","attachments":[{"callback_id":"send_secret:SyLvsPEWN","fallback":"jordan.neufeld sent a secret message","title":"jordan.neufeld sent a secret message:","id":1,"color":"6D5692","actions":[{"id":"1","name":"readMessage","text":":envelope: Read message","type":"button","value":"readMessage","style":""}]}]},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T0BCJDZ8Q\\/513307572131\\/PhmVvFrJ9QxqucGvvt0lSwe6","trigger_id":"512676218880.11426475296.d3abdbf2859e819410b428dc5a48dbb0"}' }
      supertest.post('/interactive')
      .type('form')
      .send(querystring.stringify(body))
        .expect({
          "delete_original": true,
          "response_type": 'ephemeral',
          "attachments": [
            {
              "fallback": "Error: message not found",
              "title": "Error: Message not found",
              "text": "The secret with id bad_id could not be retrieved.",
              "attachment_type": "default",
              "callback_id": "msg_not_found:",
              "color": "#FF0000",
            }
          ]
        })
        .expect(200, done);
    });

  })
});
