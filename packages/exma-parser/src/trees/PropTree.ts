import Lexer from '../types/Lexer';
import AbstractTree from './AbstractTree';

export default class PropTree extends AbstractTree {
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
  static parse(code: string, start = 0) {
    return new this().parse(code, start);
  }

  /**
   * Builds the enum syntax
   */
  parse(code: string, start = 0) {
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
      type: 'VariableDeclaration',
      kind: 'props',
      start: type.start,
      end: value.end,
      declarations: [
        {
          type: 'VariableDeclarator',
          start: name.start,
          end: value.end,
          id: {
            type: 'Identifier',
            name: name.value as string,
            start: name.start,
            end: name.end
          },
          init: value.node
        }
      ]
    };
  }
};