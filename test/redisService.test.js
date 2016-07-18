var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var redis = require('redis-mock');
var client = redis.createClient();
var redisService = require('../src/redisService.js')(client);

describe("set redis key", function() {
  it("should return 'OK' if successfull", function(done) {
    redisService.set('yolo', 'testValue', function(err, reply) {
      reply.should.equal('OK');
      done();
    });
  });
});

describe("on redis set error", function() {
  beforeEach(function() {
    sinon.stub(client, 'set').yields('this is an error');
  });
  afterEach(function() {
    client.set.restore();
  });
  it("should call callback with error msg", function() {
    var callback = sinon.spy();
    redisService.set('cb', 'cb', callback);
    expect(callback.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('Error setting redis key: this is an error');
  });
});

describe("get redis key", function() {
  beforeEach(function(done) {
    redisService.flushall(function(err, reply) {
      if (err) {
        return;
      }
      redisService.set('testKey', 'The value is banana', function(err, reply) {});
      done();
    });
  });
  it("should return correct value if found", function(done) {
    redisService.get('testKey', function(err, reply) {
      reply.should.equal('The value is banana');
      done();
    });
  });
  it("should return null if key not found", function(done) {
    redisService.get('foobarKey', function(err, reply) {
      should.not.exist(reply);
      done();
    });
  });
});

describe("on redis get error", function() {
  beforeEach(function() {
    sinon.stub(client, 'get').yields('this is an error');
  });
  afterEach(function() {
    client.get.restore();
  });
  it("should call callback with error msg", function() {
    var callback = sinon.spy();
    redisService.get('key', callback);
    expect(callback.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('this is an error');
  });
});

describe("delete redis key", function() {
  before(function(done) {
    redisService.flushall(function(err, reply) {
      if (err) {
        return;
      }
      redisService.set('deleteMe', 'The value is apple', function(err, reply) {});
      done();
    });
  });
  it("should return 1 if one key was deleted", function(done) {
    redisService.del('deleteMe', function(err, reply) {
      reply.should.equal(1);
      done();
    });
  });
  it("should return 0 if no key was deleted", function(done) {
    redisService.del('unknown_key', function(err, reply) {
      reply.should.equal(0);
      done();
    });
  });
});

describe("on redis delete key error", function() {
  beforeEach(function() {
    sinon.stub(client, 'del').yields('this is an error');
  });
  afterEach(function() {
    client.del.restore();
  });
  it("should call callback with error msg", function() {
    var callback = sinon.spy();
    redisService.del('key', callback);
    expect(callback.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('Error deleting redis key: this is an error');
  });
});

describe("flush all keys and databases", function() {
  it("should echo OK if successfull", function(done) {
    redisService.flushall(function(err, reply) {
      reply.should.equal('OK');
      done();
    });
  });
});

describe("on redis flushall error", function() {
  beforeEach(function() {
    sinon.stub(client, 'flushall').yields('this is an error');
  });
  afterEach(function() {
    client.flushall.restore();
  });
  it("should call callback with error msg", function() {
    var callback = sinon.spy();
    redisService.flushall(callback);
    expect(callback.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('Error executing flushall: this is an error');
  });
});

describe("connect event handler", function() {
  beforeEach(function() {
    sinon.stub(client, 'on').yields('Connected to redis');
  });
  afterEach(function() {
    client.on.restore();
  });
  it("should call callback with connect success message", function() {
    var callback = sinon.spy();
    redisService.registerConnectEvent(callback);
    expect(client.on.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('redis client connected');
  });
});

describe("error event handler", function() {
  beforeEach(function() {
    sinon.stub(client, 'on').yields('this is an error');
  });
  afterEach(function() {
    client.on.restore();
  });
  it("should call callback with error message", function() {
    var callback = sinon.spy();
    redisService.registerErrorEvent(callback);
    expect(client.on.callCount).to.be.equal(1);
    expect(callback.args[0][0]).to.equal('this is an error');
  });
});
