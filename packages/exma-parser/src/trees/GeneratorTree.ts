//types
import type { LiteralToken, DeclarationToken, ObjectToken } from '../types';

import Lexer from '../types/Lexer';
import { reader } from '../definitions';

import AbstractTree from './AbstractTree';

export default class TypeTree extends AbstractTree {
  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('GeneratorWord', (code, index) => reader(
      '_GeneratorWord', 
      /^generator$/, 
      code, 
      index
    ));
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
    return this.generator();
  }

  /**
   * Builds the generator syntax
   */
  generator(): DeclarationToken {
    //generator
    const type = this._lexer.expect('GeneratorWord');
    this._lexer.expect('whitespace');
    //generator "Foobar"
    const id = this._lexer.expect<LiteralToken>('String');
    this._lexer.expect('whitespace');
    //generator "Foobar" {...}
    const init = this._lexer.expect<ObjectToken>('Object');
  
    return {
      type: 'VariableDeclaration',
      kind: 'generator',
      start: type.start,
      end: this._lexer.index,
      declarations: [
        {
          type: 'VariableDeclarator',
          start: id.start,
          end: this._lexer.index,
          id: {
            type: 'Identifier',
            start: id.start,
            end: id.end,
            name: id.value
          },
          init
        }
      ]
    };
  }
};