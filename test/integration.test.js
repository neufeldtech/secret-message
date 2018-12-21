var redis = require('redis-mock');
var redisService = require('../src/redisService.js')(redis.createClient());
var express = require('express');
var app = express();
var nock = require('nock');
var supertest;

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
    supertest.post('/slash')
      .type('form')
      .send('token=foobar&team_id=T0001&team_domain=example&channel_id=C2147483705&channel_name=test&user_id=U2147483697&user_name=Steve&command=/secret&text=secret_goes_here&response_url=https://hooks.slack.com/commands/1234/5678')
      .expect({})
      .expect(200, done);
  });

  it('should respond with http 403 on /slash if token verification failed', function(done) {
    supertest.post('/slash')
    .type('form')
    // .send('token=WRONG_TOKEN&team_id=T0001&team_domain=example&channel_id=C2147483705&channel_name=test&user_id=U2147483697&user_name=Steve&command=/secret&text=secret_goes_here&response_url=https://hooks.slack.com/commands/1234/5678')
    .send({
      'token': 'WRONG_TOKEN'
    })
    .expect({})
    .expect(403, done);
  });

  it('should respond with http 403 on /interactive if token verification failed', function(done) {
    supertest.post('/interactive')
    .type('form')
    .send('payload=%7B%0A%20%20%22actions%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22name%22%3A%20%22recommend%22%2C%0A%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%20%20%7D%0A%20%20%5D%2C%0A%20%20%22callback_id%22%3A%20%22NOTFOUND%22%2C%0A%20%20%22team%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22T47563693%22%2C%0A%20%20%20%20%22domain%22%3A%20%22watermelonsugar%22%0A%20%20%7D%2C%0A%20%20%22channel%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22C065W1189%22%2C%0A%20%20%20%20%22name%22%3A%20%22forgotten-works%22%0A%20%20%7D%2C%0A%20%20%22user%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22U045VRZFT%22%2C%0A%20%20%20%20%22name%22%3A%20%22brautigan%22%0A%20%20%7D%2C%0A%20%20%22action_ts%22%3A%20%221458170917.164398%22%2C%0A%20%20%22message_ts%22%3A%20%221458170866.000004%22%2C%0A%20%20%22attachment_id%22%3A%20%221%22%2C%0A%20%20%22token%22%3A%20%22wrong_token%22%2C%0A%20%20%22original_message%22%3A%20%22%7B%5C%22text%5C%22%3A%5C%22New%20comic%20book%20alert!%5C%22%2C%5C%22attachments%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22The%20Further%20Adventures%20of%20Slackbot%5C%22%2C%5C%22fields%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22Volume%5C%22%2C%5C%22value%5C%22%3A%5C%221%5C%22%2C%5C%22short%5C%22%3Atrue%7D%2C%7B%5C%22title%5C%22%3A%5C%22Issue%5C%22%2C%5C%22value%5C%22%3A%5C%223%5C%22%2C%5C%22short%5C%22%3Atrue%7D%5D%2C%5C%22author_name%5C%22%3A%5C%22Stanford%20S.%20Strickland%5C%22%2C%5C%22author_icon%5C%22%3A%5C%22https%3A%2F%2Fapi.slack.com%2Fimg%2Fapi%2Fhomepage_custom_integrations-2x.png%5C%22%2C%5C%22image_url%5C%22%3A%5C%22http%3A%2F%2Fi.imgur.com%2FOJkaVOI.jpg%3F1%5C%22%7D%2C%7B%5C%22title%5C%22%3A%5C%22Synopsis%5C%22%2C%5C%22text%5C%22%3A%5C%22After%20%40episod%20pushed%20exciting%20changes%20to%20a%20devious%20new%20branch%20back%20in%20Issue%201%2C%20Slackbot%20notifies%20%40don%20about%20an%20unexpected%20deploy...%5C%22%7D%2C%7B%5C%22fallback%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22title%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22callback_id%5C%22%3A%5C%22comic_1234_xyz%5C%22%2C%5C%22color%5C%22%3A%5C%22%233AA3E3%5C%22%2C%5C%22attachment_type%5C%22%3A%5C%22default%5C%22%2C%5C%22actions%5C%22%3A%5B%7B%5C%22name%5C%22%3A%5C%22recommend%5C%22%2C%5C%22text%5C%22%3A%5C%22Recommend%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22recommend%5C%22%7D%2C%7B%5C%22name%5C%22%3A%5C%22no%5C%22%2C%5C%22text%5C%22%3A%5C%22No%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22bad%5C%22%7D%5D%7D%5D%7D%22%2C%0A%20%20%22response_url%22%3A%20%22https%3A%2F%2Fhooks.slack.com%2Factions%2FT47563693%2F6204672533%2Fx7ZLaiVMoECAW50Gw1ZYAXEM%22%0A%7D')
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

  it('should respond with secret message if secret was found', function(done) {
    supertest.post('/interactive')
      .type('form')
      .send('payload=%7B%0A%20%20%22actions%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22name%22%3A%20%22recommend%22%2C%0A%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%20%20%7D%0A%20%20%5D%2C%0A%20%20%22callback_id%22%3A%20%2212345abcde%22%2C%0A%20%20%22team%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22T47563693%22%2C%0A%20%20%20%20%22domain%22%3A%20%22watermelonsugar%22%0A%20%20%7D%2C%0A%20%20%22channel%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22C065W1189%22%2C%0A%20%20%20%20%22name%22%3A%20%22forgotten-works%22%0A%20%20%7D%2C%0A%20%20%22user%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22U045VRZFT%22%2C%0A%20%20%20%20%22name%22%3A%20%22brautigan%22%0A%20%20%7D%2C%0A%20%20%22action_ts%22%3A%20%221458170917.164398%22%2C%0A%20%20%22message_ts%22%3A%20%221458170866.000004%22%2C%0A%20%20%22attachment_id%22%3A%20%221%22%2C%0A%20%20%22token%22%3A%20%22foobar%22%2C%0A%20%20%22original_message%22%3A%20%22%7B%5C%22text%5C%22%3A%5C%22New%20comic%20book%20alert!%5C%22%2C%5C%22attachments%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22The%20Further%20Adventures%20of%20Slackbot%5C%22%2C%5C%22fields%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22Volume%5C%22%2C%5C%22value%5C%22%3A%5C%221%5C%22%2C%5C%22short%5C%22%3Atrue%7D%2C%7B%5C%22title%5C%22%3A%5C%22Issue%5C%22%2C%5C%22value%5C%22%3A%5C%223%5C%22%2C%5C%22short%5C%22%3Atrue%7D%5D%2C%5C%22author_name%5C%22%3A%5C%22Stanford%20S.%20Strickland%5C%22%2C%5C%22author_icon%5C%22%3A%5C%22https%3A%2F%2Fapi.slack.com%2Fimg%2Fapi%2Fhomepage_custom_integrations-2x.png%5C%22%2C%5C%22image_url%5C%22%3A%5C%22http%3A%2F%2Fi.imgur.com%2FOJkaVOI.jpg%3F1%5C%22%7D%2C%7B%5C%22title%5C%22%3A%5C%22Synopsis%5C%22%2C%5C%22text%5C%22%3A%5C%22After%20%40episod%20pushed%20exciting%20changes%20to%20a%20devious%20new%20branch%20back%20in%20Issue%201%2C%20Slackbot%20notifies%20%40don%20about%20an%20unexpected%20deploy...%5C%22%7D%2C%7B%5C%22fallback%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22title%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22callback_id%5C%22%3A%5C%22comic_1234_xyz%5C%22%2C%5C%22color%5C%22%3A%5C%22%233AA3E3%5C%22%2C%5C%22attachment_type%5C%22%3A%5C%22default%5C%22%2C%5C%22actions%5C%22%3A%5B%7B%5C%22name%5C%22%3A%5C%22recommend%5C%22%2C%5C%22text%5C%22%3A%5C%22Recommend%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22recommend%5C%22%7D%2C%7B%5C%22name%5C%22%3A%5C%22no%5C%22%2C%5C%22text%5C%22%3A%5C%22No%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22bad%5C%22%7D%5D%7D%5D%7D%22%2C%0A%20%20%22response_url%22%3A%20%22https%3A%2F%2Fhooks.slack.com%2Factions%2FT47563693%2F6204672533%2Fx7ZLaiVMoECAW50Gw1ZYAXEM%22%0A%7D')
      .expect({delete_original: true, text: 'baseball123', response_type: 'ephemeral'})
      .expect(200, done);
  });
  it('should respond with "secret not found" if secret was not found', function(done) {
    supertest.post('/interactive')
      .type('form')
      .send('payload=%7B%0A%20%20%22actions%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22name%22%3A%20%22recommend%22%2C%0A%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%20%20%7D%0A%20%20%5D%2C%0A%20%20%22callback_id%22%3A%20%22NOTFOUND%22%2C%0A%20%20%22team%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22T47563693%22%2C%0A%20%20%20%20%22domain%22%3A%20%22watermelonsugar%22%0A%20%20%7D%2C%0A%20%20%22channel%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22C065W1189%22%2C%0A%20%20%20%20%22name%22%3A%20%22forgotten-works%22%0A%20%20%7D%2C%0A%20%20%22user%22%3A%20%7B%0A%20%20%20%20%22id%22%3A%20%22U045VRZFT%22%2C%0A%20%20%20%20%22name%22%3A%20%22brautigan%22%0A%20%20%7D%2C%0A%20%20%22action_ts%22%3A%20%221458170917.164398%22%2C%0A%20%20%22message_ts%22%3A%20%221458170866.000004%22%2C%0A%20%20%22attachment_id%22%3A%20%221%22%2C%0A%20%20%22token%22%3A%20%22foobar%22%2C%0A%20%20%22original_message%22%3A%20%22%7B%5C%22text%5C%22%3A%5C%22New%20comic%20book%20alert!%5C%22%2C%5C%22attachments%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22The%20Further%20Adventures%20of%20Slackbot%5C%22%2C%5C%22fields%5C%22%3A%5B%7B%5C%22title%5C%22%3A%5C%22Volume%5C%22%2C%5C%22value%5C%22%3A%5C%221%5C%22%2C%5C%22short%5C%22%3Atrue%7D%2C%7B%5C%22title%5C%22%3A%5C%22Issue%5C%22%2C%5C%22value%5C%22%3A%5C%223%5C%22%2C%5C%22short%5C%22%3Atrue%7D%5D%2C%5C%22author_name%5C%22%3A%5C%22Stanford%20S.%20Strickland%5C%22%2C%5C%22author_icon%5C%22%3A%5C%22https%3A%2F%2Fapi.slack.com%2Fimg%2Fapi%2Fhomepage_custom_integrations-2x.png%5C%22%2C%5C%22image_url%5C%22%3A%5C%22http%3A%2F%2Fi.imgur.com%2FOJkaVOI.jpg%3F1%5C%22%7D%2C%7B%5C%22title%5C%22%3A%5C%22Synopsis%5C%22%2C%5C%22text%5C%22%3A%5C%22After%20%40episod%20pushed%20exciting%20changes%20to%20a%20devious%20new%20branch%20back%20in%20Issue%201%2C%20Slackbot%20notifies%20%40don%20about%20an%20unexpected%20deploy...%5C%22%7D%2C%7B%5C%22fallback%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22title%5C%22%3A%5C%22Would%20you%20recommend%20it%20to%20customers%3F%5C%22%2C%5C%22callback_id%5C%22%3A%5C%22comic_1234_xyz%5C%22%2C%5C%22color%5C%22%3A%5C%22%233AA3E3%5C%22%2C%5C%22attachment_type%5C%22%3A%5C%22default%5C%22%2C%5C%22actions%5C%22%3A%5B%7B%5C%22name%5C%22%3A%5C%22recommend%5C%22%2C%5C%22text%5C%22%3A%5C%22Recommend%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22recommend%5C%22%7D%2C%7B%5C%22name%5C%22%3A%5C%22no%5C%22%2C%5C%22text%5C%22%3A%5C%22No%5C%22%2C%5C%22type%5C%22%3A%5C%22button%5C%22%2C%5C%22value%5C%22%3A%5C%22bad%5C%22%7D%5D%7D%5D%7D%22%2C%0A%20%20%22response_url%22%3A%20%22https%3A%2F%2Fhooks.slack.com%2Factions%2FT47563693%2F6204672533%2Fx7ZLaiVMoECAW50Gw1ZYAXEM%22%0A%7D')
      .expect({delete_original: true, text: 'ERROR: Secret not found', response_type: 'ephemeral'})
      .expect(200, done);
  });
});
