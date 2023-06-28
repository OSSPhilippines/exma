//types
import type {
  Node,
  NodeWithBody
} from '../types';

import Lexer from '../types/Lexer';

import AbstractTree from './AbstractTree';

import { args } from '../definitions';

export default class TypeTree extends AbstractTree<NodeWithBody> {
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
  static parse(code: string, start: number = 0) {
    return new this().parse(code, start);
  }

  /**
   * Builds the enum syntax
   */
  parse(code: string, start: number = 0): NodeWithBody {
    this._lexer.load(code, start);
    return this.enum();
  }

  /**
   * Builds the enum syntax
   */
  enum(): NodeWithBody {
    //enum
    const type = this._lexer.expect('EnumWord');
    this._lexer.expect('whitespace');
    //enum Foobar
    const value = this._lexer.expect('EnumIdentifier');
    this._lexer.expect('whitespace');
    //enum Foobar {
    this._lexer.expect('{');
    this.noncode();
    const props: Node[] = [];
    //enum Foobar {
    //  FOO "bar"
    //  ...
    while(this._lexer.next('EnumPropertyIdentifier')) {
      props.push(...this.property());
    }
    //enum Foobar {
    //  FOO "bar"
    //  ...
    //}
    this._lexer.expect('}');
  
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._lexer.index,
      body: props
    };
  }

  /**
   * Builds the property syntax
   */
  property(): Node[] {
    //FOO
    const type = this._lexer.expect('EnumPropertyIdentifier');
    this._lexer.expect('whitespace');
    //FOO "bar"
    const value = this._lexer.expect(args);
    this._lexer.expect('whitespace');
    this.noncode();
    return [
      {
        type: type.name,
        value: type.value,
        start: type.start,
        end: type.end
      },
      {
        type: value.name,
        value: value.value,
        start: value.start,
        end: value.end
      }
    ];
  }
};