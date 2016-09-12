var language = require('../');
var assert = require('assert');

function accepts(str) {
  assert.ok(language.accepts(str));
}

function rejects(str) {
  assert.ok(!language.accepts(str));
}

describe('accepts', function() {
  it('should be requireable', function() {
    assert.ok(language);
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

  describe('Extended JSON Leaf Values', function() {
    it('should accept a regular expression', function() {
      accepts('{"foo": {"$regex": "^bar"}}');
      accepts('{"foo": {"$regex": "^bar", "$options": "gi"}}');
    });

    it('should reject a regular expression with invalid options', function() {
      rejects('{"foo": {"$regex": "^bar", "$options": "uvw"}}');
    });
  });

  describe('Value Operators', function() {
    it('should accept $gt / $gte operator', function() {
      accepts('{"foo": {"$gt": 20}}');
      accepts('{"foo": {"$gt": 20}}');
    });

    it('should accept $lt / $lte operator', function() {
      accepts('{"foo": {"$lt": 20}}');
      accepts('{"foo": {"$lte": 20}}');
    });

    it('should accept $eq / $ne operator', function() {
      accepts('{"foo": {"$eq": 20}}');
      accepts('{"foo": {"$ne": 20}}');
    });

    it('should accept $exists operator', function() {
      accepts('{"foo": {"$exists": true}}');
      accepts('{"foo": {"$exists": false}}');
    });

    it('should accept $type operator', function() {
      accepts('{"foo": {"$type": 3}}');
      accepts('{"foo": {"$type": "string"}}');
    });

    it('should accept $size operator', function() {
      accepts('{"foo": {"$size": 10}}');
    });

    it('should accept $regex operator without options (via leaf value)', function() {
      accepts('{"foo": {"$regex": "^foo"}}');
    });

    it('should accept $regex operator with options (via leaf value)', function() {
      accepts('{"foo": {"$regex": "^foo", "$options": "ig"}}');
    });
  });

  describe('List Operators', function() {
    it('should accept $in operator', function() {
      accepts('{"foo": {"$in": [1, 2, 3]}}');
      accepts('{"foo": {"$in": []}}');
      accepts('{"foo": {"$in": ["a", null, false, 4.35]}}');
    });

    it('should reject $in operator without an array', function() {
      rejects('{"foo": {"$in": "bar"}}');
      rejects('{"foo": {"$in": 3}}');
      rejects('{"foo": {"$in": {"a": 1}}}');
    });

    it('should accept $nin operator', function() {
      accepts('{"foo": {"$nin": [1, 2, 3]}}');
      accepts('{"foo": {"$nin": []}}');
      accepts('{"foo": {"$nin": ["a", null, false, 4.35]}}');
    });
  });

  describe('$elemMatch operator', function() {
    it('should accept $elemMatch in its expression form', function() {
      accepts('{"results": {"$elemMatch": {"product": "xyz", "score": {"$gte": 8}}}}');
    });
    it('should accept $elemMatch in its operator form', function() {
      accepts('{"results": {"$elemMatch": {"$gte": 8, "$lt": 20}}}');
    });
  });

  describe('Geo operators', function() {
    it('should accept a $geoWithin query with $centerSphere legacy shape', function() {
      accepts('{"loc":{"$geoWithin":{"$centerSphere":[[-87.71,38.64],0.03]}}}');
    });

    it('should accept a $geoWithin query with $center legacy shape', function() {
      accepts('{"loc":{"$geoWithin":{"$center":[[-87.71,38.64],0.03]}}}');
    });

    it('should accept a $geoWithin query with $box legacy shape', function() {
      accepts('{"loc":{"$geoWithin":{"$box":[[0,0],[100,100]]}}}');
    });

    it('should accept a $geoWithin query with $polygon legacy shape', function() {
      accepts('{"loc":{"$geoWithin":{"$polygon":[[0,0],[100,100],[1,4],[1,5]]}}}');
    });

    it('should accept a $geoWithin query with Polygon $geometry without hole', function() {
      accepts(`{
        "loc": {
          "$geoWithin": {
            "$geometry": {
              "type": "Polygon",
              "coordinates": [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
              ]
            }
          }
        }
      }`);
    });

    it('should accept a $geoWithin query with Polygon $geometry with hole', function() {
      accepts(`{
        "loc": {
          "$geoWithin": {
            "$geometry": {
              "type": "Polygon",
              "coordinates": [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
              ]
            }
          }
        }
      }`);
    });

    it('should accept a $geoWithin query with MultiPolygon $geometry', function() {
      accepts(`{
        "loc": {
          "$geoWithin": {
            "$geometry": {
              "type": "MultiPolygon",
              "coordinates": [
                [
                  [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                  [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                  [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
              ]
            }
          }
        }
      }`);
    });
  });

  describe('Logical Expression Trees', function() {
    it('should accept simple $and expressions', function() {
      accepts('{"$and": [{"foo": 1}, {"bar": 1}]}');
      accepts('{"$and": [{"foo": {"$gt": 1}}]}');
      accepts('{"$and": []}');
    });

    it('should accept simple $or expressions', function() {
      accepts('{"$or": [{"foo": 1}, {"bar": 1}]}');
      accepts('{"$or": [{"foo": {"$gt": 1}}]}');
      accepts('{"$or": []}');
    });

    it('should accept simple $nor expressions', function() {
      accepts('{"$nor": [{"foo": 1}, {"bar": 1}]}');
      accepts('{"$nor": [{"foo": {"$gt": 1}}]}');
      accepts('{"$nor": []}');
    });

    it('should accept mixed, nested expression trees', function() {
      accepts(`{ "$or": [ { "a":1, "b": 2 }, { "$or": [ { "$nor": [
        { "c": true }, { "d": { "$exists": false } } ] }, { "e": 1 } ] } ] }`);
    });
  });

  describe('Syntax Errors', function() {
    it('should reject an invalid string', function() {
      rejects('{"foo": bar}');
    });
    it('should reject an unquoted key', function() {
      rejects('{foo: "bar"}');
    });
    it('should reject an empty string', function() {
      rejects('');
    });
  });
});
