const {describe, it} = require('mocha');
const {expect}  = require('chai');

const sinon = require('sinon');
const Uptime = require('../src/utils');

describe('clientUptime', function() {
  it('Should return 4322 seconds', function() {
    let dateStub = sinon.stub(Date, 'now').returns(1654321987);
    let seconds = 1650000

    let result = Uptime.clientUptime(seconds);
    expect(result).to.equal(4322)
    dateStub.restore();

  });


});
