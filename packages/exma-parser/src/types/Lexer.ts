//types
import type { Syntax, Definition, Match } from '../types';

export default class Lexer {
  //a collection of definitions
  protected _dictionary: Record<string, Definition> = {};

  /**
   * Returns the shallow copy of the dictionary
   */
  get dictionary() {
    const dictionary: Record<string, Definition> = {};
    for (const name in this._dictionary) {
      dictionary[name] = { ...this._dictionary[name] };
    }
    return dictionary;
  }

  /**
   * Makes a new definition
   */
  define(name: string, syntax: RegExp|Syntax, label?: string) {
    if (syntax instanceof RegExp) {
      const regexp = syntax as RegExp;
      syntax = (value: string) => {
        const match = value.match(regexp);
        return match ? 1 : -1;
      };
    }
    this._dictionary[name] = { name, label: label || name, syntax };
  }

  /**
   * Returns the test for a given definition
   */
  get(name: string) {
    return this._dictionary[name];
  }

  /**
   * Returns all the matching definitions for a given value
   */
  match(value: string, names?: string[]) {
    //if no names, get all names
    names = names || Object.keys(this._dictionary);
    //make the dictionary based on the order of names
    const dictionary = names
      //add the definitions to dictionary
      .map(name => this.get(name))
      //filter out undefined definitions
      .filter(definition => Boolean(definition.syntax));
    //storage for matches
    const matches: Match[] = [];
    //loop through dictionary
    for (const { name, label, syntax } of (dictionary as Definition[])) {
      const match = syntax(value);
      //if test results in 0 or 1
      if (syntax(value) >= 0 ) {
        //add to matches
        matches.push({ name, label, match: match as 0|1 });
      }
    }
    return matches;
  }
}