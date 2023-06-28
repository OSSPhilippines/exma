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
  optional(names: string | string[]): Token | undefined;
  read(): Token | undefined
}

export type Match = { 
  end: number;
  value: any;
  node?: Node;
};
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
  node?: Node;
};

export type Node = {
  type: string;
  start: number;
  end: number;
  name?: string;
  key?: Node;
  init?: Node;
  value?: any;
  raw?: string;
  properties?: Node[];
  body?: Node[];
  declarations?: Node[];
  id?: Node;
  kind?: string;
  method?: boolean;
  shorthand?: boolean;
  computed?: boolean;
};