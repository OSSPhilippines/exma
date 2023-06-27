//types
import type {
  NodeWithBody,
  NodeWithParams,
  NodeWithParamsBody
} from '../types';

import Lexer from '../types/Lexer';

import AbstractTree from './AbstractTree';

import { args } from '../definitions';

export default class TypeTree extends AbstractTree<NodeWithParamsBody> {
  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('Type',  /^[A-Z][a-zA-Z0-9_]*$/); 
    lexer.define('TypeWord', /^type$/, 'Type');
    lexer.define('TypeIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    lexer.define('PropertyIdentifier', /^[a-z][a-zA-Z0-9_]*\?*$/, 'Identifier');
    lexer.define('Parameter', /^@[a-z][a-z0-9_\.]*$/);
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string) {
    return new this().parse(code);
  }

  /**
   * Builds the type syntax
   */
  parse(code: string): NodeWithParamsBody {
    this._parser.load(code);
    //type
    const type = this._parser.expect('TypeWord');
    this._parser.expect('whitespace');
    //type Foobar
    const value = this._parser.expect('TypeIdentifier');
    this._parser.expect('whitespace');
    const params: NodeWithBody[] = [];
    //type Foobar @id("foo" "bar")
    while(this._parser.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //type Foobar @id("foo" "bar") {
    this._parser.expect('{');
    this.noncode();
    const props: NodeWithParams[] = [];
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._parser.next('PropertyIdentifier')) {
      props.push(this.property());
    }
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    //}
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
    // @id
    const param = this._parser.node<NodeWithBody>(this._parser.expect('Parameter'), true);
    if (this._parser.next('(')) {
      // @id(
      this._parser.expect('(');
      this.noncode();
      // @id("foo" "bar"
      while(this._parser.next(args)) {
        param.body.push(this._parser.node(this._parser.expect(args)));
        this.noncode();
      }
      // @id("foo" "bar")
      this._parser.expect(')');
    }
    return param;
  }

  /**
   * Builds the property syntax
   */
  property(): NodeWithParams {
    //foo
    const value = this._parser.expect('PropertyIdentifier');
    this._parser.expect('whitespace');
    //foo String
    const type = this._parser.expect('Type');
    this._parser.expect('whitespace');
    const params: NodeWithBody[] = [];
    //foo String @id("foo" "bar") ...
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