var Operator = require('./operator'),
  OperatorObject = require('./opobject'),
  LeafValue = require('./leafvalue'),
  _ = require('lodash'),
  definitions = require('./definitions'),
  debug = require('debug')('models:value-operator');


/**
 * GeoOperator holds a geo operator key, and one or multiple special operators depending on
 * the type of geo query.
 * e.g. {"$geoWithin": {$centerSphere: [ [ -88, 30 ], 10/3963.2 ] } }
 *
 * @type {Operator}
 */
var GeoOperator = module.exports = Operator.extend({
  props: {
    operator: {
      type: 'string',
      required: true,
      values: definitions.geoOperators
    }
  },
  session: {
    className: {
      type: 'string',
      default: 'GeoOperator'
    }
  },
  children: {
    opob: OperatorObject
  },
  derived: {
    buffer: {
      deps: ['value', 'opob'],
      cache: false,
      fn: function() {
        var doc = {};
        doc[this.operator] = this.opob.buffer;
        return doc;
      }
    },
    valid: {
      deps: ['value'],
      cache: false,
      fn: function() {
        // operator is always valid
        return this.opob.valid;
      }
    }
  },
  initialize: function(attrs, options) {
    // bubble up buffer change events
    this.listenTo(this.opob, 'change:buffer', this.bufferChanged);
  },
  parse: function(attrs, options) {
    // assume {$op: {...}} format
    if (attrs) {
      var key = _.keys(attrs)[0];
      var opob = attrs[key];
      return {
        operator: key,
        opob: opob
      };
    }
    return {};
  },
  serialize: function() {
    return this.buffer;
  }
});
