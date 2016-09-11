# mongodb-language-model

[![build status](https://secure.travis-ci.org/mongodb-js/mongodb-language-model.png)](http://travis-ci.org/mongodb-js/mongodb-language-model)

Parses a MongoDB query and creates an abstract syntax tree (AST) with part of speech
tagging.

## UML diagram

This is the hierarchical model that is created when a query is parsed:

![](./docs/query_language_uml.png)

## Example

```javascript
var LanguageModel = require('mongodb-language-model');
var assert = require('assert');

var language = new LanguageModel();

assert.ok(language.accepts({"foo": 1}));
assert.ok(language.accepts({"age": {"$gt": 35}}));
assert.ok(language.accepts({"$or": [{"email": {"$exists": true}},
                                    {"phone": {"$exists": true}}]}));

assert.equal(language.accepts({"$invalid": "key"}), false);

```

## Installation

```
// @todo
npm install --save mongodb-language-model
```

## Testing

```
npm test
```

## License

Apache 2.0
