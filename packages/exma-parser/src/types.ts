export interface LexerInterface {
  get dictionary(): Record<string, Definition>;
  get index(): number;
  clone(): LexerInterface;
  define(name: string, syntax: RegExp|Syntax, label?: string): void;
  expect(names: string | string[]): Token;
  get(name: string): Definition|undefined;
  load(code: string, index: number): this;
  match(code: string, start: number, names?: string[]): Token[];
  next(names: string | string[]): boolean;
  node<T extends Node = Node>(token: Token, withBody?: boolean): T;
  optional(names: string | string[]): Token | undefined;
  read(): Token | undefined
}

export type Match = { end: number, value: any };
export type Syntax = (
  code: string, 
  start: number, 
  lexer: LexerInterface
) => Match|undefined;

export type Definition = {
  name: string;
  label: string;
  syntax: Syntax;
};

export type Token = {
  name: string;
  value: any;
  start: number;
  end: number;
};

export type Node = {
  type: string;
  value: any;
  start: number;
  end: number;
  params?: Node[];
  body?: Node[];
};

export type NodeWithBody = {
  type: string;
  value: any;
  start: number;
  end: number;
  body: Node[];
};

export type NodeWithParams = {
  type: string;
  value: string;
  start: number;
  end: number;
  params: Node[];
};

export type NodeWithParamsBody = {
  type: string;
  value: string;
  start: number;
  end: number;
  params: Node[];
  body: Node[];
};