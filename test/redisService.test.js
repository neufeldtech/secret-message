var should = require('chai').should();
var redis = require('redis-mock')
var redisService = require('../redisService.js')(redis.createClient())

describe("set redis key", function(){
  it("should return 'OK' if successfull", function(done){
    redisService.set('yolo','testValue',function(err,reply){
      reply.should.equal('OK');
      done();
    })
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
describe("flush all keys and databases", function(){
  it("should echo OK if successfull",function(done){
    redisService.flushall(function(err,reply){
      reply.should.equal('OK');
      done()
    });
  });
});
