var parser = require('./parser');

var LanguageModel = function() {
  this.error = null;
};

LanguageModel.prototype.parse = function(str) {
  try {
    this.error = null;
    return parser.parse(str);
  } catch (e) {
    this.error = e;
    return undefined;
  }
};

LanguageModel.prototype.accepts = function(str) {
  try {
    parser.parse(str);
    this.error = null;
    return true;
  } catch (e) {
    this.error = e;
    return false;
  }
};

module.exports = LanguageModel;
