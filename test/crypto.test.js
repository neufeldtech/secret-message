var expect = require('chai').expect;
var should = require('chai').should();
var cryptoService = require('../src/crypto.js')();

describe('crypto module', function() {
  it('should return encrypted text when calling .encrypt()', function() {
    var crypted = cryptoService.encrypt('encryptionkey', 'the password is baseball123');
    expect(crypted).to.equal('062441a92a91bb8ebe7ff762426c0fbacbdc44e661ac171761fd2c');
  });
  
  it('should return decrypted text when calling .decrypt() when string was encrypted with .encrypt()', function() {
    var decrypted = cryptoService.decrypt('encryptionkey', '062441a92a91bb8ebe7ff762426c0fbacbdc44e661ac171761fd2c');
    expect(decrypted).to.equal('the password is baseball123');
  });
  
  it('should return decrypted text when calling .decrypt() when string was encrypted with .encryptIV()', function() {
    var decrypted = cryptoService.decrypt('encryptionkey', '7a7583514e7a070b8ca16051cf627122:692f0ec1a64e77a3511ca3c6bf0c5cf325c2efa7960ce55c63725e');
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
  
  it('should return decrypted text when calling .decryptIV()', function() {
    var decrypted = cryptoService.decryptIV('7a7583514e7a070b8ca16051cf627122:692f0ec1a64e77a3511ca3c6bf0c5cf325c2efa7960ce55c63725e');
    expect(decrypted).to.equal('the password is baseball123');
  });
  
  it('should return encrypted text when calling .encryptIV()', function() {
    var crypted = cryptoService.encryptIV('the password is baseball123');
    expect(crypted).to.equal('7a7583514e7a070b8ca16051cf627122:692f0ec1a64e77a3511ca3c6bf0c5cf325c2efa7960ce55c63725e');
  });

  it('should return unchanged text after encrypting then decrypting with IV', function() {
    var secretString = 'the password is total domination'
    var crypted = cryptoService.encryptIV(secretString)
    expect(crypted).to.not.equal(secretString)
    var decrypted = cryptoService.decryptIV(crypted)
    expect(decrypted).to.equal(secretString)
  })
});
