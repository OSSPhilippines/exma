import { describe, it } from 'mocha';
import { expect } from 'chai';
import PropTree from '../src/trees/PropTree';

describe('Prop Tree', () => {
  it('Should parse Prop', async () => {
    const actual = PropTree.parse(`prop Foobar { foo "bar" bar 4.4 zoo { foo false bar null } }`);
    expect(actual.type).to.equal('prop');
    expect(actual.value).to.equal('Foobar');
    expect(actual.body[0].type).to.equal('Object');
    expect(actual.body[0].value.foo).to.equal('bar');
    expect(actual.body[0].value.bar).to.equal(4.4);
    expect(actual.body[0].value.zoo.foo).to.equal(false);
    expect(actual.body[0].value.zoo.bar).to.equal(null);
  });
});
