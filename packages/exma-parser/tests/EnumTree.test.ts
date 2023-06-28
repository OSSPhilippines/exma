import fs from 'fs';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import EnumTree from '../src/trees/EnumTree';

describe('Enum Tree', () => {
  it('Should parse Enums', async () => {
    const actual = EnumTree.parse(fs.readFileSync(`${__dirname}/assets/v2/enum.exma`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/assets/v2/enum.json`, 'utf8'));
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  });
});
