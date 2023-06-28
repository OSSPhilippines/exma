import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import SchemaTree from '../src/trees/SchemaTree';

use(deepEqualInAnyOrder);

describe('Schema Tree', () => {
  it('Should parse Schema', async () => {
    const actual = SchemaTree.parse(fs.readFileSync(`${__dirname}/assets/v2/schema.exma`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/schema.json`, 'utf8'));
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  });
});
