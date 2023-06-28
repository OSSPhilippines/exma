//types
import type { 
  Token,
  Syntax, 
  Definition, 
  LexerInterface
} from '../types';
//helpers
import { defaultSyntax } from '../utils';
import Exception from './Exception';

export default class Lexer implements LexerInterface {
  //the code to parse
  protected _code: string = '';
  //the current index
  protected _index = 0;
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
   * Returns the current index
   */
  get index() {
    return this._index;
  }

  /**
   * Clones the lexer at it's exact state
   */
  public clone() {
    const lexer = new Lexer();
    lexer.load(this._code, this._index);
    for (const name in this._dictionary) {
      lexer.define(
        name,
        this._dictionary[name].syntax,
        this._dictionary[name].label
      );
    }
    return lexer;
  }

  /**
   * Makes a new definition
   */
  public define(name: string, syntax: RegExp|Syntax, label?: string) {
    if (syntax instanceof RegExp) {
      const regexp = syntax as RegExp;
      syntax = (code: string, index: number) => {
        return defaultSyntax(regexp, code, index);
      };
    }
    this._dictionary[name] = { name, label: label || name, syntax };
  }

  /**
   * Returns a token that matches any of the given names
   */
  public expect(names: string|string[]) {
    if (!Array.isArray(names)) {
      names = [names];
    }
    //get definition
    const definitions = names.map(
      name => this.get(name)
    ).filter(Boolean);
    //throw if no definition
    if (!definitions.length) {
      throw Exception.for(
        'Unknown definitions %s', 
        names.join(', ')
      );
    }
    //get match (sorted by names defined above)
    const match = this.match(this._code, this._index, names)[0];
    //if no match
    if (!match) {
      //throw exception
      if (this._code[this._index + 10]) {
        throw Exception.for(
          'Unexpected %s ... expecting %s', 
          this._code.substring(this._index, this._index + 10),
          names.join(' or ')
        );
      } else {
        throw Exception.for(
          'Unexpected %s expecting %s', 
          this._code.substring(this._index, this._index + 10),
          names.join(' or ')
        );
      }
      
    }
    //fast forward index
    this._index = match.end;
    return match;
  }

  /**
   * Returns the test for a given definition
   */
  public get(name: string) {
    return this._dictionary[name];
  }

  /**
   * Loads the code
   */
  public load(code: string, index = 0) {
    this._code = code;
    this._index = index;
    return this;
  }

  /**
   * Returns all the matching definitions for a given value
   */
  public match(code: string, start: number, names?: string[]) {
    //if no names, get all names
    names = names || Object.keys(this._dictionary);
    //make the dictionary based on the order of names
    const dictionary = names
      //add the definitions to dictionary
      .map(name => this.get(name))
      //filter out undefined definitions
      .filter(definition => Boolean(definition.syntax));
    //storage for matches
    const matches: Token[] = [];
    //loop through dictionary
    for (const { name, label, syntax } of (dictionary as Definition[])) {
      const results = syntax(code, start, this);
      //end is greater than start
      if (results && results.end > start) {
        //get the value
        const { value, end, node } = results;
        //add to matches
        matches.push({ name: label || name, value, start, end, node });
      }
    }
    return matches;
  }

  /**
   * Tests to see if the next set of characters match the given names
   */
  public next(names: string|string[]) {
    const start = this._index;
    try {
      this.expect(names);
      this._index = start;
      return true;
    } catch (error) {
      this._index = start;
      return false;
    }
  }

  /**
   * Possible returns a token that matches any of the given names 
   */
  public optional(names: string|string[]) {
    const start = this._index;
    try {
      return this.expect(names);
    } catch (error) {
      this._index = start;
      return undefined;
    }
  }

  /**
   * Reads ahead and tries determines the next token
   */
  public read() {
    return this.optional(Object.keys(this.dictionary));
  }
}