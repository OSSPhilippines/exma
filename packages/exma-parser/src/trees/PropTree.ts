//types
import type { NodeWithBody } from '../types';

import Lexer from '../types/Lexer';
import AbstractTree from './AbstractTree';

export default class PropTree extends AbstractTree<NodeWithBody> {
  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('PropWord', /^prop$/, 'Type');
    lexer.define('PropIdentifier', /^[a-z][a-z0-9_]*$/i, 'Identifier');
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
    return this.prop();
  }

  /**
   * Builds the prop syntax  
   */
  prop() {
    //prop
    const type = this._lexer.expect('PropWord');
    this._lexer.expect('whitespace');
    //enum Foobar
    const name = this._lexer.expect('PropIdentifier');
    this._lexer.expect('whitespace');
    //enum Foobar {
    const value = this._lexer.expect('Object');
  
    return {
      type: type.value,
      value: name.value,
      start: type.start,
      end: this._lexer.index,
      body: [
        {
          type: value.name,
          value: value.value,
          start: value.start,
          end: value.end
        }
      ]
    };
  }
};