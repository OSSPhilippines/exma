//types
import type {
  NodeWithBody,
  NodeWithParams,
  NodeWithParamsBody
} from '../types';

import Lexer from './Lexer';
import Parser from './Parser';

export default class Tree {
  //the xma definitions
  static definitions(lexer: Lexer) {
    lexer.define('line', /^[\n\r]+$/);
    lexer.define('space', /^[ ]+$/);
    lexer.define('whitespace', /^\s+$/);
    lexer.define('//', /^\/\*(?:(?!\*\/).)+\*\/$/s);
    lexer.define('/**/', /^\/\/[^\n\r]+[\n\r]*$/);
    lexer.define(')', /^\)$/);
    lexer.define('(', /^\($/);
    lexer.define('}', /^\}$/);
    lexer.define('{', /^\{$/);
    lexer.define('Null', /^null$/);
    lexer.define('True', /^true$/);
    lexer.define('False', /^false$/);
    lexer.define('String', /^"[^"]*"$/);
    lexer.define('Float', 
      value => /^\d+\.$/.test(value) ? 0: /^\d+\.\d+$/.test(value) ? 1: -1
    );
    lexer.define('Integer', /^\d+$/);
    lexer.define('Type', /^[a-z]+$/);
    lexer.define('ObjectIdentifier', /^[a-z][a-z0-9_]*$/i);
    lexer.define('PropertyIdentifier', /^[a-z][a-z0-9_]*\?*$/i);
    lexer.define('Parameter', /^@[a-z][a-z0-9_\.]*$/);

    return lexer;
  }
  //valid arguments
  static readonly args = [
    'Null',    'True', 'False',
    'String',  'Null', 'Float',
    'Integer', 'ObjectIdentifier'
  ];

  /**
   * (Main) Builds the syntax tree
   */
  static build(code: string) {
    return new Tree().build(code);
  }

  //the parser
  protected _parser: Parser;

  /**
   * Creates a new parser 
   */
  constructor() {
    this._parser = new Parser(Tree.definitions(new Lexer()));
  }

  /**
   * (Main) Builds the syntax tree
   */
  build(code: string) {
    this._parser.load(code);
    const tree: NodeWithParamsBody[] = [];
    this.noncode();
    while(this._parser.next('Type')) {
      tree.push(this.object());
      this.noncode();
    }
    return tree;
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
  object(): NodeWithParamsBody {
    const type = this._parser.expect('Type');
    this._parser.expect(['whitespace', '//', '/**/']);
    const value = this._parser.expect('ObjectIdentifier');
    this._parser.expect(['whitespace', '//', '/**/']);
    const params: NodeWithBody[] = [];
    //loop params
    while(this._parser.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    this._parser.expect('{');
    this.noncode();
    const props: NodeWithParams[] = [];
    while(this._parser.next('Type')) {
      props.push(this.property());
    }
    this._parser.expect('}');
  
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._parser.index,
      params,
      body: props
    };
  }

  /**
   * Builds the parameter syntax
   */
  parameter(): NodeWithBody {
    const param = this._parser.node<NodeWithBody>(this._parser.expect('Parameter'), true);
    if (this._parser.next('(')) {
      this._parser.expect('(');
      this.noncode();
      while(this._parser.next(Tree.args)) {
        param.body.push(this._parser.node(this._parser.expect(Tree.args)));
        this.noncode();
      }
      this._parser.expect(')');
    }
    return param;
  }

  /**
   * Builds the property syntax
   */
  property(): NodeWithParams {
    const type = this._parser.expect('Type');
    this._parser.expect(['whitespace', '//', '/**/']);
    const value = this._parser.expect('PropertyIdentifier');
    this._parser.expect(['whitespace', '//', '/**/']);
    const params: NodeWithBody[] = [];
    //loop params
    while(this._parser.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._parser.index,
      params
    };
  }
};