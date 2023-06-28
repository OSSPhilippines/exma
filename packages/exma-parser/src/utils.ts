//types
import type { Match } from './types';

export function defaultSyntax(regexp: RegExp, code: string, index: number) {
  let value = '';
  let matched = false;
  while (index < code.length) {
    //get the character (and increment index afterwards)
    const char = code.charAt(index++);
    if (!regexp.test(value + char)) {
      //if we never had a match
      if (!matched) {
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
      return { end: index - 1, value };
    }
    //add character to value
    value += char;
    //remember last match
    matched = true;
  }
  //no more code...
  //did it end with a match?
  return matched && value.length
    ? { end: index, value } as Match
    : undefined;
};