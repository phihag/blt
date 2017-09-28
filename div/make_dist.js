'use strict';

const async = require('async');
const fs = require('fs');
const path = require('path');
const process = require('process');

function transform_file(in_fn, out_fn, func, cb) {
	fs.readFile(in_fn, 'utf8', function (err, content) {
		if (err) {
			return cb(err);
		}

		content = func(content);

		fs.writeFile(out_fn, content, 'utf8', function(err) {
			cb(err);
		});
	});
}

function transform_files(in_files, out_dir, func, cb) {
	async.map(in_files, function(fn, cb) {
		const out_fn = path.join(out_dir, path.basename(fn));
		transform_file(fn, out_fn, func, function(err) {
			cb(err, out_fn);
		});
	}, function(err, out_files) {
		return cb(err, out_files);
	});
}

function ensure_mkdir(path, cb) {
	fs.mkdir(path, 0x1c0, function(err) {
		if (err && err.code == 'EEXIST') {
			return cb(null);
		}
		cb(err);
	});
}

// From http://stackoverflow.com/a/14387791/35070
function copy_file(source, target, cb) {
	var cbCalled = false;

	const rd = fs.createReadStream(source);
	rd.on('error', function(err) {
		done(err);
	});
	const wr = fs.createWriteStream(target);
	wr.on('error', function(err) {
		done(err);
	});
	wr.on('close', function() {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}

function transform_js(js) {
	return js.replace(/\/\*\s*@DEV\s*\*\/[\s\S]*?\/\*\s*\/@DEV\s*\*\//g, '');
}

function transform_html(html) {
	html = html.replace(/<!--@DEV-->[\s\S]*?<!--\/@DEV-->/g, '');
	html = html.replace(/<!--@PRODUCTION([\s\S]*?)-->/g, function(m, m1) {return m1;});
	html = html.replace(/PRODUCTIONATTR-/g, '');
	return html;
}

function convert_templates(templates_dir, templates_dist_dir, callback) {
	async.waterfall([
		(cb) => ensure_mkdir(templates_dist_dir, cb),
		(cb) => fs.readdir(templates_dir, cb),
		(basenames, cb) => {
			const template_paths = basenames.map(bn => path.join(templates_dir, bn));
			transform_files(template_paths, templates_dist_dir, transform_html, cb);
		},
	], callback);
}

function convert_static(static_dir, static_dist_dir, callback) {
	async.waterfall([
		(cb) => ensure_mkdir(static_dist_dir, cb),
		(cb) => fs.readdir(static_dir, cb),
		(basenames, cb) => {
			async.each(basenames, (basename, cb) => {
				const in_fn = path.join(static_dir, basename);
				const out_fn = path.join(static_dist_dir, basename);

				if (basename.endsWith('.js')) {
					transform_file(in_fn, out_fn, transform_js, cb);
				} else if (/\.(?:css|ico|svg)$/.test(basename)) {
					copy_file(in_fn, out_fn, cb);
				}
			}, cb);
		},
	], callback);
}

function main() {
	const args = process.argv.slice(2);
	const dev_dir = args[0];
	const dist_dir = args[1];

	if (! dev_dir || !dist_dir) {
		console.error('Usage: make_dist.js DEV_DIR DIST_DIR'); // eslint-disable-line no-console
		process.exit(3);
		return;
	}

	async.parallel([
		// mustache template files
		(cb) => {
			const templates_dir = path.join(dev_dir, 'templates');
			const templates_dist_dir = path.join(dist_dir, 'templates');
			convert_templates(templates_dir, templates_dist_dir, cb);
		},
		// static files
		(cb) => {
			const static_dir = path.join(dev_dir, 'static');
			const static_dist_dir = path.join(dist_dir, 'static');

			convert_static(static_dir, static_dist_dir, cb);
		},
	], function (err) {
		if (err) {
			throw err;
		}
	});
}

main();
