
import { Node } from '../types';

import Lexer from '../types/Lexer';

import AbstractTree from './AbstractTree';

import { args } from '../definitions';

export default class TypeTree extends AbstractTree {
  static args = [ ...args, 'Reference' ];

  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('Type', /^[A-Z][a-zA-Z0-9_]*\?{0,1}$/); 
    lexer.define('TypeWord', /^type$/, 'Type');
    lexer.define('TypeIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    lexer.define('TypePropertyIdentifier', /^[a-z][a-zA-Z0-9_]*\?*$/, 'Identifier');
    lexer.define('Parameter', /^@[a-z][a-z0-9_\.]*$/);
    lexer.define('Reference', /^[A-Z][a-zA-Z0-9_]*$/);
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string, start: number = 0) {
    return new this().parse(code, start);
  }

  /**
   * Builds the type syntax
   */
  parse(code: string, start: number = 0) {
    this._lexer.load(code, start);
    return this.type();
  }

  /**
   * Builds the parameter syntax
   */
  parameter() {
    // @id
    const param = this._lexer.expect('Parameter');
    const elements: Node[] = [];
    if (this._lexer.next('(')) {
      // @id(
      this._lexer.expect('(');
      this.noncode();
      // @id("foo" "bar"
      const args = (this.constructor as typeof TypeTree).args;
      while(this._lexer.next(args)) {
        const arg = this._lexer.expect(args);
        if (typeof arg.node !== 'undefined') {
          elements.push(arg.node);
        }
        this.noncode();
      }
      // @id("foo" "bar")
      this._lexer.expect(')');
    }
    //assuming no args
    return {
      type: 'Property',
      start: param.start,
      end: this._lexer.index,
      key: {
        type: 'Identifier',
        start: param.start,
        end: param.end,
        value: param.value.slice(1)
      },
      value: elements.length ? {
        type: 'ArrayExpression',
        start: param.start,
        end: this._lexer.index,
        elements
      } : {
        type: 'Literal',
        start: param.start,
        end: this._lexer.index,
        value: true,
        raw: 'true'
      }
    };
  }

  /**
   * Builds the property syntax
   */
  property() {
    //foo
    const value = this._lexer.expect('TypePropertyIdentifier');
    this._lexer.expect('whitespace');
    //foo String
    const type = this._lexer.expect('Type');
    this._lexer.expect('whitespace');
    const params: Node[] = [];
    //foo String @id("foo" "bar") ...
    while(this._lexer.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    return {
      type: 'Property',
      start: value.start,
      end: this._lexer.index,
      method: false,
      shorthand: false,
      computed: false,
      key: {
        type: 'Identifier',
        start: value.start,
        end: value.end,
        name: value.value //foo
      },
      value: {
        type: 'ObjectExpression',
        start: type.start,
        end: this._lexer.index,
        properties: [
          {
            type: 'Property',
            kind: 'init' as 'init',
            start: type.start,
            end: type.end,
            method: false,
            shorthand: false,
            computed: false,
            key: {
              type: 'Identifier',
              start: type.start,
              end: type.end,
              name: 'type',
            },
            value: {
              type: 'Literal',
              start: type.start,
              end: type.end,
              value: type.value, //String
              raw: `"${type.value}"`
            }
          },
          {
            type: 'Property',
            kind: 'init' as 'init',
            start: type.start,
            end: this._lexer.index,
            method: false,
            shorthand: false,
            computed: false,
            key: {
              type: 'Identifier',
              start: type.start,
              end: type.end,
              name: 'attributes',
            },
            value: {
              type: 'ObjectExpression',
              start: type.start,
              end: type.end,
              properties: params
            }
          }
        ]
      } 
    };
  }

  /**
   * Builds the type syntax
   */
  type() {
    //type
    const type = this._lexer.expect('TypeWord');
    this._lexer.expect('whitespace');
    //type Foobar
    const name = this._lexer.expect('TypeIdentifier');
    this._lexer.expect('whitespace');
    const properties: Node[] = [];
    //type Foobar @id("foo" "bar")
    while(this._lexer.next('Parameter')) {
      properties.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //type Foobar @id("foo" "bar") {
    this._lexer.expect('{');
    this.noncode();
    const columns: Node[] = [];
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._lexer.next('TypePropertyIdentifier')) {
      columns.push(this.property());
    }
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    //}
    this._lexer.expect('}');
  
    return {
      type: 'VariableDeclaration',
      kind: 'type',
      start: type.start,
      end: this._lexer.index,
      declarations: [{
        type: 'VariableDeclarator',
        start: type.start,
        end: this._lexer.index,
        id: {
          type: 'Identifier',
          start: name.start,
          end: name.end,
          name: name.value //Address
        },
        init: {
          type: 'ObjectExpression',
          start: type.start,
          end: this._lexer.index,
          properties: [
            {
              type: 'Property',
              start: type.start,
              end: this._lexer.index,
              method: false,
              shorthand: false,
              computed: false,
              key: {
                type: 'Identifier',
                start: type.start,
                end: type.end,
                name: 'attributes',
              },
              value: {
                type: 'ObjectExpression',
                start: type.start,
                end: type.end,
                properties
              }
            },
            {
              type: 'Property',
              start: type.start, 
              end: this._lexer.index,
              method: false,
              shorthand: false,
              computed: false,
              key: {
                type: 'Identifier',
                start: type.start,
                end: type.end,
                name: 'columns',
              },
              value: {
                type: 'ObjectExpression',
                start: type.start,
                end: type.end,
                properties: columns
              }
            }
          ]
        }
      }]
    };
  }
};