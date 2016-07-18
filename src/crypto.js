module.exports = function() {
  var crypto = require('crypto');
  var algorithm = 'aes-256-ctr';
  var service = {};

  service.encrypt = function(password, text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  };

  service.decrypt = function(password, text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };

  return service;
};
