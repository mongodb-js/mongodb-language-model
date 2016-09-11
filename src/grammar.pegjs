query
  = expression

expression
  = begin_object
  	clauses:(
      head:clause tail:(value_separator c:clause { return c; })*
      { return [head].concat(tail); }
    )?
    end_object
    { return { pos: "expression", clauses: clauses !== null ? clauses : [] }; }

clause
  = leaf_clause
  / expression_tree_clause
  // / WhereClause
  // / TextClause
  // / CommentClause

expression_tree_clause
  = quotation_mark operator:expression_tree_operator quotation_mark name_separator begin_array expressions:expression_list end_array
  { return { pos: "expression-tree-clause", operator: operator, expressions: expressions }; }

expression_tree_operator
  = "$or" / "$nor" / "$and"

expression_list
  = expressions:(
      head:expression tail:(value_separator e:expression { return e; })*
      { return [head].concat(tail); }
    )?
    { return expressions !== null ? expressions : []; }


leaf_clause
  = key:key name_separator value:value
    { return { pos: "leaf-clause", key: key, value: value }; }

value
  = operator_object
  / JSON

operator_object
  = begin_object
    operators:(
      head:operator tail:(value_separator o:operator { return o; })*
      { return [head].concat(tail); }
    )
    end_object
    { return { pos: "operator-object", operators: operators }; }

operator
  // value-operator
  = quotation_mark operator:value_operator quotation_mark name_separator value:JSON
  { return { pos: "value-operator", operator: operator, value: value }; }
  // list-operator
  / quotation_mark operator:list_operator quotation_mark name_separator begin_array values:leaf_value_list end_array
  { return { pos: "list-operator", operator: operator, values: values }; }
  // elemmatch-expression-operator
  / quotation_mark "$elemMatch" quotation_mark name_separator expression:expression
  { return { pos: "elemmatch-expression-operator", expression: expression } }
  // elemmatch-operator-operator
  / quotation_mark "$elemMatch" quotation_mark name_separator opobject:operator_object
  { return { pos: "elemmatch-operator-operator", operators: opobject.operators } }
value_operator
  = "$gte" / "$gt" / "$lte" / "$lt" / "$eq" / "$ne" / "$type" / "$size" / "$exists"

list_operator
  = "$in" / "$nin"

leaf_value_list
  = values:(
      head:JSON tail:(value_separator v:JSON { return v; })*
      { return [head].concat(tail); }
    )?
    { return values !== null ? values : []; }

key
  = quotation_mark key:([^$] [^.\x00"]*) quotation_mark { return key[0] + key[1].join(''); }

// field name limitations: https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names
// no "." no null character and does not start with "$"
// assuming at least 1 character

/*
 * JSON Grammar
 * ============
 *
 * Based on the grammar from RFC 7159 [1].
 *
 * Note that JSON is also specified in ECMA-262 [2], ECMA-404 [3], and on the
 * JSON website [4] (somewhat informally). The RFC seems the most authoritative
 * source, which is confirmed e.g. by [5].
 *
 * [1] http://tools.ietf.org/html/rfc7159
 * [2] http://www.ecma-international.org/publications/standards/Ecma-262.htm
 * [3] http://www.ecma-international.org/publications/standards/Ecma-404.htm
 * [4] http://json.org/
 * [5] https://www.tbray.org/ongoing/When/201x/2014/03/05/RFC7159-JSON
 */

/* ----- 2. JSON Grammar ----- */

JSON
  = _ value:leaf_value _
  { return { pos: 'leaf-value', value: value }; }

begin_array     = _ "[" _
begin_object    = _ "{" _
end_array       = _ "]" _
end_object      = _ "}" _
name_separator  = _ ":" _
value_separator = _ "," _

_ "whitespace" = [ \t\n\r]*

/* ----- 3. Values ----- */

leaf_value
  = false
  / null
  / true
  / object
  / array
  / number
  / string
  / extended_json_value

extended_json_value
  = regex
  // / timestamp
  // / minkey
  // / maxkey
  // / objectid
  // / long
  // / binary
  // / dbref
  // / date
  // / undefined

regex
  = begin_object
  	members:(
      regex:(
      	quotation_mark "$regex" quotation_mark
        name_separator string:string
        { return string; }
      )
      options:(
        value_separator quotation_mark "$options" quotation_mark
        name_separator quotation_mark options:[gims]* quotation_mark
        {return options.join(''); }
      )?
      { return {regex: regex, options: options ? options : ""}; }
    )
    end_object
    { return members; }

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

/* ----- 4. Objects ----- */

object
  = begin_object
    members:(
      head:member tail:(value_separator m:member { return m; })*
      {
        var result = {};
        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });
        return result;
      }
    )?
    end_object
    { return members !== null ? members : {}; }

member
  = name:key name_separator value:leaf_value {
      return { name: name, value: value };
    }

/* ----- 5. Arrays ----- */

array
  = begin_array
    values:(
      head:leaf_value tail:(value_separator v:leaf_value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }

/* ----- 6. Numbers ----- */

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point = "."
digit1_9      = [1-9]
e             = [eE]
exp           = e (minus / plus)? DIGIT+
frac          = decimal_point DIGIT+
int           = zero / (digit1_9 DIGIT*)
minus         = "-"
plus          = "+"
zero          = "0"

/* ----- 7. Strings ----- */

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG)
      { return String.fromCharCode(parseInt(digits, 16)); }
    )
    { return sequence; }

escape         = "\\"
quotation_mark = '"'
unescaped      = [^\0-\x1F\x22\x5C]

/* ----- Core ABNF Rules ----- */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
