import type { Syntax } from './types';
const definitions: Record<string, RegExp|Syntax> = {
  'line': /^[\n\r]+$/,
  'space': /^[ ]+$/,
  'whitespace': /^\s+$/,
  '//': /^\/\*(?:(?!\*\/).)+\*\/$/s,
  '/**/': /^\/\/[^\n\r]+[\n\r]*$/,
  ')': /^\)$/,
  '(': /^\($/,
  '}': /^\}$/,
  '{': /^\{$/,
  ']': /^\]$/,
  '[': /^\[$/,
  'Null': (code: string, index: number) => {
    return code.substring(index, index + 4) === 'null' 
      ? { end: index + 4, value: null }
      : undefined; 
  },
  'Boolean': (code, index) => {
    if (code.substring(index, index + 4) === 'true') {
      return { end: index + 4, value: true };
    }
    if (code.substring(index, index + 5) === 'false') {
      return { end: index + 5, value: false };
    }
    return undefined;
  },
  'String': (code, index) => {
    if (code.charAt(index) !== '"') {
      return undefined;
    }

    const end = code.indexOf('"', index + 1) + 1;
    if (end === -1) {
      return undefined;
    }

    return { end, value: code.slice(index + 1, end - 1) };
  },
  'Float': (code, index) => {
    let value = '';
    let matched = false;
    while (index < code.length) {
      //get the character (and increment index afterwards)
      const char = code.charAt(index++);
      if (!/^\d+\.\d+$/.test(value + char)) {
        //if number then dot (optional)
        if (/^\d+\.{0,1}$/.test(value + char)) {
          //add character to value anyways
          value += char;
          //let it keep parsing
          continue;
        }
        //if we do not have a value
        if (value.length === 0) {
          return undefined;
        }
        //return where we ended
        return { end: index - 1, value: parseFloat(value) };
      }
      //add character to value
      value += char;
      //remember last match
      matched = true;
    }
    //no more code...
    //did it end with a match?
    return matched && value.length
      ? { end: index, value: parseFloat(value) }
      : undefined;
  },
  'Integer': (code, index) => {
    if (!/^[0-9]$/.test(code.charAt(index))) {
      return undefined;
    }

    let value = code.charAt(index);
    while (index < code.length) {
      const char = code.charAt(++index);
      if (!/^[0-9]+$/.test(value + char)) {
        return { end: index - 1, value: parseInt(value) };
      }
      value += char;
    }
    
    if (/^[0-9]+$/.test(value)) {
      return { end: index, value: parseInt(value) };
    }
    return undefined;
  },
  'Array': (code, index, lexer) => {
    const array: any[] = [];
    const subparser = lexer.clone().load(code, index);
    try {
      subparser.expect('[');
      subparser.optional('whitespace');
      while (subparser.next(args)) {
        const value = subparser.expect(args);
        subparser.optional('whitespace');
        array.push(value.value);
      }
      subparser.expect(']');
    } catch(e) {
      return undefined;
    }
    
    return { end: subparser.index, value: array };
  },
  'ObjectKey': /^[a-z0-9_]+$/i,
  'Object': (code, index, lexer) => {
    const object: Record<string, any> = {};
    const subparser = lexer.clone().load(code, index);
    try {
      subparser.expect('{');
      subparser.optional('whitespace');
      while (subparser.next('ObjectKey')) {
        const key = subparser.expect('ObjectKey');
        subparser.expect('whitespace');
        const value = subparser.expect(args);
        subparser.optional('whitespace');
        object[key.value] = value.value;
      }
      subparser.expect('}');
    } catch(e) {
      return undefined;
    }
    return { end: subparser.index, value: object };
  }
};

export const args = [
  'Null',  'Boolean', 'String',
  'Float', 'Integer', 'Object',
  'Array'
];

export default definitions;