//types
import type { Node } from '../types';

import Lexer from '../types/Lexer';
import Parser from '../types/Parser';

import definitions from '../definitions';

export default abstract class AbstractTree<T = Node> {
  //the language used
  static definitions(lexer: Lexer) {
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
    lexer.define('True', definitions['True']);
    lexer.define('False', definitions['False']);
    lexer.define('String', definitions['String']);
    lexer.define('Float', definitions['Float']);
    lexer.define('Integer', definitions['Integer']);
    return lexer;
  }

  //the parser
  protected _parser: Parser;

  /**
   * Creates a new parser 
   */
  constructor() {
    this._parser = new Parser(
      (this.constructor as typeof AbstractTree).definitions(new Lexer())
    );
  }

  /**
   * Consumes non code
   */
  noncode() {
    while(this._parser.next(['whitespace', '//', '/**/'])) {
      this._parser.expect(['whitespace', '//', '/**/']);
    }
  }

  /**
   * Builds the object syntax
   */
  abstract parse(code: string): T;
};