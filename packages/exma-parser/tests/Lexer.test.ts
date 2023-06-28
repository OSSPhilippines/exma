import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import Lexer from '../src/types/Lexer';
import definitions, { args } from '../src/definitions';

describe('Lexer', () => {
  it('Should parse Args', async () => {
    const lexer = new Lexer();
    lexer.define('line', definitions.line);
    lexer.define('space', definitions.space);
    lexer.define('whitespace', definitions.whitespace);
    lexer.define('//', definitions['//']);
    lexer.define('/**/', definitions['/**/']);
    lexer.define(')', definitions[')']);
    lexer.define('(', definitions['(']);
    lexer.define('}', definitions['}']);
    lexer.define('{', definitions['{']);
    lexer.define(']', definitions[']']);
    lexer.define('[', definitions['[']);
    lexer.define('Null', definitions['Null']);
    lexer.define('Boolean', definitions['Boolean']);
    lexer.define('String', definitions['String']);
    lexer.define('Float', definitions['Float']);
    lexer.define('Integer', definitions['Integer']);
    lexer.define('ObjectKey', definitions['ObjectKey']);
    lexer.define('Object', definitions['Object']);
    lexer.define('Array', definitions['Array']);

    //float 
    (() => {
      lexer.load('4.4');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Float');
      expect(token.value).to.equal(4.4);
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(3);
    })();
    //int
    (() => {
      lexer.load('44');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Integer');
      expect(token.value).to.equal(44);
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(2);
    })();
    //null
    (() => {
      lexer.load('null');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Null');
      expect(token.value).to.equal(null);
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(4);
    })();
    //true
    (() => {
      lexer.load('true');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Boolean');
      expect(token.value).to.equal(true);
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(4);
    })();
    //false
    (() => {
      lexer.load('false');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Boolean');
      expect(token.value).to.equal(false);
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(5);
    })();
    //string
    (() => {
      lexer.load('"foobar"');
      const token = lexer.expect(args);
      expect(token.name).to.equal('String');
      expect(token.value).to.equal('foobar');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(8);
    })();
    //basic object
    (() => {
      lexer.load('{ foo "bar" bar 4.4 }');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Object');
      expect(token.value.foo).to.equal('bar');
      expect(token.value.bar).to.equal(4.4);
    })();
    //object object
    (() => {
      lexer.load('{ foo "bar" bar 4.4 zoo { foo false bar null } }');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Object');
      expect(token.value.foo).to.equal('bar');
      expect(token.value.bar).to.equal(4.4);
      expect(token.value.zoo.foo).to.equal(false);
      expect(token.value.zoo.bar).to.equal(null);
    })();
    //object array
    (() => {
      lexer.load('{ foo "bar" bar 4.4 zoo [ 4 true ] }');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Object');
      expect(token.value.foo).to.equal('bar');
      expect(token.value.bar).to.equal(4.4);
      expect(token.value.zoo[0]).to.equal(4);
      expect(token.value.zoo[1]).to.equal(true);
    })();
    //basic array
    (() => {
      lexer.load('[ 4.4 "bar" false null ]');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Array');
      expect(token.value[0]).to.equal(4.4);
      expect(token.value[1]).to.equal('bar');
      expect(token.value[2]).to.equal(false);
      expect(token.value[3]).to.equal(null);
    })();
    //array array
    (() => {
      lexer.load('[ 4.4 "bar" false null [ 4 true ] ]');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Array');
      expect(token.value[0]).to.equal(4.4);
      expect(token.value[1]).to.equal('bar');
      expect(token.value[2]).to.equal(false);
      expect(token.value[3]).to.equal(null);
      expect(token.value[4][0]).to.equal(4);
      expect(token.value[4][1]).to.equal(true);
    })();
    //array object
    (() => {
      lexer.load('[ 4.4 "bar" false null { foo false bar null } ]');
      const token = lexer.expect(args);
      expect(token.name).to.equal('Array');
      expect(token.value[0]).to.equal(4.4);
      expect(token.value[1]).to.equal('bar');
      expect(token.value[2]).to.equal(false);
      expect(token.value[3]).to.equal(null);
      expect(token.value[4].foo).to.equal(false);
      expect(token.value[4].bar).to.equal(null);
    })();
    
  });

  it('Should parse comments', async () => {
    const lexer = new Lexer();
    lexer.define('Comment', /^\/\*(?:(?!\*\/).)+\*\/$/s);
    lexer.define('CommentLine', /^\/\/[^\n\r]+[\n\r]*$/);

    (() => {
      lexer.load('/* some comment */');
      const token = lexer.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      lexer.load('//some comment');
      const token = lexer.expect('CommentLine');
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//some comment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(14);
    })();

    (() => {
      lexer.load('/* some // comment */');
      const token = lexer.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some // comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(21);
    })();

    (() => {
      lexer.load('/* some // comment */');
      const token = lexer.expect([ 'Comment', 'CommentLine' ]);
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some // comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(21);
    })();

    (() => {
      lexer.load('//so/*me com*/ment');
      const token = lexer.expect('CommentLine');
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//so/*me com*/ment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      lexer.load('//so/*me com*/ment');
      const token = lexer.expect([ 'Comment', 'CommentLine' ]);
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//so/*me com*/ment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      lexer.load(`/* 
        some 
        // comment
      */`);
      const token = lexer.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal("/* \n        some \n        // comment\n      */");
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(45);
    })();
  });
});
