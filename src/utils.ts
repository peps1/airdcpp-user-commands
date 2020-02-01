'use strict';

import child_process from 'child_process';
import os from 'os';

const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

// Format bytes to MiB, GiB, TiB
export let formatSize = (fileSizeInBytes: number): string => {
  let result: string;
  const thresh = 1024;
  if (Math.abs(fileSizeInBytes) < thresh) {
    return fileSizeInBytes + ' B';
  }

  let u = -1;
  do {
    fileSizeInBytes /= thresh;
    ++u;
  } while (Math.abs(fileSizeInBytes) >= thresh && u < byteUnits.length - 1);

  result = fileSizeInBytes.toFixed(2) + ' ' + byteUnits[u];
  return result;
};

// AirDC Client uptime
export let clientUptime = (startTime: number): number => {
  const now = Math.round(Date.now() / 1000);
  const seconds = Math.abs(now - startTime);
  return seconds;
};

// Format nicely (151 days 18 hours 58 minutes 25 seconds)
export let formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor(((seconds % 86400) % 3600) / 60);
  const s = Math.floor(((seconds % 86400) % 3600) % 60);

  const dDisplay = d > 0 ? d + (d === 1 ? ' day ' : ' days ') : '';
  const hDisplay = h > 0 ? h + (h === 1 ? ' hour ' : ' hours ') : '';
  const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
  const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

// Works only for directories
export let getLastDirectory = (fullPath: string) => {
  const result = fullPath.match(/([^\\\/]+)[\\\/]$/);
  return result ? result[1] : fullPath;
};

// Extracting OS info
// Windows: Microsoft Windows 10.0.19041.1
// Linux: Debian GNU/Linux 10 (buster) / Ubuntu 18.04.3 LTS
export let getOsInfo = () => {
  let osInfo;
  const errors = [] as any;

  if (os.platform() === 'win32') {
    const winVer = child_process
      .execSync('ver')
      .toString()
      .trim();
    const r = /(Version )|[[\]]/g;
    osInfo = winVer.replace(r, '');
  } else if (os.platform() === 'linux') {
    try {
      osInfo = child_process
        .execSync('. /etc/os-release && echo $PRETTY_NAME')
        .toString()
        .trim();
    } catch (e) {
      osInfo = 'Unknown Linux';
      errors.push(e);
    }
  } else if (os.platform() === 'darwin') {
    osInfo = `MacOS ${os.release()}`;
  } else if (os.platform() === 'netbsd' || os.platform() === 'freebsd') {
    try {
      osInfo = child_process
        .execSync('uname -mrs')
        .toString()
        .trim();
    } catch (e) {
      osInfo = 'Unknown BSD';
      errors.push(e);
    }
  } else {
    osInfo = 'Unknown OS';
  }

  return [osInfo, errors];
};

export let sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export let parseSearchQuery = (item: { pattern: any; extensions: string; file_type: any; min_size: number; }) => {
  return {
    pattern: item.pattern,
    extensions: item.extensions.split(';'),
    file_type: item.file_type,
    min_size: item.min_size * 1024 * 1024,
  };
};
