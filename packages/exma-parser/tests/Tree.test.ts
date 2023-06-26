import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Tree from '../src/types/Tree';

use(deepEqualInAnyOrder);

describe('Tree', () => {
  it('Should parse type', async () => {
    const code = fs.readFileSync(`${__dirname}/assets/object.exma`, 'utf8');
    //const expected = require('./assets/schema.json');
    const actual = Tree.build(code);
    console.log(JSON.stringify(actual, null, 2));
    //expect(actual).to.deep.equalInAnyOrder(expected);
  })
  it('Should parse object', async () => {
    const code = fs.readFileSync(`${__dirname}/assets/object.exma`, 'utf8');
    //const expected = require('./assets/schema.json');
    const actual = Tree.build(code);
    console.log(JSON.stringify(actual, null, 2));
    //expect(actual).to.deep.equalInAnyOrder(expected);
  })
  it('Should parse model', async () => {
    const code = fs.readFileSync(`${__dirname}/assets/schema.exma`, 'utf8');
    const expected = require('./assets/schema.json');
    const actual = Tree.build(code);
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  })
})
