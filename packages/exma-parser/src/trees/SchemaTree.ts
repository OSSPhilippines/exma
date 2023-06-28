//types
import type { NodeWithBody } from '../types';

import Lexer from '../types/Lexer';

import AbstractTree from './AbstractTree';
import EnumTree from './EnumTree';
import PropTree from './PropTree';
import TypeTree from './TypeTree';
import ModelTree from './ModelTree';

import { args } from '../definitions';

export default class SchemaTree extends AbstractTree<NodeWithBody> {
  static args = [ ...args, 'Reference' ];

  //the language used
  static definitions(lexer: Lexer) {
    super.definitions(lexer);

    EnumTree.definitions(lexer);
    PropTree.definitions(lexer);
    TypeTree.definitions(lexer);
    ModelTree.definitions(lexer);
  
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string) {
    return new this().parse(code);
  }

  //placeholder for trees
  protected _enumTree: EnumTree;
  protected _propTree: PropTree;
  protected _typeTree: TypeTree;
  protected _modelTree: ModelTree;

  /**
   * Creates a new parser 
   */
  constructor(lexer?: Lexer) {
    super(lexer);
    this._enumTree = new EnumTree(this._lexer);
    this._propTree = new PropTree(this._lexer);
    this._typeTree = new TypeTree(this._lexer);
    this._modelTree = new ModelTree(this._lexer);
  }

  /**
   * Builds the type syntax
   */
  parse(code: string, start: number = 0): NodeWithBody {
    this._lexer.load(code, start);
    const entries = [ 'EnumWord', 'PropWord', 'TypeWord', 'ModelWord' ];
    this._lexer.optional('whitespace');
    const body: NodeWithBody[] = [];
    while (this._lexer.next(entries)) {
      switch(true) {
        case this._lexer.next('EnumWord'):
          body.push(this._enumTree.enum());
          break;
        case this._lexer.next('PropWord'):
          body.push(this._propTree.prop());
          break;
        case this._lexer.next('TypeWord'):
          body.push(this._typeTree.type());
          break;
        case this._lexer.next('ModelWord'):
          body.push(this._modelTree.model());
          break;
      }
      this._lexer.optional('whitespace');
    }

    return {
      type: 'Schema',
      value: 'schema',
      start: 0,
      end: this._lexer.index,
      body
    };
  }
};