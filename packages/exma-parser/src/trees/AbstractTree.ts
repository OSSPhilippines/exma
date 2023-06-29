//types
import type { DeclarationToken } from '../types';

import Lexer from '../types/Lexer';

import definitions from '../definitions';

export default abstract class AbstractTree {
  //the language used
  static definitions(lexer: Lexer) {
    Object.keys(definitions).forEach((key) => {
      lexer.define(key, definitions[key]);
    });
    return lexer;
  }

  //the parser
  protected _lexer: Lexer;

  /**
   * Creates a new parser 
   */
  constructor(lexer?: Lexer) {
    this._lexer = lexer || (
      this.constructor as typeof AbstractTree
    ).definitions(new Lexer());
  }

  /**
   * Consumes non code
   */
  noncode() {
    while(this._lexer.next(['whitespace', 'comment', 'note'])) {
      this._lexer.expect(['whitespace', 'comment', 'note']);
    }
  }

  /**
   * Builds the object syntax
   */
  abstract parse(code: string, start: number): DeclarationToken;
};