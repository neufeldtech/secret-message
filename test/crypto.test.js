var expect = require('chai').expect;
var cryptoService = require('../src/crypto.js')();

describe('crypto module', function() {
  it('should return encrypted text', function() {
    var crypted = cryptoService.encrypt('encryptionkey', 'the password is baseball123');
    expect(crypted).to.equal('062441a92a91bb8ebe7ff762426c0fbacbdc44e661ac171761fd2c');
  });

  it('should return decrypted text', function() {
    var decrypted = cryptoService.decrypt('encryptionkey', '062441a92a91bb8ebe7ff762426c0fbacbdc44e661ac171761fd2c');
    expect(decrypted).to.equal('the password is baseball123');
  });
});
