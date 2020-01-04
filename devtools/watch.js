'use strict';

const webpack = require('webpack');
const nodemon = require('nodemon');

const path = require('path');

const webpackConfig = require('../webpack.config.js');


let started = false;

webpack(webpackConfig).watch(1000, function(err, stats) {
	if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
	}

	const info = stats.toJson();
	if (stats.hasErrors()) {
		console.error(info.errors);
		return;
	}

	if (stats.hasWarnings()) {
		console.warn(info.warnings)
	}

	if (!started) {
		started = true;

		const serverPath = path.resolve(__dirname, 'dev-server.js');
		nodemon({
			execMap: {
				js: 'node --inspect'
			},
			args: process.argv.length > 2 ? process.argv.slice(2) : [ path.resolve(__dirname, '../dist/main.js') ],
			script: serverPath,

			// Don't watch anything
			ignore: ['*'],
			watch: ['foo/'],
			ext: 'noop'
		}).on('restart', function() {
			// Restart finished
		});
	} else {
		console.log('Changes detected, restarting...');
		nodemon.restart();
	}
});
