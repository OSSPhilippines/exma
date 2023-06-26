//types
import type { Syntax, Definition, Match } from '../types';

export default class Lexer {
  //a collection of definitions
  protected _dictionary: Record<string, Syntax> = {};

  /**
   * Makes a new definition
   */
  define(name: string, test: RegExp|Syntax) {
    if (test instanceof RegExp) {
      const regexp = test as RegExp;
      test = (value: string) => {
        const match = value.match(regexp);
        return match ? 1 : -1;
      };
    }
    this._dictionary[name] = test;
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
      //add the name to the dictionary
      .map(name => ({ name, syntax: this.get(name) }))
      //filter out undefined tests
      .filter(definition => Boolean(definition.syntax));
    //storage for matches
    const matches: Match[] = [];
    //loop through dictionary
    for (const { name, syntax } of (dictionary as Definition[])) {
      const match = syntax(value);
      //if test results in 0 or 1
      if (syntax(value) >= 0 ) {
        //add to matches
        matches.push({ name, match: match as 0|1 });
      }
    }

    return matches;
  }
}