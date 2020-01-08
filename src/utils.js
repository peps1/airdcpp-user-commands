'use strict';

const os		= require('os');

const byteUnits = [ 'kB','MB','GB','TB','PB','EB','ZB','YB' ];

const priorityEnum = [
	{
		id: -1,
		name: 'Paused (forced)',
	}, {
		id: 0,
		name: 'Paused',
	}, {
		id: 1,
		name: 'Lowest',
	}, {
		id: 2,
		name: 'Low',
	}, {
		id: 3,
		name: 'Normal',
	}, {
		id: 4,
		name: 'High',
	}, {
		id: 5,
		name: 'Highest',
	}
];

const fileTypeEnum = [
	{
		id: 'any',
		name: 'Any',
	}, {
		id: 'directory',
		name: 'Directory',
	}, {
		id: 'file',
		name: 'File',
	}, {
		id: 'audio',
		name: 'Audio',
	}, {
		id: 'compressed',
		name: 'Compressed',
	}, {
		id: 'document',
		name: 'Document',
	}, {
		id: 'executable',
		name: 'Executable',
	}, {
		id: 'picture',
		name: 'Picture',
	}, {
		id: 'video',
		name: 'Video',
	}
];

module.exports = {
	// Format bytes to MiB, GiB, TiB
	formatSize: function (fileSizeInBytes) {
		const thresh = 1024;
		if (Math.abs(fileSizeInBytes) < thresh) {
			return fileSizeInBytes + ' B';
		}

		let u = -1;
		do {
			fileSizeInBytes /= thresh;
			++u;
		} while (Math.abs(fileSizeInBytes) >= thresh && u < byteUnits.length - 1);

		return fileSizeInBytes.toFixed(2) + ' ' + byteUnits[u];
	},

	// AirDC Client uptime
	clientUptime: function (startTime) {

		var now = Math.round(Date.now() / 1000)
		var seconds = Math.abs(now - startTime);
		return seconds
	},

	// Format nicely (151 days 18 hours 58 minutes 25 seconds)
	formatUptime: function (seconds) {
    var d = Math.floor(seconds / 86400);
    var h = Math.floor(seconds % 86400 / 3600);
    var m = Math.floor(seconds % 86400 % 3600 / 60);
    var s = Math.floor(seconds % 86400 % 3600 % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
		return dDisplay + hDisplay + mDisplay + sDisplay;
	},

	// Works only for directories
	getLastDirectory: function (fullPath) {
		const result = fullPath.match(/([^\\\/]+)[\\\/]$/);
		return result ? result[1] : fullPath;
	},

	// Extracting OS info
	// Windows: Microsoft Windows 10.0.19041.1
	// Linux: Debian GNU/Linux 10 (buster) / Ubuntu 18.04.3 LTS
	getOsInfo: function () {

		var os_info;
		var e = null;

		if (os.platform() == "win32") {
			const win_ver = require('child_process').execSync('ver').toString().trim();
			const r = /(Version )|[[\]]/g
			os_info = win_ver.replace(r, "")
		}
		else if (os.platform() == "linux") {
			try {
				os_info = require('child_process').execSync('. /etc/os-release && echo $PRETTY_NAME').toString().trim();
			} catch (e) {
				os_info = `Unknown Linux ${e}`;
			}
		}
		else if (os.platform() == "darwin") {
			os_info = `MacOS ${os.release()}`
		}
		else if (
			os.platform() == "netbsd" ||
			os.platform() == "freebsd"
		) {
			try {
				os_info = require('child_process').execSync('uname -mrs').toString().trim();
			} catch (e) {
				os_info = "Unknown BSD";
			}
		}
		else {
			os_info = "Unknown OS";
		}

		return [os_info, e];
	},

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	parseSearchQuery(item) {
		return {
			pattern: item.pattern,
			extensions: item.extensions.split(';'),
			file_type: item.file_type,
			min_size: item.min_size * 1024 * 1024,
		};
	},

	searchQueryDefinitions: [
		{
			key: 'pattern',
			title: 'Search string',
			default_value: '',
			type: 'string',
			optional: true,
		}, {
			key: 'extensions',
			title: 'File extensions',
			default_value: '',
			type: 'string',
			help: 'Separate extensions with ; (example: exe;iso;img)',
			optional: true,
		}, {
			key: 'file_type',
			title: 'File type',
			default_value: 'any',
			type: 'string',
			options: fileTypeEnum,
		}, {
			key: 'min_size',
			title: 'Minimum size (MiB)',
			default_value: 0,
			type: 'number',
		}
	],

	fileTypeEnum,
	priorityEnum,
};