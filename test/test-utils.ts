
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { clientUptime } from '../src/utils';

describe('clientUptime', () => {
  it('Should return 4322 seconds', () => {
    const dateStub = sinon.stub(Date, 'now').returns(1654321987);
    const seconds = 1650000;

    const result = clientUptime(seconds);
    expect(result).to.equal(4322);
    dateStub.restore();

  });


});
