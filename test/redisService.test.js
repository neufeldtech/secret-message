var should = require('chai').should();
var redis = require('redis-mock')
var redisService = require('../redisService.js')(redis.createClient())

describe("set key in redis", function(){
  it("should return 'OK' if successfull", function(done){
    redisService.set('yolo','testValue',function(err,reply){
      reply.should.equal('OK');
      done();
    })
  })
})
