'use strict';

const assert = require('assert');
const child_process = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const async = require('async');
const extract_zip = require('extract-zip');
const rimraf = require('rimraf');

const render = require('./render');
const utils = require('./utils');

const ROOT_DIR = path.dirname(__dirname);
const TMP_ROOT = path.join(ROOT_DIR, 'tmp');
const ZIP_URL = 'https://aufschlagwechsel.de/bup.zip';


function rename(oldPath, newPath, callback) {
	fs.rename(oldPath, newPath, (err) => {
		if (!err || (err.code !== 'EXDEV')) return callback(err);

		// On AUFS (e.g. docker), rename is not supported:
		// https://docs.docker.com/engine/userguide/storagedriver/aufs-driver/#modifying-files-or-directories
		// Fall back to mv instead.
		child_process.execFile('mv', ['-T', '--', oldPath, newPath], (err, _stdout, stderr) => {
			if (err) {
				return callback(new Error(
					'mv -T -- ' + JSON.stringify(oldPath) + ' ' + JSON.stringify(newPath) + ' failed: ' + stderr));
			}

			callback();
		});
	});
}

function safe_rimraf(path, cb) {
	assert(path.includes('/tmp'));
	rimraf(path, cb);
}

function bupdate(callback) {
	const tmp_token = process.pid + '_' + Date.now() + '_' + crypto.randomBytes(4).readUInt32LE(0);
	const tmp_dir = path.join(TMP_ROOT, 'bupdate_tmp_' + tmp_token);
	const new_dir = path.join(tmp_dir, 'new');
	const zip_fn = path.join(tmp_dir, 'bup.zip');
	const final_dir = path.join(ROOT_DIR, 'bup');
	const backup_dir = path.join(TMP_ROOT, 'bupdate_tmp_oldbup_' + tmp_token);

	async.waterfall([
		(cb) => utils.ensure_mkdir(TMP_ROOT, cb),
		(cb) => utils.ensure_mkdir(tmp_dir, cb),
	(cb) => {
		utils.download_file(ZIP_URL, zip_fn, cb);
	}, (cb) => {
		const new_dir_abs = path.resolve(new_dir);
		extract_zip(zip_fn, {dir: new_dir_abs}, cb);
	}, (cb) => {
		const checksums_fn = path.join(new_dir, 'bup', 'checksums.json');
		fs.readFile(checksums_fn, 'utf8', cb);
	}, (checksums_json, cb) => {
		const checksums = JSON.parse(checksums_json);

		async.each(Object.keys(checksums), (vfn, cb) => {
			const file_checksums = checksums[vfn];
			const fn = path.join(new_dir, vfn);

			utils.sha512_file(fn, (err, sum) => {
				if (err) return cb(err);

				if (sum === file_checksums.sha512) {
					cb();
				} else {
					const msg = (
						'Incorrect checksum of ' + fn + ': ' +
						'Expected ' + sum + ', but is ' + file_checksums.sha512
					);
					cb(new Error(msg));
				}
			});
		}, cb);
	}, (cb) => {
		fs.stat(final_dir, err => cb(null, !err));
	}, (old_exists, cb) => {
		if (old_exists) {
			rename(final_dir, backup_dir, cb);
		} else {
			cb();
		}
	}, (cb) => {
		rename(path.join(new_dir, 'bup'), final_dir, cb);
	}, (cb) => {
		safe_rimraf(backup_dir, cb);
	}], (err) => {
		if (err) {
			safe_rimraf(tmp_dir, (rimraf_err) => {
				if (rimraf_err) {
					console.error('Final rimraf failed: ' + rimraf_err.message);  // eslint-disable-line no-console
				}
				callback(err);
			});
			return;
		}

		safe_rimraf(tmp_dir, (err) => {
			if (err) return callback(err);
			
			fs.readFile(path.join(final_dir, 'VERSION'), 'utf8', (err, contents) => {
				if (err) return callback(err);

				const bup_version = contents.trim();
				callback(err, bup_version);
			});
		});
	});
}

function bupdate_handler(req, res, next) {
	bupdate((err, bup_version) => {
		if (err) {
			console.error('bupdate failed', err.message); // eslint-disable-line no-console
			return next(err);
		}
		render(req, res, next, 'bupdate_success', {
			bup_version,
		});
	});
}


module.exports = {
	bupdate_handler,
};
