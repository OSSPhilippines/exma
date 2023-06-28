//models
import { Node } from '../types';

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
  model() {
    //model
    const type = this._lexer.expect('ModelWord');
    this._lexer.expect('whitespace');
    //model Foobar
    const name = this._lexer.expect('ModelIdentifier');
    this._lexer.expect('whitespace');
    const properties: Node[] = [];
    //model Foobar @id("foo" "bar")
    while(this._lexer.next('Parameter')) {
      properties.push(this.parameter());
      this.noncode();
    }
    this.noncode();
    //model Foobar @id("foo" "bar") {
    this._lexer.expect('{');
    this.noncode();
    const columns: Node[] = [];
    //model Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    while(this._lexer.next('TypePropertyIdentifier')) {
      columns.push(this.property());
    }
    //model Foobar @id("foo" "bar") {
    //  foo String @id("foo" "bar")
    //  ...
    //}
    this._lexer.expect('}');
  
    return {
      type: 'VariableDeclaration',
      kind: 'model',
      start: type.start,
      end: this._lexer.index,
      declarations: [{
        type: 'VariableDeclarator',
        start: type.start,
        end: this._lexer.index,
        id: {
          type: 'Identifier',
          start: name.start,
          end: name.end,
          name: name.value //Foobar
        },
        init: {
          type: 'ObjectExpression',
          start: type.start,
          end: this._lexer.index,
          properties: [
            {
              type: 'Property',
              start: type.start,
              end: this._lexer.index,
              method: false,
              shorthand: false,
              computed: false,
              key: {
                type: 'Identifier',
                start: type.start,
                end: type.end,
                name: 'attributes',
              },
              value: {
                type: 'ObjectExpression',
                start: type.start,
                end: type.end,
                properties
              }
            },
            {
              type: 'Property',
              start: type.start, 
              end: this._lexer.index,
              method: false,
              shorthand: false,
              computed: false,
              key: {
                type: 'Identifier',
                start: type.start,
                end: type.end,
                name: 'columns',
              },
              value: {
                type: 'ObjectExpression',
                start: type.start,
                end: type.end,
                properties: columns
              }
            }
          ]
        }
      }]
    };
  }

  /**
   * Builds the model syntax
   */
  parse(code: string, start = 0) {
    this._lexer.load(code, start);
    return this.model();
  }
};