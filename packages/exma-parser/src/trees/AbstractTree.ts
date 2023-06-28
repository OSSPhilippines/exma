//types
import type { Node } from '../types';

import Lexer from '../types/Lexer';

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
    lexer.define('Boolean', definitions['Boolean']);
    lexer.define('String', definitions['String']);
    lexer.define('Float', definitions['Float']);
    lexer.define('Integer', definitions['Integer']);
    lexer.define('ObjectKey', definitions['ObjectKey']);
    lexer.define('Object', definitions['Object']);
    lexer.define('Array', definitions['Array']);
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
    while(this._lexer.next(['whitespace', '//', '/**/'])) {
      this._lexer.expect(['whitespace', '//', '/**/']);
    }
  }

  /**
   * Builds the object syntax
   */
  abstract parse(code: string): T;
};