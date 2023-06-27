export type Syntax = (value: string) => -1|0|1;
export type Match = { name: string, label: string, match: 0|1 };

export type Definition = {
  name: string;
  label: string;
  syntax: Syntax;
};

export type Token = {
  name: string;
  value: string;
  start: number;
  end: number;
};

export type Node = {
  type: string;
  value: string;
  start: number;
  end: number;
  params?: Node[];
  body?: Node[];
};

export type NodeWithBody = {
  type: string;
  value: string;
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