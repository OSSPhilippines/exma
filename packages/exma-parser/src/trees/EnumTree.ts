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
    lexer.define('Type',  /^[A-Z][a-zA-Z0-9_]*$/); 
    lexer.define('EnumWord', /^enum$/, 'Type');
    lexer.define('EnumIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    lexer.define('PropertyIdentifier', /^[A-Z][A-Z0-9_]*\?*$/, 'Identifier');
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string) {
    return new this().parse(code);
  }

  /**
   * Builds the enum syntax
   */
  parse(code: string): NodeWithBody {
    this._parser.load(code);
    //enum
    const type = this._parser.expect('EnumWord');
    this._parser.expect('whitespace');
    //enum Foobar
    const value = this._parser.expect('EnumIdentifier');
    this._parser.expect('whitespace');
    //enum Foobar {
    this._parser.expect('{');
    this.noncode();
    const props: Node[] = [];
    //enum Foobar {
    //  FOO "bar"
    //  ...
    while(this._parser.next('PropertyIdentifier')) {
      props.push(this.property());
    }
    //enum Foobar {
    //  FOO "bar"
    //  ...
    //}
    this._parser.expect('}');
  
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._parser.index,
      body: props
    };
  }

  /**
   * Builds the property syntax
   */
  property(): Node {
    //FOO
    const value = this._parser.expect('PropertyIdentifier');
    this._parser.expect('whitespace');
    //FOO "bar"
    const type = this._parser.expect(args);
    this._parser.expect('whitespace');
    this.noncode();
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._parser.index
    };
  }
};