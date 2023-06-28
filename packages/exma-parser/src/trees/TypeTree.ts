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
  static args = [ ...args, 'Reference' ];

  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('Type', /^[A-Z][a-zA-Z0-9_]*\?{0,1}$/); 
    lexer.define('TypeWord', /^type$/, 'Type');
    lexer.define('TypeIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    lexer.define('TypePropertyIdentifier', /^[a-z][a-zA-Z0-9_]*\?*$/, 'Identifier');
    lexer.define('Parameter', /^@[a-z][a-z0-9_\.]*$/);
    lexer.define('Reference', /^[A-Z][a-zA-Z0-9_]*$/);
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string, start: number = 0) {
    return new this().parse(code, start);
  }

  /**
   * Builds the type syntax
   */
  parse(code: string, start: number = 0): NodeWithParamsBody {
    this._lexer.load(code, start);
    return this.type();
  }

  /**
   * Builds the parameter syntax
   */
  parameter(): NodeWithBody {
    // @id
    const param = this._lexer.node<NodeWithBody>(this._lexer.expect('Parameter'), true);
    if (this._lexer.next('(')) {
      // @id(
      this._lexer.expect('(');
      this.noncode();
      // @id("foo" "bar"
      while(this._lexer.next((this.constructor as typeof TypeTree).args)) {
        param.body.push(this._lexer.node(this._lexer.expect(
          (this.constructor as typeof TypeTree).args
        )));
        this.noncode();
      }
      // @id("foo" "bar")
      this._lexer.expect(')');
    }
    return param;
  }

  /**
   * Builds the property syntax
   */
  property(): NodeWithParams {
    //foo
    const value = this._lexer.expect('TypePropertyIdentifier');
    this._lexer.expect('whitespace');
    //foo String
    const type = this._lexer.expect('Type');
    this._lexer.expect('whitespace');
    const params: NodeWithBody[] = [];
    //foo String @id("foo" "bar") ...
    while(this._lexer.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._lexer.index,
      params
    };
  }

  /**
   * Builds the type syntax
   */
  type(): NodeWithParamsBody {
    //type
    const type = this._lexer.expect('TypeWord');
    this._lexer.expect('whitespace');
    //type Foobar
    const value = this._lexer.expect('TypeIdentifier');
    this._lexer.expect('whitespace');
    const params: NodeWithBody[] = [];
    //type Foobar @id("foo" "bar")
    while(this._lexer.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //type Foobar @id("foo" "bar") {
    this._lexer.expect('{');
    this.noncode();
    const props: NodeWithParams[] = [];
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._lexer.next('TypePropertyIdentifier')) {
      props.push(this.property());
    }
    //type Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    //}
    this._lexer.expect('}');
  
    return {
      type: type.value,
      value: value.value,
      start: type.start,
      end: this._lexer.index,
      params,
      body: props
    };
  }
};