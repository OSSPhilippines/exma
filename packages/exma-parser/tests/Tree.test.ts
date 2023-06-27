import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Tree from '../src/types/Tree';

use(deepEqualInAnyOrder);

describe('Tree', () => {
  it('Should parse type', async () => {
    //const code = fs.readFileSync(`${__dirname}/assets/v2/type.exma`, 'utf8');
    //const expected = require('./assets/v2/type.json');
    //const actual = Tree.build(code);
    //console.log(JSON.stringify(actual, null, 2));
    //expect(actual).to.deep.equalInAnyOrder(expected);
  })
  it('Should parse props', async () => {
    //const code = fs.readFileSync(`${__dirname}/assets/v2/props.exma`, 'utf8');
    //const expected = require('./assets/v2/props.json');
    //const actual = Tree.build(code);
    //console.log(JSON.stringify(actual, null, 2));
    //expect(actual).to.deep.equalInAnyOrder(expected);
  })
  it('Should parse model', async () => {
    const code = fs.readFileSync(`${__dirname}/assets/v2/model.exma`, 'utf8');
    const expected = require('./assets/v2/model.json');
    const actual = Tree.build(code);
    console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  })
})
