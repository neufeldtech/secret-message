module.exports = function(client) {
  var cryptoService = require('./crypto.js')();
  var sha256 = require('sha256');
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
    var hashedKey = sha256(key);
    var encryptedValue = cryptoService.encryptIV(value);
    client.set(hashedKey, encryptedValue, function(err, reply) {
      if (err) {
        callback("Error setting redis key: " + err);
      } else {
        callback(null, reply);
      }
    });
  };
  service.get = function(key, callback) {
    var hashedKey = sha256(key);
    client.get(hashedKey, function(err, reply) {
      if (err) {
        callback(err);
      } else {
        if (reply) {
          var decryptedValue = cryptoService.decrypt(key, reply.toString());
          callback(null, decryptedValue);
          return;
        }
        callback(null, null);
      }
    });
  };
  service.del = function(key, callback) {
    var hashedKey = sha256(key);
    client.del(hashedKey, function(err, reply) {
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
