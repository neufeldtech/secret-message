module.exports = function(client) {
  var service = {};

  service.registerErrorEvent = function(callback) {
    client.on('error', function(err) {
      callback(err);
    });
  };

  service.registerConnectEvent = function(callback) {
    client.on('connect', function() {
      callback("redis client connected");
    });
  };

  service.set = function(key, value, callback) {
    client.set(key, value, function(err, reply) {
      if (err) {
        callback("Error setting redis key: " + err);
      } else {
        callback(null, reply);
      }
    });
  };
  service.get = function(key, callback) {
    client.get(key, function(err, reply) {
      if (err) {
        callback(err);
      } else {
        callback(null, reply);
      }
    });
  };
  service.del = function(key, callback) {
    client.del(key, function(err, reply) {
      if (err) {
        callback("Error deleting redis key: " + err);
      } else {
        callback(null, reply);
      }
    });
  };
  service.flushall = function(callback) {
    client.flushall(function(err, reply) {
      if (err) {
        callback("Error executing flushall: " + err);
      } else {
        callback(null, reply);
      }
    });
  };
  return service;
};
