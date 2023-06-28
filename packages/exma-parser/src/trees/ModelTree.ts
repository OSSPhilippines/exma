//types
import type {
  NodeWithBody,
  NodeWithParams,
  NodeWithParamsBody
} from '../types';

import Lexer from '../types/Lexer';
import TypeTree from './TypeTree';

export default class ModelTree extends TypeTree {
  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);
    lexer.define('ModelWord', /^model$/);
    lexer.define('ModelIdentifier', /^[A-Z][a-zA-Z0-9_]*$/, 'Identifier');
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string, start: number = 0) {
    return new ModelTree().parse(code, start);
  }

  /**
   * Builds the model syntax
   */
  model(): NodeWithParamsBody {
    //model
    const type = this._lexer.expect('ModelWord');
    this._lexer.expect('whitespace');
    //model Foobar
    const value = this._lexer.expect('ModelIdentifier');
    this._lexer.expect('whitespace');
    const params: NodeWithBody[] = [];
    //model Foobar @id("foo" "bar")
    while(this._lexer.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //model Foobar @id("foo" "bar") {
    this._lexer.expect('{');
    this.noncode();
    const props: NodeWithParams[] = [];
    //model Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._lexer.next('TypePropertyIdentifier')) {
      props.push(this.property());
    }
    //model Foobar @id("foo" "bar") {
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

  /**
   * Builds the model syntax
   */
  parse(code: string, start: number = 0): NodeWithParamsBody {
    this._lexer.load(code, start);
    return this.model();
  }
};