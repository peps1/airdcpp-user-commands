
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import assert from 'assert';
import ChildProcess from 'child_process';
import os from 'os';

import { clientUptime, formatSize, formatNetSpeed, formatUptime, formatDateTime, getLastDirectory, sleep, cleanUsername, getOsInfo } from '../utils';

describe('clientUptime', () => {
  it('Should return 4322 seconds', () => {
    const dateStub = sinon.stub(Date, 'now').returns(1654321987);
    const seconds = 1650000;

    expect(clientUptime(seconds)).to.equal(4322);
    dateStub.restore();
  });
});

describe('formatDateTime', () => {
  it('Should properly format date time', () => {
    expect(formatDateTime('2020-10-05T14:48:00.000Z')).to.equal('2020-10-05_144800')
  });
});


describe('getOsInfo', () => {
  it('Should return OS info (Windows)', () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(os, 'platform').returns('win32')
    sandbox.stub(ChildProcess, 'execSync').returns(Buffer.from('Microsoft Windows [Version 10.0.20226.1000]'))

    expect(getOsInfo().toString()).to.equal(['Microsoft Windows 10.0.20226.1000', []].toString())
    sandbox.restore();
  });
  it('Should return OS info (Linux)', () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(os, 'platform').returns('linux')
    sandbox.stub(ChildProcess, 'execSync').returns(Buffer.from('Ubuntu 20.04.1 LTS'))

    expect(getOsInfo().toString()).to.equal(['Ubuntu 20.04.1 LTS', []].toString())
    sandbox.restore();
  });
  it('Should return OS info (BSD)', () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(os, 'platform').returns('netbsd')
    sandbox.stub(ChildProcess, 'execSync').returns(Buffer.from('FreeBSD 11.2-RELEASE-p4 amd64'))

    expect(getOsInfo().toString()).to.equal(['FreeBSD 11.2-RELEASE-p4 amd64', []].toString())
    sandbox.restore();
  });
});


describe('cleanUsername', () => {
  it('Should properly clean Username', () => {
    expect(cleanUsername('-- *:|"some <>U%sern//\?me')).to.equal('-- ----some --U-sern---me')
  });
});

describe('formatUptime', () => {
  it('Should properly format seconds to human readable time since', () => {
    expect(formatUptime(54321987)).to.equal('628 days 17 hours 26 minutes 27 seconds')
  });
});

describe('formatNetSpeed', () => {
  it('Should properly format seconds to human readable time since', () => {
    expect(formatNetSpeed(154321987)).to.equal('147.17MB')
  });
});

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