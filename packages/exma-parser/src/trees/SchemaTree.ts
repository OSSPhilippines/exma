//types
import type { SchemaToken, DeclarationToken } from '../types';

import Lexer from '../types/Lexer';

import EnumTree from './EnumTree';
import PropTree from './PropTree';
import TypeTree from './TypeTree';
import ModelTree from './ModelTree';
import PluginTree from './PluginTree';

export default class SchemaTree {
  //the language used
  static definitions(lexer: Lexer) {
    EnumTree.definitions(lexer);
    PropTree.definitions(lexer);
    TypeTree.definitions(lexer);
    ModelTree.definitions(lexer);
    PluginTree.definitions(lexer);
  
    return lexer;
  }

  /**
   * (Main) Builds the syntax tree
   */
  static parse(code: string) {
    return new this().parse(code);
  }

  //the parser
  protected _lexer: Lexer;

  //placeholder for trees
  protected _enumTree: EnumTree;
  protected _propTree: PropTree;
  protected _typeTree: TypeTree;
  protected _modelTree: ModelTree;
  protected _pluginTree: PluginTree;

  /**
   * Creates a new parser 
   */
  constructor(lexer?: Lexer) {
    this._lexer = lexer || (
      this.constructor as typeof SchemaTree
    ).definitions(new Lexer());
    this._enumTree = new EnumTree(this._lexer);
    this._propTree = new PropTree(this._lexer);
    this._typeTree = new TypeTree(this._lexer);
    this._modelTree = new ModelTree(this._lexer);
    this._pluginTree = new PluginTree(this._lexer);
  }

  /**
   * Builds the type syntax
   */
  parse(code: string, start: number = 0): SchemaToken {
    this._lexer.load(code, start);
    const entries = [ 
      'EnumWord', 
      'PropWord', 
      'TypeWord', 
      'ModelWord', 
      'PluginWord' 
    ];
    this._lexer.optional('whitespace');
    const body: DeclarationToken[] = [];
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
        case this._lexer.next('PluginWord'):
          body.push(this._pluginTree.plugin());
          break;
      }
      this._lexer.optional('whitespace');
    }

    return {
      type: 'Program',
      kind: 'schema',
      start: 0,
      end: this._lexer.index,
      body
    };
  }
};