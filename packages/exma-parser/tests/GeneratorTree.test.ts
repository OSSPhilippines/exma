import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import GeneratorTree from '../src/trees/GeneratorTree';

use(deepEqualInAnyOrder);

describe('Enum Tree', () => {
  it('Should parse Generator', async () => {
    const actual = GeneratorTree.parse(fs.readFileSync(`${__dirname}/assets/v2/generator.exma`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/generator.json`, 'utf8'));
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  });
});
