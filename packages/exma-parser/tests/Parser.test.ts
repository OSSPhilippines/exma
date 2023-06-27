import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Lexer from '../src/types/Lexer';
import Parser from '../src/types/Parser';

use(deepEqualInAnyOrder);

describe('Parser', () => {
  it('Should parse integer', async () => {
    const lexer = new Lexer();
    lexer.define('Integer', /^\d+$/);
    const parser = new Parser(lexer).load('4.4');

    const token = parser.expect('Integer');
    expect(token.name).to.equal('Integer');
    expect(token.value).to.equal('4');
    expect(token.start).to.equal(0);
    expect(token.end).to.equal(1);
  });

  it('Should parse float', async () => {
    const lexer = new Lexer();
    lexer.define('Integer', /^\d+$/);
    lexer.define('Float', 
      value => /^\d+\.$/.test(value) ? 0: /^\d+\.\d+$/.test(value) ? 1: -1
    );

    const parser = new Parser(lexer).load('4.4');
    const token = parser.expect(['Float', 'Integer']);
    expect(token.name).to.equal('Float');
    expect(token.value).to.equal('4.4');
    expect(token.start).to.equal(0);
    expect(token.end).to.equal(3);
  });

  it('Should parse comments', async () => {
    const lexer = new Lexer();
    lexer.define('Comment', /^\/\*(?:(?!\*\/).)+\*\/$/s);
    lexer.define('CommentLine', /^\/\/[^\n\r]+[\n\r]*$/);

    const parser = new Parser(lexer);

    (() => {
      parser.load('/* some comment */');
      const token = parser.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      parser.load('//some comment');
      const token = parser.expect('CommentLine');
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//some comment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(14);
    })();

    (() => {
      parser.load('/* some // comment */');
      const token = parser.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some // comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(21);
    })();

    (() => {
      parser.load('/* some // comment */');
      const token = parser.expect([ 'Comment', 'CommentLine' ]);
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal('/* some // comment */');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(21);
    })();

    (() => {
      parser.load('//so/*me com*/ment');
      const token = parser.expect('CommentLine');
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//so/*me com*/ment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      parser.load('//so/*me com*/ment');
      const token = parser.expect([ 'Comment', 'CommentLine' ]);
      expect(token.name).to.equal('CommentLine');
      expect(token.value).to.equal('//so/*me com*/ment');
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(18);
    })();

    (() => {
      parser.load(`/* 
        some 
        // comment
      */`);
      const token = parser.expect('Comment');
      expect(token.name).to.equal('Comment');
      expect(token.value).to.equal("/* \n        some \n        // comment\n      */");
      expect(token.start).to.equal(0);
      expect(token.end).to.equal(45);
    })();
  });

  it('Should parse object', async () => {
    const lexer = new Lexer();
    lexer.define('Object', (value: string) => {
      const opens = value.match(/\{/g) || [];
      const closes = value.match(/\}/g) || [];
      return !opens.length ? -1: opens.length !== closes.length ? 0: 1;
    });

    const parser = new Parser(lexer).load('{"{d{d}"}d}');
    const token = parser.expect('Object');
    expect(token.name).to.equal('Object');
    expect(token.value).to.equal('{"{d{d}"}d}');
    expect(token.start).to.equal(0);
    expect(token.end).to.equal(11);
  });
});
