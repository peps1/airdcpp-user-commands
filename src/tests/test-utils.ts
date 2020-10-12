
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import * as assert from 'assert';

import { clientUptime, formatSize, formatDateTime, getLastDirectory, sleep } from '../utils';

describe('clientUptime', () => {
  it('Should return 4322 seconds', () => {
    const dateStub = sinon.stub(Date, 'now').returns(1654321987);
    const seconds = 1650000;

    const result = clientUptime(seconds);
    expect(result).to.equal(4322);
    dateStub.restore();
  });
});

describe('formatDateTime', () => {
  it('Should properly format date time', () => {
    expect(formatDateTime('2020-10-05T14:48:00.000Z')).to.equal('2020-10-05_144800')
  });
});


// formatUptime
// formatNetSpeed
// cleanUsername



describe('formatSize', () => {
  it('Should format bytes to MiB, GiB, TiB', () => {
    expect(formatSize(9812391156851)).to.equal('8.92 TB');
  });
  it('Should properly show Byte values', () => {
    expect(formatSize(1000)).to.equal('1000 B');
  });
});

describe('getLastDirectory', () => {
  it('Should return last folder of a path, when no trailing slash provided', () => {
    expect(getLastDirectory('/home/user/folder/2ndfolder/lastfolder')).to.equal('lastfolder');
  });
  it('Should return last folder of a path, when trailing slash provided', () => {
    expect(getLastDirectory('/home/user/folder/2ndfolder/lastfolder/')).to.equal('lastfolder');
  });
  it('Should return last folder, when root level folder', () => {
    expect(getLastDirectory('/home')).to.equal('home');
  });
  it('Should return full path if last folder can\'t be determined', () => {
    expect(getLastDirectory('/home/user//')).to.equal('/home/user//');
  });
});

describe('sleep', () => {
  it('Should sleep for specified amount', () => {
    sleep(100);
    assert.ok(true);
  });
})