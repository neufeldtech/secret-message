module.exports = function(client){
  var module = {};

    client.on('connect', function (err) {
      console.log('redis client connected')
    });

    client.on('error', function(err){
      console.log('Redis error: '+err)
    })
  module.set = function(key, value, callback){
    client.set(key, value, function(err,reply){
      if (err){
        callback("Error setting redis key: "+err)
      } else {
        callback(null, reply)
      }
    });
  }
  module.get = function(key, callback){
    client.get(key, function(err, reply){
      if (err){
        callback("Error getting redis key: "+err)
      } else {
        callback(null, reply)
      }
    });
  }
  module.del = function(key, callback){
    client.del(key, function(err, reply){
      if (err){
        callback("Error deleting redis key: "+err)
      } else {
        callback(null, reply)
      }
    })
  }
  module.flushall = function(callback){
    client.flushall(function(err, reply){
      if (err){
        callback("Error executing flushall: "+err)
      } else {
        callback(null, reply)
      }
    });
  }
  return module;
}
