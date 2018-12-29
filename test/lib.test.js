var should = require('chai').should();
var lib = require('../src/lib.js');
var nock = require('nock');
var debug = require('debug')('test');
nock.disableNetConnect();
nock.enableNetConnect(/slacksecret.herokuapp.com/);

describe("lib keepalive function", function () {
  before(function () {
    nock('https://slacksecret.herokuapp.com')
      .get('/')
      .reply(200, { message: "OK" })
      .get("/error")
      .replyWithError('it was me');
  });
  it("should make successfull http request", function (done) {
    lib.wakeUp('https://slacksecret.herokuapp.com', function (err, responseCode) {
      responseCode.should.equal(200);
      done();
    });
  });
  it("should handle errors gracefully", function (done) {
    lib.wakeUp('https://slacksecret.herokuapp.com/error', function (err, responseCode) {
      err.should.equal('Error calling self wakeup: Error: it was me');
      done();
    });
  });
});

describe("lib JSON parsing function", function () {
  it("should return JSON if parse was successfull", function () {
    lib.safelyParseJson("{\"valid\":\"JSON\"}", function (json) {
      json.should.have.ownProperty("valid");
    });
  });
  it("should return undefined if JSON parse failed", function () {
    lib.safelyParseJson("{\"invalid:\"JSON\"}", function (json) {
      should.not.exist(json);
    });
  });
});

describe("send secret button to Slack channel", function () {
  before(function () {
    nock.cleanAll();
    nock('https://hooks.slack.com')
      .post('/sendSecret')
      .reply(200, "wee")
      .post('/error')
      .replyWithError("it was me");
  });
  it("should return 200", function (done) {
    lib.sendSecret('https://hooks.slack.com/sendSecret', 'jordan.neufeld', 'a1B2c3D4', function (err, res) {
      res.should.equal(200);
      done();
    });
  });
  it("should handle errors gracefully", function (done) {
    lib.sendSecret('https://hooks.slack.com/error', 'jordan.neufeld', 'a1B2c3D4', function (err, res) {
      debug(err);
      err.should.equal('Error posting secret button to slack Error: it was me');
      done();
    });
  });
});

describe("send error message to slack channel", function () {
  before(function () {
    nock.cleanAll();
    nock('https://hooks.slack.com')
      .post('/sendSecret')
      .reply(200, "wee")
  });
  it("should return 200", function(done){
    lib.sendErrorMessage('https://hooks.slack.com/sendSecret', 'this is an error message', [], function(err, res){
      res.should.equal(200);
      done()
    })
  })
})
