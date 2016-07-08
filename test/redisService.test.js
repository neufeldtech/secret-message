var should = require('chai').should(),
    assert = require('chai').assert,
    expect = require('chai').expect,
    sinon = require('sinon'),
    redis = require('redis-mock'),
    client = redis.createClient(),
    redisService = require('../src/redisService.js')(client);

describe("set redis key", function(){
  it("should return 'OK' if successfull", function(done){
    redisService.set('yolo','testValue',function(err,reply){
      reply.should.equal('OK');
      done();
    })
  });
})

describe("on redis set error", function(){
  before(function(){
    sinon.stub(client,'set').yields('this is an error');
  });
  it("should call callback with error msg",function() {
    var callback = sinon.spy()
    redisService.set('cb','cb',callback)
    expect(callback.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.set.restore()
  })
})

describe("get redis key", function(){
  before(function(done){
    redisService.flushall(function(err,reply){
      if (err){
        return
      } else {
        redisService.set('testKey','The value is banana', function(err,reply){})
        done()
      }
    });
  });
  it("should return correct value if found", function(done){
    redisService.get('testKey',function(err,reply){
      reply.should.equal('The value is banana')
      done()
    })
  })
  it("should return null if key not found", function(done){
    redisService.get('foobarKey',function(err,reply){
      should.not.exist(reply);
      done();
    })
  });
})

describe("on redis get error", function(){
  before(function(){
    sinon.stub(client,'get').yields('this is an error');
  });
  it("should call callback with error msg",function() {
    var callback = sinon.spy()
    redisService.get('key',callback)
    expect(callback.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.get.restore()
  })
})

describe("delete redis key", function(){
  before(function(done){
    redisService.flushall(function(err,reply){
      if (err){
        return
      } else {
        redisService.set('deleteMe','The value is apple', function(err,reply){})
        done()
      }
    });
  });
  it("should return 1 if one key was deleted", function(done){
    redisService.del('deleteMe', function(err,reply){
      reply.should.equal(1)
      done()
    })
  })
  it("should return 0 if no key was deleted", function(done){
    redisService.del('unknown_key', function(err,reply){
      reply.should.equal(0)
      done()
    })
  })
})

describe("on redis delete key error", function(){
  before(function(){
    sinon.stub(client,'del').yields('this is an error');
  });
  it("should call callback with error msg",function() {
    var callback = sinon.spy()
    redisService.del('key',callback)
    expect(callback.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.del.restore()
  })
})

describe("flush all keys and databases", function(){
  it("should echo OK if successfull",function(done){
    redisService.flushall(function(err,reply){
      reply.should.equal('OK');
      done()
    });
  });
});

describe("on redis flushall error", function(){
  before(function(){
    sinon.stub(client,'flushall').yields('this is an error');
  });
  it("should call callback with error msg",function() {
    var callback = sinon.spy()
    redisService.flushall(callback)
    expect(callback.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.flushall.restore()
  })
})

describe("connect event handler", function(){
  before(function(){
    sinon.stub(client,'on').yields('Connected to redis');
  });
  it("should call callback with connect success message",function(){
    var callback = sinon.spy();
    redisService.registerConnectEvent(callback)
    expect(client.on.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.on.restore()
  })
})

describe("error event handler", function(){
  before(function(){
    sinon.stub(client,'on').yields('this is an error');
  });
  it("should call callback with error message",function(){
    var callback = sinon.spy();
    redisService.registerErrorEvent(callback)
    expect(client.on.callCount).to.be.equal(1)
    expect(callback.args[0]).to.exist
  })
  after(function(){
    client.on.restore()
  })
})
