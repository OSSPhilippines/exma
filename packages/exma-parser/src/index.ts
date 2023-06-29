import Exception from './types/Exception';
import Lexer from './types/Lexer';
import AbstractTree from './trees/AbstractTree';
import EnumTree from './trees/EnumTree';
import ModelTree from './trees/ModelTree';
import PropTree from './trees/PropTree';
import SchemaTree from './trees/SchemaTree';
import TypeTree from './trees/TypeTree';

export type * from './types';
export { 
  Exception, 
  Lexer, 
  AbstractTree, 
  EnumTree,
  ModelTree,
  PropTree,
  SchemaTree,
  TypeTree
};

export default function parse(code: string) {
  return SchemaTree.parse(code);
};