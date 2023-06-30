import Exception from './types/Exception';
import Lexer from './types/Lexer';
import Compiler from './types/Compiler';
import AbstractTree from './trees/AbstractTree';
import EnumTree from './trees/EnumTree';
import PropTree from './trees/PropTree';
import TypeTree from './trees/TypeTree';
import ModelTree from './trees/ModelTree';
import SchemaTree from './trees/SchemaTree';
import GeneratorTree from './trees/GeneratorTree';

export type * from './types';
export { 
  Exception, 
  Lexer, 
  Compiler,
  AbstractTree, 
  EnumTree,
  PropTree,
  TypeTree,
  ModelTree,
  SchemaTree,
  GeneratorTree
};

export function parse(code: string) {
  return Compiler.schema(SchemaTree.parse(code));
};