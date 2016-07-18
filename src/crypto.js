module.exports = function() {
  var crypto = require('crypto');
  var algorithm = 'aes-256-ctr';
  var service = {};

  service.encrypt = function(password, text) {
    if (password && text && typeof text === "string") {
      var cipher = crypto.createCipher(algorithm, password);
      var crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
    }
    return null;
  };

  service.decrypt = function(password, text) {
    if (password && text && typeof text === "string") {
      var decipher = crypto.createDecipher(algorithm, password);
      var decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    return null;
  };

  return service;
};
