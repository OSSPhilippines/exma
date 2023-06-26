//types
import type { Match, Token, Node } from '../types';
import type Lexer from './Lexer';
//helpers
import Exception from './Exception';

export default class Parser {
  //the list of definisions
  protected _lexer: Lexer;
  //the code to parse
  protected _code: string = '';
  //the current index
  protected _index = 0;

  /**
   * Returns the current index
   */
  get index() {
    return this._index;
  }

  /**
   * Returns the lexer
   */
  get lexer() {
    return this._lexer;
  }

  /**
   * Just sets the code and lexer 
   */
  constructor(lexer: Lexer) {
    this._lexer = lexer;
  }

  /**
   * Loads the code
   */
  load(code: string) {
    this._code = code;
    this._index = 0;
    return this;
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
   * Returns a token that matches any of the given names
   */
  public expect(names: string|string[]) {
    if (!Array.isArray(names)) {
      names = [names];
    }
    //get definition
    const definitions = names
      .map(name => this._lexer.get(name))
      .filter(Boolean);
    //throw if no definition
    if (!definitions.length) {
      throw Exception.for(
        'Unknown definitions %s', 
        names.join(', ')
      );
    }
    const start = this._index;
    let value = '';
    let last: Match[]|undefined = undefined;
    while (this._index < this._code.length) {
      //get the next character (and increment index afterwards)
      const char = this._code[this._index++];
      //see what this matches
      const matches = this._lexer
        .match(value + char, names)
        .filter(match => names.includes(match.name));
      //if no matches
      if (matches.length === 0) {
        //if we never had a match
        if (!last) {
          //add character to value anyways
          value += char;
          //let it keep parsing
          continue;
        }
        //go back one
        --this._index;
        //if we do not have a value
        if (value.length === 0) {
          //throw exception
          throw Exception.for('Unexpected "%s"', char);
        }
        //done
        return this._token(value, start, names, last);
      }
      //add character to value
      value += char;
      //remember last match
      last = matches;
      //console.log('match', value, matches)
    }
    //no more code...
    //did it end with a match?
    if (last && value.length) {
      //done
      return this._token(value, start, names, last);
    }
    //throw if we got through without returning
    throw Exception.for('Expected %s', names.join(' or '));
  }

  /**
   * Converts a token into an AST node
   */
  public node<T extends Node = Node>(token: Token, withBody = false) {
    const definition = this._lexer.get(token.name);
    if (!definition) {
      throw Exception.for('Unknown definition %s', token.name);
    }
    const node = {
      type: token.name,
      value: token.value,
      start: token.start,
      end: token.end
    } as T;

    if (withBody) {
      node.body = [];
    }

    return node as T;
  }

  /**
   * Tries to create a token given the results from the parser
   */
  protected _token(
    value: string, 
    start: number, 
    names: string[], 
    matches: Match[]
  ) {
    //get the first positive match
    const match = matches.filter(match => match.match === 1)[0];
    //if no match
    if (!match) {
      //throw exception
      throw Exception.for('Expected %s', names.join(' or '));
    }
    return { 
      name: match.name, 
      value, 
      start, 
      end: this._index, 
      match
    } as Token;
  }
}