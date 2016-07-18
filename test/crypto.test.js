var expect = require('chai').expect;
var should = require('chai').should();
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

  it('should return null if trying to encrypt null', function() {
    var encrypted = cryptoService.encrypt('encryptionkey', null);
    should.not.exist(encrypted);
  });

  it('should return null if trying to decrypt null', function() {
    var decrypted = cryptoService.decrypt('encryptionkey', null);
    should.not.exist(decrypted);
  });
});
