import Exception from './types/Exception';
import Lexer from './types/Lexer';
import Parser from './types/Parser';
import Tree from './types/Tree';

export type * from './types';
export { Exception, Lexer, Parser, Tree };

export default function parse(code: string) {
  return Tree.build(code);
};