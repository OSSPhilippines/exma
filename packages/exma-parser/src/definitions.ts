const definitions = {
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
  'Null': /^null$/,
  'True': /^true$/,
  'False': /^false$/,
  'String': /^"[^"]*"$/,
  'Float': (value: string) => /^\d+\.$/.test(value) ? 0: /^\d+\.\d+$/.test(value) ? 1: -1,
  'Integer': /^\d+$/,
  'Object': (value: string) => {
    //const opens = value.match(/\{/);
    //const closes = value.match(/\}/);
  },
  'Type': /^[a-z]+$/,
  'Parameter': /^@[a-z][a-z0-9_\.]*$/
};

export const args = [
  'Null',    'True', 'False',
  'String',  'Null', 'Float',
  'Integer', 'ObjectIdentifier'
];

export default definitions;