import type { Syntax, Node } from './types';
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
      ? { 
        end: index + 4, 
        value: null, 
        node: { 
          type: 'Literal', 
          start: index,
          end: index + 4,
          value: null,
          raw: 'null'
        } 
      } : undefined; 
  },
  'Boolean': (code, index) => {
    if (code.substring(index, index + 4) === 'true') {
      return { 
        end: index + 4, 
        value: true, 
        node: { 
          type: 'Literal', 
          start: index,
          end: index + 4,
          value: true,
          raw: 'true'
        } 
      };
    }
    if (code.substring(index, index + 5) === 'false') {
      return { 
        end: index + 5, 
        value: false, 
        node: { 
          type: 'Literal', 
          start: index,
          end: index + 5,
          value: false,
          raw: 'false'
        } 
      };
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

    const value = code.slice(index + 1, end - 1);

    return { 
      end, 
      value,
      node: {
        type: 'Literal',
        start: index,
        end,
        value,
        raw: `'${value}'`
      }
    };
  },
  'Float': (code, index) => {
    let value = '';
    let matched = false;
    const start = index;
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
        return { 
          end: index - 1, 
          value: parseFloat(value),
          node: {
            type: 'Literal',
            start,
            end: index - 1,
            value: parseFloat(value),
            raw: `${value}`
          }
        };
      }
      //add character to value
      value += char;
      //remember last match
      matched = true;
    }
    //no more code...
    //did it end with a match?
    return matched && value.length
      ? { 
        end: index, 
        value: parseFloat(value) ,
        node: {
          type: 'Literal',
          start,
          end: index,
          value: parseFloat(value),
          raw: `${value}`
        }
      } : undefined;
  },
  'Integer': (code, index) => {
    if (!/^[0-9]$/.test(code.charAt(index))) {
      return undefined;
    }
    const start = index;
    let value = code.charAt(index);
    while (index < code.length) {
      const char = code.charAt(++index);
      if (!/^[0-9]+$/.test(value + char)) {
        return { 
          end: index - 1, 
          value: parseInt(value),
          node: {
            type: 'Literal',
            start,
            end: index - 1,
            value: parseInt(value),
            raw: `${value}`
          }
        };
      }
      value += char;
    }
    
    if (/^[0-9]+$/.test(value)) {
      return { 
        end: index, 
        value: parseInt(value),
        node: {
          type: 'Literal',
          start,
          end: index,
          value: parseInt(value),
          raw: `${value}`
        }
      };
    }
    return undefined;
  },
  'Array': (code, index, lexer) => {
    const elements: Node[] = [];
    const array: any[] = [];
    const subparser = lexer.clone().load(code, index);
    try {
      subparser.expect('[');
      subparser.optional('whitespace');
      while (subparser.next(args)) {
        const value = subparser.expect(args);
        subparser.optional('whitespace');
        array.push(value.value);
        if (typeof value.node !== 'undefined') {
          elements.push(value.node);
        }
      }
      subparser.expect(']');
    } catch(e) {
      return undefined;
    }
    
    return { 
      end: subparser.index, 
      value: array,
      node: {
        type: 'ArrayExpression',
        start: index,
        end: subparser.index,
        elements
      }
    };
  },
  'ObjectKey': /^[a-z0-9_]+$/i,
  'Object': (code, index, lexer) => {
    const properties: any[] = [];
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
        if (typeof value.node !== 'undefined') {
          properties.push({
            type: 'Property',
            start: key.start,
            end: value.node.end,
            key: {
              type: 'Identifier',
              start: key.start,
              end: key.end,
              name: key.value
            },
            value: value.node
          });
        }
      }
      subparser.expect('}');
    } catch(e) {
      return undefined;
    }
    return { 
      end: subparser.index, 
      value: object,
      node: {
        type: 'ObjectExpression',
        start: index,
        end: subparser.index,
        properties
      }
    };
  }
};

export const args = [
  'Null',  'Boolean', 'String',
  'Float', 'Integer', 'Object',
  'Array'
];

export default definitions;