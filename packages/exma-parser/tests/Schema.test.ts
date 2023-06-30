import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import SchemaTree from '../src/trees/SchemaTree';
import Compiler from '../src/types/Compiler';

use(deepEqualInAnyOrder);

describe('Schema Tree', () => {
  it('Should parse Schema', async () => {
    const actual = SchemaTree.parse(fs.readFileSync(`${__dirname}/assets/v2/schema.exma`, 'utf8'));
    const schema = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/schema.json`, 'utf8'));
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(schema);

    //console.log(JSON.stringify(Compiler.schema(actual, true), null, 2));
    const references = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/references.json`, 'utf8'));
    expect(Compiler.schema(actual)).to.deep.equalInAnyOrder(references);
    const final = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/final.json`, 'utf8'));
    expect(Compiler.schema(actual, true)).to.deep.equalInAnyOrder(final);
  });
});
