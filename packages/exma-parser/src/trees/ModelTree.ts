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
  static parse(code: string) {
    return new ModelTree().parse(code);
  }

  /**
   * Builds the model syntax
   */
  parse(code: string): NodeWithParamsBody {
    this._parser.load(code);
    //model
    const type = this._parser.expect('ModelWord');
    this._parser.expect('whitespace');
    //model Foobar
    const value = this._parser.expect('ModelIdentifier');
    this._parser.expect('whitespace');
    const params: NodeWithBody[] = [];
    //model Foobar @id("foo" "bar")
    while(this._parser.next('Parameter')) {
      params.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //model Foobar @id("foo" "bar") {
    this._parser.expect('{');
    this.noncode();
    const props: NodeWithParams[] = [];
    //model Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._parser.next('PropertyIdentifier')) {
      props.push(this.property());
    }
    //model Foobar @id("foo" "bar") {
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
};