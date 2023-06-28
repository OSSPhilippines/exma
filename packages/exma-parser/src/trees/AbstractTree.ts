//types
import type { Node } from '../types';

import Lexer from '../types/Lexer';

import definitions from '../definitions';

export default abstract class AbstractTree {
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
    lexer.define('Null', definitions['Null'], 'Literal');
    lexer.define('Boolean', definitions['Boolean'], 'Literal');
    lexer.define('String', definitions['String'], 'Literal');
    lexer.define('Float', definitions['Float'], 'Literal');
    lexer.define('Integer', definitions['Integer'], 'Literal');
    lexer.define('ObjectKey', definitions['ObjectKey'], 'Identifier');
    lexer.define('Object', definitions['Object'], 'ObjectExpression');
    lexer.define('Array', definitions['Array'], 'ArrayExpression');
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
  abstract parse(code: string, start: number): Node;
};