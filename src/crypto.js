module.exports = function() {
  var crypto = require('crypto');
  var algorithm = 'aes-256-ctr';
  var service = {};
  
  service.ivLength = 16;

  service.getKey = function() {
    if (process.env.NODE_ENV === 'test') {
      // If we're running tests, return a static crypto key
      return '4f36cdbb5e2a191b098e943d853b5df0'
    } else {
      return process.env.CRYPTO_KEY
    }
  }

  // Check the crypto key length when lib is loaded
  if (service.getKey() === undefined || (service.getKey() && service.getKey().length != 32)) {
    console.error('Error! CRYPTO_KEY variable must be exactly 32 characters!')
    process.exit(1)
  } 
  
  service.getIV = function(length) {
    if (process.env.NODE_ENV === 'test') {
      return Buffer.from("7a7583514e7a070b8ca16051cf627122", "hex")
    } else {
      return crypto.randomBytes(length)
    }
  }
  service.encrypt = function(password, text) {
    if (password && text && typeof text === "string") {
      var cipher = crypto.createCipher(algorithm, password);
      var crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
    }
    return null;
  };

  service.encryptIV = function(text) {
    if (text && typeof text === "string") {
      let iv = this.getIV(this.ivLength)
      var cipher = crypto.createCipheriv(algorithm, new Buffer(this.getKey()), iv);
      var crypted = cipher.update(text);
      crypted = Buffer.concat([crypted, cipher.final()]);
      return iv.toString('hex') + ':' + crypted.toString('hex')
    }
    return null;
  }

  service.decryptIV = function(text) {
    if (text && typeof text === "string") {
      var textParts = text.split(':');
      let iv = new Buffer(textParts.shift(), 'hex');
      var encryptedText = new Buffer(textParts.join(':'), 'hex');
      var decipher = crypto.createDecipheriv(algorithm, new Buffer(this.getKey()), iv);
      var decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }
    return null;
  }

  service.decrypt = function(password, text) {
    if (password && text && typeof text === "string") {
      if (/^[a-f0-9]{32}\:/.test(text)) {
        // This secret was encrypted with IV, so decrypt it and return
        return this.decryptIV(text)
      }
      var decipher = crypto.createDecipher(algorithm, password);
      var decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    return null;
  };

  return service;
};
