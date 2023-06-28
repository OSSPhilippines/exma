import { describe, it } from 'mocha';
import { expect } from 'chai';
import EnumTree from '../src/trees/EnumTree';

describe('Enum Tree', () => {
  it('Should parse Enums', async () => {
    const actual = EnumTree.parse(`enum Foobar { FOO "bar" BAR "foo" }`);
    expect(actual.type).to.equal('enum');
    expect(actual.value).to.equal('Foobar');
    expect(actual.body[0].type).to.equal('Identifier');
    expect(actual.body[0].value).to.equal('FOO');
    expect(actual.body[1].type).to.equal('String');
    expect(actual.body[1].value).to.equal('bar');
    expect(actual.body[2].type).to.equal('Identifier');
    expect(actual.body[2].value).to.equal('BAR');
    expect(actual.body[3].type).to.equal('String');
    expect(actual.body[3].value).to.equal('foo');
    
  });
});
