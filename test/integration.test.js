var should = require('chai').should();
var redis = require('redis-mock')
var redisService = require('../src/redisService.js')(redis.createClient())
var express = require('express');
var app = express();
var nock = require('nock');
require('../src/app')(app, redisService);
var supertest = require('supertest')(app)

describe('Routes', function() {
  beforeEach(function(){
    nock.enableNetConnect();
    nock.cleanAll();
  });
  it('responds with json on /', function(done) {
    supertest.get('/')
    .expect(200)
    .expect({
      message: 'OK'
    }, done)
  });
});
