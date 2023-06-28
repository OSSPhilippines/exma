//types
import type { Node } from '../types';

import Lexer from '../types/Lexer';

import AbstractTree from './AbstractTree';

import { args } from '../definitions';

export default class TypeTree extends AbstractTree {
  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('EnumWord', /^enum$/, 'Type');
    lexer.define('EnumIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    lexer.define('EnumPropertyIdentifier', /^[A-Z][A-Z0-9_]*\?*$/, 'Identifier');
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string, start = 0) {
    return new this().parse(code, start);
  }

  /**
   * Builds the enum syntax
   */
  parse(code: string, start = 0) {
    this._lexer.load(code, start);
    return this.enum();
  }

  /**
   * Builds the enum syntax
   */
  enum() {
    //enum
    const type = this._lexer.expect('EnumWord');
    this._lexer.expect('whitespace');
    //enum Foobar
    const name = this._lexer.expect('EnumIdentifier');
    this._lexer.expect('whitespace');
    //enum Foobar {
    this._lexer.expect('{');
    this.noncode();
    const props: Node[] = [];
    //enum Foobar {
    //  FOO "bar"
    //  ...
    while(this._lexer.next('EnumPropertyIdentifier')) {
      props.push(this.property());
    }
    //enum Foobar {
    //  FOO "bar"
    //  ...
    //}
    this._lexer.expect('}');
  
    return {
      type: 'VariableDeclaration',
      kind: 'enum',
      start: type.start,
      end: this._lexer.index,
      declarations: [
        {
          type: 'VariableDeclarator',
          start: name.start,
          end: this._lexer.index,
          id: {
            type: 'Identifier',
            start: name.start,
            end: name.end,
            name: name.value
          },
          init: {
            type: 'ObjectExpression',
            start: type.start,
            end: this._lexer.index,
            properties: props
          }
        }
      ]
    };
  }

  /**
   * Builds the property syntax
   */
  property(): Node {
    //FOO
    const id = this._lexer.expect('EnumPropertyIdentifier');
    this._lexer.expect('whitespace');
    //FOO "bar"
    const value = this._lexer.expect(args);
    this._lexer.expect('whitespace');
    this.noncode();
    return {
      type: 'Property',
      kind: 'init' as 'init',
      start: id.start,
      end: value.end,
      method: false,
      shorthand: false,
      computed: false,
      key: {
        type: 'Identifier',
        start: id.start,
        end: id.end,
        name: id.value
      },
      value: {
        type: 'Literal',
        start: value.start,
        end: value.end,
        value: value.value

      }
    };
  }
};