var LanguageModel = require('../');
var assert = require('assert');

var languageModel = new LanguageModel();
function accepts(str) {
  assert.ok(languageModel.accepts(str));
}

function rejects(str) {
  assert.ok(!languageModel.accepts(str));
}

describe('LanguageModel', function() {
  it('should be requireable', function() {
    assert.ok(LanguageModel);
  });

  describe('General Acceptance', function() {
    it('should accept a simple query', function() {
      accepts('{"foo": "bar"}');
    });
    it('should accept an empty query', function() {
      accepts('{}');
    });
  });

  describe('Simple Leaf Values', function() {
    it('should accept a number value', function() {
      accepts('{"foo": 1}');
    });
    it('should accept a decimal number value', function() {
      accepts('{"foo": 1.23}');
    });
    it('should accept a negative number value', function() {
      accepts('{"foo": -8}');
    });
    it('should accept a string value', function() {
      accepts('{"foo": "bar"}');
    });
    it('should accept a null value', function() {
      accepts('{"foo": null}');
    });
    it('should accept a boolean value', function() {
      accepts('{"foo": false}');
    });
  });

  describe('Rejections', function() {
    it('should reject an invalid string', function() {
      rejects('{"foo": bar}');
    });
    it('should reject an empty string', function() {
      rejects('');
    });
    it('should reject an empty string', function() {
      rejects('');
    });
  });
});
